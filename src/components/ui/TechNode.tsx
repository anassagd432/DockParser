import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface TechNodeProps {
    icon: LucideIcon;
    active?: boolean;
    delay?: number;
}

export const TechNode = ({ icon: Icon, active = false }: TechNodeProps) => {
    return (
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Outer Ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-blue-500/20 md:border-dashed"
            />

            {/* Inner Ring Reverse */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-blue-400/10"
            />

            {/* Glowing Core */}
            <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-500 ${active ? 'bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-white/5 border border-white/10'}`}>
                <Icon className={`w-8 h-8 transition-colors duration-300 ${active ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>

            {/* Orbiting Dot */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60A5FA] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
        </div>
    );
};
