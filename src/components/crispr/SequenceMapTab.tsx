import { useMemo } from "react";
import { GuideRow, CAS_PAM_TABLE, getSequencePositionTypes, GuideMeta } from "@/lib/crispr-logic";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SequenceMapTabProps {
  filteredGuides: GuideRow[];
  cleanedSequence: string;
  casSystem: string;
  topN: number;
  setTopN: (value: number) => void;
  charsPerLine: number;
  setCharsPerLine: (value: number) => void;
}

export function SequenceMapTab({
  filteredGuides,
  cleanedSequence,
  casSystem,
  topN,
  setTopN,
  charsPerLine,
  setCharsPerLine,
}: SequenceMapTabProps) {
  const pamChoice = CAS_PAM_TABLE[casSystem];
  const pamLen = pamChoice.length;

  const maxGuides = Math.min(50, filteredGuides.length);

  const guidesToShow = useMemo(() => {
    return filteredGuides.slice(0, topN);
  }, [filteredGuides, topN]);

  const guidesMeta: GuideMeta[] = useMemo(() => {
    return guidesToShow.map((g) => ({
      guideStart: g.guideStart,
      guideEnd: g.guideEnd,
      pamStart: g.guideEnd,
      pamEnd: g.guideEnd + pamLen,
      guideSeq: g.guideSeq,
      pamSeq: g.matchedPam,
    }));
  }, [guidesToShow, pamLen]);

  const positionTypes = useMemo(() => {
    return getSequencePositionTypes(cleanedSequence, guidesMeta);
  }, [cleanedSequence, guidesMeta]);

  const lines = useMemo(() => {
    const result: { lineStart: number; content: JSX.Element[] }[] = [];
    for (let i = 0; i < cleanedSequence.length; i += charsPerLine) {
      const lineContent: JSX.Element[] = [];
      for (let j = i; j < Math.min(i + charsPerLine, cleanedSequence.length); j++) {
        const char = cleanedSequence[j];
        const posType = positionTypes[j].type;

        let className = "font-mono";
        if (posType === "guide") {
          className += " sequence-guide";
        } else if (posType === "pam") {
          className += " sequence-pam";
        }

        lineContent.push(
          <span key={j} className={className}>
            {char}
          </span>
        );
      }
      result.push({ lineStart: i, content: lineContent });
    }
    return result;
  }, [cleanedSequence, positionTypes, charsPerLine]);

  if (filteredGuides.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-fade-in">
        <p className="text-lg font-medium">No guides to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Info Card */}
      <div className="card-glass p-4 text-sm">
        For readability, visualize the <strong>Top N</strong> guides (ranked by Total Score).
        Guides are <span className="text-guide font-bold">green</span> and PAMs are{" "}
        <span className="text-pam font-bold">red</span>.
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Top N guides to display</Label>
            <span className="font-mono text-sm font-semibold text-primary">{topN}</span>
          </div>
          <Slider
            value={[topN]}
            onValueChange={([val]) => setTopN(val)}
            min={1}
            max={maxGuides || 1}
            step={1}
            className="py-2"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Characters per line</Label>
            <span className="font-mono text-sm font-semibold text-primary">{charsPerLine}</span>
          </div>
          <Slider
            value={[charsPerLine]}
            onValueChange={([val]) => setCharsPerLine(val)}
            min={50}
            max={120}
            step={5}
            className="py-2"
          />
        </div>
      </div>

      {/* Sequence Map */}
      <div className="sequence-block max-h-[520px] overflow-auto">
        {lines.map((line, idx) => (
          <div key={idx} className="whitespace-pre leading-relaxed">
            <span className="text-muted-foreground text-xs mr-2">
              [{line.lineStart.toString().padStart(4, "0")}]
            </span>
            {line.content}
          </div>
        ))}
      </div>

      {/* Caption */}
      <p className="text-xs text-muted-foreground">
        Showing Top {topN} guides. PAM pattern is{" "}
        <span className="font-mono font-bold text-primary">{pamChoice}</span> (instances highlighted
        in red).
      </p>
    </div>
  );
}
