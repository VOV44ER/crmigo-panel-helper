import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PixelTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  campaignId: string;
}

const eventTypes = [
  "Add Payment Info",
  "Add to Cart",
  "Add to Wishlist",
  "Click Button",
  "Complete Payment",
  "Complete Registration",
  "Contact",
  "Download",
  "Initiate Checkout",
  "Place an Order",
  "Search",
  "Submit Form",
  "Subscribe",
  "View Content"
];

export const PixelTrackingModal = ({ isOpen, onClose, campaignName, campaignId }: PixelTrackingModalProps) => {
  const [pixelId, setPixelId] = useState("");
  const [eventType, setEventType] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testToken, setTestToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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

      const { data, error } = await supabase.functions.invoke('invoke-tonic-pixel', {
        body: {
          campaign_id: campaignId,
          'pixel-pixel_id': pixelId,
          'tiktok_access_token': accessToken,
          'pixel-test-token': testToken,
          'pixel-event_type': camelCaseEventType,
          'pixel-revenue_choice': 'preestimated_revenue',
          'pixel-target': 'tiktok'
        }
      });

      if (error) throw error;

      // Show success messages
      if (data.successes?.length > 0) {
        data.successes.forEach((message: string) => toast.success(message));
      }

      // Show error messages
      if (data.errors?.length > 0) {
        data.errors.forEach((message: string) => toast.error(message));
      }

      if (!data.errors?.length) {
        onClose();
      }
    } catch (error) {
      console.error('Error invoking pixel:', error);
      toast.error('Failed to invoke pixel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pixel Tracking - {campaignName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Token:</label>
            <Input
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Enter test token"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Invoking Pixel...' : 'Invoke Pixel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};