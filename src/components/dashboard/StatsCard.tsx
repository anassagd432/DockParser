import { GlassCard } from "../ui/GlassCard";
import { cn } from "../../lib/utils";
import React from "react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ElementType; // Lucide icon or similar
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) => {
    return (
        <GlassCard className={cn("p-6 flex flex-col gap-4", className)}>
            <div className="flex justify-between items-start">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                {Icon && <div className="p-2 bg-white/5 rounded-lg"><Icon className="w-4 h-4 text-gray-400" /></div>}
            </div>
            <div className="flex items-end justify-between mt-auto">
                <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                {trend && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full border border-white/5",
                        trendUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
        </GlassCard>
    )
}
