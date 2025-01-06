import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTonicToken } from "@/utils/tokenUtils";

export const useCampaignData = () => {
  const { data: countriesResponse, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const token = getTonicToken();
      if (!token) throw new Error('No Tonic authentication token found');

      console.log('Fetching countries with token...');
      const { data, error } = await supabase.functions.invoke('fetch-tonic-countries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      
      console.log('Countries response:', data);
      return data;
    }
  });

  const { data: offersResponse, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const token = getTonicToken();
      if (!token) throw new Error('No Tonic authentication token found');

      console.log('Fetching offers with token...');
      const { data, error } = await supabase.functions.invoke('fetch-tonic-offers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }
      
      console.log('Offers response:', data);
      return data;
    }
  });

  return {
    countriesResponse,
    isLoadingCountries,
    offersResponse,
    isLoadingOffers,
  };
};