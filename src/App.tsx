import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import AuthPage from "./pages/AuthPage";
import AdminPanel from "./pages/AdminPanel";
import UserDashboard from "./pages/UserDashboard";
import Keywords from "./pages/Keywords";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

// Protected route wrapper component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to access this page");
        navigate("/auth");
        return;
      }

      const isAdmin = session.user.email === "admin@admin.com";
      
      if (adminOnly && !isAdmin) {
        navigate("/dashboard");
      } else if (!adminOnly && isAdmin) {
        navigate("/admin");
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (session) {
        const isAdmin = session.user.email === "admin@admin.com";
        if (adminOnly && !isAdmin) {
          navigate("/dashboard");
        } else if (!adminOnly && isAdmin) {
          navigate("/admin");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, adminOnly]);

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    // Check if we're on the root path and redirect to auth
    if (window.location.pathname === '/') {
      window.location.href = '/auth';
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/keywords" 
              element={
                <ProtectedRoute>
                  <Keywords />
                </ProtectedRoute>
              } 
            />
            {/* Catch all route for 404 */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;