import { useState, useRef, useEffect } from "react";
import { LogOut, User, CreditCard, Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
    email?: string;
    user_metadata?: {
        avatar_url?: string;
        full_name?: string;
    }
}

export const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // Close on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/login");
        toast.success("Signed out successfully");
    };

    const getInitials = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
        }
        return user?.email?.slice(0, 2).toUpperCase() || "DP";
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        getInitials()
                    )}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white max-w-[100px] truncate">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                    >
                        <div className="px-3 py-2 mb-2 border-b border-white/5">
                            <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                            <p className="text-sm text-white truncate">{user?.email}</p>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => navigate("/settings")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4" /> Profile Settings
                            </button>
                            <button
                                onClick={() => navigate("/billing")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <CreditCard className="w-4 h-4" /> Billing
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Log Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
