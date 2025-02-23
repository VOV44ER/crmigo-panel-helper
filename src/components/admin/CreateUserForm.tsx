import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewUser } from "@/types/admin";
import { DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateUserFormProps {
  onSubmit: (user: NewUser) => Promise<void>;
  loading: boolean;
}

export const CreateUserForm = ({ onSubmit, loading }: CreateUserFormProps) => {
  const [newUser, setNewUser] = useState<NewUser>({
    password: "",
    username: "",
    full_name: "",
    platforms: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newUser);
    setNewUser({ password: "", username: "", full_name: "", platforms: [] });
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setNewUser(prev => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform),
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new user account.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={ handleSubmit } className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            value={ newUser.username }
            onChange={ (e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="full_name"
            value={ newUser.full_name }
            onChange={ (e) =>
              setNewUser({ ...newUser, full_name: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={ newUser.password }
            onChange={ (e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Platforms</label>
          <div className="flex gap-4">
            { ['facebook', 'tiktok'].map((platform) => (
              <div key={ platform } className="flex items-center space-x-2">
                <Checkbox
                  id={ `platform-${platform}` }
                  checked={ newUser.platforms.includes(platform) }
                  onCheckedChange={ (checked) =>
                    handlePlatformChange(platform, checked as boolean)
                  }
                />
                <label
                  htmlFor={ `platform-${platform}` }
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  { platform }
                </label>
              </div>
            )) }
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={ loading }>
          { loading ? "Creating..." : "Create User" }
        </Button>
      </form>
    </>
  );
};