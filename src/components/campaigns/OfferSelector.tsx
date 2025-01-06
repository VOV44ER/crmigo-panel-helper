import { useState } from "react";
import { Label } from "@/components/ui/label";

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
  const [isOpen, setIsOpen] = useState(false);
  const validOffers = Array.isArray(offers) ? offers : [];

  // Group and filter offers
  const filteredOffers = validOffers.filter(offer =>
    searchTerm === "" ? true : offer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedOffers = filteredOffers.reduce((acc, offer) => {
    const vertical = offer.vertical.name;
    if (!acc[vertical]) {
      acc[vertical] = [];
    }
    acc[vertical].push(offer);
    return acc;
  }, {} as Record<string, Offer[]>);

  const handleSelect = (offer: Offer) => {
    onOfferSelect(offer);
    setSearchTerm(offer.name);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder={isLoading ? "Loading offers..." : "Search and select offer..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isOpen && Object.keys(groupedOffers).length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {Object.entries(groupedOffers).map(([vertical, verticalOffers]) => (
              <div key={vertical}>
                <div className="px-3 py-1 bg-gray-50 text-sm font-semibold">
                  {vertical}
                </div>
                {verticalOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelect(offer)}
                  >
                    {offer.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedOffer && (
        <div className="flex items-center gap-2 mt-2">
          <Label>Selected:</Label>
          <span className="text-sm font-medium">{selectedOffer.name}</span>
        </div>
      )}
    </div>
  );
}