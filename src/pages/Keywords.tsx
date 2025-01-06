import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Loader } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
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
}

interface Keyword {
  keyword: string;
  campaigns: Campaign[];
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

export default function Keywords() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const { data: keywords, isLoading, error } = useQuery({
    queryKey: ['keywords', dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;

      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords', {
        body: {
          from: format(dateRange.from, "yyyy-MM-dd"),
          to: format(dateRange.to, "yyyy-MM-dd"),
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  if (error) {
    toast.error('Failed to fetch keywords');
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-6">Keywords Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !keywords || !Array.isArray(keywords) || keywords.length === 0 ? (
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
                  <TableHead>Campaign</TableHead>
                  <TableHead>Offer</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">RPC</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword: Keyword, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{keyword.keyword}</TableCell>
                    <TableCell>{keyword.campaigns[0]?.name || 'N/A'}</TableCell>
                    <TableCell>{keyword.offers[0]?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {keyword.countries[0] && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://flagcdn.com/w20/${keyword.countries[0].code.toLowerCase()}.png`}
                            alt={keyword.countries[0].name}
                            className="w-5 h-auto"
                          />
                          {keyword.countries[0].name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{keyword.clicks}</TableCell>
                    <TableCell className="text-right">{formatNumber(keyword.rpc)}</TableCell>
                    <TableCell className="text-right">{formatNumber(keyword.revenue)}</TableCell>
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