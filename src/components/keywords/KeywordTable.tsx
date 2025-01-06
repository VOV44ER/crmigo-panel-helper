import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { KeywordStats } from "@/types/tonic";

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
            <TableHead>Countries</TableHead>
            <TableHead>Offers</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>RPC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead>Campaigns</TableHead>
          <TableHead>Countries</TableHead>
          <TableHead>Offers</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>RPC</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((keyword) => (
          <TableRow key={keyword.keyword}>
            <TableCell>{keyword.keyword}</TableCell>
            <TableCell>{keyword.campaigns.map(c => c.name).join(", ")}</TableCell>
            <TableCell>{keyword.countries.map(c => c.name).join(", ")}</TableCell>
            <TableCell>{keyword.offers.map(o => o.name).join(", ")}</TableCell>
            <TableCell>{keyword.clicks}</TableCell>
            <TableCell>${keyword.revenue.toFixed(2)}</TableCell>
            <TableCell>${keyword.rpc.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default KeywordTable;