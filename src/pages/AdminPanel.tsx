import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UsersTable } from "@/components/admin/UsersTable";
import { User, NewUser } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated and admin
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        navigate("/auth");
        return;
      }

      if (session.user.email !== "admin@admin.com") {
        toast.error("Unauthorized access");
        navigate("/dashboard");
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError || !isAdmin) {
        toast.error("Unauthorized access");
        navigate("/dashboard");
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    checkAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch users using React Query
  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, password_text');
      
      if (error) {
        console.error('Error fetching users:', error);
        toast.error("Failed to fetch users");
        throw error;
      }
      
      return profiles as User[];
    }
  });

  const handleCreateUser = async (newUser: NewUser) => {
    setLoading(true);
    try {
      // First, create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: `${newUser.username}@user.com`,
        password: newUser.password,
        options: {
          data: {
            username: newUser.username,
            full_name: newUser.full_name
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("No user returned from auth creation");

      // Update the password_text in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          password_text: newUser.password
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success("User created successfully!");
      setIsModalOpen(false);
      refetch();

      // Ensure we maintain the admin's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== "admin@admin.com") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: "admin@admin.com",
          password: "admin123" // Make sure this matches your admin password
        });
        if (signInError) throw signInError;
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('delete_user_with_profile', {
        user_id: userId
      });

      if (error) throw error;

      toast.success("User deleted successfully!");
      refetch();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateUserForm onSubmit={handleCreateUser} loading={loading} />
            </DialogContent>
          </Dialog>
        </div>

        <UsersTable users={users} onDeleteUser={handleDeleteUser} />
      </main>
    </div>
  );
};

export default AdminPanel;