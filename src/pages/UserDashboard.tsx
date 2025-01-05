import { useState, useEffect } from "react";
import { Copy, X, MoreVertical, Settings, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  const [filter, setFilter] = useState("Active");

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
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button 
              variant={filter === "Active" ? "default" : "outline"}
              onClick={() => setFilter("Active")}
              className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
            >
              Active
            </Button>
            <Button 
              variant={filter === "Pending" ? "default" : "outline"}
              onClick={() => setFilter("Pending")}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Pending
            </Button>
            <Button 
              variant={filter === "Stopped" ? "default" : "outline"}
              onClick={() => setFilter("Stopped")}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Stopped
            </Button>
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

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
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">
              Filtered campaigns: {campaigns.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <select className="border rounded px-2 py-1">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon">
                  <span className="sr-only">First page</span>
                  ⟪
                </Button>
                <Button variant="outline" size="icon">
                  <span className="sr-only">Previous page</span>
                  ⟨
                </Button>
                <span className="text-sm">1 of {Math.ceil(campaigns.length / 10)}</span>
                <Button variant="outline" size="icon">
                  <span className="sr-only">Next page</span>
                  ⟩
                </Button>
                <Button variant="outline" size="icon">
                  <span className="sr-only">Last page</span>
                  ⟫
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;