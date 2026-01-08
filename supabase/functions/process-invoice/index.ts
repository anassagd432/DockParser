// NO SDK IMPORTS - Using raw fetch to avoid runtime crashes
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
    // ============================================
    // CRITICAL: Handle OPTIONS preflight FIRST
    // ============================================
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`[process-invoice] ${req.method} request received`);

        // Environment Variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        }
        if (!geminiApiKey) {
            throw new Error('Missing GEMINI_API_KEY');
        }

        // Admin Supabase Client (bypasses RLS)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Soft Auth Check
        let userId: string | null = null;
        const authHeader = req.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const { data: { user } } = await supabaseAdmin.auth.getUser(
                    authHeader.replace('Bearer ', '')
                );
                userId = user?.id || null;
            } catch { /* ignore auth errors */ }
        }

        // Parse Body
        const { fileUrl, type } = await req.json();
        if (!fileUrl) {
            throw new Error('Missing fileUrl');
        }

        console.log(`[process-invoice] Type: ${type}, User: ${userId || 'anonymous'}`);

        // Rate Limiting (if user identified)
        if (userId) {
            const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
            const { count } = await supabaseAdmin
                .from('ai_usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', oneDayAgo);

            if (count && count >= 50) {
                return new Response(JSON.stringify({ error: "Daily limit reached" }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 429
                });
            }

            await supabaseAdmin.from('ai_usage_logs').insert({
                user_id: userId,
                model: 'gemini-2.5-flash',
                action: type || 'invoice'
            });
        }

        // ============================================
        // Download File and Convert to Base64
        // ============================================
        console.log('[process-invoice] Downloading file...');
        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) throw new Error(`Download failed: ${fileRes.status}`);

        const blob = await fileRes.blob();
        const mimeType = blob.type || 'image/png';
        const buffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

        console.log(`[process-invoice] File downloaded: ${mimeType}, ${buffer.byteLength} bytes`);

        // ============================================
        // RAW FETCH to Gemini API (No SDK)
        // ============================================
        const prompt = type === 'contract'
            ? `Analyze this document image. Extract the vendor name and pricing rules. Return ONLY valid JSON in this exact format: {"vendor_name":"Company Name","rules":[{"item_description":"Description","agreed_price":"$X.XX","condition":"any conditions"}]}. Do not include markdown or explanation.`
            : `Analyze this invoice image. Extract all data. Return ONLY valid JSON in this exact format: {"vendor":"Company Name","invoice_date":"YYYY-MM-DD","total_amount":0.00,"currency":"USD","confidence":0.95,"line_items":[{"description":"Item","qty":1,"unit_price":0.00,"total":0.00}],"audit_flags":[]}. Do not include markdown or explanation.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

        const geminiPayload = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64
                        }
                    }
                ]
            }]
        };

        console.log('[process-invoice] Calling Gemini API via raw fetch...');

        const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
        });

        if (!geminiRes.ok) {
            const errorText = await geminiRes.text();
            console.error('[process-invoice] Gemini API error:', errorText);
            throw new Error(`Gemini API error: ${geminiRes.status} - ${errorText}`);
        }

        const geminiData = await geminiRes.json();
        console.log('[process-invoice] Gemini response received');

        // Extract text from response
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!responseText) {
            throw new Error('No response from Gemini');
        }

        // Clean and parse JSON
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleaned);

        console.log('[process-invoice] Success!');
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (err: any) {
        console.error('[process-invoice] Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
})
