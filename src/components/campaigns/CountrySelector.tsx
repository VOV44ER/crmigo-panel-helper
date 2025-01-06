import { useState } from "react";
import { Label } from "@/components/ui/label";

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
      <div className="relative">
        <input
          type="text"
          placeholder={isLoading ? "Loading countries..." : "Search and select country..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {filteredCountries.length > 0 && searchTerm && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredCountries.map((country) => (
              <div
                key={country.code}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  onCountrySelect(country);
                  setSearchTerm(country.name);
                }}
              >
                {country.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedCountry && (
        <div className="flex items-center gap-2 mt-2">
          <Label>Selected:</Label>
          <span className="text-sm font-medium">{selectedCountry.name}</span>
        </div>
      )}
    </div>
  );
}