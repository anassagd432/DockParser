
import { cn } from "../../lib/utils";

interface LogoProps {
    className?: string; // For container or sizing
    showText?: boolean;
    showIcon?: boolean;
    textClassName?: string;
}

export const Logo = ({ className = "h-8 w-8", showText = true, showIcon = true, textClassName }: LogoProps) => {
    return (
        <div className="flex items-center gap-2" aria-label="DockParser">
            {showIcon && (
                <div className={cn("bg-blue-600 rounded-lg flex items-center justify-center shrink-0", className)}>
                    <span className="text-white font-bold text-xl leading-none">D</span>
                </div>
            )}
            {showText && (
                <span className={cn("font-bold text-xl tracking-tight text-white", textClassName)}>
                    DockParser
                </span>
            )}
        </div>
    );
};
