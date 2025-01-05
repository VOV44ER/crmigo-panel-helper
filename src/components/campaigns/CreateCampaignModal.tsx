import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Offer {
  id: number;
  name: string;
}

export function CreateCampaignModal() {
  const [open, setOpen] = useState(false);
  const [openCountryCombobox, setOpenCountryCombobox] = useState(false);
  const [openOfferCombobox, setOpenOfferCombobox] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [targetDomain, setTargetDomain] = useState("");

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-tonic-countries');
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      return data as Country[];
    }
  });

  const { data: offers = [], isLoading: isLoadingOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-tonic-offers');
      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }
      return data as Offer[];
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
          countryId: selectedCountry.id,
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
            <Popover open={openCountryCombobox} onOpenChange={setOpenCountryCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountryCombobox}
                  className="w-full justify-between"
                  disabled={isLoadingCountries}
                >
                  {isLoadingCountries ? (
                    "Loading countries..."
                  ) : selectedCountry ? (
                    selectedCountry.name
                  ) : (
                    "Select country..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start" style={{ zIndex: 50 }}>
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {countries.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={country.name}
                        onSelect={() => {
                          setSelectedCountry(country);
                          setOpenCountryCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCountry?.id === country.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Select Offer</Label>
            <Popover open={openOfferCombobox} onOpenChange={setOpenOfferCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOfferCombobox}
                  className="w-full justify-between"
                  disabled={isLoadingOffers}
                >
                  {isLoadingOffers ? (
                    "Loading offers..."
                  ) : selectedOffer ? (
                    selectedOffer.name
                  ) : (
                    "Select offer..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start" style={{ zIndex: 50 }}>
                <Command>
                  <CommandInput placeholder="Search offer..." />
                  <CommandEmpty>No offer found.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {offers.map((offer) => (
                      <CommandItem
                        key={offer.id}
                        value={offer.name}
                        onSelect={() => {
                          setSelectedOffer(offer);
                          setOpenOfferCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedOffer?.id === offer.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {offer.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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