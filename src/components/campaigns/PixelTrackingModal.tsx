import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigureTab } from "./pixel-tracking/ConfigureTab";
import { TestTab } from "./pixel-tracking/TestTab";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PixelTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  campaignId: string;
  isFacebook: boolean;
}

export const PixelTrackingModal = ({ isOpen, onClose, campaignName, campaignId, isFacebook }: PixelTrackingModalProps) => {
  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testToken, setTestToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPixelData = async () => {
      if (!isOpen || !campaignId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('fetch-tonic-pixel', {
          body: { campaign_id: campaignId, isFacebook: isFacebook }
        });

        if (error) throw error;

        // Reset fields if no data or if pixel_id and access_token are not present
        if (!data || !data.pixel_id || !data.access_token) {
          setPixelId("");
          setAccessToken("");
          setTestToken("");
          return;
        }

        setPixelId(data.pixel_id);
        setAccessToken(data.access_token);
      } catch (error) {
        console.error('Error fetching pixel data:', error);
        toast.error('Failed to fetch pixel configuration');
        // Reset fields on error
        setPixelId("");
        setAccessToken("");
        setTestToken("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPixelData();
  }, [isOpen, campaignId]);

  return (
    <Dialog open={ isOpen } onOpenChange={ onClose }>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pixel Tracking - { campaignName }</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="configure" className="mt-4" ref={ tabsRef }>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          <TabsContent value="configure">
            <ConfigureTab
              pixelId={ pixelId }
              setPixelId={ setPixelId }
              accessToken={ accessToken }
              setAccessToken={ setAccessToken }
              isFacebook={ isFacebook }
              campaignId={ campaignId }
              tabsRef={ tabsRef }
              isLoading={ isLoading }
            />
          </TabsContent>

          <TabsContent value="test">
            <TestTab
              testToken={ testToken }
              setTestToken={ setTestToken }
              campaignId={ campaignId }
              pixelId={ pixelId }
              accessToken={ accessToken }
              onClose={ onClose }
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};