import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { motion, AnimatePresence } from "framer-motion";

export const SignupPage = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [shake, setShake] = useState(false);

    // Regex: At least 12 chars, 1 letter, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[&%$#!?¿@]).{12,}$/;

    const validatePassword = (pwd: string) => passwordRegex.test(pwd);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setShake(false);

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            setShake(true);
            return;
        }

        if (!validatePassword(password)) {
            toast.error("Password does not meet requirements");
            setShake(true);
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            toast.success("Account created! Please check your email.");
        } catch (error: any) {
            toast.error(error.message);
            setShake(true);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/dashboard` },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error("Google login failed: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4 relative overflow-hidden text-white">
            {/* Animated Background Elements */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"
            />

            <div className="w-full max-w-md z-10">
                <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <GlassCard className="p-8 backdrop-blur-xl border-white/10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <div className="flex justify-center mb-6"><Logo className="h-12 w-auto" showText={false} /></div>
                        <h1 className="text-3xl font-bold mb-2">Start your 14-day Free Audit</h1>
                        <p className="text-gray-400">No credit card required.</p>
                    </motion.div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <motion.div
                            initial={{ x: 0 }}
                            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        placeholder="name@company.com" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        placeholder="Min 12 chars, symbol & number" required />
                                </div>
                                {/* Password Strength Indicator */}
                                {password.length > 0 && (
                                    <div className="text-xs space-y-1 mt-2 p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="font-semibold text-gray-400 mb-1">Requirements:</p>
                                        <div className={`flex items-center gap-2 ${password.length >= 12 ? "text-green-400" : "text-gray-500"}`}>
                                            {password.length >= 12 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
                                            <span>12+ Characters</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${/[a-zA-Z]/.test(password) && /\d/.test(password) ? "text-green-400" : "text-gray-500"}`}>
                                            {/[a-zA-Z]/.test(password) && /\d/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
                                            <span>Letters & Numbers</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${/[&%$#!?¿@]/.test(password) ? "text-green-400" : "text-gray-500"}`}>
                                            {/[&%$#!?¿@]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
                                            <span>Symbol (&%$#!?¿@)</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full bg-white/5 border rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${confirmPassword && password !== confirmPassword
                                            ? "border-red-500/50 focus:ring-red-500/20"
                                            : "border-white/10 focus:ring-blue-500/50"
                                            }`}
                                        placeholder="Repeat password" required />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Passwords do not match
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-500 h-11 shadow-lg shadow-blue-500/25" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Free Trial"}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0A0C10] px-2 text-gray-500">Or continue with</span></div>
                    </div>

                    <Button variant="outline" className="w-full gap-2 h-11 border-white/10 hover:bg-white/5" onClick={handleGoogleLogin}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google
                    </Button>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
