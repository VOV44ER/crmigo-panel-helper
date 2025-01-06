import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  state: string;
  budget: number;
  spent: number;
  remaining: number;
  created_at: string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

const CampaignTable = ({ campaigns, isLoading }: CampaignTableProps) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Database className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
        <p className="text-sm text-gray-500">Get started by creating a new campaign.</p>
      </div>
    );
  }

  const formatNumber = (value: number | undefined | null) => {
    if (typeof value !== 'number') return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign Name</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Spent</TableHead>
          <TableHead>Remaining</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.name}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.state === 'active'
                    ? 'bg-green-100 text-green-800'
                    : campaign.state === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {campaign.state}
              </span>
            </TableCell>
            <TableCell>{formatNumber(campaign.budget)}</TableCell>
            <TableCell>{formatNumber(campaign.spent)}</TableCell>
            <TableCell>{formatNumber(campaign.remaining)}</TableCell>
            <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CampaignTable;