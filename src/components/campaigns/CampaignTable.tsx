import { Table, TableBody } from "@/components/ui/table";
import { TonicCampaign } from "@/types/tonic";
import { Skeleton } from "@/components/ui/skeleton";
import CampaignCard from "./CampaignCard";
import { useState } from "react";
import { KeywordEditModal } from "./KeywordEditModal";
import { PixelTrackingModal } from "./PixelTrackingModal";
import { CampaignTableHeader } from "./TableHeader";
import { CampaignTableRow } from "./TableRow";
import { LoadingState } from "./LoadingState";

interface CampaignTableProps {
  campaigns: TonicCampaign[];
  isLoading: boolean;
  isFacebook: boolean;
}

const CampaignTable = ({ campaigns, isLoading, isFacebook }: CampaignTableProps) => {
  const [selectedCampaign, setSelectedCampaign] = useState<TonicCampaign | null>(null);
  const [pixelTrackingCampaign, setPixelTrackingCampaign] = useState<TonicCampaign | null>(null);

  if (isLoading) {
    return (
      <div>
        <div className="hidden sm:block">
          <Table>
            <CampaignTableHeader />
            <LoadingState />
          </Table>
        </div>
        <div className="grid gap-4 sm:hidden">
          { Array(3).fill(0).map((_, i) => (
            <Skeleton key={ i } className="h-48 w-full" />
          )) }
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */ }
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <CampaignTableHeader />
          <TableBody>
            { campaigns.map((campaign) => (
              <CampaignTableRow
                key={ campaign.id }
                campaign={ campaign }
                onKeywordEdit={ setSelectedCampaign }
                onPixelTracking={ setPixelTrackingCampaign }
              />
            )) }
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */ }
      <div className="grid gap-4 sm:hidden">
        { campaigns.map((campaign) => (
          <CampaignCard
            key={ campaign.id }
            campaign={ campaign }
            onEdit={ () => setSelectedCampaign(campaign) }
            onPixelTracking={ () => setPixelTrackingCampaign(campaign) }
          />
        )) }
      </div>

      {/* Modals */ }
      <KeywordEditModal
        isOpen={ !!selectedCampaign }
        onClose={ () => setSelectedCampaign(null) }
        campaignName={ selectedCampaign?.name || "" }
        campaignId={ selectedCampaign?.id.toString() || "" }
        isFacebook={ isFacebook }
      />
      <PixelTrackingModal
        isOpen={ !!pixelTrackingCampaign }
        isFacebook={ isFacebook }
        onClose={ () => setPixelTrackingCampaign(null) }
        campaignName={ pixelTrackingCampaign?.name || "" }
        campaignId={ pixelTrackingCampaign?.id.toString() || "" }
      />
    </div>
  );
};

export default CampaignTable;