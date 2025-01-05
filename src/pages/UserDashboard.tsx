import { useState, useEffect } from "react";
import { Copy, X, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import CampaignPagination from "@/components/campaigns/CampaignPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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

const fetchCampaigns = async (states: string[], limit: number, offset: number) => {
  const session = localStorage.getItem('sb-iviaxxfodvwqjiiomzkl-auth-token');
  if (!session) {
    throw new Error('No authentication token found');
  }

  const { access_token } = JSON.parse(session);
  if (!access_token) {
    throw new Error('Invalid token format');
  }

  const params = new URLSearchParams({
    state: states.join(','),
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const { data, error } = await supabase.functions.invoke('fetch-tonic-campaigns', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    body: { params: params.toString() }
  });

  if (error) {
    console.error('Edge Function Error:', error);
    throw new Error(`Failed to fetch campaigns: ${error.message}`);
  }

  return data;
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedStates, setSelectedStates] = useState<string[]>(['active']);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

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

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['campaigns', selectedStates, limit, offset],
    queryFn: () => fetchCampaigns(selectedStates, limit, offset),
  });

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

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
        <CampaignFilters 
          selectedStates={selectedStates}
          onStateChange={setSelectedStates}
        />

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vertical</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Geo</TableHead>
                <TableHead>TL</TableHead>
                <TableHead>Imprint</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">VTC</TableHead>
                <TableHead className="text-right">RPC</TableHead>
                <TableHead className="text-right">RPMV</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign: TonicCampaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded border-gray-300" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.id}</TableCell>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell>{campaign.vertical}</TableCell>
                  <TableCell>{campaign.offer}</TableCell>
                  <TableCell>{campaign.country}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleCopyLink(campaign.link)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <X className="h-4 w-4" />
                  </TableCell>
                  <TableCell className="text-right">0</TableCell>
                  <TableCell className="text-right">0</TableCell>
                  <TableCell className="text-right">0.0%</TableCell>
                  <TableCell className="text-right">$0.00</TableCell>
                  <TableCell className="text-right">$0.00</TableCell>
                  <TableCell className="text-right">$0.00</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <CampaignPagination
            total={campaigns.length}
            limit={limit}
            offset={offset}
            onLimitChange={setLimit}
            onOffsetChange={setOffset}
          />
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;