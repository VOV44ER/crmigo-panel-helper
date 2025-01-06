import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import KeywordTable from "@/components/keywords/KeywordTable";
import KeywordCard from "@/components/keywords/KeywordCard";
import EmptyState from "@/components/keywords/EmptyState";
import "flag-icons/css/flag-icons.min.css";

const Keywords = () => {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: today,
  });
  const [username, setUsername] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedCountries, setSelectedCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedOffers, setSelectedOffers] = useState<Array<{ id: number; name: string; vertical: { id: number; name: string } }>>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const getUsername = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login first");
        return;
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

    getUsername();
  }, []);

  const { data: response, isLoading } = useQuery({
    queryKey: ['keywords', dateRange, username, selectedCountries, selectedOffers],
    queryFn: async () => {
      if (!username || !dateRange.from || !dateRange.to) return null;

      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords-stats', {
        body: { 
          from: format(dateRange.from, "yyyy-MM-dd"),
          to: format(dateRange.to, "yyyy-MM-dd"),
          username,
          ...(selectedCountries.length > 0 && {
            countryCodes: selectedCountries.map(c => c.code).join(',')
          }),
          ...(selectedOffers.length > 0 && {
            offerIds: selectedOffers.map(o => o.id).join(',')
          })
        }
      });

      if (error) {
        console.error('Error fetching keywords:', error);
        throw error;
      }
      return data;
    },
    enabled: !!username && !!dateRange.from && !!dateRange.to,
  });

  const keywords = response?.data || [];
  const showEmptyState = !isLoading && (!keywords || keywords.length === 0);

  const handleClearFilters = () => {
    setSelectedCountries([]);
    setSelectedOffers([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          <div className="flex-grow">
            <CampaignFilters 
              selectedStates={[]}
              onStateChange={() => {}}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              hideStateFilter={true}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
              selectedOffers={selectedOffers}
              onOfferChange={setSelectedOffers}
              onClearFilters={handleClearFilters}
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
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Keywords;