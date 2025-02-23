import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ConfigureTabProps {
  pixelId: string;
  setPixelId: (value: string) => void;
  accessToken: string;
  setAccessToken: (value: string) => void;
  campaignId: string;
  tabsRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  isFacebook: boolean;
}

export const ConfigureTab = ({
  pixelId,
  setPixelId,
  accessToken,
  setAccessToken,
  campaignId,
  tabsRef,
  isFacebook,
  isLoading,
}: ConfigureTabProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSavePixel = async () => {
    try {
      setIsSaving(true);
      const { data, error } = await supabase.functions.invoke('save-tonic-pixel', {
        body: {
          campaign_id: campaignId,
          pixel_id: pixelId,
          access_token: accessToken,
          revenue_type: "preestimated_revenue",
          isFacebook: isFacebook,
          event_name: 'Lead'
        }
      });

      if (error) throw error;

      toast.success("Pixel configuration saved successfully");

      // Switch to test tab
      const testTrigger = tabsRef.current?.querySelector('[value="test"]') as HTMLButtonElement;
      if (testTrigger) {
        testTrigger.click();
      }
    } catch (error) {
      console.error('Error saving pixel:', error);
      toast.error('Failed to save pixel configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePixel = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.functions.invoke('delete-tonic-pixel', {
        body: { campaign_id: campaignId }
      });

      if (error) throw error;

      toast.success("Pixel configuration deleted successfully");
      setPixelId('');
      setAccessToken('');
    } catch (error) {
      console.error('Error deleting pixel:', error);
      toast.error('Failed to delete pixel configuration');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Target:</label>
        <Input value={ isFacebook ? "Facebook" : "TikTok" } disabled className="bg-gray-100" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Pixel ID:</label>
        <Input
          value={ pixelId }
          onChange={ (e) => setPixelId(e.target.value) }
          placeholder="Enter pixel ID"
          required
          disabled={ isLoading }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Access Token:</label>
        <Input
          value={ accessToken }
          onChange={ (e) => setAccessToken(e.target.value) }
          placeholder="Enter access token"
          required
          disabled={ isLoading }
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          className="flex-1"
          onClick={ handleSavePixel }
          disabled={ isSaving || isLoading }
        >
          { isSaving ? "Saving..." : "Save Configuration" }
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={ !pixelId || isDeleting || isLoading }
          className="w-24"
          onClick={ handleDeletePixel }
        >
          { isDeleting ? "..." : "Delete" }
        </Button>
      </div>
    </div>
  );
};