import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { Check, Upload, Brain, FileSpreadsheet, ArrowRight, Zap, XCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "../components/ui/Logo";


export const LandingPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleCheckout = async () => {
        // User provided a direct Payment Link.
        window.location.href = "https://buy.stripe.com/28E8wRcsJ2ZZ7UVeLRbbG0b";
    };

    return (
        <div className="min-h-screen bg-[#0A0C10] text-white selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0C10]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="cursor-pointer">
                        <Logo />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Log In
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-white text-black hover:bg-gray-200 border-none">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <XCircle className="w-6 h-6" /> : <div className="space-y-1.5 p-1">
                            <div className="w-6 h-0.5 bg-current"></div>
                            <div className="w-6 h-0.5 bg-current"></div>
                            <div className="w-6 h-0.5 bg-current"></div>
                        </div>}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/5 bg-[#0A0C10] px-6 py-4 space-y-4 shadow-2xl"
                    >
                        <div className="flex flex-col gap-4 text-sm font-medium text-gray-400">
                            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 block">Features</a>
                            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 block">How it Works</a>
                            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 block">Pricing</a>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2 text-gray-300 hover:text-white">
                                Log In
                            </Link>
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full bg-white text-black hover:bg-gray-200 border-none">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-[100%] blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                            Now with Gemini 3.0 Pro Intelligence
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                            Stop Overpaying for Freight. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Automate Your Audit.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            AI that extracts invoice data and catches billing errors in seconds.
                            Cross-reference against your rate cards and eliminate manual Excel entry forever.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup">
                                <Button
                                    className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25"
                                >
                                    Start Auditing Now <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="h-12 px-8 text-lg border-white/10 hover:bg-white/5"
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                View Demo
                            </Button>
                        </div>
                    </motion.div>

                    {/* App Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-20 relative"
                    >
                        {/* Mockup Content */}
                        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0F1117]/80 backdrop-blur-sm">
                            <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="aspect-[16/9] bg-gradient-to-br from-[#0F1117] to-[#1A1D24] relative flex items-center justify-center">
                                {/* Simulated UI Elements */}
                                <img
                                    src="https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                                    alt="Dashboard"
                                    className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-transparent" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Zap className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">$14,250.00</div>
                                                <div className="text-sm text-gray-400">Recovered this month</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trusted By Marquee */}
            <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <div className="max-w-7xl mx-auto py-12 px-6">
                    <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-widest mb-8">
                        Trusted by Modern Logistics Teams
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder Logos - In production these would be SVGs */}
                        {["Flexport", "Uber Freight", "C.H. Robinson", "Echo", "Convoy"].map((brand) => (
                            <div key={brand} className="text-xl md:text-2xl font-bold font-serif text-white/40 hover:text-white/80 transition-colors cursor-default">
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 bg-[#0F1117] relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0F1117] to-[#0F1117]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How DockParser Works</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Three simple steps to flawless freight auditing. No complex setup required.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0" />

                        {[
                            { icon: Upload, title: "Upload Invoices", desc: "Drag & drop PDF invoices or rate cards directly into the dashboard." },
                            { icon: Brain, title: "AI Analysis", desc: "Gemini 3.0 Pro extracts line items and cross-references them against your contracts." },
                            { icon: FileSpreadsheet, title: "Export Results", desc: "Download clean, audited data in CSV format ready for your ERP or Excel." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                className="relative z-10 text-center group"
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="w-24 h-24 mx-auto bg-[#0A0C10] border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-300">
                                    <step.icon className="w-10 h-10 text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-gray-400 leading-relaxed px-4 group-hover:text-gray-300 transition-colors">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison / Features */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Logistics Teams Choose Us</h2>
                        <p className="text-gray-400">Stop relying on manual entry and legacy OCR.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Manual */}
                        <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10">
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                                <XCircle className="w-5 h-5" /> Manual Entry
                            </h3>
                            <ul className="space-y-4">
                                {["Hours of data entry per week", "High risk of human error", "Missed overcharges & duplicate bills", "Delayed visibility into spend"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-400">
                                        <XCircle className="w-5 h-5 text-red-500/40 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* DockParser */}
                        <div className="p-8 rounded-2xl bg-blue-500/10 border border-blue-500/20 relative">
                            <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500 text-xs font-bold uppercase rounded-bl-xl rounded-tr-xl">
                                Recommended
                            </div>
                            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> DockParser
                            </h3>
                            <ul className="space-y-4">
                                {["Instant extraction (Seconds)", "100% Accuracy with AI Validation", "Automatic Price Auditing vs Contracts", "Real-time spend analytics"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-white">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-[#0F1117] relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-[100%] blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Audit Pricing</h2>
                        <p className="text-gray-400">Start strictly auditing your freight spend today.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Starter */}
                        <div className="p-8 rounded-2xl border border-white/10 bg-[#0A0C10]/50 backdrop-blur-sm flex flex-col h-full hover:border-white/20 transition-all">
                            <h3 className="text-xl font-bold mb-2">Trial</h3>
                            <div className="text-3xl font-bold mb-1">$0 <span className="text-sm font-normal text-gray-400">/mo</span></div>
                            <p className="text-gray-400 text-sm mb-6">Best for: Testing the water.</p>

                            <Link to="/signup">
                                <Button variant="outline" className="w-full mb-8 border-white/10 hover:bg-white/5">Start Free</Button>
                            </Link>

                            <ul className="space-y-4 text-left flex-1">
                                <li className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> 50 Invoices / mo</li>
                                <li className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Basic Extraction</li>
                                <li className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Manual Export</li>
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="p-8 rounded-2xl border border-blue-500/50 bg-blue-900/10 backdrop-blur-sm flex flex-col h-full transform scale-105 shadow-2xl shadow-blue-500/20 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg shadow-blue-500/40">
                                Most Popular
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-blue-400">Pro Audit</h3>
                            <div className="text-3xl font-bold mb-1">$299 <span className="text-sm font-normal text-gray-400">/mo</span></div>
                            <p className="text-gray-400 text-sm mb-6">Best for: Freight Brokers & Logistics Teams.</p>

                            <Button
                                onClick={() => handleCheckout()} // Replace with your actual Stripe Price ID
                                className="w-full mb-8 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25"
                            >
                                Start 14-Day Free Trial
                            </Button>

                            <ul className="space-y-4 text-left flex-1">
                                <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-blue-400 shrink-0" /> 2,500 Invoices / mo</li>
                                <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Automatic Overcharge Detection</li>
                                <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Rate Card Storage</li>
                                <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Priority Support</li>
                            </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="p-8 rounded-2xl border border-white/10 bg-[#0A0C10]/50 backdrop-blur-sm flex flex-col h-full hover:border-white/20 transition-all">
                            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                            <div className="text-3xl font-bold mb-1">Custom</div>
                            <p className="text-gray-400 text-sm mb-6">Best for: High Volume 3PLs.</p>

                            <a href="mailto:sales@dockparser.com">
                                <Button variant="outline" className="w-full mb-8 border-white/10 hover:bg-white/5">Contact Sales</Button>
                            </a>

                            <ul className="space-y-4 text-left flex-1">
                                <li className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited Volume</li>
                                <li className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> API Access</li>
                                <li className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> ERP Integration</li>
                                <li className="flex gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Dedicated Account Manager</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-[#050608]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <div className="mb-4 md:mb-0 flex items-center">
                        <Logo className="h-8 w-8" textClassName="text-lg mr-2" />
                        <span className="border-l border-white/10 pl-2 ml-2">© 2026</span>
                    </div>
                    <div className="flex gap-8">
                        <Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
                        <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};
