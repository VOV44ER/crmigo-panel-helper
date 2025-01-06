import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StateFilterProps {
  selectedStates: string[];
  onStateChange: (states: string[]) => void;
}

export const StateFilter = ({ selectedStates, onStateChange }: StateFilterProps) => {
  return (
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
  );
};