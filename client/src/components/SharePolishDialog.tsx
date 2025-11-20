import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, ExternalLink, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";
import type { PolishResponse } from "@shared/schemas";

interface SharePolishDialogProps {
  polish: PolishResponse;
  onGenerateLink?: () => Promise<string>;
}

export function SharePolishDialog({ polish, onGenerateLink }: SharePolishDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateLink = async () => {
    setGenerating(true);
    try {
      // Mock URL generation - in production, call the API
      const url = onGenerateLink
        ? await onGenerateLink()
        : `${window.location.origin}/share/${polish.id}`;
      setShareUrl(url);
      toast.success("Share link generated!");
    } catch (error) {
      toast.error("Failed to generate share link");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard!");
    }
  };

  const shareToTwitter = () => {
    if (!shareUrl) return;
    const text = `Check out my polished code! Quality improved by ${
      (polish.qualityScoreAfter || 0) - (polish.qualityScoreBefore || 0)
    } points with @CodePolish`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const shareToLinkedIn = () => {
    if (!shareUrl) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Polish Results</DialogTitle>
          <DialogDescription>
            Create a shareable link to showcase your code improvements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Polish Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{polish.name}</span>
              <Badge variant="outline">{polish.framework}</Badge>
            </div>
            {polish.qualityScoreBefore && polish.qualityScoreAfter && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Quality:</span>
                <span className="text-destructive">{polish.qualityScoreBefore}</span>
                <span>→</span>
                <span className="text-green-500">{polish.qualityScoreAfter}</span>
                <Badge variant="outline" className="ml-auto text-green-500 border-green-500">
                  +{polish.qualityScoreAfter - polish.qualityScoreBefore} pts
                </Badge>
              </div>
            )}
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Link</Label>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Generate Link */}
          {!shareUrl ? (
            <Button
              onClick={handleGenerateLink}
              disabled={generating}
              className="w-full"
            >
              {generating ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <>
              {/* Share URL */}
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex items-center gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="space-y-2">
                <Label>Share On</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={shareToTwitter}
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={shareToLinkedIn}
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SharePolishDialog;
