import { Edit } from "lucide-react";
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

interface CampaignTableProps {
  campaigns: TonicCampaign[];
  isLoading: boolean;
}

const CampaignTable = ({ campaigns, isLoading }: CampaignTableProps) => {
  const handleEdit = (campaign: TonicCampaign) => {
    // Handle edit action
  };

  const LoadingRow = () => (
    <TableRow>
      {Array(9).fill(0).map((_, i) => (
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vertical</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Geo</TableHead>
                <TableHead className="text-right">Views</TableHead>
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Offer</TableHead>
              <TableHead>Geo</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="w-12"></TableHead>
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
                <TableCell>{campaign.name}</TableCell>
                <TableCell>{campaign.type}</TableCell>
                <TableCell>{campaign.offer.vertical.name}</TableCell>
                <TableCell>{campaign.offer.name}</TableCell>
                <TableCell>{campaign.country.name}</TableCell>
                <TableCell className="text-right">{campaign.views.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatCurrency(campaign.revenue)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
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
