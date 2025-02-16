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

export function CreateCampaignModal({ isFacebook }) {
  const [open, setOpen] = useState(false);
  const { countriesResponse, isLoadingCountries, offersResponse, isLoadingOffers } = useCampaignData();
  const {
    selectedCountry,
    setSelectedCountry,
    selectedOffer,
    setSelectedOffer,
    campaignName,
    setCampaignName,
    handleSubmit,
  } = useCampaignForm(() => setOpen(false));

  return (
    <Dialog open={ open } onOpenChange={ setOpen }>
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
        <form onSubmit={ (e) => handleSubmit(e, isFacebook) } className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Select Country</Label>
            <CountrySelector
              selectedCountry={ selectedCountry }
              onCountrySelect={ setSelectedCountry }
              countries={ countriesResponse?.data || [] }
              isLoading={ isLoadingCountries }
              placeholder={ selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : "Select a country" }
            />
          </div>

          <div className="space-y-2">
            <Label>Select Offer</Label>
            <OfferSelector
              selectedOffer={ selectedOffer }
              onOfferSelect={ setSelectedOffer }
              offers={ offersResponse?.data || [] }
              isLoading={ isLoadingOffers }
              placeholder={ selectedOffer ? `${selectedOffer.name} (${selectedOffer.vertical.name})` : "Select an offer" }
            />
          </div>

          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input
              value={ campaignName }
              onChange={ (e) => setCampaignName(e.target.value) }
              placeholder="Enter campaign name"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Campaign
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}