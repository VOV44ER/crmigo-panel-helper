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

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (newUser: NewUser) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_user_with_profile', {
        input_email: newUser.email,
        input_password: newUser.password,
        input_username: newUser.username,
        input_full_name: newUser.full_name
      });

      if (error) throw error;

      // Explicitly type the response data
      const userData: User = {
        id: data.id as string,
        email: data.email as string,
        username: data.username as string,
        full_name: data.full_name as string
      };

      setUsers((prevUsers) => [...prevUsers, userData]);
      setIsModalOpen(false);
      toast.success("User created successfully!");
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
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

        <UsersTable users={users} />
      </main>
    </div>
  );
};

export default AdminPanel;