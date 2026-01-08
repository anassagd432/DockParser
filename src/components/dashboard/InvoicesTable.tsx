import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import { GlassCard } from "../ui/GlassCard";
import { cn } from "../../lib/utils";

export type Invoice = {
    id: string;
    vendor: string;
    invoice_date: string;
    total_amount: number;
    currency: string;
    status: "Review" | "Approved" | "Processing";
    confidence: number;
    extracted_data?: any; // Holds line items and raw data
};

const columnHelper = createColumnHelper<Invoice>();

const columns = [
    columnHelper.accessor("vendor", {
        header: "Vendor",
        cell: info => (
            <div className="flex items-center gap-2">
                <span className="font-medium text-white">{info.getValue()}</span>
                {info.row.original.extracted_data?.audit_flags?.length > 0 && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Audit Issues Found" />
                )}
            </div>
        ),
    }),
    columnHelper.accessor("invoice_date", {
        header: "Date",
        cell: info => {
            const date = new Date(info.getValue());
            return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        },
    }),
    columnHelper.accessor("total_amount", {
        header: "Total",
        cell: info => new Intl.NumberFormat("en-US", { style: "currency", currency: info.row.original.currency || "USD" }).format(info.getValue()),
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: info => (
            <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border",
                info.getValue() === "Approved" && "bg-green-500/10 text-green-400 border-green-500/20",
                info.getValue() === "Review" && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                info.getValue() === "Processing" && "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}>
                {info.getValue()}
            </span>
        )
    }),
    columnHelper.accessor("confidence", {
        header: "Confidence",
        cell: info => {
            const val = info.getValue();
            return (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full", val < 0.9 ? "bg-red-500" : "bg-green-500")}
                            style={{ width: `${val * 100}%` }}
                        />
                    </div>
                    <span className={cn("text-xs font-medium", val < 0.9 ? "text-red-400" : "text-green-400")}>
                        {(val * 100).toFixed(0)}%
                    </span>
                </div>
            )
        }
    })
]

interface InvoicesTableProps {
    data: Invoice[];
    onRowClick?: (invoice: Invoice) => void;
}

export const InvoicesTable = ({ data, onRowClick }: InvoicesTableProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
                <span className="text-xs text-slate-400 border border-slate-700/50 bg-slate-800/50 px-2 py-1 rounded">
                    {data.some(i => i.status === "Processing") ? "Processing..." : "Synced"}
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-3 md:px-6 py-3 md:py-4 font-medium tracking-wider">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {table.getRowModel().rows.map(row => {
                            const isProcessing = row.original.status === "Processing";
                            return (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row.original)}
                                    className={cn(
                                        "text-sm text-gray-300 transition-colors cursor-pointer",
                                        isProcessing && "animate-pulse bg-blue-500/5",
                                        !isProcessing && "hover:bg-white/5"
                                    )}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                            {isProcessing && cell.column.id !== "status" ? (
                                                <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                                            ) : (
                                                flexRender(cell.column.columnDef.cell, cell.getContext())
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};
