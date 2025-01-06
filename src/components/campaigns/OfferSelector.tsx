import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Select
      value={selectedOffer?.id.toString()}
      onValueChange={(value) => {
        const offer = validOffers.find(o => o.id.toString() === value);
        if (offer) {
          console.log('Offer selected:', offer);
          onOfferSelect(offer);
        }
      }}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Loading offers..." : "Select offer..."} />
      </SelectTrigger>
      <SelectContent className="max-h-[200px] overflow-y-auto">
        {Object.entries(offersByVertical).map(([vertical, verticalOffers]) => (
          <SelectGroup key={vertical}>
            <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              {vertical}
            </SelectLabel>
            {verticalOffers.map((offer) => (
              <SelectItem
                key={offer.id}
                value={offer.id.toString()}
                className="cursor-pointer hover:bg-accent"
              >
                {offer.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}