import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Copy, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  name: string;
  state: string;
  type?: string;
  vertical?: string;
  offer_id: number;
  offer_name?: string;
  country_id: string;
  views?: number;
  clicks?: number;
  vtc?: number;
  rpc?: number;
  rpmv?: number;
  revenue?: number;
  created_at: string;
  target_domain?: string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

const CampaignTable = ({ campaigns, isLoading }: CampaignTableProps) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Database className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
        <p className="text-sm text-gray-500">Get started by creating a new campaign.</p>
      </div>
    );
  }

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (typeof value !== 'number') return '0%';
    return `${value.toFixed(1)} %`;
  };

  const formatNumber = (value: number | undefined) => {
    if (typeof value !== 'number') return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Vertical</TableHead>
          <TableHead>Offer</TableHead>
          <TableHead>Geo</TableHead>
          <TableHead>TL</TableHead>
          <TableHead>Imprint</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>VTC</TableHead>
          <TableHead>RPC</TableHead>
          <TableHead>RPMV</TableHead>
          <TableHead>Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell>
              <Badge 
                variant="default"
                className={`capitalize ${
                  campaign.state === 'active' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : ''
                }`}
              >
                {campaign.state}
              </Badge>
            </TableCell>
            <TableCell>{campaign.id}</TableCell>
            <TableCell className="font-medium">{campaign.name}</TableCell>
            <TableCell>{campaign.type || 'Display'}</TableCell>
            <TableCell>{campaign.vertical || '-'}</TableCell>
            <TableCell>{campaign.offer_name || '-'}</TableCell>
            <TableCell>
              {campaign.country_id && (
                <div className="flex items-center gap-2">
                  <img 
                    src={`https://flagcdn.com/w20/${campaign.country_id.toLowerCase()}.png`}
                    alt={campaign.country_id}
                    className="w-5 h-auto"
                  />
                  {campaign.country_id}
                </div>
              )}
            </TableCell>
            <TableCell>
              <Copy className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
            </TableCell>
            <TableCell>
              <X className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
            </TableCell>
            <TableCell>{formatNumber(campaign.views)}</TableCell>
            <TableCell>{formatNumber(campaign.clicks)}</TableCell>
            <TableCell>{formatPercentage(campaign.vtc)}</TableCell>
            <TableCell>{formatCurrency(campaign.rpc)}</TableCell>
            <TableCell>{formatCurrency(campaign.rpmv)}</TableCell>
            <TableCell>{formatCurrency(campaign.revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CampaignTable;