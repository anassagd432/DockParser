import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Construction } from "lucide-react";

interface PlaceholderProps {
    title: string;
}

export const PlaceholderPage = ({ title }: PlaceholderProps) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center text-white">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold mb-4">{title}</h1>
                <p className="text-gray-400 mb-8">This feature is coming soon.</p>
                <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>
        </div>
    );
};
