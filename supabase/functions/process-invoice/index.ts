// removed the bad "shim" import causing the stack overflow
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // 1. Handle CORS Preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Setup Admin Client (Bypasses RLS)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

        if (!serviceRoleKey) {
            throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey)

        // 3. Get the File & User
        const formData = await req.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof File)) {
            throw new Error('No file uploaded')
        }

        // Try to get user ID (soft fail if anonymous)
        let userId = null
        const authHeader = req.headers.get('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user } } = await supabase.auth.getUser(token)
            userId = user?.id || null
        }

        // 4. Prepare Image for Gemini
        const arrayBuffer = await file.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

        // 5. Call Gemini API (Raw Fetch)
        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) throw new Error('Missing GEMINI_API_KEY secret')

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

        const geminiPayload = {
            contents: [{
                parts: [
                    { text: "Extract these fields from the invoice: total_amount (number), vendor_name (string), date (YYYY-MM-DD), line_items (array of objects). Return PURE JSON only. Do not wrap in markdown blocks." },
                    { inline_data: { mime_type: file.type, data: base64 } }
                ]
            }],
            generationConfig: { response_mime_type: "application/json" }
        }

        const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
        })

        if (!geminiRes.ok) {
            const errorText = await geminiRes.text()
            throw new Error(`Gemini API Error ${geminiRes.status}: ${errorText}`)
        }

        const geminiData = await geminiRes.json()
        const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!extractedText) throw new Error('Gemini returned no text')

        const parsedData = JSON.parse(extractedText)

        // 6. Save to Database
        const { data: insertedData, error: dbError } = await supabase
            .from('invoices')
            .insert({
                user_id: userId,
                total: parsedData.total_amount || 0,
                vendor: parsedData.vendor_name || 'Unknown',
                date: parsedData.date || new Date().toISOString(),
                raw_data: parsedData
            })
            .select()
            .single()

        if (dbError) throw new Error(`Database Error: ${dbError.message}`)

        return new Response(JSON.stringify(insertedData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        // Return the actual error message so we can see it in the frontend
        return new Response(JSON.stringify({ error: error.message || 'Unknown Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
