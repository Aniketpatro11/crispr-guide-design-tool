import { useState, useMemo } from "react";
import { cleanSequence, parseFasta, gcContent } from "@/lib/crispr-logic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GitCompare, ArrowLeftRight, CheckCircle2, XCircle, Minus, Plus, RotateCcw } from "lucide-react";

interface SequenceCompareTabProps {
  primarySequence: string;
}

interface DiffResult {
  type: "match" | "mismatch" | "insertion" | "deletion";
  pos: number;
  baseA?: string;
  baseB?: string;
}

function computeDiff(seqA: string, seqB: string): DiffResult[] {
  const results: DiffResult[] = [];
  const maxLen = Math.max(seqA.length, seqB.length);
  
  for (let i = 0; i < maxLen; i++) {
    const baseA = seqA[i] || "";
    const baseB = seqB[i] || "";
    
    if (baseA && baseB) {
      if (baseA === baseB) {
        results.push({ type: "match", pos: i, baseA, baseB });
      } else {
        results.push({ type: "mismatch", pos: i, baseA, baseB });
      }
    } else if (baseA && !baseB) {
      results.push({ type: "deletion", pos: i, baseA });
    } else if (!baseA && baseB) {
      results.push({ type: "insertion", pos: i, baseB });
    }
  }
  
  return results;
}

export function SequenceCompareTab({ primarySequence }: SequenceCompareTabProps) {
  const [secondaryText, setSecondaryText] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  const secondarySequence = useMemo(() => {
    const raw = secondaryText.includes(">") ? parseFasta(secondaryText) : secondaryText;
    return cleanSequence(raw);
  }, [secondaryText]);

  const diffResults = useMemo(() => {
    if (!isComparing || !primarySequence || !secondarySequence) return [];
    return computeDiff(primarySequence, secondarySequence);
  }, [primarySequence, secondarySequence, isComparing]);

  const stats = useMemo(() => {
    if (diffResults.length === 0) return null;
    const matches = diffResults.filter(d => d.type === "match").length;
    const mismatches = diffResults.filter(d => d.type === "mismatch").length;
    const insertions = diffResults.filter(d => d.type === "insertion").length;
    const deletions = diffResults.filter(d => d.type === "deletion").length;
    const identity = matches / diffResults.length * 100;
    
    return { matches, mismatches, insertions, deletions, identity };
  }, [diffResults]);

  const canCompare = primarySequence.length > 0 && secondarySequence.length > 0;

  const handleCompare = () => {
    if (canCompare) {
      setIsComparing(true);
    }
  };

  const handleReset = () => {
    setIsComparing(false);
    setSecondaryText("");
  };

  // Render highlighted diff (max 500 bases shown for performance)
  const renderDiff = () => {
    const displayDiff = diffResults.slice(0, 500);
    const hasMore = diffResults.length > 500;

    return (
      <div className="space-y-4">
        <div className="sequence-block max-h-64 overflow-auto">
          <div className="flex flex-wrap">
            {displayDiff.map((d, i) => {
              let className = "font-mono text-xs ";
              let char = d.baseA || d.baseB || "-";
              
              switch (d.type) {
                case "match":
                  className += "text-muted-foreground";
                  break;
                case "mismatch":
                  className += "text-amber-500 bg-amber-500/20 rounded px-0.5";
                  break;
                case "insertion":
                  className += "text-green-500 bg-green-500/20 rounded px-0.5";
                  char = d.baseB || "+";
                  break;
                case "deletion":
                  className += "text-red-500 bg-red-500/20 rounded px-0.5";
                  char = d.baseA || "-";
                  break;
              }
              
              return (
                <span key={i} className={className} title={`Position ${d.pos + 1}: ${d.type}`}>
                  {char}
                </span>
              );
            })}
          </div>
          {hasMore && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              ... and {diffResults.length - 500} more positions
            </p>
          )}
        </div>

        <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-muted-foreground/30"></span> Match
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500/50"></span> Mismatch
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500/50"></span> Insertion (in Seq B)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500/50"></span> Deletion (in Seq B)
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Sequence Comparison</h3>
          <p className="text-xs text-muted-foreground">Compare your analyzed sequence with another</p>
        </div>
      </div>

      {/* Comparison inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Sequence A (Primary)
            <span className="text-xs text-muted-foreground">({primarySequence.length} bp)</span>
          </label>
          <div className="p-3 rounded-lg bg-muted/30 border border-border font-mono text-xs max-h-32 overflow-auto">
            {primarySequence.slice(0, 200)}
            {primarySequence.length > 200 && <span className="text-muted-foreground">... ({primarySequence.length - 200} more)</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            GC: {gcContent(primarySequence).toFixed(1)}%
          </div>
        </div>

        {/* Secondary (editable) */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Sequence B (Compare)
            {secondarySequence.length > 0 && (
              <span className="text-xs text-muted-foreground">({secondarySequence.length} bp)</span>
            )}
          </label>
          <Textarea
            value={secondaryText}
            onChange={(e) => {
              setSecondaryText(e.target.value);
              setIsComparing(false);
            }}
            placeholder="Paste another DNA sequence to compare..."
            className="min-h-32 font-mono text-xs bg-muted/30 border-border resize-none"
          />
          {secondarySequence.length > 0 && (
            <div className="text-xs text-muted-foreground">
              GC: {gcContent(secondarySequence).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCompare}
          disabled={!canCompare || isComparing}
          className="btn-ios"
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Compare Sequences
        </Button>
        {isComparing && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="btn-ios-secondary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Results */}
      {isComparing && stats && (
        <div className="space-y-4 animate-slide-up">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="metric-card text-center">
              <div className="text-2xl font-bold text-primary font-mono">{stats.identity.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Identity</div>
            </div>
            <div className="metric-card text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold font-mono">{stats.matches}</span>
              </div>
              <div className="text-xs text-muted-foreground">Matches</div>
            </div>
            <div className="metric-card text-center">
              <div className="flex items-center justify-center gap-1">
                <XCircle className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-bold font-mono">{stats.mismatches}</span>
              </div>
              <div className="text-xs text-muted-foreground">Mismatches</div>
            </div>
            <div className="metric-card text-center">
              <div className="flex items-center justify-center gap-1">
                <Plus className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold font-mono">{stats.insertions}</span>
              </div>
              <div className="text-xs text-muted-foreground">Insertions</div>
            </div>
            <div className="metric-card text-center">
              <div className="flex items-center justify-center gap-1">
                <Minus className="w-4 h-4 text-red-500" />
                <span className="text-lg font-bold font-mono">{stats.deletions}</span>
              </div>
              <div className="text-xs text-muted-foreground">Deletions</div>
            </div>
          </div>

          {/* Visual diff */}
          <div className="card-glass p-4">
            <h4 className="font-medium mb-3 text-sm">Alignment Visualization</h4>
            {renderDiff()}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isComparing && !secondarySequence && (
        <div className="text-center py-8 text-muted-foreground">
          <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a second sequence to compare against your primary sequence.</p>
        </div>
      )}
    </div>
  );
}
