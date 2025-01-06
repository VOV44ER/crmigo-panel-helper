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

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const DateRangeFilter = ({ dateRange, onDateRangeChange }: DateRangeFilterProps) => {
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = useState(false);

  const handleSaveDate = () => {
    onDateRangeChange(tempDateRange);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
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
  );
};