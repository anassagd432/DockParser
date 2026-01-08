import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.13.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
    // 1. Handle CORS Preflight Request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`Received request: ${req.method}`);

        // 0. Initialize Supabase Client
        // Note: Edge Functions have access to strict env vars.
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseKey) {
            const errorMsg = 'Missing Supabase Environment Variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        });

        // 1. Get User from Auth Header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

        if (userError || !user) {
            console.error("Auth Error:", userError);
            throw new Error('Unauthorized: Invalid Token');
        }

        // 2. RATE LIMITING CHECK
        // (Simplified for stability check - keep critical logic only)
        // Only checking limits if user is confirmed valid

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();

        // Check Daily Limit
        const { count: dailyCount } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneDayAgo);

        if (dailyCount && dailyCount >= 50) {
            throw new Error('Daily limit reached (50 requests/day).');
        }

        // Check Burst Limit
        const { count: burstCount } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneMinuteAgo);

        if (burstCount && burstCount >= 10) {
            throw new Error('Too many requests. Please wait a moment.');
        }

        const { fileUrl, type } = await req.json()

        // 3. Log this request
        await supabase.from('ai_usage_logs').insert({
            user_id: user.id,
            model: 'gemini-2.5-flash',
            action: type || 'unknown'
        });

        if (!fileUrl) {
            throw new Error('Missing fileUrl')
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            throw new Error('Missing GEMINI_API_KEY')
        }

        // 4. Download file
        console.log("Downloading file from:", fileUrl);
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            console.error(`File download failed: ${fileResponse.status} ${fileResponse.statusText}`);
            throw new Error(`Failed to download file from URL`);
        }

        const blob = await fileResponse.blob();

        // 5. Setup Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 6. Construct Prompt
        let prompt = "";
        if (type === 'contract') {
            prompt = `Analyze this "master agreement" or "rate card". Extract Vendor Name and Pricing Rules. Return strict JSON: {"vendor_name": "...", "rules": [{"item_description": "...", "agreed_price": "...", "condition": "..."}]}. No markdown.`;
        } else {
            prompt = `Analyze this invoice. Extract data in strict JSON: {"vendor": "...", "invoice_date": "YYYY-MM-DD", "total_amount": 0.00, "currency": "USD", "confidence": 0.0, "line_items": [{"description": "...", "qty": 0, "unit_price": 0.00, "total": 0.00}], "audit_flags": []}. No markdown.`;
        }

        // Convert Blob to Base64
        const arrayBuffer = await blob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: blob.type
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let data;
        try {
            data = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON Parse Error on Gemini output:", text);
            throw new Error("Failed to parse AI response");
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error("Edge Function Critical Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
