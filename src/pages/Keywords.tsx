import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import KeywordTable from "@/components/keywords/KeywordTable";
import KeywordCard from "@/components/keywords/KeywordCard";
import EmptyState from "@/components/keywords/EmptyState";
import "flag-icons/css/flag-icons.min.css";

const Keywords = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: today,
  });
  const [username, setUsername] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
      }
    };

    checkAuth();
  }, [navigate]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['keywords', dateRange, username],
    queryFn: async () => {
      if (!username) throw new Error('Username is required');

      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('campaign_id')
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id)
        .maybeSingle();

      if (campaignError) {
        toast.error("Error fetching campaign");
        throw campaignError;
      }

      if (!campaignData?.campaign_id) {
        toast.error("No campaign found");
        navigate("/dashboard");
        throw new Error('No campaign found');
      }

      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords', {
        body: { 
          campaign_id: campaignData.campaign_id,
          ...(dateRange?.from && dateRange?.to ? {
            from: format(dateRange.from, "yyyy-MM-dd"),
            to: format(dateRange.to, "yyyy-MM-dd"),
          } : {}),
          username,
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  const keywords = response?.data || [];
  const showEmptyState = !isLoading && (!keywords || keywords.length === 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-grow">
            <CampaignFilters 
              selectedStates={[]}
              onStateChange={() => {}}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              hideStateFilter={true}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {showEmptyState ? (
            <EmptyState />
          ) : isMobile ? (
            <div className="grid grid-cols-1 gap-4 p-4">
              {keywords.map((keyword) => (
                <KeywordCard 
                  key={keyword.keyword}
                  keyword={keyword.keyword}
                  campaigns={keyword.campaigns}
                  countries={keyword.countries}
                  offers={keyword.offers}
                  clicks={keyword.clicks}
                  revenue={keyword.revenue}
                  rpc={keyword.rpc}
                />
              ))}
            </div>
          ) : (
            <KeywordTable 
              keywords={keywords}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Keywords;