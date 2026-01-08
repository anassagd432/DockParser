import { supabase } from "./supabase";

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 */
async function uploadFile(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

    if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
}

export async function extractContractRules(file: File) {
    try {
        console.log("Uploading file for contract extraction...");
        // Create FormData for the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'contract');

        console.log("Invoking Edge Function 'process-invoice' (type: contract)...");
        const { data, error } = await supabase.functions.invoke('process-invoice', {
            body: formData,
            // Header Content-Type is inferred automatically
        });

        if (error) throw error;
        return data;

    } catch (error) {
        console.error("Contract Rule Extraction Failed:", error);
        throw error;
    }
}

export async function extractInvoiceData(file: File) {
    try {
        console.log("Invoking Edge Function 'process-invoice' (type: invoice)...");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'invoice');

        const { data: resultData, error } = await supabase.functions.invoke('process-invoice', {
            body: formData,
            // ✅ Do not set Content-Type. The browser will add it + the boundary automatically.
        });

        if (error) {
            // Log the full error object for debugging
            console.error("Edge Function Error Details:", error);
            throw error;
        }

        return resultData;

    } catch (error) {
        console.error("Gemini Extraction Failed:", error);
        throw error;
    }
}

