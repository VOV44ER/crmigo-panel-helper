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
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedStates, setSelectedStates] = useState<string[]>(['active']);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [username, setUsername] = useState<string | null>(null);

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

      // Get username from profiles table
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

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['campaigns', selectedStates, limit, offset, dateRange, username],
    queryFn: async () => {
      // Ensure we have at least one state selected
      if (selectedStates.length === 0) {
        setSelectedStates(['active']);
        return null;
      }

      const { data, error } = await supabase.functions.invoke('fetch-tonic-campaigns', {
        body: { 
          states: selectedStates,
          limit,
          offset,
          from: dateRange?.from?.toISOString().split('T')[0],
          to: dateRange?.to?.toISOString().split('T')[0],
          username
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!username, // Only run query when we have the username
  });

  if (error) {
    toast.error(error instanceof Error ? error.message : 'An error occurred');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-grow">
            <CampaignFilters 
              selectedStates={selectedStates}
              onStateChange={(states) => {
                if (states.length === 0) {
                  toast.error("At least one state must be selected");
                  return;
                }
                setSelectedStates(states);
              }}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
          <div className="shrink-0">
            <CreateCampaignModal />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <CampaignTable 
            campaigns={response?.data || []} 
            isLoading={isLoading}
          />
          <CampaignPagination
            total={response?.pagination.total || 0}
            limit={limit}
            offset={offset}
            onLimitChange={setLimit}
            onOffsetChange={setOffset}
          />
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;