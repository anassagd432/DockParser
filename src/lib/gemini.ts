import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// ... imports ...

// Helper
function fileToGenerativePart(base64Data: string, mimeType: string) {
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
}

export async function extractContractRules(file: File) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

        // Convert to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
        });

        const prompt = `
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
        `;

        const result = await model.generateContent([
            prompt,
            fileToGenerativePart(base64Data, file.type)
        ]);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Contract Rule Extraction Failed:", error);
        throw error;
    }
}

export async function extractInvoiceData(file: File, knownContracts?: any[]) {
    try {
        // KEEPING GEMINI 3 PRO PREVIEW AS REQUESTED
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

        // Convert invoice to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });

        let prompt = `
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
        `;

        if (knownContracts && knownContracts.length > 0) {
            prompt += `
            AUDIT INSTRUCTION:
            Here is a list of known "Contract Rules" for various vendors:
            ${JSON.stringify(knownContracts)}

            1. Identify the Vendor of this invoice.
            2. Check if that Vendor exists in the 'Contract Rules' list provided above.
            3. If a match is found, COMPARE the invoice line items against the agreed Contract Rules.
            4. If a Unit Price is higher than the agreed rule, or if there is an unknown fee, add an entry to "audit_flags".
            
            Format for audit_flags: { "item": "Item Name", "issue": "Detected Discrepancy (e.g. Invoice price $12 > Contract rate $10)", "severity": "high" }
            `;
        } else {
            prompt += `
            "audit_flags" should be empty since no context was provided.
            `;
        }

        prompt += `Only return the JSON. Do not include markdown formatting like \`\`\`json.`;

        const result = await model.generateContent([
            prompt,
            fileToGenerativePart(base64Data, file.type)
        ]);

        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Gemini Extraction Failed:", error);
        throw error;
    }
}
