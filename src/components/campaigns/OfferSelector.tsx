import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = useState("");
  const validOffers = Array.isArray(offers) ? offers : [];

  // Group offers by vertical
  const offersByVertical = validOffers.reduce((acc, offer) => {
    const vertical = offer.vertical.name;
    if (!acc[vertical]) {
      acc[vertical] = [];
    }
    acc[vertical].push(offer);
    return acc;
  }, {} as Record<string, Offer[]>);

  // Filter offers based on search term
  const filteredOffersByVertical = Object.entries(offersByVertical).reduce((acc, [vertical, verticalOffers]) => {
    const filtered = verticalOffers.filter(offer =>
      offer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[vertical] = filtered;
    }
    return acc;
  }, {} as Record<string, Offer[]>);

  return (
    <div className="space-y-2">
      <Select
        value={selectedOffer?.id.toString()}
        onValueChange={(value) => {
          const offer = validOffers.find(o => o.id.toString() === value);
          if (offer) onOfferSelect(offer);
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading offers..." : "Select offer..."} />
        </SelectTrigger>
        <SelectContent 
          className="bg-white border shadow-lg"
          style={{ maxHeight: '300px' }}
        >
          <div className="sticky top-0 z-10 bg-white p-2 border-b shadow-sm">
            <Input
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(300px - 60px)' }}>
            {Object.entries(filteredOffersByVertical).map(([vertical, verticalOffers]) => (
              <SelectGroup key={vertical}>
                <SelectLabel className="px-2 py-1.5 text-sm font-semibold bg-gray-50">
                  {vertical}
                </SelectLabel>
                {verticalOffers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id.toString()}>
                    {offer.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}