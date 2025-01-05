import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CountrySelector } from "./CountrySelector";
import { OfferSelector } from "./OfferSelector";

interface Country {
  code: string;
  name: string;
}

interface Offer {
  id: number;
  name: string;
  vertical: {
    id: number;
    name: string;
  };
}

export function CreateCampaignModal() {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [targetDomain, setTargetDomain] = useState("");

  const { data: countriesResponse, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-tonic-countries');
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      return data as { data: Country[] };
    }
  });

  const { data: offersResponse, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-tonic-offers');
      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }
      return data as { data: Offer[] };
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry || !selectedOffer || !campaignName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('create-tonic-campaign', {
        body: {
          countryId: selectedCountry.code,
          offerId: selectedOffer.id,
          name: campaignName,
          targetDomain: targetDomain || undefined
        }
      });

      if (error) throw error;

      toast.success("Campaign created successfully");
      setOpen(false);
      // Reset form
      setSelectedCountry(null);
      setSelectedOffer(null);
      setCampaignName("");
      setTargetDomain("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create campaign");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new campaign.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Select Country</Label>
            <CountrySelector
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
              countries={countriesResponse?.data || []}
              isLoading={isLoadingCountries}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Offer</Label>
            <OfferSelector
              selectedOffer={selectedOffer}
              onOfferSelect={setSelectedOffer}
              offers={offersResponse?.data || []}
              isLoading={isLoadingOffers}
            />
          </div>

          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="space-y-2">
            <Label>Target Domain (optional)</Label>
            <div className="flex">
              <div className="bg-muted px-3 py-2 rounded-l-md border border-r-0">
                https://www.
              </div>
              <Input
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                className="rounded-l-none"
                placeholder="example.com"
              />
              <div className="bg-muted px-3 py-2 rounded-r-md border border-l-0">
                .bond
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Campaign
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}