import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTonicToken } from "@/utils/tokenUtils";

export const useCampaignData = () => {
  const { data: countriesResponse, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      console.log('Fetching countries...');
      const token = getTonicToken();
      if (!token) throw new Error('No authentication token found');

      const { data, error } = await supabase.functions.invoke('fetch-tonic-countries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      console.log('Countries API Response:', data);
      return data;
    }
  });

  const { data: offersResponse, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      console.log('Fetching offers...');
      const token = getTonicToken();
      if (!token) throw new Error('No authentication token found');

      const { data, error } = await supabase.functions.invoke('fetch-tonic-offers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }
      console.log('Offers API Response:', data);
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