import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-8">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">CRM System</h2>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
};