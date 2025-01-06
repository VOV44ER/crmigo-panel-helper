import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TonicCampaign } from "@/types/tonic";
import { getStatusColor, formatCurrency, formatPercentage } from "./campaignUtils";

interface CampaignCardProps {
  campaign: TonicCampaign;
  onEdit: (campaign: TonicCampaign) => void;
}

const CampaignCard = ({ campaign, onEdit }: CampaignCardProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={getStatusColor(campaign.status)}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </Badge>
        <Button variant="ghost" size="icon" onClick={() => onEdit(campaign)}>
          <Edit className="h-4 w-4" />
        </Button>
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
    </Card>
  );
};

export default CampaignCard;