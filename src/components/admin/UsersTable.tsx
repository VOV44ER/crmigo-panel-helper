import { User } from "@/types/admin";
import { Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsersTableProps {
  users: User[];
  onDeleteUser: (userId: string) => Promise<void>;
  refetch: any;
}

export const UsersTable = ({ users, onDeleteUser, refetch }: UsersTableProps) => {
  const platforms = ['facebook', 'tiktok'];

  const handlePlatformChange = async (userId: string, platform: string, checked: boolean) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const currentPlatforms = user.platforms || [];
      const newPlatforms = checked
        ? [...new Set([...currentPlatforms, platform])] // Ensure uniqueness
        : currentPlatforms.filter(p => p !== platform);

      const { error } = await supabase
        .from('profiles')
        .update({ platforms: newPlatforms })
        .eq('id', userId);

      if (error) throw error;

      toast.success("Platforms updated successfully");

      // Manually update UI state
      refetch(); // If using React Query
    } catch (error: any) {
      console.error('Error updating platforms:', error);
      toast.error(error.message || "Failed to update platforms");
    }
  };

  console.log(users)


  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Password</TableHead>
            <TableHead>Platforms</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { users.map((user) => (
            <TableRow key={ user.id } className="cursor-pointer hover:bg-gray-50">
              <TableCell>{ user.full_name }</TableCell>
              <TableCell>{ user.username }</TableCell>
              <TableCell>{ user.password_text }</TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  { platforms.map((platform) => (
                    <div key={ platform } className="flex items-center space-x-2">
                      <Checkbox
                        id={ `${user.id}-${platform}` }
                        checked={ (user.platforms || []).includes(platform) }
                        onCheckedChange={ (checked) =>
                          handlePlatformChange(user.id, platform, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={ `${user.id}-${platform}` }
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        { platform }
                      </label>
                    </div>
                  )) }
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={ () => onDeleteUser(user.id) }
                  className="cursor-pointer"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )) }
          { users.length === 0 && (
            <TableRow>
              <TableCell colSpan={ 5 } className="text-center text-gray-500 py-8">
                No users yet. Create your first one!
              </TableCell>
            </TableRow>
          ) }
        </TableBody>
      </Table>
    </div>
  );
};