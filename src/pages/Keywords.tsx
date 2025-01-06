import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Loader } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Keyword {
  keyword: string;
  campaigns: string;
  campaignOffer: string;
  geo: string;
  rpc: string;
  conv: number;
  rev: string;
}

export default function Keywords() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const { data: keywords, isLoading, error } = useQuery({
    queryKey: ['keywords', dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;

      const { data } = await supabase.functions.invoke('fetch-tonic-keywords', {
        body: {
          from: format(dateRange.from, "yyyy-MM-dd"),
          to: format(dateRange.to, "yyyy-MM-dd"),
        }
      });

      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  if (error) {
    toast.error('Failed to fetch keywords');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-6">Keywords Management</h1>
          <CampaignFilters 
            selectedStates={[]}
            onStateChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !keywords || keywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Database className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No keywords data found</h3>
              <p className="text-sm text-gray-500">Try selecting a different date range.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Campaign Offer</TableHead>
                  <TableHead>Geo</TableHead>
                  <TableHead>RPC</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Rev.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword: Keyword, index: number) => (
                  <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">{keyword.keyword}</TableCell>
                    <TableCell>{keyword.campaigns}</TableCell>
                    <TableCell>{keyword.campaignOffer}</TableCell>
                    <TableCell>
                      <img 
                        src={`https://flagcdn.com/w20/${keyword.geo.toLowerCase()}.png`}
                        alt={keyword.geo}
                        className="inline-block mr-2"
                      />
                      {keyword.geo}
                    </TableCell>
                    <TableCell>{keyword.rpc}</TableCell>
                    <TableCell className="text-right">{keyword.conv}</TableCell>
                    <TableCell className="text-right">{keyword.rev}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}