import type { Invoice } from "../components/dashboard/InvoicesTable";
import { supabase } from "../lib/supabase";
import { extractInvoiceData } from "../lib/gemini";

export async function processInvoice(file: File): Promise<Invoice> {
    // 0. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    // 1. Upload file to Supabase Storage (User Scoped)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Folder structure: user_id/filename

    // Note: User needs to create 'invoices' bucket in Supabase dashboard
    const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Storage upload failed:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 2. Fetch Active Contract Rules for Auditing
    const { data: contracts } = await supabase
        .from('contracts')
        .select('vendor_name, extracted_rules') // Only need metadata
        .not('extracted_rules', 'is', null);

    // 3. Call Gemini for Extraction & Auditing
    console.log("Calling Gemini 3.0 Pro (Auditing Mode)...");
    let extractedData;
    try {
        // Pass the list of contracts as context
        extractedData = await extractInvoiceData(file, contracts || []);
        console.log("Gemini Extracted:", JSON.stringify(extractedData, null, 2));
    } catch (err) {
        console.error("AI Extraction failed, falling back to basic data", err);
        // Fallback or rethrow? For now fallback to ensure upload persists
        extractedData = {
            vendor: "Unknown (Extraction Failed)",
            invoice_date: new Date().toISOString().split('T')[0],
            total_amount: 0,
            currency: "USD",
            confidence: 0,
            audit_flags: []
        };
    }

    // 3. Insert into Supabase Database
    console.log('Uploading file:', file.name);

    const { data, error } = await supabase
        .from('invoices')
        .insert({
            user_id: user.id,
            filename: file.name,
            vendor: extractedData.vendor,
            invoice_date: extractedData.invoice_date,
            total_amount: extractedData.total_amount,
            currency: extractedData.currency || "USD",
            status: extractedData.confidence > 0.8 ? "Approved" : "Review",
            confidence: extractedData.confidence,
            extracted_data: extractedData, // Store full JSON including line items
            file_url: filePath,
        })
        .select()
        .single();

    if (error) {
        console.error("Database insert failed:", JSON.stringify(error, null, 2)); // Stringify to see the actual error message
        throw error;
    }

    // Return the inserted invoice
    return {
        id: data.id,
        vendor: data.vendor,
        invoice_date: data.invoice_date,
        total_amount: data.total_amount,
        currency: data.currency,
        status: data.status,
        confidence: data.confidence
    };
}
