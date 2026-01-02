import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { useState } from "react";
import { toast } from "sonner";

export const ContactPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success("Message sent! We'll be in touch shortly.");
            setLoading(false);
            navigate("/");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0A0C10] text-white p-6 pt-32 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#0A0C10]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="font-bold text-lg">D</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">DockParser</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Contact Sales</h1>
                    <p className="text-gray-400">Ready to automate your freight audit? Let's talk.</p>
                </div>

                <GlassCard className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">First Name</label>
                                <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Last Name</label>
                                <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="name@company.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">How can we help?</label>
                            <textarea required rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="Tell us about your volume and needs..."></textarea>
                        </div>

                        <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500" disabled={loading}>
                            {loading ? "Sending..." : <span className="flex items-center gap-2">Send Message <Send className="w-4 h-4" /></span>}
                        </Button>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};
