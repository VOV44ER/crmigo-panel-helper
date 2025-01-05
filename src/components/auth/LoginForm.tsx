import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isAdmin = session.user.email === "admin@admin.com";
        navigate(isAdmin ? "/admin" : "/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: credentials.email,
          });
          
          if (resendError) throw resendError;
          
          toast.error("Please check your email to confirm your account");
          return;
        }
        throw signInError;
      }

      // Check if the user is admin (admin@admin.com)
      const isAdmin = credentials.email === "admin@admin.com";
      
      if (isAdmin) {
        // Verify admin status through RPC
        const { data: isAdminVerified, error: adminError } = await supabase.rpc('is_admin');
        if (adminError || !isAdminVerified) {
          toast.error("Unauthorized access");
          await supabase.auth.signOut();
          return;
        }
        toast.success("Welcome back, Admin!");
        navigate("/admin");
      } else {
        // For regular users, authenticate with Tonic API
        const { data: session } = await supabase.auth.getSession();
        const { error: tonicError } = await supabase.functions.invoke('authenticate-tonic', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (tonicError) {
          toast.error("Failed to authenticate with Tonic API");
          await supabase.auth.signOut();
          return;
        }

        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};