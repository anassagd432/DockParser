import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { toast } from "sonner";
import { User, Trash2, Save, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";
import { UserMenu } from "../components/dashboard/UserMenu";

export const SettingsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
    const [fullName, setFullName] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            setFullName(user.user_metadata?.full_name || "");
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });
            if (error) throw error;
            toast.success("Profile updated successfully");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== "DELETE") {
            toast.error("Please type DELETE to confirm");
            return;
        }

        setIsDeleting(true);
        try {
            // Call the RPC function we created
            const { error } = await supabase.rpc('delete_own_account');

            if (error) throw error;

            await supabase.auth.signOut();
            toast.success("Account deleted successfully");
            navigate("/");
        } catch (error: unknown) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete account: " + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0C10] text-white p-6">
            <header className="flex justify-between items-center max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Logo className="h-8 w-auto" showText={false} />
                    <div className="w-px h-6 bg-white/10" />
                    <UserMenu />
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-8">
                {/* Profile Section */}
                <GlassCard className="p-8 backdrop-blur-xl border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold">Profile Settings</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="pt-2">
                            <Button disabled={loading} className="gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </GlassCard>

                {/* Danger Zone */}
                <GlassCard className="p-8 backdrop-blur-xl border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-red-50 text-red-400">Danger Zone</h2>
                    </div>

                    <div className="space-y-6">
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Deleting your account is permanent. All your data, including invoices, contracts, and history will be permanently removed. This action cannot be undone.
                        </p>

                        <div className="space-y-4 pt-4 border-t border-red-500/10">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Type <span className="font-mono text-red-400">DELETE</span> to confirm</label>
                                <input
                                    type="text"
                                    value={deleteConfirm}
                                    onChange={(e) => setDeleteConfirm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-gray-600"
                                    placeholder="DELETE"
                                />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 gap-2"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirm !== "DELETE" || isDeleting}
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete Account Permanently
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
