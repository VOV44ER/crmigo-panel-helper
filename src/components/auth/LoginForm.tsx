import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // For admin login, use exact credentials
      const email = username === 'admin' ? 'admin@admin.com' : `${username}@user.com`;
      
      // Make sure password matches expected format
      if (username === 'admin' && password !== 'Qwerty98761') {
        toast.error("Invalid admin credentials");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid username or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email before logging in.");
        } else {
          toast.error("Login failed: " + error.message);
        }
        return;
      }

      // Check if user is admin
      const isAdmin = email === 'admin@admin.com';
      
      // Show welcome message
      toast.success(`Welcome ${isAdmin ? 'Admin' : username}!`);

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          name="email"
          placeholder="Username"
          required
          className="w-full"
        />
      </div>
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};