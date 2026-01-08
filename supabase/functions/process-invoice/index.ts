// Use native Deno.serve - no imports needed for server
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
    // Handle OPTIONS preflight FIRST
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
                model: 'gemini-1.5-flash',
                action: type || 'invoice'
            });
        }

        // Download File
        console.log('[process-invoice] Downloading file...');
        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) throw new Error(`Download failed: ${fileRes.status}`);

        const blob = await fileRes.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

        // Gemini API Call
        console.log('[process-invoice] Calling Gemini...');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = type === 'contract'
            ? `Extract vendor name and pricing rules as JSON: {"vendor_name":"...","rules":[{"item_description":"...","agreed_price":"..."}]}`
            : `Extract invoice data as JSON: {"vendor":"...","invoice_date":"YYYY-MM-DD","total_amount":0,"currency":"USD","confidence":0.9,"line_items":[],"audit_flags":[]}`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType: blob.type || 'image/png' } }
        ]);

        const text = (await result.response).text();
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
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
