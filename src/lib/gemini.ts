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
        const fileUrl = await uploadFile(file);

        console.log("Invoking Edge Function 'process-invoice' (type: contract)...");
        const { data, error } = await supabase.functions.invoke('process-invoice', {
            body: {
                fileUrl,
                type: 'contract'
            }
        });

        if (error) throw error;
        return data;

    } catch (error) {
        console.error("Contract Rule Extraction Failed:", error);
        throw error;
    }
}

export async function extractInvoiceData(filePath: string, _knownContracts?: any[]) {
    try {
        console.log("Generating signed URL for invoice extraction...");

        const { data, error: signedUrlError } = await supabase.storage
            .from('invoices')
            .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

        if (signedUrlError) {
            throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
        }

        const fileUrl = data.signedUrl;

        console.log("Invoking Edge Function 'process-invoice' (type: invoice)...");
        const { data: resultData, error } = await supabase.functions.invoke('process-invoice', {
            body: {
                fileUrl,
                type: 'invoice',
            }
        });

        if (error) throw error;

        // The Edge Function returns the parsed JSON directly
        return resultData;

    } catch (error) {
        console.error("Gemini Extraction Failed:", error);
        throw error;
    }
}

