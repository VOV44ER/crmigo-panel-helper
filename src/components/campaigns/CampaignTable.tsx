import { Edit, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TonicCampaign } from "@/types/tonic";
import { Skeleton } from "@/components/ui/skeleton";
import CampaignCard from "./CampaignCard";
import { getStatusColor, formatCurrency, formatPercentage } from "./campaignUtils";
import { toast } from "sonner";

interface CampaignTableProps {
  campaigns: TonicCampaign[];
  isLoading: boolean;
}

const CampaignTable = ({ campaigns, isLoading }: CampaignTableProps) => {
  const handleEdit = (campaign: TonicCampaign) => {
    // Handle edit action
    console.log('Edit campaign:', campaign);
  };

  const copyTrackingLink = (trackingLink: string) => {
    navigator.clipboard.writeText(trackingLink);
    toast.success("Tracking link copied to clipboard");
  };

  const LoadingRow = () => (
    <TableRow>
      {Array(14).fill(0).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );

  if (isLoading) {
    return (
      <div>
        <div className="hidden sm:block">
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
                <TableHead className="text-center">TL</TableHead>
                <TableHead className="text-center">Imprint</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">VTC</TableHead>
                <TableHead className="text-right">RPC</TableHead>
                <TableHead className="text-right">RPMV</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
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
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
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
              <TableHead>Status</TableHead>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Offer</TableHead>
              <TableHead>Geo</TableHead>
              <TableHead className="text-center">TL</TableHead>
              <TableHead className="text-center">Imprint</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">VTC</TableHead>
              <TableHead className="text-right">RPC</TableHead>
              <TableHead className="text-right">RPMV</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{campaign.id}</TableCell>
                <TableCell>{campaign.name}</TableCell>
                <TableCell className="capitalize">{campaign.type}</TableCell>
                <TableCell>{campaign.offer.vertical.name}</TableCell>
                <TableCell>{campaign.offer.name}</TableCell>
                <TableCell>{campaign.country.code}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyTrackingLink(campaign.trackingLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="text-center">
                  {campaign.imprint === 'yes' ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <X className="h-4 w-4 mx-auto text-red-600" />
                  )}
                </TableCell>
                <TableCell className="text-right">{campaign.views.toLocaleString()}</TableCell>
                <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatPercentage(campaign.vtc / 100)}</TableCell>
                <TableCell className="text-right">{formatCurrency(campaign.rpc)}</TableCell>
                <TableCell className="text-right">{formatCurrency(campaign.rpmv)}</TableCell>
                <TableCell className="text-right">{formatCurrency(campaign.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 sm:hidden">
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignTable;