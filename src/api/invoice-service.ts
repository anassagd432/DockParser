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
        .eq('user_id', user.id)
        .not('extracted_rules', 'is', null);

    // 3. Call Gemini for Extraction & Auditing
    console.log("Calling Gemini 3.0 Pro (Auditing Mode)...");
    let insertedInvoice;

    try {
        // Pass the file directly to the Edge Function (which handles insertion)
        // Note: Contracts logic was removed from Edge Function for now
        insertedInvoice = await extractInvoiceData(file);

        console.log("Edge Function Inserted Invoice:", insertedInvoice);

        // 4. Update the record with File Metadata (Url & Filename)
        // The Edge Function creates the record but doesn't know the storage path
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                file_url: filePath,
                filename: file.name
            })
            .eq('id', insertedInvoice.id);

        if (updateError) {
            console.error("Failed to update file metadata:", updateError);
            // Continue anyway, we have the record
        }

        // Merge metadata for return
        insertedInvoice.file_url = filePath;
        insertedInvoice.filename = file.name;

    } catch (err) {
        console.error("AI Extraction/Insertion failed, falling back to manual insert", err);

        // Fallback: If Edge Function failed, we manually insert a basic record
        // allowing the user to at least see their uploaded file
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                filename: file.name,
                vendor: "Unknown (Extraction Failed)",
                invoice_date: new Date().toISOString().split('T')[0],
                total_amount: 0,
                currency: "USD",
                status: "Review",
                confidence: 0,
                extracted_data: {},
                file_url: filePath,
            })
            .select()
            .single();

        if (error) {
            console.error("Database insert failed:", JSON.stringify(error, null, 2));
            throw error;
        }
        insertedInvoice = data;
    }

    // Return the invoice (mapped to Interface)
    return {
        id: insertedInvoice.id,
        vendor: insertedInvoice.vendor,
        invoice_date: insertedInvoice.invoice_date,
        total_amount: insertedInvoice.total_amount,
        currency: insertedInvoice.currency,
        status: insertedInvoice.status,
        confidence: insertedInvoice.confidence
    };
}
