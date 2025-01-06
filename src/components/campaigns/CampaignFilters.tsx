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
  hideStateFilter?: boolean;
}

const CampaignFilters = ({ 
  selectedStates,
  onStateChange,
  dateRange,
  onDateRangeChange,
  hideStateFilter = false
}: CampaignFiltersProps) => {
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = useState(false);

  const handleSaveDate = () => {
    onDateRangeChange(tempDateRange);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-4">
      {!hideStateFilter && (
        <div className="flex gap-2">
          {['active', 'pending', 'stopped'].map((state) => (
            <Button
              key={state}
              variant={selectedStates.includes(state) ? "default" : "outline"}
              onClick={() => {
                const newStates = selectedStates.includes(state)
                  ? selectedStates.filter(s => s !== state)
                  : [...selectedStates, state];
                onStateChange(newStates);
              }}
              className={cn(
                "capitalize",
                selectedStates.includes(state) && state === 'active' && "bg-green-500 hover:bg-green-600",
                selectedStates.includes(state) && state === 'pending' && "bg-yellow-500 hover:bg-yellow-600",
                selectedStates.includes(state) && state === 'stopped' && "bg-red-500 hover:bg-red-600"
              )}
            >
              {state}
            </Button>
          ))}
        </div>
      )}
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