import { useMemo, useState } from "react";
import { GuideRow, CAS_PAM_TABLE, sliceContext } from "@/lib/crispr-logic";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, CheckCircle, ArrowUpDown } from "lucide-react";
import { ExportReportButton } from "./ExportReportButton";
import { ShareModal } from "./ShareModal";
import { EmailReportModal } from "./EmailReportModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GuidesTabProps {
  guides: GuideRow[];
  filteredGuides: GuideRow[];
  casSystem: string;
  cleanedSequence: string;
  guideLength: number;
  gcRange: [number, number];
}

export function GuidesTab({ guides, filteredGuides, casSystem, cleanedSequence, guideLength, gcRange }: GuidesTabProps) {
  const pamChoice = CAS_PAM_TABLE[casSystem];
  const [selectedRank, setSelectedRank] = useState<number>(filteredGuides[0]?.rank || 1);
  const [sortField, setSortField] = useState<keyof GuideRow>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const sortedGuides = useMemo(() => {
    return [...filteredGuides].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredGuides, sortField, sortAsc]);

  const selectedGuide = filteredGuides.find((g) => g.rank === selectedRank) || filteredGuides[0];

  const handleSort = (field: keyof GuideRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Rank",
      "Guide Start (0-based)",
      "Guide End (0-based, excl)",
      "Guide Sequence (5'→3')",
      "PAM Pattern",
      "Matched PAM (instance)",
      "GC %",
      "Self-Complementarity",
      "Off-target-like Matches",
      "Total Score (lower is better)",
    ];
    const rows = filteredGuides.map((g) => [
      g.rank,
      g.guideStart,
      g.guideEnd,
      g.guideSeq,
      g.pamPattern,
      g.matchedPam,
      g.gcPercent,
      g.selfComplementarity ?? "",
      g.offTargetLikeMatches ?? "",
      g.totalScore,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crispr_guides.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (filteredGuides.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-fade-in">
        <p className="text-lg font-medium">No guides remain after filtering.</p>
        <p className="text-sm mt-2">Try widening the GC% range.</p>
      </div>
    );
  }

  // Context snippet for selected guide
  const { context, left } = sliceContext(
    cleanedSequence,
    selectedGuide.guideStart,
    selectedGuide.guideEnd,
    selectedGuide.guideEnd + pamChoice.length,
    14
  );
  const g0 = selectedGuide.guideStart - left;
  const g1 = selectedGuide.guideEnd - left;
  const p0 = g1;
  const p1 = p0 + pamChoice.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="text-xs text-muted-foreground mb-1">Guides found (raw)</div>
          <div className="text-2xl font-bold font-mono">{guides.length}</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-muted-foreground mb-1">After GC filter</div>
          <div className="text-2xl font-bold font-mono text-primary">{filteredGuides.length}</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-muted-foreground mb-1">Best score</div>
          <div className="text-2xl font-bold font-mono text-score-good">
            {filteredGuides[0]?.totalScore.toFixed(2) || "—"}
          </div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-muted-foreground mb-1">Worst score</div>
          <div className="text-2xl font-bold font-mono text-score-bad">
            {filteredGuides[filteredGuides.length - 1]?.totalScore.toFixed(2) || "—"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Pick guide by Rank:</span>
          <Select
            value={String(selectedRank)}
            onValueChange={(val) => setSelectedRank(Number(val))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filteredGuides.map((g) => (
                <SelectItem key={g.rank} value={String(g.rank)}>
                  #{g.rank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <ShareModal
            filteredGuides={filteredGuides}
            casSystem={casSystem}
            guideLength={guideLength}
            cleanedSequence={cleanedSequence}
            onEmailClick={() => setIsEmailModalOpen(true)}
            onDownloadPdf={() => {}}
            onDownloadCsv={downloadCSV}
          />
          <Button variant="outline" size="sm" onClick={downloadCSV} className="ios-button-secondary">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <ExportReportButton
            filteredGuides={filteredGuides}
            casSystem={casSystem}
            guideLength={guideLength}
            gcRange={gcRange}
            cleanedSequence={cleanedSequence}
          />
        </div>
      </div>

      {/* Email Modal */}
      <EmailReportModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        filteredGuides={filteredGuides}
        casSystem={casSystem}
        guideLength={guideLength}
        gcRange={gcRange}
        cleanedSequence={cleanedSequence}
      />

      {/* Guide Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("rank")}
                >
                  Rank <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Guide (5'→3')</TableHead>
                <TableHead>PAM</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("gcPercent")}
                >
                  GC% <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("selfComplementarity")}
                >
                  Self-Comp <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("offTargetLikeMatches")}
                >
                  Off-target <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort("totalScore")}
                >
                  Score <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGuides.map((g) => (
                <TableRow
                  key={g.rank}
                  className={`cursor-pointer transition-colors ${
                    g.rank === selectedRank ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedRank(g.rank)}
                >
                  <TableCell className="font-bold">#{g.rank}</TableCell>
                  <TableCell className="font-mono text-xs">{g.guideStart}</TableCell>
                  <TableCell className="font-mono text-xs">{g.guideEnd}</TableCell>
                  <TableCell className="font-mono text-xs text-guide font-semibold">
                    {g.guideSeq}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-pam font-bold">
                    {g.matchedPam}
                  </TableCell>
                  <TableCell className="font-mono">{g.gcPercent.toFixed(1)}</TableCell>
                  <TableCell className="font-mono">{g.selfComplementarity ?? "—"}</TableCell>
                  <TableCell className="font-mono">{g.offTargetLikeMatches ?? "—"}</TableCell>
                  <TableCell className="font-mono font-bold">{g.totalScore.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Selected Guide Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Selected guide (quick preview)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-glass p-4">
            <div className="text-xs text-muted-foreground mb-2">Guide (5'→3')</div>
            <div className="font-mono text-lg font-bold text-guide break-all">
              {selectedGuide.guideSeq}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Start: <span className="font-mono font-semibold">{selectedGuide.guideStart}</span> •
              End: <span className="font-mono font-semibold">{selectedGuide.guideEnd}</span>
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="text-xs text-muted-foreground mb-2">PAM</div>
            <div className="font-mono text-lg font-bold text-pam">{selectedGuide.matchedPam}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Pattern: <span className="font-mono font-semibold">{pamChoice}</span> • Length:{" "}
              <span className="font-mono font-semibold">{pamChoice.length}</span>
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="text-xs text-muted-foreground mb-2">Scores</div>
            <div className="text-xs space-y-1">
              <div>
                GC%: <span className="font-mono font-semibold">{selectedGuide.gcPercent}</span>
              </div>
              <div>
                Self-comp:{" "}
                <span className="font-mono font-semibold">
                  {selectedGuide.selfComplementarity ?? "—"}
                </span>
              </div>
              <div>
                Off-target:{" "}
                <span className="font-mono font-semibold">
                  {selectedGuide.offTargetLikeMatches ?? "—"}
                </span>
              </div>
            </div>
            <div className="mt-3 text-lg font-bold">
              Total: <span className="font-mono text-primary">{selectedGuide.totalScore}</span>
            </div>
          </div>
        </div>

        {/* Context Snippet */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Local context{" "}
            <span className="text-muted-foreground font-normal">
              (guide = <span className="text-guide">green</span>, PAM ={" "}
              <span className="text-pam">red</span>)
            </span>
          </div>
          <div className="sequence-block">
            <span className="text-muted-foreground">[{left.toString().padStart(4, "0")}]</span>{" "}
            <span className="font-mono">
              {context.slice(0, g0)}
              <span className="sequence-guide">{context.slice(g0, g1)}</span>
              <span className="sequence-pam">{context.slice(p0, p1)}</span>
              {context.slice(p1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
