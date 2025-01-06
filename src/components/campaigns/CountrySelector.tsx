import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = useState("");
  const validCountries = Array.isArray(countries) ? countries : [];

  const filteredCountries = validCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Select
        value={selectedCountry?.code}
        onValueChange={(value) => {
          const country = validCountries.find(c => c.code === value);
          if (country) onCountrySelect(country);
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading countries..." : "Select country..."} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b">
            <Input
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <SelectGroup>
            {filteredCountries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}