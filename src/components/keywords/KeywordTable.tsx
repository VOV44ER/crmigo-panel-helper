import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/campaigns/campaignUtils";
import { KeywordStats } from "@/types/tonic";
import "flag-icons/css/flag-icons.min.css";

interface KeywordTableProps {
  keywords: KeywordStats[];
}

const KeywordTable = ({ keywords }: KeywordTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b">
            <TableHead className="font-semibold text-gray-600">Keyword</TableHead>
            <TableHead className="font-semibold text-gray-600">Campaigns</TableHead>
            <TableHead className="font-semibold text-gray-600">Campaign Offer</TableHead>
            <TableHead className="font-semibold text-gray-600">Geo</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">RPC</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Conv.</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Rev.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((item) => (
            <TableRow key={item.keyword} className="hover:bg-gray-50">
              <TableCell className="font-medium">{item.keyword}</TableCell>
              <TableCell>
                {item.campaigns.map((campaign) => (
                  <div key={campaign.id} className="mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {campaign.name}
                    </Badge>
                  </div>
                ))}
              </TableCell>
              <TableCell>
                {item.offers.map((offer) => (
                  <span key={offer.id} className="text-sm text-gray-600">
                    {offer.name}
                  </span>
                ))}
              </TableCell>
              <TableCell>
                {item.countries.map((country) => (
                  <span key={country.code} className="inline-flex items-center">
                    <span className={`fi fi-${country.code.toLowerCase()} mr-2`}></span>
                    {country.name}
                  </span>
                ))}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.rpc)}</TableCell>
              <TableCell className="text-right">{item.clicks.toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default KeywordTable;