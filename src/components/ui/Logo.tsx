

interface LogoProps {
    className?: string; // For container or sizing
    showText?: boolean;
}

export const Logo = ({ className = "h-8 w-auto", showText = true }: LogoProps) => {
    return (
        <div className="flex items-center gap-2">
            <img
                src="https://ik.imagekit.io/2xdpjujefs/logo"
                alt="DockParser Logo"
                className={className}
            />
            {showText && <span className="font-bold text-xl tracking-tight text-white">DockParser</span>}
        </div>
    );
};
