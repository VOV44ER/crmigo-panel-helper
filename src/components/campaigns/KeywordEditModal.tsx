import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface KeywordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
}

export function KeywordEditModal({ isOpen, onClose, campaignName }: KeywordEditModalProps) {
  const [keywordAmount, setKeywordAmount] = useState("6");
  const [keywords, setKeywords] = useState(Array(6).fill(""));

  const handleSave = () => {
    // Here you would typically save the keywords to your backend
    toast.success("Keywords saved successfully");
    onClose();
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
            <Select value={keywordAmount} onValueChange={setKeywordAmount}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
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
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button onClick={handleSave} className="w-full mt-4">
            Save Keywords
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}