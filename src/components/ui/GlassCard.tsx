import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
}

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
    return (
        <motion.div
            className={cn(
                "glass-card relative overflow-hidden",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
