import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface KeywordTableProps {
  keywords: any[];
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
            <TableCell>{keyword.campaigns}</TableCell>
            <TableCell>{keyword.countries}</TableCell>
            <TableCell>{keyword.offers}</TableCell>
            <TableCell>{keyword.clicks}</TableCell>
            <TableCell>{keyword.revenue}</TableCell>
            <TableCell>{keyword.rpc}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default KeywordTable;
