import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.13.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno"

// Define CORS headers first
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
    // ============================================
    // CRITICAL: Handle OPTIONS preflight FIRST
    // This MUST be before ANY other logic
    // ============================================
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // ============================================
    // Main Logic - Wrapped in try/catch for safety
    // ============================================
    try {
        console.log(`[process-invoice] Received ${req.method} request`);

        // Environment Variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        }
        if (!apiKey) {
            throw new Error('Missing GEMINI_API_KEY');
        }

        // Supabase Client
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        });

        // Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        // Parse Request Body
        const { fileUrl, type } = await req.json();
        if (!fileUrl) {
            throw new Error('Missing fileUrl');
        }

        // Rate Limiting (Simple Check)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: dailyCount } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneDayAgo);

        if (dailyCount && dailyCount >= 50) {
            return new Response(JSON.stringify({ error: "Daily limit reached (50/day)." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        // Log Usage
        await supabase.from('ai_usage_logs').insert({
            user_id: user.id,
            model: 'gemini-1.5-flash',
            action: type || 'unknown'
        });

        // Download File
        console.log("[process-invoice] Downloading file:", fileUrl);
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to download file: ${fileResponse.status}`);
        }
        const blob = await fileResponse.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // ============================================
        // Gemini AI Call - Wrapped in its own try/catch
        // ============================================
        let data;
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            let prompt = "";
            if (type === 'contract') {
                prompt = `Analyze this document. Extract Vendor Name and Pricing Rules in strict JSON: {"vendor_name": "...", "rules": [{"item_description": "...", "agreed_price": "...", "condition": "..."}]}. No markdown.`;
            } else {
                prompt = `Analyze this invoice. Extract data in strict JSON: {"vendor": "...", "invoice_date": "YYYY-MM-DD", "total_amount": 0.00, "currency": "USD", "confidence": 0.0, "line_items": [{"description": "...", "qty": 0, "unit_price": 0.00, "total": 0.00}], "audit_flags": []}. No markdown.`;
            }

            console.log("[process-invoice] Calling Gemini API...");
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Data, mimeType: blob.type } }
            ]);

            const response = await result.response;
            const text = response.text();
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            data = JSON.parse(cleanedText);
            console.log("[process-invoice] Gemini response parsed successfully");

        } catch (geminiError: any) {
            console.error("[process-invoice] Gemini API Error:", geminiError);
            // Return error WITH CORS headers
            return new Response(JSON.stringify({
                error: geminiError.message || "AI processing failed"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        // Success Response
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        // Catch-all error handler - ALWAYS includes CORS headers
        console.error("[process-invoice] Critical Error:", error);
        return new Response(JSON.stringify({
            error: error.message || "Internal Server Error"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
})
