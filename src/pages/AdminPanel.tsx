import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UsersTable } from "@/components/admin/UsersTable";
import { User, NewUser } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";

const AdminPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch users using React Query
  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name');
      
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
      const { data, error } = await supabase.rpc('create_user_with_profile', {
        input_username: newUser.username,
        input_password: newUser.password,
        input_full_name: newUser.full_name
      });

      if (error) throw error;

      toast.success("User created successfully!");
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_user_with_profile', {
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