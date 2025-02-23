import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import CampaignPagination from "@/components/campaigns/CampaignPagination";
import CampaignTable from "@/components/campaigns/CampaignTable";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedStates, setSelectedStates] = useState<string[]>(['active']);
  const [isFacebook, setIsFacebook] = useState<boolean>(false);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(today, -30),
    to: today,
  });
  const [username, setUsername] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[] | null>([]);
  const [selectedCountries, setSelectedCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedOffers, setSelectedOffers] = useState<Array<{ id: number; name: string; vertical: { id: number; name: string } }>>([]);

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
        .select('username, platforms')
        .eq('id', session.user.id)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
      }
      if (profile?.platforms) {
        setPlatforms(profile.platforms);
        if (profile?.platforms[0] === 'facebook') {
          setIsFacebook(true)
        } else {
          setIsFacebook(false)
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [dateRange, selectedCountries, selectedOffers, selectedStates]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['campaigns', isFacebook, selectedStates, limit, offset, dateRange, username, selectedCountries, selectedOffers],
    queryFn: async () => {
      if (selectedStates.length === 0) {
        setSelectedStates(['active']);
        return null;
      }

      const { data, error } = await supabase.functions.invoke('fetch-tonic-campaigns', {
        body: {
          isFacebook,
          states: selectedStates,
          limit,
          offset,
          ...(dateRange?.from && dateRange?.to ? {
            from: format(dateRange.from, "yyyy-MM-dd"),
            to: format(dateRange.to, "yyyy-MM-dd"),
          } : {}),
          username,
          ...(selectedCountries.length > 0 && {
            countryCodes: selectedCountries.map(c => c.code).join(',')
          }),
          ...(selectedOffers.length > 0 && {
            offerIds: selectedOffers.map(o => o.id).join(',')
          })
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  if (error) {
    toast.error(error instanceof Error ? error.message : 'An error occurred');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          <div className="flex-grow">
            <CampaignFilters
              selectedStates={ selectedStates }
              onStateChange={ (states) => {
                if (states.length === 0) {
                  toast.error("At least one state must be selected");
                  return;
                }
                setSelectedStates(states);
              } }
              dateRange={ dateRange }
              onDateRangeChange={ setDateRange }
              selectedCountries={ selectedCountries }
              onCountryChange={ setSelectedCountries }
              selectedOffers={ selectedOffers }
              onOfferChange={ setSelectedOffers }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            { platforms.map((state) => (
              <Button
                key={ state }
                variant={ selectedStates.includes(state) ? "default" : "outline" }
                onClick={ () => {
                  state === 'facebook' ? setIsFacebook(true) : setIsFacebook(false)
                } }
                className={ cn(
                  "capitalize whitespace-nowrap",
                  isFacebook && state === 'facebook' && "bg-green-500 hover:bg-green-600",
                  !isFacebook && state === 'tiktok' && "bg-green-500 hover:bg-green-600",
                ) }
              >
                { state }
              </Button>
            )) }
          </div>
          <div className="shrink-0">
            <CreateCampaignModal isFacebook={ isFacebook } />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <CampaignTable
            campaigns={ response?.data || [] }
            isLoading={ isLoading }
          />
          <CampaignPagination
            total={ response?.pagination.total || 0 }
            limit={ limit }
            offset={ offset }
            onLimitChange={ (newLimit) => {
              setLimit(newLimit);
              setOffset(0); // Reset to first page when changing limit
            } }
            onOffsetChange={ setOffset }
          />
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;