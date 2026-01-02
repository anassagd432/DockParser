import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { LandingPage } from "./pages/LandingPage";
import { ContactPage } from "./pages/ContactPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error("Auth check failed:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white font-sans antialiased selection:bg-blue-500/30">
      <BrowserRouter>
        <Toaster position="top-right" theme="dark" closeButton />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Auth Routes - Redirect to dashboard if logged in */}
          <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!session ? <SignupPage /> : <Navigate to="/dashboard" replace />} />

          {/* For backward compatibility */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route path="/settings" element={session ? <PlaceholderPage title="Settings" /> : <Navigate to="/login" replace />} />
          <Route path="/billing" element={session ? <PlaceholderPage title="Billing" /> : <Navigate to="/login" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
