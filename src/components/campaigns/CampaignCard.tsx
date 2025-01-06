import { TonicCampaign } from "@/types/tonic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Edit, X } from "lucide-react";
import { getStatusColor, formatCurrency, formatPercentage } from "./campaignUtils";
import { toast } from "sonner";

interface CampaignCardProps {
  campaign: TonicCampaign;
  onEdit: () => void;
}

const CampaignCard = ({ campaign, onEdit }: CampaignCardProps) => {
  const copyTrackingLink = () => {
    if (!campaign.trackingLink) {
      toast.error("No tracking link available");
      return;
    }
    navigator.clipboard.writeText(campaign.trackingLink);
    toast.success("Tracking link copied to clipboard");
  };

  const isDisabled = !campaign.trackingLink;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1.5">
          <Badge variant="secondary" className={getStatusColor(campaign.status)}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
          <h2 className="font-semibold text-base">{campaign.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={copyTrackingLink} 
            className={`cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          >
            <Copy className={`h-4 w-4 ${isDisabled ? 'text-gray-400' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onEdit} 
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="text-sm font-medium">{campaign.id}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="text-sm font-medium capitalize">{campaign.type}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Vertical</p>
            <p className="text-sm font-medium">{campaign.offer.vertical.name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Offer</p>
            <p className="text-sm font-medium">{campaign.offer.name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Geo</p>
            <p className="text-sm font-medium">{campaign.country.code}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Imprint</p>
            <p className="text-sm font-medium">
              {campaign.imprint === 'yes' ? (
                <span className="text-green-600">✓</span>
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Views</p>
            <p className="text-sm font-medium">{campaign.views.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Clicks</p>
            <p className="text-sm font-medium">{campaign.clicks.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">VTC</p>
            <p className="text-sm font-medium">{formatPercentage(campaign.vtc / 100)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">RPC</p>
            <p className="text-sm font-medium">{formatCurrency(campaign.rpc)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">RPMV</p>
            <p className="text-sm font-medium">{formatCurrency(campaign.rpmv)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-sm font-medium">{formatCurrency(campaign.revenue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;