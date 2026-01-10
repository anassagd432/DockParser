import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Database } from "lucide-react";
import { Button } from "../components/ui/Button";

export const Privacy = () => {
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
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-gray-400">Last updated: January 2, 2026</p>
                </div>

                <div className="space-y-12">
                    {/* Introduction */}
                    <section>
                        <p className="leading-relaxed mb-6">
                            At DockParser, we understand that freight invoices contain sensitive financial and commercial data.
                            We have built our infrastructure with a "security-first" and "privacy-by-design" approach to ensure your data remains yours.
                        </p>
                    </section>

                    {/* AI Data Usage */}
                    <section className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <BrainIcon className="w-6 h-6 text-blue-400" />
                            AI & Data Processing
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <span className="font-bold text-white min-w-[120px]">Processing:</span>
                                <div>Documents are processed via the Google Gemini API strictly for extraction and auditing purposes.</div>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-white min-w-[120px]">No Training:</span>
                                <div>Data processed through our API is <strong className="text-white">NOT</strong> used to train Google's public AI models or DockParser's internal foundation models.</div>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-white min-w-[120px]">Retention:</span>
                                <div>Transient processing data is discarded by the AI inference engine immediately after analysis.</div>
                            </div>
                        </div>
                    </section>

                    {/* Data Storage & Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <Lock className="w-6 h-6 text-green-400" />
                            Storage & Encryption
                        </h2>
                        <ul className="list-disc pl-6 space-y-3 marker:text-gray-500">
                            <li><strong>Encryption at Rest:</strong> All files and extracted data are stored using Supabase (Enterprise Grade Security), encrypted on disk using AES-256.</li>
                            <li><strong>Encryption in Transit:</strong> All data is transmitted over secure TLS 1.3 channels.</li>
                            <li><strong>Access Control:</strong> Strict Row Level Security (RLS) ensures that only authenticated users authorized by your organization can access your documents.</li>
                        </ul>
                    </section>

                    {/* Data Deletion */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <Database className="w-6 h-6 text-red-400" />
                            Data Ownership & Deletion
                        </h2>
                        <p className="leading-relaxed mb-4">
                            You retain full ownership of all data uploaded to DockParser. We do not claim any intellectual property rights over your invoices or contracts.
                        </p>
                        <p className="leading-relaxed">
                            <strong>Permanent Deletion:</strong> When you delete a file from your dashboard, it is immediately and permanently wiped from our storage servers and database. We do not retain "soft deleted" copies of customer documents.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-white/10 pt-12">
                        <h3 className="text-lg font-bold text-white mb-2">Questions?</h3>
                        <p>
                            For any privacy-related inquiries, please contact our Data Protection Officer at <a href="mailto:privacy@dockparser.com" className="text-blue-400 hover:text-blue-300">privacy@dockparser.com</a>.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

// Simple internal icon component to avoid huge imports if not needed, 
// but reusing lucide-react Brain is fine if imported above. 
// I'll grab Brain from lucide-react in the import.
const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.97-1.364" /><path d="M19.97 16.636A4 4 0 0 1 18 18" /></svg>
)
