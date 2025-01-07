import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestTabProps {
  testToken: string;
  setTestToken: (value: string) => void;
  campaignId: string;
  onClose: () => void;
}

export const TestTab = ({
  testToken,
  setTestToken,
  campaignId,
  onClose,
}: TestTabProps) => {
  const [isInvoking, setIsInvoking] = useState(false);

  const handleInvokePixel = async () => {
    try {
      setIsInvoking(true);
      const { data, error } = await supabase.functions.invoke('invoke-tonic-pixel', {
        body: {
          campaign_id: campaignId,
          token: testToken,
        }
      });

      if (error) throw error;

      toast.success('Pixel invoked successfully');
      onClose();
    } catch (error) {
      console.error('Error invoking pixel:', error);
      toast.error('Failed to invoke pixel');
    } finally {
      setIsInvoking(false);
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
        disabled={isInvoking}
      >
        {isInvoking ? "Invoking..." : "Invoke Pixel"}
      </Button>
    </div>
  );
};