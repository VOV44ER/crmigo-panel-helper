import {
  TableHead,
  TableHeader as UITableHeader,
  TableRow,
} from "@/components/ui/table";

export const CampaignTableHeader = () => (
  <UITableHeader>
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
  </UITableHeader>
);