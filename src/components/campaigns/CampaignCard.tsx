import { Edit, Wand2, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TonicCampaign } from "@/types/tonic";
import { getStatusColor, formatCurrency, formatPercentage } from "./campaignUtils";
import { toast } from "sonner";

interface CampaignCardProps {
  campaign: TonicCampaign;
  onEdit: () => void;
  onPixelTracking: () => void;
}

const CampaignCard = ({ campaign, onEdit, onPixelTracking }: CampaignCardProps) => {
  const copyTrackingLink = (trackingLink: string | null) => {
    if (!trackingLink) {
      toast.error("No tracking link available");
      return;
    }
    navigator.clipboard.writeText(trackingLink);
    toast.success("Tracking link copied to clipboard");
  };

  const isDisabled = !campaign.trackingLink;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="secondary" className={getStatusColor(campaign.status)}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
            <h3 className="font-medium mt-2">{campaign.name}</h3>
            <p className="text-sm text-gray-500">ID: {campaign.id}</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="cursor-pointer"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPixelTracking}
              className="cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="capitalize">{campaign.type}</p>
          </div>
          <div>
            <p className="text-gray-500">Vertical</p>
            <p>{campaign.offer.vertical.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Offer</p>
            <p>{campaign.offer.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Geo</p>
            <p>{campaign.country.code}</p>
          </div>
          <div>
            <p className="text-gray-500">Tracking Link</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyTrackingLink(campaign.trackingLink)}
              className={`px-0 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isDisabled}
            >
              <Copy className={`h-4 w-4 ${isDisabled ? 'text-gray-400' : ''}`} />
            </Button>
          </div>
          <div>
            <p className="text-gray-500">Imprint</p>
            {campaign.imprint === 'yes' ? (
              <span className="text-green-600">✓</span>
            ) : (
              <X className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
          <div>
            <p className="text-gray-500">Views</p>
            <p>{campaign.views.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Clicks</p>
            <p>{campaign.clicks.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">VTC</p>
            <p>{formatPercentage(campaign.vtc / 100)}</p>
          </div>
          <div>
            <p className="text-gray-500">RPC</p>
            <p>{formatCurrency(campaign.rpc)}</p>
          </div>
          <div>
            <p className="text-gray-500">RPMV</p>
            <p>{formatCurrency(campaign.rpmv)}</p>
          </div>
          <div>
            <p className="text-gray-500">Revenue</p>
            <p>{formatCurrency(campaign.revenue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;