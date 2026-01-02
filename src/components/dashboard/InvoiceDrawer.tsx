import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import type { Invoice } from "./InvoicesTable";

interface InvoiceDrawerProps {
    invoice: Invoice | null;
    onClose: () => void;
}

export const InvoiceDrawer = ({ invoice, onClose }: InvoiceDrawerProps) => {
    return (
        <AnimatePresence>
            {invoice && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#0F1117] border-l border-white/10 shadow-2xl overflow-y-auto"
                    >
                        <div className="p-6 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{invoice.vendor}</h2>
                                    <p className="text-gray-400 text-sm">Invoice ID: {invoice.id.slice(0, 8)}</p>
                                </div>
                                <Button variant="outline" onClick={onClose} className="p-2">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Audit Flags Alert */}
                            {invoice.extracted_data?.audit_flags && invoice.extracted_data.audit_flags.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 bg-red-500/20 rounded-full mt-0.5">
                                            <X className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-red-400 font-semibold text-sm">Potential Contract Violation Detected</h3>
                                            <div className="mt-2 space-y-1">
                                                {invoice.extracted_data.audit_flags.map((flag: any, idx: number) => (
                                                    <p key={idx} className="text-xs text-red-300/80">
                                                        • <span className="font-medium text-red-300">{flag.item}:</span> {flag.issue}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <GlassCard className="p-4">
                                    <p className="text-xs text-gray-400 uppercase">Total Amount</p>
                                    <p className="text-xl font-bold text-white mt-1">
                                        {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency || "USD" }).format(invoice.total_amount)}
                                    </p>
                                </GlassCard>
                                <GlassCard className="p-4">
                                    <p className="text-xs text-gray-400 uppercase">Date</p>
                                    <p className="text-lg font-medium text-white mt-1">
                                        {invoice.invoice_date}
                                    </p>
                                </GlassCard>
                                <GlassCard className="p-4">
                                    <p className="text-xs text-gray-400 uppercase">Review Status</p>
                                    <div className={`mt-2 inline-flex px-2 py-1 rounded-full text-xs font-medium border ${invoice.status === "Approved" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                                        {invoice.status}
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Line Items Table */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Line Items</h3>
                                {invoice.extracted_data?.line_items && invoice.extracted_data.line_items.length > 0 ? (
                                    <div className="rounded-lg border border-white/10 overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white/5 text-gray-400">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Description</th>
                                                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                                                    <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                                                    <th className="px-4 py-3 font-medium text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-gray-300">
                                                {invoice.extracted_data.line_items.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-white/5">
                                                        <td className="px-4 py-3">{item.description}</td>
                                                        <td className="px-4 py-3 text-right">{item.qty}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency || "USD" }).format(item.unit_price)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-white">
                                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency || "USD" }).format(item.total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10 border-dashed">
                                        <p className="text-gray-400">No line item details available for this invoice.</p>
                                        <p className="text-xs text-gray-600 mt-2">Try re-uploading with the new Gemini 3.0 Pro model.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
