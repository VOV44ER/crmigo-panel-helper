import { Edit, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TonicCampaign } from "@/types/tonic";
import { getStatusColor, formatCurrency, formatPercentage } from "./campaignUtils";
import { toast } from "sonner";

interface CampaignCardProps {
  campaign: TonicCampaign;
  onEdit: (campaign: TonicCampaign) => void;
}

const CampaignCard = ({ campaign, onEdit }: CampaignCardProps) => {
  const copyTrackingLink = (trackingLink: string) => {
    navigator.clipboard.writeText(trackingLink);
    toast.success("Tracking link copied to clipboard");
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={getStatusColor(campaign.status)}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </Badge>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => copyTrackingLink(campaign.trackingLink)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(campaign)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">ID: {campaign.id}</p>
            <h3 className="font-medium">{campaign.name}</h3>
            <p className="text-sm text-gray-500">{campaign.offer.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{campaign.country.code}</p>
            <p className="text-sm text-gray-500 capitalize">{campaign.type}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
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
          <p className="font-medium">{formatPercentage(campaign.vtc / 100)}</p>
        </div>
        <div>
          <p className="text-gray-500">RPC</p>
          <p className="font-medium">{formatCurrency(campaign.rpc)}</p>
        </div>
        <div>
          <p className="text-gray-500">RPMV</p>
          <p className="font-medium">{formatCurrency(campaign.rpmv)}</p>
        </div>
        <div>
          <p className="text-gray-500">Revenue</p>
          <p className="font-medium">{formatCurrency(campaign.revenue)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-gray-500">Imprint</p>
          <p className="font-medium">
            {campaign.imprint === 'yes' ? (
              <span className="text-green-600">Yes</span>
            ) : (
              <span className="text-red-600">No</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Vertical</p>
          <p className="font-medium">{campaign.offer.vertical.name}</p>
        </div>
      </div>
    </Card>
  );
};

export default CampaignCard;