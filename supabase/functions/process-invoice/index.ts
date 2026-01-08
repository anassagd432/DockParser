import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.13.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
    // 1. Handle CORS Preflight Request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`Received request: ${req.method}`);

        // 0. Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase Environment Variables');
            throw new Error('Server usage configuration error: Missing Supabase URL or Key.');
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
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();

        // Check Daily Limit (e.g., 50 per day)
        const { count: dailyCount, error: dailyError } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneDayAgo);

        if (dailyCount && dailyCount >= 50) {
            throw new Error('Daily limit reached (50 requests/day). Please try again tomorrow.');
        }

        // Check Burst Limit (e.g., 10 per minute)
        const { count: burstCount, error: burstError } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneMinuteAgo);

        if (burstCount && burstCount >= 10) {
            throw new Error('Too many requests. Please wait a moment.');
        }

        const { fileUrl, type } = await req.json()
        // type can be 'invoice' or 'contract'

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
            throw new Error('Missing GEMINI_API_KEY')
        }

        // 4. Download file
        console.log("Downloading file from:", fileUrl);
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to download file: ${fileResponse.statusText}`);
        }
        const blob = await fileResponse.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = blob.type;

        // 5. Setup Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        // Using gemini-2.5-flash as requested.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 6. Construct Prompt
        let prompt = "";
        if (type === 'contract') {
            prompt = `
        Analyze this "master agreement" or "rate card" document.
        Extract the Vendor Name and the Pricing Rules.
        
        Return strict JSON:
        {
            "vendor_name": "Vendor Name found in contract",
            "rules": [
                {
                    "item_description": "Description of item/service (e.g. Shipping 0-5kg)",
                    "agreed_price": "Price or Rate (e.g. $5.00/kg or $100 flat)",
                    "condition": "Any conditions (optional)"
                }
            ]
        }
        Only return the JSON. Do not include markdown formatting.
        `;
        } else {
            // Invoice
            prompt = `
        Analyze this invoice and extract the following data in strict JSON format:
        {
            "vendor": "Vendor Name",
            "invoice_date": "YYYY-MM-DD",
            "total_amount": 123.45,
            "currency": "USD",
            "confidence": 0.95,
            "line_items": [
                {
                    "description": "Item Description",
                    "qty": 1,
                    "unit_price": 10.00,
                    "total": 10.00
                }
            ],
            "audit_flags": []
        }
        Only return the JSON. Do not include markdown formatting.
        `;
        }

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error("Edge Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            // Status 400 with headers ensures the client can read the error message.
            // A 500 without headers would result in a CORS error masking the real issue.
            status: 400,
        })
    }
})
