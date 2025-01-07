import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, startOfToday } from "date-fns";
import { DateRange } from "react-day-picker";
import { CountrySelector } from "./CountrySelector";
import { OfferSelector } from "./OfferSelector";
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
}

const PRESET_RANGES = [
  { label: 'Today', getDates: () => ({ from: startOfToday(), to: startOfToday() }) },
  { label: 'Last day', getDates: () => ({ from: subDays(startOfToday(), 1), to: subDays(startOfToday(), 1) }) },
  { label: 'Last 3 days', getDates: () => ({ from: subDays(startOfToday(), 3), to: startOfToday() }) },
  { label: 'Last week', getDates: () => ({ from: subDays(startOfToday(), 7), to: startOfToday() }) },
  { label: 'Last 2 weeks', getDates: () => ({ from: subDays(startOfToday(), 14), to: startOfToday() }) },
  { label: 'Last month', getDates: () => ({ from: subDays(startOfToday(), 30), to: startOfToday() }) },
];

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
}: CampaignFiltersProps) => {
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = useState(false);
  const { countriesResponse, isLoadingCountries, offersResponse, isLoadingOffers } = useCampaignData();

  const handleSaveDate = () => {
    onDateRangeChange(tempDateRange);
    setOpen(false);
  };

  const handlePresetClick = (preset: typeof PRESET_RANGES[number]) => {
    const newRange = preset.getDates();
    setTempDateRange(newRange);
    onDateRangeChange(newRange);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {!hideStateFilter && (
          <div className="flex flex-wrap gap-2">
            {['active', 'pending', 'stopped'].map((state) => (
              <Button
                key={state}
                variant={selectedStates.includes(state) ? "default" : "outline"}
                onClick={() => {
                  const newStates = selectedStates.includes(state)
                    ? selectedStates.filter(s => s !== state)
                    : [...selectedStates, state];
                  onStateChange(newStates);
                }}
                className={cn(
                  "capitalize whitespace-nowrap",
                  selectedStates.includes(state) && state === 'active' && "bg-green-500 hover:bg-green-600",
                  selectedStates.includes(state) && state === 'pending' && "bg-yellow-500 hover:bg-yellow-600",
                  selectedStates.includes(state) && state === 'stopped' && "bg-red-500 hover:bg-red-600"
                )}
              >
                {state}
              </Button>
            ))}
          </div>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "yyyy-MM-dd")} -{" "}
                    {format(dateRange.to, "yyyy-MM-dd")}
                  </>
                ) : (
                  format(dateRange.from, "yyyy-MM-dd")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="end"
            sideOffset={8}
          >
            <div className="p-3 space-y-3 bg-white rounded-md border shadow-lg">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_RANGES.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempDateRange?.from}
                selected={tempDateRange}
                onSelect={(newRange) => {
                  if (newRange?.from && !newRange.to && tempDateRange?.to) {
                    setTempDateRange({
                      from: newRange.from,
                      to: tempDateRange.to
                    });
                  } else {
                    setTempDateRange(newRange);
                  }
                }}
                numberOfMonths={2}
                className="rounded-md border shadow-md bg-white"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveDate}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
            countries={countriesResponse?.data || []}
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
                  className="flex items-center gap-2"
                >
                  <span className={`fi fi-${country.code.toLowerCase()}`} />
                  <span className="max-w-[150px] truncate">{country.name}</span>
                  <span className="ml-1">×</span>
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
            offers={offersResponse?.data || []}
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
                  className="flex items-center gap-2"
                >
                  <span className="max-w-[150px] truncate">{offer.name}</span>
                  <span className="ml-1">×</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignFilters;