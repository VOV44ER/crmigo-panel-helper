import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const LoginForm = () => {
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const isAdmin = email === 'admin@admin.com';
      if (isAdmin) {
        toast.success("Welcome back, Admin!");
        navigate("/admin");
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Failed to login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
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
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
};