import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getTonicToken } from "@/utils/tokenUtils";

interface KeywordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  campaignId: string | number;
}

export function KeywordEditModal({ isOpen, onClose, campaignName, campaignId }: KeywordEditModalProps) {
  const [keywordAmount, setKeywordAmount] = useState("3");
  const [keywords, setKeywords] = useState(Array(3).fill(""));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const token = getTonicToken();
    if (!token) return;

    // Filter out empty keywords
    const filteredKeywords = keywords.filter(keyword => keyword.trim() !== "");

    try {
      setIsSaving(true);
      const response = await fetch('https://api.publisher.tonic.com/privileged/v3/campaign/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          keywords: filteredKeywords,
          keyword_amount: Number(keywordAmount)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save keywords');
      }

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
              {[...Array(Number(keywordAmount))].map((_, index) => (
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
                    className="bg-white"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button 
            onClick={handleSave} 
            className="w-full mt-4"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Keywords"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}