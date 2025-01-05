import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Campaign {
  id: number;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if user is authenticated and not admin
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        navigate("/auth");
        return;
      }

      // If user is admin@admin.com, redirect to admin panel
      if (session.user.email === "admin@admin.com") {
        toast.error("Please use the admin dashboard");
        navigate("/admin");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign: Campaign = {
      id: Date.now(),
      ...newCampaign,
      status: "active",
    };
    setCampaigns([...campaigns, campaign]);
    setNewCampaign({ name: "", description: "" });
    setIsModalOpen(false);
    toast.success("Campaign created successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Campaign Name
                  </label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={newCampaign.description}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No campaigns yet. Create your first one!
            </div>
          ) : (
            <div className="divide-y">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">
                      {campaign.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === "active"
                        ? "bg-green-100 text-green-800"
                        : campaign.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
