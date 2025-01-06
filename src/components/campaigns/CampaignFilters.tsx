import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface CampaignFiltersProps {
  selectedStates: string[];
  onStateChange: (states: string[]) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const CampaignFilters = ({ 
  selectedStates, 
  onStateChange,
  dateRange,
  onDateRangeChange
}: CampaignFiltersProps) => {
  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      onStateChange(selectedStates.filter(s => s !== state));
    } else {
      onStateChange([...selectedStates, state]);
    }
  };

  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = useState(false);

  const handleSaveDate = () => {
    onDateRangeChange(tempDateRange);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedStates.includes('active') ? "default" : "outline"}
          onClick={() => toggleState('active')}
          className={cn(
            "flex-1 sm:flex-none",
            selectedStates.includes('active') 
              ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
              : "hover:bg-green-100 hover:text-green-800"
          )}
        >
          Active
        </Button>
        <Button 
          variant={selectedStates.includes('pending') ? "default" : "outline"}
          onClick={() => toggleState('pending')}
          className={cn(
            "flex-1 sm:flex-none",
            selectedStates.includes('pending')
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900"
              : "hover:bg-yellow-100 hover:text-yellow-800"
          )}
        >
          Pending
        </Button>
        <Button 
          variant={selectedStates.includes('stopped') ? "default" : "outline"}
          onClick={() => toggleState('stopped')}
          className={cn(
            "flex-1 sm:flex-none",
            selectedStates.includes('stopped')
              ? "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900"
              : "hover:bg-red-100 hover:text-red-800"
          )}
        >
          Stopped
        </Button>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[280px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "yyyy-MM-dd")} -{" "}
                  {format(dateRange.to, "yyyy-MM-dd")}
                </>
              ) : (
                format(dateRange.from, "yyyy-MM-dd")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="end"
          sideOffset={8}
        >
          <div className="p-3 space-y-3 bg-white rounded-md border shadow-lg">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={tempDateRange?.from}
              selected={tempDateRange}
              onSelect={(newRange) => {
                // Ensure we keep both dates when selecting
                if (newRange?.from && !newRange.to && tempDateRange?.to) {
                  setTempDateRange({
                    from: newRange.from,
                    to: tempDateRange.to
                  });
                } else {
                  setTempDateRange(newRange);
                }
              }}
              numberOfMonths={2}
              className="rounded-md border shadow-md bg-white"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveDate}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CampaignFilters;
