import { FileX } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <FileX className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No Keywords Found</h3>
      <p className="text-sm text-gray-500">
        There are no keywords available for the selected date range.
      </p>
    </div>
  );
};

export default EmptyState;