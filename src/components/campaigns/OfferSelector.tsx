import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Offer {
  id: number;
  name: string;
  vertical: {
    id: number;
    name: string;
  };
}

interface OfferSelectorProps {
  selectedOffer: Offer | null;
  onOfferSelect: (offer: Offer) => void;
  offers: Offer[];
  isLoading: boolean;
}

export function OfferSelector({ selectedOffer, onOfferSelect, offers = [], isLoading }: OfferSelectorProps) {
  const [open, setOpen] = useState(false);
  const validOffers = Array.isArray(offers) ? offers : [];

  console.log('OfferSelector render:', {
    selectedOffer,
    offersLength: validOffers.length,
    offers: validOffers,
    isLoading
  });

  // Group offers by vertical
  const offersByVertical = validOffers.reduce((acc, offer) => {
    const vertical = offer.vertical.name;
    if (!acc[vertical]) {
      acc[vertical] = [];
    }
    acc[vertical].push(offer);
    return acc;
  }, {} as Record<string, Offer[]>);

  console.log('Offers grouped by vertical:', offersByVertical);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {selectedOffer ? selectedOffer.name : isLoading ? "Loading offers..." : "Select offer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search offer..." />
          <CommandEmpty>No offer found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {Object.entries(offersByVertical).map(([vertical, verticalOffers]) => (
              <div key={vertical}>
                <div className="px-2 py-1.5 text-sm font-semibold bg-gray-50 text-gray-700">
                  {vertical}
                </div>
                {verticalOffers.map((offer) => (
                  <CommandItem
                    key={offer.id}
                    value={offer.name}
                    onSelect={() => {
                      onOfferSelect(offer);
                      setOpen(false);
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
              </div>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}