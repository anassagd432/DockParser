
import { cn } from "../../lib/utils";

interface LogoProps {
    className?: string; // For container or sizing
    showText?: boolean;
    showIcon?: boolean;
    textClassName?: string;
}

export const Logo = ({ className = "h-8 w-auto", showText = true, showIcon = true, textClassName }: LogoProps) => {
    return (
        <div className="flex items-center gap-0" aria-label="DockParser">
            {showIcon && (
                <img
                    src="https://ik.imagekit.io/2xdpjujefs/logo"
                    alt="DockParser Logo"
                    className={className}
                />
            )}
            {showText && <span className={cn("font-bold text-xl tracking-tight text-white -ml-0.5", textClassName)}>ockParser</span>}
        </div>
    );
};
