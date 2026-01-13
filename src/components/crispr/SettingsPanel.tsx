import { CAS_PAM_TABLE, IUPAC_CODES } from "@/lib/crispr-logic";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Info } from "lucide-react";
interface SettingsPanelProps {
  casSystem: string;
  setCasSystem: (value: string) => void;
  guideLength: number;
  setGuideLength: (value: number) => void;
  advancedScores: boolean;
  setAdvancedScores: (value: boolean) => void;
  gcRange: [number, number];
  setGcRange: (value: [number, number]) => void;
}
export function SettingsPanel({
  casSystem,
  setCasSystem,
  guideLength,
  setGuideLength,
  advancedScores,
  setAdvancedScores,
  gcRange,
  setGcRange
}: SettingsPanelProps) {
  const pamChoice = CAS_PAM_TABLE[casSystem];
  return <div className="space-y-6 animate-fade-in">
      {/* CRISPR System Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">CRISPR System / Organism</Label>
        <Select value={casSystem} onValueChange={setCasSystem}>
          <SelectTrigger className="w-full bg-card border-border">
            <SelectValue placeholder="Select system" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(CAS_PAM_TABLE).map(system => <SelectItem key={system} value={system}>
                {system}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* PAM Display */}
      <div className="metric-card space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">PAM in use</Label>
        <div className="font-mono text-xl font-bold text-primary">{pamChoice}</div>
        <div className="text-xs text-muted-foreground">
          PAM length: <span className="font-mono font-semibold">{pamChoice.length}</span> nt
        </div>
      </div>

      {/* IUPAC Legend */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
          <Info className="w-4 h-4" />
          <span>IUPAC legend</span>
          <ChevronDown className="w-4 h-4 ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1 font-mono">
            {Object.entries(IUPAC_CODES).map(([code, bases]) => <div key={code} className="flex justify-between">
                <span className="font-bold text-primary">{code}</span>
                <span className="text-muted-foreground">{bases.join(" / ")}</span>
              </div>)}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Guide Length */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Guide length (nt)</Label>
          <span className="font-mono text-sm font-semibold text-primary">{guideLength}</span>
        </div>
        <Slider value={[guideLength]} onValueChange={([val]) => setGuideLength(val)} min={18} max={24} step={1} className="py-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>18</span>
          <span>24</span>
        </div>
      </div>

      {/* Advanced Scores Toggle */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm font-medium">Compute advanced scores</Label>
        <Switch checked={advancedScores} onCheckedChange={setAdvancedScores} />
      </div>

      {/* GC Range Filter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Filter by GC %</Label>
          <span className="font-mono text-sm font-semibold text-primary">
            {gcRange[0]}% – {gcRange[1]}%
          </span>
        </div>
        <Slider value={gcRange} onValueChange={val => setGcRange(val as [number, number])} min={0} max={100} step={1} className="py-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Attribution - iOS Inspired */}
      <div className="ios-attribution mt-6">
        <div className="ios-attribution-card">
          <div className="ios-attribution-icon">
            <span className="text-lg">🧬</span>
          </div>
          <div className="ios-attribution-content">
            <p className="ios-attribution-title">Code Biologist</p>
            <p className="ios-attribution-subtitle">Crafted by <span className="ios-attribution-name">Aniket</span></p>
          </div>
          <div className="ios-attribution-badge">
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </div>;
}