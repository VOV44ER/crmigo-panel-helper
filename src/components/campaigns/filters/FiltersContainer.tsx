import { CountrySelector } from "../CountrySelector";
import { OfferSelector } from "../OfferSelector";
import { Button } from "@/components/ui/button";

interface FiltersContainerProps {
  selectedCountries: Array<{ code: string; name: string }>;
  onCountryChange: (countries: Array<{ code: string; name: string }>) => void;
  selectedOffers: Array<{ id: number; name: string; vertical: { id: number; name: string } }>;
  onOfferChange: (offers: Array<{ id: number; name: string; vertical: { id: number; name: string } }>) => void;
  onClearFilters: () => void;
  isLoadingCountries: boolean;
  isLoadingOffers: boolean;
  countries: Array<{ code: string; name: string }>;
  offers: Array<{ id: number; name: string; vertical: { id: number; name: string } }>;
}

export const FiltersContainer = ({
  selectedCountries,
  onCountryChange,
  selectedOffers,
  onOfferChange,
  onClearFilters,
  isLoadingCountries,
  isLoadingOffers,
  countries,
  offers,
}: FiltersContainerProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-full sm:w-[280px]">
        <CountrySelector
          selectedCountry={null}
          onCountrySelect={(country) => {
            const exists = selectedCountries.some(c => c.code === country.code);
            if (!exists) {
              onCountryChange([...selectedCountries, country]);
            }
          }}
          countries={countries}
          isLoading={isLoadingCountries}
        />
        {selectedCountries.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedCountries.map(country => (
              <Button
                key={country.code}
                variant="secondary"
                size="sm"
                onClick={() => onCountryChange(selectedCountries.filter(c => c.code !== country.code))}
              >
                <span className={`fi fi-${country.code.toLowerCase()} mr-2`} />
                {country.name}
                <span className="ml-2">×</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full sm:w-[280px]">
        <OfferSelector
          selectedOffer={null}
          onOfferSelect={(offer) => {
            const exists = selectedOffers.some(o => o.id === offer.id);
            if (!exists) {
              onOfferChange([...selectedOffers, offer]);
            }
          }}
          offers={offers}
          isLoading={isLoadingOffers}
        />
        {selectedOffers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedOffers.map(offer => (
              <Button
                key={offer.id}
                variant="secondary"
                size="sm"
                onClick={() => onOfferChange(selectedOffers.filter(o => o.id !== offer.id))}
              >
                {offer.name}
                <span className="ml-2">×</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {(selectedCountries.length > 0 || selectedOffers.length > 0) && (
        <div className="w-full">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="text-red-500 hover:text-red-600"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};