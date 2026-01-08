import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.13.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno"

// CORS Headers - Always included
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
    // ============================================
    // CRITICAL: Handle OPTIONS preflight FIRST
    // ============================================
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`[process-invoice] Request received: ${req.method}`);

        // ============================================
        // ADMIN MODE: Initialize with Service Role Key
        // This bypasses ALL RLS policies
        // ============================================
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[process-invoice] Missing Supabase credentials');
            throw new Error('Server configuration error: Missing database credentials');
        }

        if (!geminiApiKey) {
            console.error('[process-invoice] Missing GEMINI_API_KEY');
            throw new Error('Server configuration error: Missing AI API key');
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        });

        // ============================================
        // SOFT AUTH CHECK - Do NOT block if no user
        // ============================================
        let userId: string | null = null;
        const authHeader = req.headers.get('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
                if (user && !error) {
                    userId = user.id;
                    console.log(`[process-invoice] User identified: ${userId}`);
                } else {
                    console.log('[process-invoice] Token invalid, proceeding as anonymous');
                }
            } catch (authErr) {
                console.log('[process-invoice] Auth check failed, proceeding as anonymous');
            }
        } else {
            console.log('[process-invoice] No auth header, proceeding as anonymous');
        }

        // ============================================
        // Parse Request Body
        // ============================================
        const body = await req.json();
        const fileUrl = body.fileUrl;
        const type = body.type || 'invoice';

        if (!fileUrl) {
            throw new Error('Missing fileUrl in request body');
        }

        console.log(`[process-invoice] Processing ${type}, file: ${fileUrl.substring(0, 50)}...`);

        // ============================================
        // Rate Limiting (Only if user is identified)
        // ============================================
        if (userId) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count: dailyCount } = await supabaseAdmin
                .from('ai_usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', oneDayAgo);

            if (dailyCount && dailyCount >= 50) {
                return new Response(JSON.stringify({ error: "Daily limit reached (50/day)." }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 429
                });
            }

            // Log usage
            await supabaseAdmin.from('ai_usage_logs').insert({
                user_id: userId,
                model: 'gemini-1.5-flash',
                action: type
            });
        }

        // ============================================
        // Download File
        // ============================================
        console.log('[process-invoice] Downloading file...');
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`File download failed: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const blob = await fileResponse.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // ============================================
        // Gemini AI - Model: gemini-1.5-flash (Free Tier)
        // ============================================
        console.log('[process-invoice] Calling Gemini API (gemini-1.5-flash)...');

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";
        if (type === 'contract') {
            prompt = `Analyze this document. Extract Vendor Name and Pricing Rules. Return ONLY valid JSON: {"vendor_name": "...", "rules": [{"item_description": "...", "agreed_price": "...", "condition": "..."}]}. No markdown, no explanation.`;
        } else {
            prompt = `Analyze this invoice image. Extract data as ONLY valid JSON: {"vendor": "...", "invoice_date": "YYYY-MM-DD", "total_amount": 0.00, "currency": "USD", "confidence": 0.95, "line_items": [], "audit_flags": []}. No markdown, no explanation.`;
        }

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: blob.type || 'image/png' } }
        ]);

        const response = await result.response;
        const text = response.text();
        console.log('[process-invoice] Gemini raw response:', text.substring(0, 200));

        // Clean and parse JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        console.log('[process-invoice] Success!');
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('[process-invoice] ERROR:', error.message || error);
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
            details: String(error)
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
})
