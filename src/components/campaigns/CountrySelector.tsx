import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const validCountries = Array.isArray(countries) ? countries : [];

  console.log('CountrySelector render:', {
    selectedCountry,
    countriesLength: validCountries.length,
    countries: validCountries,
    isLoading
  });

  return (
    <Select
      value={selectedCountry?.code}
      onValueChange={(code) => {
        const country = validCountries.find(c => c.code === code);
        if (country) {
          console.log('Country selected:', country);
          onCountrySelect(country);
        }
      }}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Loading countries..." : "Select country..."} />
      </SelectTrigger>
      <SelectContent 
        className="bg-popover border shadow-md"
        style={{ 
          maxHeight: "200px",
          overflowY: "auto",
          scrollBehavior: "smooth"
        }}
      >
        {validCountries.map((country) => (
          <SelectItem 
            key={country.code} 
            value={country.code}
            className="cursor-pointer hover:bg-accent focus:bg-accent"
          >
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}