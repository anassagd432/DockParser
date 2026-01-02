import { useState, useRef } from "react";
import { toast } from "sonner";
import { useInvoices } from "../../hooks/useInvoices";
import { Button } from "../ui/Button";
import { StatsCard } from "./StatsCard";
import { UploadZone } from "./UploadZone";
import { InvoicesTable } from "./InvoicesTable";
import { processInvoice } from "../../api/invoice-service";
import { DollarSign, FileText, Clock, Plus, Upload } from "lucide-react";
import { InvoiceDrawer } from "./InvoiceDrawer";
import { ContractsDrawer } from "./ContractsDrawer";
import { UserMenu } from "./UserMenu";
import { Logo } from "../ui/Logo";

export const Dashboard = () => {
    const { invoices, refresh } = useInvoices();

    // State for selected invoice (Drawer)
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [isContractsOpen, setIsContractsOpen] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    // Derived stats
    const totalSpend = invoices.reduce((acc, curr) => acc + curr.total_amount, 0);
    const processedCount = invoices.length;
    const pendingCount = invoices.filter(i => i.status === "Review").length;

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        const toastId = toast.loading("Uploading and processing invoice...");

        try {
            // Call API (which should upload to Supabase and process)
            await processInvoice(file);

            // Refresh list to see new item
            refresh();

            toast.success("Invoice processed successfully!", { id: toastId });
        } catch (error: any) {
            console.error("Upload failed", error);
            toast.error(error.message || "Failed to process invoice", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    }

    const handleExport = () => {
        if (invoices.length === 0) {
            toast.error("No invoices to export");
            return;
        }

        // Generate CSV Content
        const headers = ["Invoice Date", "Vendor", "Total Amount", "Status", "Description", "Qty", "Unit Price", "Total"];
        const rows = invoices.flatMap(inv => {
            const lineItems = inv.extracted_data?.line_items || [];

            // If no line items, return a single row for the invoice
            if (lineItems.length === 0) {
                return [[
                    inv.invoice_date,
                    `"${inv.vendor}"`, // Escape quotes
                    inv.total_amount,
                    inv.status,
                    "-", "-", "-", "-"
                ]];
            }

            // Return a row for each line item
            return lineItems.map((item: any) => [
                inv.invoice_date,
                `"${inv.vendor}"`,
                inv.total_amount,
                inv.status,
                `"${item.description || ''}"`,
                item.qty,
                item.unit_price,
                item.total
            ]);
        });

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // Trigger Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `DockParser_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${invoices.length} invoices to CSV`);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNewInvoiceClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileInputChange}
                accept=".pdf,.jpg,.jpeg,.png"
            />
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Logo className="h-10 w-auto" showText={false} />
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">DockParser</h1>
                        <p className="text-gray-400 mt-1">Turn messy freight bills into Excel in seconds.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsContractsOpen(true)} className="gap-2">
                        <FileText className="w-4 h-4" /> Contracts
                    </Button>
                    <Button variant="outline" onClick={handleExport} className="gap-2">
                        <Upload className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button className="gap-2" onClick={handleNewInvoiceClick}>
                        <Plus className="w-4 h-4" /> New Invoice
                    </Button>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <UserMenu />
                </div>
            </header>

            <ContractsDrawer isOpen={isContractsOpen} onClose={() => setIsContractsOpen(false)} />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Spend"
                    value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalSpend)}
                    icon={DollarSign}
                    trend="+12%"
                    trendUp={true}
                />
                <StatsCard
                    title="Invoices Processed"
                    value={processedCount}
                    icon={FileText}
                    trend="+4"
                    trendUp={true}
                />
                <StatsCard
                    title="Pending Review"
                    value={pendingCount}
                    icon={Clock}
                    trend={pendingCount > 0 ? "Action Needed" : "All Good"}
                    trendUp={pendingCount === 0}
                />
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                <UploadZone onFileSelect={handleFileUpload} isUploading={isUploading} />
                <InvoicesTable
                    data={invoices}
                    onRowClick={(invoice) => setSelectedInvoice(invoice)}
                />
            </div>

            {/* Drawer */}
            <InvoiceDrawer
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />
        </div>
    )
}
