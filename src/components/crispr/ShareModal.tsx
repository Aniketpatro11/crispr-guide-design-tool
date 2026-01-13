import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Check,
  Download,
  FileText,
  Mail,
} from "lucide-react";
import { GuideRow } from "@/lib/crispr-logic";

interface ShareModalProps {
  filteredGuides: GuideRow[];
  casSystem: string;
  guideLength: number;
  cleanedSequence: string;
  onEmailClick: () => void;
  onDownloadPdf: () => void;
  onDownloadCsv: () => void;
}

export function ShareModal({
  filteredGuides,
  casSystem,
  guideLength,
  cleanedSequence,
  onEmailClick,
  onDownloadPdf,
  onDownloadCsv,
}: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `🧬 Just designed ${filteredGuides.length} CRISPR guide RNAs using ${casSystem}! Check out this educational tool for exploring guide design.`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="ios-share-button">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md ios-share-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="ios-stat-card">
              <span className="text-2xl font-bold text-primary">{filteredGuides.length}</span>
              <span className="text-xs text-muted-foreground">Guides</span>
            </div>
            <div className="ios-stat-card">
              <span className="text-2xl font-bold text-primary">{guideLength}</span>
              <span className="text-xs text-muted-foreground">Length (nt)</span>
            </div>
            <div className="ios-stat-card">
              <span className="text-2xl font-bold text-primary">{cleanedSequence.length}</span>
              <span className="text-xs text-muted-foreground">Seq (bp)</span>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Share on Social</h4>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={shareToTwitter}
                className="ios-social-button group"
              >
                <Twitter className="w-5 h-5 text-[#1DA1F2] group-hover:scale-110 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={shareToLinkedIn}
                className="ios-social-button group"
              >
                <Linkedin className="w-5 h-5 text-[#0A66C2] group-hover:scale-110 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={shareToFacebook}
                className="ios-social-button group"
              >
                <Facebook className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Copy Link</h4>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full ios-button-secondary justify-between"
            >
              <span className="text-sm truncate max-w-[200px]">{shareUrl}</span>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Download & Email */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Download & Send</h4>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  onDownloadPdf();
                  setIsOpen(false);
                }}
                className="ios-download-button flex flex-col h-auto py-3"
              >
                <FileText className="w-5 h-5 mb-1 text-red-500" />
                <span className="text-xs">PDF</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onDownloadCsv();
                  setIsOpen(false);
                }}
                className="ios-download-button flex flex-col h-auto py-3"
              >
                <Download className="w-5 h-5 mb-1 text-green-500" />
                <span className="text-xs">CSV</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onEmailClick();
                  setIsOpen(false);
                }}
                className="ios-download-button flex flex-col h-auto py-3"
              >
                <Mail className="w-5 h-5 mb-1 text-blue-500" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
