import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import { format } from "date-fns";
import { useState } from "react";
import KeywordTable from "@/components/keywords/KeywordTable";
import KeywordCard from "@/components/keywords/KeywordCard";
import EmptyState from "@/components/keywords/EmptyState";
import { KeywordStats } from "@/types/tonic";

export default function Keywords() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const { data: keywordsData, isLoading } = useQuery({
    queryKey: ['keywords', dateRange],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const username = userData.user?.email?.split('@')[0] || '';

      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords-stats', {
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

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="hidden sm:block">
        <Skeleton className="h-[400px] w-full" />
      </div>
      <div className="sm:hidden space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    </div>
  );

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
            hideStateFilter
          />
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <LoadingSkeleton />
          ) : !keywordsData?.data || keywordsData.data.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden sm:block">
                <KeywordTable keywords={keywordsData.data} />
              </div>
              
              {/* Mobile View */}
              <div className="sm:hidden p-4 space-y-4">
                {keywordsData.data.map((item: KeywordStats) => (
                  <KeywordCard
                    key={item.keyword}
                    keyword={item.keyword}
                    campaigns={item.campaigns}
                    countries={item.countries}
                    offers={item.offers}
                    clicks={item.clicks}
                    revenue={item.revenue}
                    rpc={item.rpc}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}