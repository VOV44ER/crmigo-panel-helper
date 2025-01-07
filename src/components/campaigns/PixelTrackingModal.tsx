import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PixelTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
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

export const PixelTrackingModal = ({ isOpen, onClose, campaignName }: PixelTrackingModalProps) => {
  const [pixelId, setPixelId] = useState("");
  const [eventType, setEventType] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testToken, setTestToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement pixel tracking logic here
      toast.success("Pixel tracking invoked successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to invoke pixel tracking");
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

          <Button type="submit" className="w-full">
            Invoke Pixel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};