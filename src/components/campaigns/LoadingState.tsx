import { TableCell, TableRow, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingRow = () => (
  <TableRow>
    {Array(16).fill(0).map((_, i) => (
      <TableCell key={i}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))}
  </TableRow>
);

export const LoadingState = () => (
  <TableBody>
    <LoadingRow />
    <LoadingRow />
    <LoadingRow />
  </TableBody>
);