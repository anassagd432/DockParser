import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { fileUrl, type } = await req.json()
        // type can be 'invoice' or 'contract'

        if (!fileUrl) {
            throw new Error('Missing fileUrl')
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            throw new Error('Missing GEMINI_API_KEY')
        }

        // 1. Download file from Supabase Storage
        // NOTE: If the bucket is private, we need a signed URL or service role.
        // Assuming fileUrl is a signed URL or publicly accessible for this MVP step.
        // If it's a path like "invoices/123.pdf", we would need to construct the URL or use supabaseAdmin.
        // For this implementation, we expect a full download URL (likely a signed URL generated on frontend).

        console.log("Downloading file from:", fileUrl);
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to download file: ${fileResponse.statusText}`);
        }
        const blob = await fileResponse.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = blob.type;

        // 2. Setup Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-1.5-flash as it is generally faster/cheaper, or use "gemini-3-pro-preview" matching existing code if preferred.
        // Existing code uses "gemini-3-pro-preview". Let's stick to a known stable or the requested one. 
        // The user existing code uses "gemini-3-pro-preview". I will use gemini-1.5-flash for efficiency unless strict reason not to.
        const model = genAI.getGenerativeModel({ model: "gemini-3.0-pro" });

        // 3. Construct Prompt
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

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
