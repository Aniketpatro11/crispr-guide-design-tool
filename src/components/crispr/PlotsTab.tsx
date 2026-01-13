import { useMemo } from "react";
import { GuideRow } from "@/lib/crispr-logic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BookOpen } from "lucide-react";

interface PlotsTabProps {
  filteredGuides: GuideRow[];
}

export function PlotsTab({ filteredGuides }: PlotsTabProps) {
  const gcData = useMemo(() => {
    return filteredGuides.map((g, idx) => ({
      name: `#${g.rank}`,
      value: g.gcPercent,
      index: idx,
    }));
  }, [filteredGuides]);

  const scoreData = useMemo(() => {
    return filteredGuides.map((g, idx) => ({
      name: `#${g.rank}`,
      value: g.totalScore,
      index: idx,
    }));
  }, [filteredGuides]);

  const getGcColor = (gc: number) => {
    if (gc >= 40 && gc <= 60) return "hsl(150, 70%, 45%)";
    if (gc >= 30 && gc <= 70) return "hsl(45, 80%, 50%)";
    return "hsl(0, 70%, 55%)";
  };

  const getScoreColor = (score: number, min: number, max: number) => {
    const normalized = (score - min) / (max - min || 1);
    if (normalized <= 0.33) return "hsl(150, 70%, 45%)";
    if (normalized <= 0.66) return "hsl(45, 80%, 50%)";
    return "hsl(0, 70%, 55%)";
  };

  const minScore = Math.min(...filteredGuides.map((g) => g.totalScore));
  const maxScore = Math.max(...filteredGuides.map((g) => g.totalScore));

  if (filteredGuides.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-fade-in">
        <p className="text-lg font-medium">No guides to plot.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div data-charts-container className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GC% Distribution */}
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold mb-4">GC% Distribution (filtered guides)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gcData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(0, Math.floor(gcData.length / 10))}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "GC%"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {gcData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getGcColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold mb-4">
            Total Score Distribution (lower is better)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(0, Math.floor(scoreData.length / 10))}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [value.toFixed(2), "Score"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {scoreData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getScoreColor(entry.value, minScore, maxScore)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interpretation Card */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          How to interpret the scores
        </h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">GC% ~ 40–60%</strong> is often a comfortable range
              for many systems (rule-of-thumb).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">Self-complementarity</strong> is a small heuristic
              for potential hairpins (higher → more risk).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">Off-target-like matches</strong> here are checked
              only against the same input sequence (educational).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>
              <strong className="text-foreground">Total Score</strong> combines these metrics: lower
              ≈ better under this simplified model.
            </span>
          </li>
        </ul>
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          ⚠️ This tool is for learning and visualization only, not for experimental/clinical guide
          design.
        </div>
      </div>
    </div>
  );
}
