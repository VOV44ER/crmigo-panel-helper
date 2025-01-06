import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import KeywordTable from "@/components/keywords/KeywordTable";
import KeywordCard from "@/components/keywords/KeywordCard";
import EmptyState from "@/components/keywords/EmptyState";
import "flag-icons/css/flag-icons.min.css";

const Keywords = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
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
      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords', {
        body: { 
          ...(dateRange?.from && dateRange?.to ? {
            from: format(dateRange.from, "yyyy-MM-dd"),
            to: format(dateRange.to, "yyyy-MM-dd"),
          } : {}),
          username,
          campaignName: username
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
              {keywords.map((keyword, index) => (
                <KeywordCard key={index} keyword={keyword} />
              ))}
            </div>
          ) : (
            <KeywordTable 
              keywords={keywords}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Keywords;