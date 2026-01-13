import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Send, Loader2, CheckCircle, AlertCircle, FileText, FileSpreadsheet } from "lucide-react";
import { GuideRow, CAS_PAM_TABLE } from "@/lib/crispr-logic";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredGuides: GuideRow[];
  casSystem: string;
  guideLength: number;
  gcRange: [number, number];
  cleanedSequence: string;
}

type ReportType = "summary" | "full";

export function EmailReportModal({
  isOpen,
  onClose,
  filteredGuides,
  casSystem,
  guideLength,
  gcRange,
  cleanedSequence,
}: EmailReportModalProps) {
  const [email, setEmail] = useState("");
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pamChoice = CAS_PAM_TABLE[casSystem];

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const scores = filteredGuides.map((g) => g.totalScore);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const topGuides = filteredGuides.slice(0, 10).map((g) => ({
        rank: g.rank,
        sequence: g.guideSeq,
        pam: g.matchedPam,
        gcPercent: g.gcPercent.toFixed(1),
        score: g.totalScore.toFixed(2),
        position: `${g.guideStart}-${g.guideEnd}`,
      }));

      const reportData = {
        email,
        reportType,
        casSystem,
        pamSequence: pamChoice,
        guideLength,
        gcRange,
        sequenceLength: cleanedSequence.length,
        totalGuides: filteredGuides.length,
        avgScore: avgScore.toFixed(2),
        topGuides,
        generatedAt: new Date().toISOString(),
      };

      const { error: fnError } = await supabase.functions.invoke("send-report", {
        body: reportData,
      });

      if (fnError) throw fnError;

      setIsSent(true);
      toast.success("Report sent successfully!");
      setTimeout(() => {
        onClose();
        setIsSent(false);
        setEmail("");
      }, 2000);
    } catch (err: unknown) {
      console.error("Error sending email:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to send email";
      // Show more specific error messages
      if (errorMsg.includes("domain") || errorMsg.includes("verify")) {
        setError("Email sending requires domain verification. Contact the app owner.");
        toast.error("Domain verification required for sending to external emails");
      } else {
        setError(errorMsg);
        toast.error("Failed to send email: " + errorMsg);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md ios-email-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {isSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Report Sent!</h3>
              <p className="text-muted-foreground">Check your inbox at {email}</p>
            </div>
          ) : (
            <>
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 ios-input"
                  />
                </div>
              </div>

              {/* Report Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Report Type</Label>
                <RadioGroup
                  value={reportType}
                  onValueChange={(val) => setReportType(val as ReportType)}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="summary"
                    className={`ios-report-option cursor-pointer ${
                      reportType === "summary" ? "ios-report-option-selected" : ""
                    }`}
                  >
                    <RadioGroupItem value="summary" id="summary" className="sr-only" />
                    <FileSpreadsheet className="w-6 h-6 mb-2 text-blue-500" />
                    <span className="font-medium text-sm">Summary</span>
                    <span className="text-xs text-muted-foreground">Key stats & top guides</span>
                  </label>
                  <label
                    htmlFor="full"
                    className={`ios-report-option cursor-pointer ${
                      reportType === "full" ? "ios-report-option-selected" : ""
                    }`}
                  >
                    <RadioGroupItem value="full" id="full" className="sr-only" />
                    <FileText className="w-6 h-6 mb-2 text-red-500" />
                    <span className="font-medium text-sm">Full Report</span>
                    <span className="text-xs text-muted-foreground">Complete analysis data</span>
                  </label>
                </RadioGroup>
              </div>

              {/* Summary preview */}
              <div className="ios-preview-section">
                <h4 className="text-sm font-medium mb-3">Report includes:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {casSystem.split(" ")[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {filteredGuides.length} guides
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    {guideLength} nt length
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Top 10 ranked
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={isSending || !email}
                className="w-full ios-button-primary"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Report
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
