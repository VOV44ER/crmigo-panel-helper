import { LogOut, Menu, X } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Error logging out");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-8">
        <button
          onClick={toggleMobileMenu}
          className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        <div className="flex-1 flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Takahuli</h2>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <Link 
                to="/admin" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                User Management
              </Link>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' 
                      ? 'text-primary' 
                      : 'hover:text-primary'
                  }`}
                >
                  Overview
                </Link>
                <Link 
                  to="/keywords" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/keywords' 
                      ? 'text-primary' 
                      : 'hover:text-primary'
                  }`}
                >
                  Keywords
                </Link>
              </>
            )}
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3 space-y-2">
            {isAdmin ? (
              <Link 
                to="/admin" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                User Management
              </Link>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`block text-sm font-medium transition-colors py-2 ${
                    location.pathname === '/dashboard' 
                      ? 'text-primary' 
                      : 'hover:text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Overview
                </Link>
                <Link 
                  to="/keywords" 
                  className={`block text-sm font-medium transition-colors py-2 ${
                    location.pathname === '/keywords' 
                      ? 'text-primary' 
                      : 'hover:text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Keywords
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};