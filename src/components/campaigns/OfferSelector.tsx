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
  placeholder?: string;  // Added placeholder prop as optional
}

export function OfferSelector({ 
  selectedOffer, 
  onOfferSelect, 
  offers = [], 
  isLoading,
  placeholder 
}: OfferSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const validOffers = Array.isArray(offers) ? offers : [];

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
    setSearchTerm(""); // Clear the search term after selection
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder={isLoading ? "Loading offers..." : placeholder || "Search and select offer..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
        />
        {isOpen && Object.keys(groupedOffers).length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {Object.entries(groupedOffers).map(([vertical, verticalOffers]) => (
              <div key={vertical}>
                <div className="px-3 py-1 bg-gray-50 text-sm font-semibold sticky top-0">
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
    </div>
  );
}