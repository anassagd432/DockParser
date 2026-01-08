import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Invoice } from "../components/dashboard/InvoicesTable";

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('invoices_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'invoices' },
                () => fetchInvoices()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match UI model
            const formattedInvoices: Invoice[] = (data || []).map(item => ({
                id: item.id,
                vendor: item.vendor || "Unknown Vendor",
                invoice_date: item.invoice_date || item.date || new Date().toISOString().split('T')[0],
                total_amount: Number(item.total_amount || item.total) || 0,
                currency: item.currency || "USD",
                status: item.status as "Review" | "Approved" | "Processing",
                confidence: Number(item.confidence) || 0,
                extracted_data: item.extracted_data
            }));

            setInvoices(formattedInvoices);
        } catch (err: any) {
            console.error("Error fetching invoices:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { invoices, loading, error, refresh: fetchInvoices };
}
