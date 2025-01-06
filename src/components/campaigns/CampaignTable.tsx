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
import { Card } from "@/components/ui/card";

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

  const LoadingCard = () => (
    <Card className="p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </Card>
  );

  const MobileCard = ({ campaign }: { campaign: TonicCampaign }) => (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={getStatusColor(campaign.status)}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </Badge>
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
      </div>

      <div>
        <h3 className="font-medium">{campaign.name}</h3>
        <p className="text-sm text-gray-500">{campaign.offer.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Views</p>
          <p className="font-medium">{campaign.views.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Clicks</p>
          <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">VTC</p>
          <p className="font-medium">{formatPercentage(campaign.vtc)}</p>
        </div>
        <div>
          <p className="text-gray-500">Revenue</p>
          <p className="font-medium">{formatCurrency(campaign.revenue)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">TL:</span>
          <Button variant="ghost" size="icon" onClick={() => handleCopyLink(campaign.trackingLink)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Country:</span>
          <span>{campaign.country.name}</span>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableHead>
                <TableHead>Status</TableHead>
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
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </TableBody>
          </Table>
        </div>
        <div className="grid gap-4 sm:hidden">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input type="checkbox" className="rounded border-gray-300" />
              </TableHead>
              <TableHead>Status</TableHead>
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
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </TableCell>
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
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 sm:hidden">
        {campaigns.map((campaign) => (
          <MobileCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

export default CampaignTable;