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
import { useQuery } from "@tanstack/react-query";

interface TonicCampaign {
  id: string;
  name: string;
  type: string;
  country: string;
  imprint: string;
  offer_id: string;
  offer: string;
  vertical: string;
  link: string;
  target: string;
}

const fetchCampaigns = async () => {
  const session = localStorage.getItem('sb-iviaxxfodvwqjiiomzkl-auth-token');
  if (!session) {
    throw new Error('No authentication token found');
  }

  const { access_token } = JSON.parse(session);
  if (!access_token) {
    throw new Error('Invalid token format');
  }

  console.log('Using access token:', access_token);

  const { data, error } = await supabase.functions.invoke('fetch-tonic-campaigns', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (error) {
    console.error('Edge Function Error:', error);
    throw new Error(`Failed to fetch campaigns: ${error.message}`);
  }

  return data;
};

const UserDashboard = () => {
  const navigate = useNavigate();
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

      if (session.user.email === "admin@admin.com") {
        toast.error("Please use the admin dashboard");
        navigate("/admin");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch campaigns using React Query
  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <div className="text-center">Loading campaigns...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <div className="text-center text-red-500">
            Error loading campaigns: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Campaigns</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No campaigns available.
            </div>
          ) : (
            <div className="divide-y">
              {campaigns.map((campaign: TonicCampaign) => (
                <div
                  key={campaign.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{campaign.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Offer: {campaign.offer} | Vertical: {campaign.vertical}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Type:</span> {campaign.type}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Country:</span> {campaign.country}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Link:</span>{" "}
                          <a 
                            href={campaign.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {campaign.link}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
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
