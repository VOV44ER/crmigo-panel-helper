import { Edit, Wand2, Copy, X } from "lucide-react";
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
import { useState } from "react";
import { KeywordEditModal } from "./KeywordEditModal";
import { PixelTrackingModal } from "./PixelTrackingModal";

interface CampaignTableProps {
  campaigns: TonicCampaign[];
  isLoading: boolean;
}

const CampaignTable = ({ campaigns, isLoading }: CampaignTableProps) => {
  const [selectedCampaign, setSelectedCampaign] = useState<TonicCampaign | null>(null);
  const [pixelTrackingCampaign, setPixelTrackingCampaign] = useState<TonicCampaign | null>(null);

  const copyTrackingLink = (trackingLink: string | null) => {
    if (!trackingLink) {
      toast.error("No tracking link available");
      return;
    }
    navigator.clipboard.writeText(trackingLink);
    toast.success("Tracking link copied to clipboard");
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

  if (isLoading) {
    return (
      <div>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20">Id</TableHead>
                <TableHead className="w-64">Name</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-24">Vertical</TableHead>
                <TableHead className="w-32">Offer</TableHead>
                <TableHead className="w-20">Geo</TableHead>
                <TableHead className="w-20 text-center">TL</TableHead>
                <TableHead className="w-24 text-center">Imprint</TableHead>
                <TableHead className="w-24 text-right">Views</TableHead>
                <TableHead className="w-24 text-right">Clicks</TableHead>
                <TableHead className="w-20 text-right">VTC</TableHead>
                <TableHead className="w-24 text-right">RPC</TableHead>
                <TableHead className="w-24 text-right">RPMV</TableHead>
                <TableHead className="w-24 text-right">Revenue</TableHead>
                <TableHead className="w-24 text-center">Edit</TableHead>
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
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-20">Id</TableHead>
              <TableHead className="w-64">Name</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead className="w-24">Vertical</TableHead>
              <TableHead className="w-32">Offer</TableHead>
              <TableHead className="w-20">Geo</TableHead>
              <TableHead className="w-20 text-center">TL</TableHead>
              <TableHead className="w-24 text-center">Imprint</TableHead>
              <TableHead className="w-24 text-right">Views</TableHead>
              <TableHead className="w-24 text-right">Clicks</TableHead>
              <TableHead className="w-20 text-right">VTC</TableHead>
              <TableHead className="w-24 text-right">RPC</TableHead>
              <TableHead className="w-24 text-right">RPMV</TableHead>
              <TableHead className="w-24 text-right">Revenue</TableHead>
              <TableHead className="w-24 text-center">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => {
              const isDisabled = !campaign.trackingLink;
              return (
                <TableRow key={campaign.id} className="hover:bg-gray-50">
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
                        onClick={() => setSelectedCampaign(campaign)}
                        className="cursor-pointer"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPixelTrackingCampaign(campaign)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 sm:hidden">
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign}
            onEdit={() => setSelectedCampaign(campaign)}
            onPixelTracking={() => setPixelTrackingCampaign(campaign)}
          />
        ))}
      </div>

      {/* Modals */}
      <KeywordEditModal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        campaignName={selectedCampaign?.name || ""}
        campaignId={selectedCampaign?.id || ""}
      />
      <PixelTrackingModal
        isOpen={!!pixelTrackingCampaign}
        onClose={() => setPixelTrackingCampaign(null)}
        campaignName={pixelTrackingCampaign?.name || ""}
        campaignId={pixelTrackingCampaign?.id || ""}
      />
    </div>
  );
};

export default CampaignTable;
