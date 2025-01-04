import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Campaign {
  id: number;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
}

const UserDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const id = campaigns.length + 1;
    setCampaigns([
      ...campaigns,
      { ...newCampaign, id, status: "active" as const },
    ]);
    toast.success("Campaign created successfully!");
    setNewCampaign({ name: "", description: "" });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Campaign Dashboard</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <Input
              placeholder="Campaign Name"
              value={newCampaign.name}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, name: e.target.value })
              }
              required
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Campaign Description"
              value={newCampaign.description}
              onChange={(e) =>
                setNewCampaign({ ...newCampaign, description: e.target.value })
              }
              required
            />
            <Button type="submit" className="w-full">
              Create Campaign
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 bg-gray-50 rounded space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{campaign.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
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
                <p className="text-sm text-gray-600">{campaign.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Add edit functionality later
                      toast.info("Edit functionality coming soon!");
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setCampaigns(
                        campaigns.filter((c) => c.id !== campaign.id)
                      );
                      toast.success("Campaign deleted successfully!");
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-center text-gray-500">
                No campaigns yet. Create your first one!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;