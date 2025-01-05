import { Copy, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TonicCampaign } from "@/types/tonic";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignTableProps {
  campaigns: TonicCampaign[];
  isLoading: boolean;
}

const CampaignTable = ({ campaigns, isLoading }: CampaignTableProps) => {
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'stopped':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const LoadingRow = () => (
    <TableRow>
      {Array(16).fill(0).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <input type="checkbox" className="rounded border-gray-300" />
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Vertical</TableHead>
          <TableHead>Offer</TableHead>
          <TableHead>Geo</TableHead>
          <TableHead>TL</TableHead>
          <TableHead>Imprint</TableHead>
          <TableHead className="text-right">Views</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead className="text-right">VTC</TableHead>
          <TableHead className="text-right">RPC</TableHead>
          <TableHead className="text-right">RPMV</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <>
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </>
        ) : campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell>
              <input type="checkbox" className="rounded border-gray-300" />
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{campaign.id}</TableCell>
            <TableCell>{campaign.name}</TableCell>
            <TableCell>{campaign.type}</TableCell>
            <TableCell>{campaign.offer.vertical.name}</TableCell>
            <TableCell>{campaign.offer.name}</TableCell>
            <TableCell>{campaign.country.name}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => handleCopyLink(campaign.trackingLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>{campaign.imprint}</TableCell>
            <TableCell className="text-right">{campaign.views.toLocaleString()}</TableCell>
            <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
            <TableCell className="text-right">{formatPercentage(campaign.vtc)}</TableCell>
            <TableCell className="text-right">{formatCurrency(campaign.rpc)}</TableCell>
            <TableCell className="text-right">{formatCurrency(campaign.rpmv)}</TableCell>
            <TableCell className="text-right">{formatCurrency(campaign.revenue)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CampaignTable;