import { Edit, Wand2, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TableCell,
  TableRow as UITableRow,
} from "@/components/ui/table";
import { TonicCampaign } from "@/types/tonic";
import { getStatusColor, formatCurrency, formatPercentage } from "./campaignUtils";
import { toast } from "sonner";

interface TableRowProps {
  campaign: TonicCampaign;
  onKeywordEdit: (campaign: TonicCampaign) => void;
  onPixelTracking: (campaign: TonicCampaign) => void;
}

export const CampaignTableRow = ({ campaign, onKeywordEdit, onPixelTracking }: TableRowProps) => {
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
    <UITableRow className="hover:bg-gray-50">
      <TableCell>
        <Badge variant="secondary" className={getStatusColor(campaign.status)}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>{campaign.id}</TableCell>
      <TableCell className="font-medium text-base">{campaign.name}</TableCell>
      <TableCell className="capitalize">{campaign.type}</TableCell>
      <TableCell>{campaign.offer.vertical.name}</TableCell>
      <TableCell>{campaign.offer.name}</TableCell>
      <TableCell>{campaign.country.code}</TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyTrackingLink(campaign.trackingLink)}
          className={`${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isDisabled}
        >
          <Copy className={`h-4 w-4 ${isDisabled ? 'text-gray-400' : ''}`} />
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
      <TableCell>
        <div className="flex justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onKeywordEdit(campaign)}
            className="cursor-pointer"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPixelTracking(campaign)}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </UITableRow>
  );
};