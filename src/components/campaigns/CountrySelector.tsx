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
  const [isOpen, setIsOpen] = useState(false);
  const validCountries = Array.isArray(countries) ? countries : [];

  const filteredCountries = validCountries.filter(country =>
    searchTerm === "" ? true : country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    onCountrySelect(country);
    setSearchTerm(""); // Clear the search term after selection
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder={isLoading ? "Loading countries..." : "Search and select country..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
        />
        {isOpen && filteredCountries.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredCountries.map((country) => (
              <div
                key={country.code}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleSelect(country)}
              >
                <span className={`fi fi-${country.code.toLowerCase()}`} />
                {country.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}