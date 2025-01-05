import { LogOut } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-8">
        <div className="flex-1 flex items-center space-x-4">
          <h2 className="text-lg font-semibold">CRM System</h2>
          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <Link 
                to="/admin" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                User Management
              </Link>
            ) : (
              <Link 
                to="/dashboard" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Campaigns
              </Link>
            )}
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
};