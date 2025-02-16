import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTonicToken } from "@/utils/tokenUtils";

interface Offer {
  id: number;
  name: string;
  vertical: {
    id: number;
    name: string;
  };
}

export const useCampaignForm = (onSuccess: () => void) => {
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; } | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [campaignName, setCampaignName] = useState("");

  const handleSubmit = async (e: React.FormEvent, isFacebook: boolean) => {
    e.preventDefault();
    if (!selectedCountry || !selectedOffer || !campaignName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = getTonicToken();
      if (!token) return;

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to create campaigns");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-tonic-campaign', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          isFacebook: isFacebook,
          countryId: selectedCountry.code,
          offerId: selectedOffer.id,
          name: campaignName,
          userId: session.user.id,
          imprint: false // Added hardcoded imprint parameter
        }
      });

      if (error) throw error;

      toast.success("Campaign created successfully");
      onSuccess();
      // Reset form
      setSelectedCountry(null);
      setSelectedOffer(null);
      setCampaignName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create campaign");
    }
  };

  return {
    selectedCountry,
    setSelectedCountry,
    selectedOffer,
    setSelectedOffer,
    campaignName,
    setCampaignName,
    handleSubmit,
  };
};