import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestTabProps {
  testToken: string;
  setTestToken: (value: string) => void;
  campaignId: string;
  pixelId: string;
  accessToken: string;
  onClose: () => void;
}

export const TestTab = ({
  testToken,
  setTestToken,
  campaignId,
  pixelId,
  accessToken,
  onClose,
}: TestTabProps) => {
  const handleInvokePixel = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('invoke-tonic-pixel', {
        body: {
          campaign_id: campaignId,
          'pixel-pixel_id': pixelId,
          'tiktok_access_token': accessToken,
          'pixel-test-token': testToken,
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Test Token:</label>
        <Input
          value={testToken}
          onChange={(e) => setTestToken(e.target.value)}
          placeholder="Enter test token"
          required
        />
      </div>

      <Button 
        type="button" 
        className="w-full"
        onClick={handleInvokePixel}
      >
        Invoke Pixel
      </Button>
    </div>
  );
};