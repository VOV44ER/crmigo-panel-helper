import { Button } from "@/components/ui/button";

interface CampaignPaginationProps {
  total: number;
  limit: number;
  offset: number;
  onLimitChange: (limit: number) => void;
  onOffsetChange: (offset: number) => void;
}

const CampaignPagination = ({ 
  total, 
  limit, 
  offset, 
  onLimitChange, 
  onOffsetChange 
}: CampaignPaginationProps) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-gray-500">
        Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} results
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Rows per page:</span>
        <select 
          className="border rounded px-2 py-1"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onOffsetChange(0)}
            disabled={currentPage === 1}
          >
            ⟪
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onOffsetChange(Math.max(0, offset - limit))}
            disabled={currentPage === 1}
          >
            ⟨
          </Button>
          <span className="text-sm">{currentPage} of {totalPages}</span>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onOffsetChange(offset + limit)}
            disabled={currentPage === totalPages}
          >
            ⟩
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onOffsetChange((totalPages - 1) * limit)}
            disabled={currentPage === totalPages}
          >
            ⟫
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignPagination;