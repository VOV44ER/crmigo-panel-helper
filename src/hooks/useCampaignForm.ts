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
  const [targetDomain, setTargetDomain] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry || !selectedOffer || !campaignName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = getTonicToken();
      if (!token) return;

      const { data, error } = await supabase.functions.invoke('create-tonic-campaign', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          countryId: selectedCountry.code,
          offerId: selectedOffer.id,
          name: campaignName,
          targetDomain: targetDomain || undefined
        }
      });

      if (error) throw error;

      toast.success("Campaign created successfully");
      onSuccess();
      // Reset form
      setSelectedCountry(null);
      setSelectedOffer(null);
      setCampaignName("");
      setTargetDomain("");
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
    targetDomain,
    setTargetDomain,
    handleSubmit,
  };
};