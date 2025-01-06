import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Country {
  code: string;
  name: string;
}

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onCountrySelect: (country: Country) => void;
  countries: Country[];
  isLoading: boolean;
}

export function CountrySelector({ selectedCountry, onCountrySelect, countries = [], isLoading }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const validCountries = Array.isArray(countries) ? countries : [];

  console.log('CountrySelector render:', {
    selectedCountry,
    countriesLength: validCountries.length,
    countries: validCountries,
    isLoading
  });

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
          {selectedCountry ? selectedCountry.name : isLoading ? "Loading countries..." : "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {validCountries.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={() => {
                  onCountrySelect(country);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
                  )}
                />
                {country.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}