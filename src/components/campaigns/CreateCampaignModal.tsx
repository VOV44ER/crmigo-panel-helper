import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { CountrySelector } from "./CountrySelector";
import { OfferSelector } from "./OfferSelector";
import { useCampaignForm } from "@/hooks/useCampaignForm";
import { useCampaignData } from "@/hooks/useCampaignData";

export function CreateCampaignModal() {
  const [open, setOpen] = useState(false);
  const { countriesResponse, isLoadingCountries, offersResponse, isLoadingOffers } = useCampaignData();
  const {
    selectedCountry,
    setSelectedCountry,
    selectedOffer,
    setSelectedOffer,
    campaignName,
    setCampaignName,
    targetDomain,
    setTargetDomain,
    handleSubmit,
  } = useCampaignForm(() => setOpen(false));

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