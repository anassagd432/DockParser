import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline";
}

export const Button = ({ className, variant = "primary", children, ...props }: ButtonProps) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                variant === "primary" && "bg-blue-600 text-white hover:bg-blue-500 border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]",
                variant === "secondary" && "bg-white/10 text-white hover:bg-white/20 border border-white/10",
                variant === "outline" && "bg-transparent text-white border border-white/20 hover:bg-white/5",
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};
