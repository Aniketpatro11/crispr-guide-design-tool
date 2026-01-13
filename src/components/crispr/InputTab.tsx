import { useRef } from "react";
import { CAS_PAM_TABLE, gcContent } from "@/lib/crispr-logic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Dna, Play, CheckCircle2, History, Trash2, X, Loader2 } from "lucide-react";
import { SequenceHistoryItem } from "@/hooks/useSequenceHistory";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InputTabProps {
  sequenceText: string;
  setSequenceText: (value: string) => void;
  cleanedSequence: string;
  casSystem: string;
  canSubmit: boolean;
  isSubmitted: boolean;
  isLoading: boolean;
  onSubmit: () => void;
  history: SequenceHistoryItem[];
  onSelectFromHistory: (sequence: string) => void;
  onRemoveFromHistory: (id: string) => void;
  onClearHistory: () => void;
}

export function InputTab({
  sequenceText,
  setSequenceText,
  cleanedSequence,
  casSystem,
  canSubmit,
  isSubmitted,
  isLoading,
  onSubmit,
  history,
  onSelectFromHistory,
  onRemoveFromHistory,
  onClearHistory,
}: InputTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pamChoice = CAS_PAM_TABLE[casSystem];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSequenceText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <div className="lg:col-span-2 space-y-3 animate-slide-up">
          <label className="text-sm font-medium flex items-center gap-2">
            <Dna className="w-4 h-4 text-primary" />
            Paste DNA or FASTA (A/T/G/C only will be kept):
          </label>
          <Textarea
            value={sequenceText}
            onChange={(e) => setSequenceText(e.target.value)}
            placeholder="Example:&#10;>my_seq&#10;ATGCGT... (you can paste FASTA too)"
            className="min-h-[200px] font-mono text-sm bg-muted/30 border-border resize-none transition-all focus:ring-2 focus:ring-primary/30"
          />
          
          {/* Submit Button */}
          <Button 
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
            className={`w-full sm:w-auto btn-ios ${
              isSubmitted 
                ? '!bg-green-600 hover:!bg-green-700' 
                : ''
            }`}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : isSubmitted ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Submitted — View Results
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Analyze Sequence
              </>
            )}
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-3 animate-slide-up stagger-1">
          <label className="text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Or upload FASTA / TXT
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 group"
          >
            <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-sm text-muted-foreground">
              Click to upload <span className="font-medium">.fa, .fasta, .txt</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              File overrides the text box
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".fa,.fasta,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="metric-card animate-scale-in stagger-1">
          <div className="text-xs text-muted-foreground mb-1">Sequence length</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {cleanedSequence.length.toLocaleString()}
            <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">bp</span>
          </div>
        </div>

        <div className="metric-card animate-scale-in stagger-2">
          <div className="text-xs text-muted-foreground mb-1">GC % (whole input)</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {cleanedSequence ? gcContent(cleanedSequence).toFixed(2) : "—"}
            <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">%</span>
          </div>
        </div>

        <div className="metric-card animate-scale-in stagger-3">
          <div className="text-xs text-muted-foreground mb-1">Selected system</div>
          <div className="text-sm sm:text-lg font-bold text-foreground truncate">
            {casSystem.split(" (")[0]}
          </div>
        </div>

        <div className="metric-card animate-scale-in stagger-4">
          <div className="text-xs text-muted-foreground mb-1">PAM pattern</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-primary">{pamChoice}</div>
        </div>
      </div>

      {/* Sequence History */}
      {history.length > 0 && (
        <Collapsible className="animate-fade-in">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full py-2">
            <History className="w-4 h-4" />
            <span>Recent Sequences ({history.length})</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="card-glass p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Click to load a previous sequence</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearHistory}
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectFromHistory(item.sequence)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs truncate text-foreground">{item.preview}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.length.toLocaleString()} bp • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromHistory(item.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Info message if no sequence */}
      {!cleanedSequence && (
        <div className="text-center py-8 text-muted-foreground animate-fade-in">
          <Dna className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse-subtle" />
          <p className="text-sm">Provide a DNA sequence to begin analysis.</p>
        </div>
      )}

      {/* Success message after submit */}
      {isSubmitted && cleanedSequence && (
        <div className="card-glass p-4 border-green-500/30 bg-green-500/5 animate-scale-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm text-green-400">
              Analysis complete! Navigate to the <span className="font-semibold">Guides</span> tab to view results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
