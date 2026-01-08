import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { extractContractRules } from "../../lib/gemini";

interface ContractsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ContractsDrawer = ({ isOpen, onClose }: ContractsDrawerProps) => {
    const [contracts, setContracts] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchContracts = async () => {
        const { data } = await supabase
            .from('contracts')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setContracts(data);
    };

    useEffect(() => {
        if (isOpen) fetchContracts();
    }, [isOpen]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        const toastId = toast.loading("Processing contract & extracting rules...");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            // 1. Extract Rules via Gemini
            console.log("Extracting rules...");
            const rulesData = await extractContractRules(file);
            console.log("Extracted Rules:", rulesData);

            // 2. Upload File
            const filePath = `${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('contracts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 3. Save to DB with Rules
            const { error: dbError } = await supabase
                .from('contracts')
                .insert({
                    user_id: user.id,
                    filename: file.name,
                    file_url: filePath,
                    vendor_name: rulesData.vendor_name || "Unknown Vendor",
                    extracted_rules: rulesData.rules || []
                });

            if (dbError) throw dbError;

            toast.success(`Contract processed for ${rulesData.vendor_name}`, { id: toastId });
            fetchContracts();
        } catch (error: any) {
            console.error(error);
            toast.error("Upload/Extraction failed: " + error.message, { id: toastId });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0F1117] border-l border-white/10 shadow-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white">Rate Cards / Contracts</h2>
                            <Button variant="outline" onClick={onClose} className="p-2">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf,.png,.jpg"
                                    onChange={handleUpload}
                                />
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-blue-400" />
                                </div>
                                <p className="text-sm font-medium text-white">Upload Master Agreement</p>
                                <p className="text-xs text-gray-500 mt-1">PDF or Image (Rate Card)</p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-400 uppercase">Active Contracts</h3>
                                {contracts.map(contract => (
                                    <GlassCard key={contract.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 rounded-lg">
                                                <FileText className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm truncate max-w-[180px]">
                                                    {contract.vendor_name || contract.filename}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(contract.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
