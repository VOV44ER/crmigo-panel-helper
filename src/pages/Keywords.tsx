import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTonicToken } from "@/utils/tokenUtils";

interface KeywordStats {
  keyword: string;
  campaigns: Array<{
    id: number;
    name: string;
    status: string;
    country: {
      code: string;
      name: string;
    };
    imprint: string;
    offer: {
      id: number;
      name: string;
      vertical: {
        id: number;
        name: string;
      };
    };
    trackingLink: string;
    created: string;
  }>;
  countries: Array<{
    code: string;
    name: string;
  }>;
  offers: Array<{
    id: number;
    name: string;
    vertical: {
      id: number;
      name: string;
    };
  }>;
  clicks: number;
  revenue: number;
  rpc: number;
}

interface KeywordResponse {
  data: KeywordStats[];
}

export default function Keywords() {
  const today = new Date().toISOString().split('T')[0];

  const { data: keywordsData, isLoading, error } = useQuery<KeywordResponse>({
    queryKey: ['keywords', today],
    queryFn: async () => {
      const token = getTonicToken();
      if (!token) throw new Error('No authentication token found');

      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords-stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          from: today,
          to: today,
          orderField: 'clicks',
          orderOrientation: 'desc',
          offset: 0
        }
      });

      if (error) {
        console.error('Error fetching keywords:', error);
        throw error;
      }

      return data;
    },
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch keywords: ${error.message}`);
      },
    },
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container py-8">
          <h1 className="text-2xl font-bold mb-6">Keywords Management</h1>
          <div className="text-red-500">Error loading keywords: {error.message}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Keywords Management</h1>
        
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Campaigns</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Offers</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">RPC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                keywordsData?.data.map((item) => (
                  <TableRow key={item.keyword}>
                    <TableCell className="font-medium">{item.keyword}</TableCell>
                    <TableCell>
                      {item.campaigns.map((campaign) => (
                        <div key={campaign.id} className="mb-1">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.name}
                          </Badge>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {item.countries.map((country) => (
                        <Badge key={country.code} variant="outline" className="mr-1">
                          {country.name}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {item.offers.map((offer) => (
                        <Badge key={offer.id} variant="outline" className="mr-1">
                          {offer.name}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">{item.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.rpc.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}