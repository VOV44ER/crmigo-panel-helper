import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { KeywordStats } from "@/types/tonic";
import "flag-icons/css/flag-icons.min.css";

interface KeywordTableProps {
  keywords: KeywordStats[];
  isLoading?: boolean;
}

const KeywordTable = ({ keywords, isLoading = false }: KeywordTableProps) => {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Campaigns</TableHead>
            <TableHead>Campaign Offer</TableHead>
            <TableHead>Geo</TableHead>
            <TableHead className="text-right">RPC</TableHead>
            <TableHead className="text-right">Conv.</TableHead>
            <TableHead className="text-right">Rev.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-200">
          <TableHead className="font-medium">Keyword</TableHead>
          <TableHead className="font-medium">Campaigns</TableHead>
          <TableHead className="font-medium">Campaign Offer</TableHead>
          <TableHead className="font-medium">Geo</TableHead>
          <TableHead className="text-right font-medium">RPC</TableHead>
          <TableHead className="text-right font-medium">Conv.</TableHead>
          <TableHead className="text-right font-medium">Rev.</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((keyword) => (
          <TableRow key={keyword.keyword} className="border-b border-gray-100">
            <TableCell className="font-medium">{keyword.keyword}</TableCell>
            <TableCell>{keyword.campaigns.map(c => c.name).join(", ")}</TableCell>
            <TableCell>{keyword.offers.map(o => o.name).join(", ")}</TableCell>
            <TableCell>
              {keyword.countries.map(country => (
                <span 
                  key={country.code} 
                  className={`fi fi-${country.code.toLowerCase()} mr-1`}
                  title={country.name}
                />
              ))}
            </TableCell>
            <TableCell className="text-right">{keyword.rpc.toFixed(2)} $</TableCell>
            <TableCell className="text-right">{keyword.clicks}</TableCell>
            <TableCell className="text-right">{keyword.revenue.toFixed(2)} $</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default KeywordTable;