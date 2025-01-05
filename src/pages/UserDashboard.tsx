import { useState, useEffect } from "react";
import { Settings, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import CampaignPagination from "@/components/campaigns/CampaignPagination";
import CampaignTable from "@/components/campaigns/CampaignTable";
import { TonicResponse } from "@/types/tonic";
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
    };

    checkAuth();
  }, [navigate]);

  const { data: response, isLoading, error } = useQuery<TonicResponse>({
    queryKey: ['campaigns', selectedStates, limit, offset, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-tonic-campaigns', {
        body: { 
          states: selectedStates,
          limit,
          offset,
          from: dateRange?.from?.toISOString().split('T')[0],
          to: dateRange?.to?.toISOString().split('T')[0]
        }
      });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <div className="text-center">Loading campaigns...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <div className="text-center text-red-500">
            Error loading campaigns: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <CampaignFilters 
            selectedStates={selectedStates}
            onStateChange={setSelectedStates}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <CampaignTable campaigns={response?.data || []} />
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