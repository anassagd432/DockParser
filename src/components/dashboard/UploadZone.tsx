import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isUploading?: boolean;
}

export const UploadZone = ({ onFileSelect, isUploading }: UploadZoneProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const onContainerClick = () => {
        fileInputRef.current?.click();
    };

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <motion.div
            layout
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={onContainerClick}
            animate={{
                borderColor: isDragging ? "rgb(59, 130, 246)" : "rgba(255, 255, 255, 0.1)",
                boxShadow: isDragging ? "0 0 30px rgba(59, 130, 246, 0.2)" : "none",
                scale: isDragging ? 1.01 : 1
            }}
            transition={{ duration: 0.2 }}
            className={cn(
                "w-full h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group transition-colors",
                isDragging ? "bg-blue-500/10" : "bg-white/5 hover:bg-white/10"
            )}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={onFileInputChange}
                accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <motion.div
                animate={{ y: isDragging ? -5 : 0 }}
                className="z-10 flex flex-col items-center gap-3"
            >
                <div className={cn("p-4 rounded-full transition-colors", isDragging ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:scale-110 duration-300")}>
                    {isUploading ? (
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8" />
                    )}
                </div>
                <div className="text-center">
                    <p className="text-lg font-medium text-white">
                        {isUploading ? "Processing with Gemini..." : isDragging ? "Drop invoice here" : "Upload Invoice"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        <span className="hidden md:inline">Drag & drop or click to browse</span>
                        <span className="md:hidden">Tap to upload invoice</span>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
