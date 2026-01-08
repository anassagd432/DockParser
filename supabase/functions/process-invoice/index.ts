import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.13.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
    // 1. CORS Preflight - Handle Immediately
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`Received request: ${req.method}`);

        // 0. Environment Check
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!supabaseUrl || !supabaseKey || !apiKey) {
            throw new Error('Server usage configuration error: Missing Environment Variables.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        });

        // 1. Auth Check
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

        if (userError || !user) {
            throw new Error('Unauthorized: Invalid Token');
        }

        // 2. Parse Request
        const { fileUrl, type } = await req.json();

        if (!fileUrl) {
            throw new Error('Missing fileUrl');
        }

        // 3. User Rate Limiting (Database Check)
        // Check Daily Limit (50/day)
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

        // Check Burst Limit (10/min)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
        const { count: burstCount } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneMinuteAgo);

        if (burstCount && burstCount >= 10) {
            return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        // 4. Log Usage
        await supabase.from('ai_usage_logs').insert({
            user_id: user.id,
            model: 'gemini-2.5-flash', // Logging the requested model
            action: type || 'unknown'
        });

        // 5. Download File
        console.log("Downloading file from:", fileUrl);
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to download file: ${fileResponse.statusText}`);
        }
        const blob = await fileResponse.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // 6. Gemini AI Call
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = "";
        if (type === 'contract') {
            prompt = `Analyze this document. Extract Vendor Name and Pricing Rules in strict JSON: {"vendor_name": "...", "rules": [{"item_description": "...", "agreed_price": "...", "condition": "..."}]}. No markdown.`;
        } else {
            prompt = `Analyze this invoice. Extract data in strict JSON: {"vendor": "...", "invoice_date": "YYYY-MM-DD", "total_amount": 0.00, "currency": "USD", "confidence": 0.0, "line_items": [{"description": "...", "qty": 0, "unit_price": 0.00, "total": 0.00}], "audit_flags": []}. No markdown.`;
        }

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: blob.type } }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean and Parse JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Edge Function Error:", error);

        // Handle Gemini 429 (Rate Limit) specifically
        if (error.message?.includes("429") || error.status === 429) {
            return new Response(JSON.stringify({ error: "AI Service Busy (Rate Limit). Please try again in 30 seconds." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        // Return Generic Error with CORS
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400, // 400 is safer than 500 for client handling
        });
    }
})
