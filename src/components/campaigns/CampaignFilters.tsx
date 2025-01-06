import { DateRangeFilter } from "./filters/DateRangeFilter";
import { StateFilter } from "./filters/StateFilter";
import { FiltersContainer } from "./filters/FiltersContainer";
import { DateRange } from "react-day-picker";
import { useCampaignData } from "@/hooks/useCampaignData";

interface CampaignFiltersProps {
  selectedStates: string[];
  onStateChange: (states: string[]) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  hideStateFilter?: boolean;
  selectedCountries: Array<{ code: string; name: string }>;
  onCountryChange: (countries: Array<{ code: string; name: string }>) => void;
  selectedOffers: Array<{ id: number; name: string; vertical: { id: number; name: string } }>;
  onOfferChange: (offers: Array<{ id: number; name: string; vertical: { id: number; name: string } }>) => void;
  onClearFilters?: () => void;
}

const CampaignFilters = ({ 
  selectedStates,
  onStateChange,
  dateRange,
  onDateRangeChange,
  hideStateFilter = false,
  selectedCountries,
  onCountryChange,
  selectedOffers,
  onOfferChange,
  onClearFilters,
}: CampaignFiltersProps) => {
  const { countriesResponse, isLoadingCountries, offersResponse, isLoadingOffers } = useCampaignData();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {!hideStateFilter && (
          <StateFilter 
            selectedStates={selectedStates} 
            onStateChange={onStateChange} 
          />
        )}
        <DateRangeFilter 
          dateRange={dateRange} 
          onDateRangeChange={onDateRangeChange} 
        />
      </div>

      <FiltersContainer
        selectedCountries={selectedCountries}
        onCountryChange={onCountryChange}
        selectedOffers={selectedOffers}
        onOfferChange={onOfferChange}
        onClearFilters={onClearFilters || (() => {
          onCountryChange([]);
          onOfferChange([]);
        })}
        isLoadingCountries={isLoadingCountries}
        isLoadingOffers={isLoadingOffers}
        countries={countriesResponse?.data || []}
        offers={offersResponse?.data || []}
      />
    </div>
  );
};

export default CampaignFilters;