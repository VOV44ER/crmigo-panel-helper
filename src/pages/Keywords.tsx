import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTonicToken } from "@/utils/tokenUtils";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import { format } from "date-fns";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const { data: keywordsData, isLoading, error } = useQuery<KeywordResponse>({
    queryKey: ['keywords', dateRange],
    queryFn: async () => {
      const token = getTonicToken();
      if (!token) throw new Error('No authentication token found');

      const { data: userData } = await supabase.auth.getUser();
      const username = userData.user?.email?.split('@')[0] || '';

      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords-stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          orderField: 'clicks',
          orderOrientation: 'desc',
          offset: 0,
          campaignName: username
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Keywords Management</h1>
          <CampaignFilters
            selectedStates={[]}
            onStateChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-600">Keyword</TableHead>
                  <TableHead className="font-semibold text-gray-600">Campaigns</TableHead>
                  <TableHead className="font-semibold text-gray-600">Campaign Offer</TableHead>
                  <TableHead className="font-semibold text-gray-600">Geo</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">RPC</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">Conv.</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">Rev.</TableHead>
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
                    <TableRow key={item.keyword} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.keyword}</TableCell>
                      <TableCell>
                        {item.campaigns.map((campaign) => (
                          <div key={campaign.id} className="mb-1">
                            <Badge 
                              variant={campaign.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {campaign.name}
                            </Badge>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {item.offers.map((offer) => (
                          <span key={offer.id} className="text-sm text-gray-600">
                            {offer.name}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {item.countries.map((country) => (
                          <span 
                            key={country.code} 
                            className="inline-flex items-center"
                          >
                            <span className={`fi fi-${country.code.toLowerCase()} mr-2`}></span>
                            {country.name}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">${item.rpc.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.clicks}</TableCell>
                      <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}