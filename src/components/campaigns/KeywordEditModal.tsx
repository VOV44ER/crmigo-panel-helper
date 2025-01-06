import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KeywordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  campaignId: string | number;
}

export function KeywordEditModal({ isOpen, onClose, campaignName, campaignId }: KeywordEditModalProps) {
  const [keywordAmount, setKeywordAmount] = useState("3");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && campaignId) {
      setKeywords(Array(Number(keywordAmount)).fill(""));
      fetchExistingKeywords();
    }
  }, [isOpen, campaignId, keywordAmount]);

  const fetchExistingKeywords = async () => {
    if (!campaignId) {
      toast.error("Campaign ID is missing");
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching keywords for campaign:', campaignId);
      
      const { data, error } = await supabase.functions.invoke('fetch-tonic-keywords', {
        body: { 
          campaign_id: campaignId.toString()
        }
      });

      if (error) {
        console.error('Error fetching keywords:', error);
        throw error;
      }

      console.log('Received keywords data:', data);

      if (data?.KwAmount && Array.isArray(data?.Keywords)) {
        setKeywordAmount(data.KwAmount.toString());
        const newKeywords = Array(data.KwAmount).fill("");
        data.Keywords.forEach((kw: string, index: number) => {
          if (index < newKeywords.length) {
            newKeywords[index] = kw;
          }
        });
        setKeywords(newKeywords);
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
      toast.error("Failed to fetch existing keywords");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const filteredKeywords = keywords.filter(keyword => keyword.trim() !== "");

    try {
      setIsSaving(true);
      const { data, error } = await supabase.functions.invoke('update-tonic-keywords', {
        body: {
          campaign_id: campaignId.toString(),
          keywords: filteredKeywords,
          keyword_amount: Number(keywordAmount)
        }
      });

      if (error) throw error;

      toast.success("Keywords saved successfully");
      onClose();
    } catch (error) {
      console.error('Error saving keywords:', error);
      toast.error("Failed to save keywords");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Keywords for {campaignName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <Label>Keyword amount</Label>
            <Select 
              value={keywordAmount} 
              onValueChange={(value) => {
                setKeywordAmount(value);
                setKeywords(Array(Number(value)).fill(""));
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {[...Array(8)].map((_, i) => (
                  <SelectItem 
                    key={i + 3} 
                    value={(i + 3).toString()}
                    className="hover:bg-gray-100"
                  >
                    {i + 3}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How many keywords do you want to display?
            </p>
          </div>

          <ScrollArea className="h-[40vh] pr-4">
            <div className="space-y-4">
              {isLoading ? (
                [...Array(Number(keywordAmount))].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : (
                [...Array(Number(keywordAmount))].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label>Keyword #{index + 1}</Label>
                    <Input
                      value={keywords[index] || ""}
                      onChange={(e) => {
                        const newKeywords = [...keywords];
                        newKeywords[index] = e.target.value;
                        setKeywords(newKeywords);
                      }}
                      placeholder="Empty fields will be filled by us"
                      className="bg-white focus-visible:ring-offset-0"
                    />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <Button 
            onClick={handleSave} 
            className="w-full mt-4"
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Keywords"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}