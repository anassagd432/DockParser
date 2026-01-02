import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import { supabase } from "../../lib/supabase";
import { useState } from "react";
import { motion } from "framer-motion";

export const AuthPage = () => {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) console.error(error);
        setLoading(false);
    }

    return (
        <div className="flex items-center justify-center min-h-screen relative p-4 overflow-hidden">
            {/* Gradient Orbs */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 mix-blend-screen"
            />

            <GlassCard className="w-full max-w-md p-10 flex flex-col items-center gap-8 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 tracking-tight">
                        Invoiceflow AI
                    </h1>
                    <p className="text-gray-400">
                        Future-ready invoice extraction for the modern enterprise.
                    </p>
                </div>

                <Button onClick={handleLogin} disabled={loading} className="w-full text-lg h-12">
                    {loading ? "Connecting..." : "Continue with Google"}
                </Button>

                <div className="text-xs text-center text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </div>
            </GlassCard>
        </div>
    )
}
