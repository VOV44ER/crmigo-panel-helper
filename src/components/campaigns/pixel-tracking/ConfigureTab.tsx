import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eventTypes } from "./constants";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ConfigureTabProps {
  pixelId: string;
  setPixelId: (value: string) => void;
  eventType: string;
  setEventType: (value: string) => void;
  accessToken: string;
  setAccessToken: (value: string) => void;
  campaignId: string;
  onClose: () => void;
}

export const ConfigureTab = ({
  pixelId,
  setPixelId,
  eventType,
  setEventType,
  accessToken,
  setAccessToken,
  campaignId,
  onClose,
}: ConfigureTabProps) => {
  const handleSavePixel = async () => {
    try {
      // Convert event type to camelCase
      const camelCaseEventType = eventType
        .split(' ')
        .map((word, index) => 
          index === 0 
            ? word.toLowerCase() 
            : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');

      const { data, error } = await supabase.functions.invoke('save-tonic-pixel', {
        body: {
          campaign_id: campaignId,
          pixel_id: pixelId,
          access_token: accessToken,
          event_type: camelCaseEventType,
          revenue_type: "preestimated_revenue"
        }
      });

      if (error) throw error;

      toast.success("Pixel configuration saved successfully");
      onClose();
    } catch (error) {
      console.error('Error saving pixel:', error);
      toast.error('Failed to save pixel configuration');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Target:</label>
        <Input value="TikTok" disabled className="bg-gray-100" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Pixel ID:</label>
        <Input
          value={pixelId}
          onChange={(e) => setPixelId(e.target.value)}
          placeholder="Enter pixel ID"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Event Type:</label>
        <Select value={eventType} onValueChange={setEventType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Access Token:</label>
        <Input
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Enter access token"
          required
        />
      </div>

      <Button 
        type="button" 
        className="w-full"
        onClick={handleSavePixel}
      >
        Save Configuration
      </Button>
    </div>
  );
};