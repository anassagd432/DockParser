import { Link } from "react-router-dom";
import { ArrowLeft, Scale, AlertTriangle, FileText, Ban } from "lucide-react";
import { Button } from "../components/ui/Button";

export const Terms = () => {
    return (
        <div className="min-h-screen bg-[#0A0C10] text-gray-300 font-sans selection:bg-blue-500/30">
            {/* Header / Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
                    <Link to="/">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-gray-400">Last updated: January 2, 2026</p>
                </div>

                <div className="space-y-12">
                    {/* Nature of Service */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-400" />
                            Nature of Service
                        </h2>
                        <p className="leading-relaxed">
                            DockParser is an AI-assisted data extraction and auditing tool designed to assist logistics professionals in processing freight invoices.
                        </p>
                        <p className="leading-relaxed mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                            <strong>Important Notice:</strong> DockParser is NOT a substitute for a certified public accountant, tax professional, or legal counsel. We provide data processing services, not financial or legal advice.
                        </p>
                    </section>

                    {/* Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            Limitation of Liability
                        </h2>
                        <p className="leading-relaxed mb-4">
                            By using this service, you acknowledge that AI extraction technology, while highly accurate, is not infallible. DockParser guarantees best-effort processing but does not guarantee 100% accuracy.
                        </p>
                        <ul className="list-disc pl-6 space-y-3 marker:text-gray-500">
                            <li>DockParser is not liable for any financial losses, penalties, or damages arising from missed errors, incorrect extractions, false positives, or overlooked overcharges.</li>
                            <li>It is the user's responsibility to verify all audited data before making payments or disputing charges with carriers.</li>
                        </ul>
                    </section>

                    {/* Subscription */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <Scale className="w-6 h-6 text-green-400" />
                            Subscription & Cancellation
                        </h2>
                        <p className="leading-relaxed mb-4">
                            <strong>Billing:</strong> Subscriptions are billed on a monthly basis. You agree to pay the fees associated with your selected tier.
                        </p>
                        <p className="leading-relaxed">
                            <strong>Cancellation:</strong> You may cancel your subscription at any time via the billing settings in your dashboard. Access to paid features will continue until the end of the current billing cycle.
                        </p>
                    </section>

                    {/* Fair Use */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <Ban className="w-6 h-6 text-purple-400" />
                            Acceptable Use
                        </h2>
                        <ul className="list-disc pl-6 space-y-3 marker:text-gray-500">
                            <li>You agree not to use the API for any illegal or unauthorized purpose.</li>
                            <li>Automated scraping, reverse engineering, or abusive usage of the DockParser infrastructure is strictly prohibited and may result in immediate account termination.</li>
                            <li>Do not upload documents containing illegal content or content you do not have the right to process.</li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-white/10 pt-12">
                        <h3 className="text-lg font-bold text-white mb-2">Legal Contact</h3>
                        <p>
                            Notices regarding these terms should be sent to <a href="mailto:legal@dockparser.com" className="text-blue-400 hover:text-blue-300">legal@dockparser.com</a>.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};
