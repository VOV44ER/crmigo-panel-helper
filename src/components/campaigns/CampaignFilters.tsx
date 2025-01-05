import { Button } from "@/components/ui/button";
import { Settings, Filter } from "lucide-react";

interface CampaignFiltersProps {
  selectedStates: string[];
  onStateChange: (states: string[]) => void;
}

const CampaignFilters = ({ selectedStates, onStateChange }: CampaignFiltersProps) => {
  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      onStateChange(selectedStates.filter(s => s !== state));
    } else {
      onStateChange([...selectedStates, state]);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex gap-2">
        <Button 
          variant={selectedStates.includes('active') ? "default" : "outline"}
          onClick={() => toggleState('active')}
          className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
        >
          Active
        </Button>
        <Button 
          variant={selectedStates.includes('pending') ? "default" : "outline"}
          onClick={() => toggleState('pending')}
          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Pending
        </Button>
        <Button 
          variant={selectedStates.includes('stopped') ? "default" : "outline"}
          onClick={() => toggleState('stopped')}
          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Stopped
        </Button>
      </div>
      <div className="flex-1" />
      <Button variant="outline" size="icon">
        <Settings className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CampaignFilters;