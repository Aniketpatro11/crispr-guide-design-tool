import { useState, useMemo } from "react";
import {
  CAS_PAM_TABLE,
  cleanSequence,
  parseFasta,
  computeGuideTable,
} from "@/lib/crispr-logic";
import { SettingsPanel } from "./SettingsPanel";
import { InputTab } from "./InputTab";
import { GuidesTab } from "./GuidesTab";
import { SequenceMapTab } from "./SequenceMapTab";
import { PlotsTab } from "./PlotsTab";
import { SequenceCompareTab } from "./SequenceCompareTab";
import { LoadingSpinner } from "./LoadingSpinner";
import { HamburgerIcon } from "./HamburgerIcon";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { AppHeader, MobileHeader } from "./AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dna, FileInput, List, Map, BarChart3, FlaskConical, GitCompare } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useSequenceHistory } from "@/hooks/useSequenceHistory";

export function CrisprApp() {
  // Theme
  const { theme, toggleTheme } = useTheme();

  // Sequence history
  const { history, addToHistory, removeFromHistory, clearHistory } = useSequenceHistory();

  // Settings state
  const [casSystem, setCasSystem] = useState<string>("SpCas9 (S. pyogenes, Type II)");
  const [guideLength, setGuideLength] = useState(20);
  const [advancedScores, setAdvancedScores] = useState(true);
  const [gcRange, setGcRange] = useState<[number, number]>([30, 80]);

  // Sequence state
  const [sequenceText, setSequenceText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Onboarding state
  const [showTutorial, setShowTutorial] = useState(false);

  // Map visualization state
  const [topN, setTopN] = useState(10);
  const [charsPerLine, setCharsPerLine] = useState(70);

  // Derived values
  const pamChoice = CAS_PAM_TABLE[casSystem];

  const cleanedSequence = useMemo(() => {
    const raw = sequenceText.includes(">") ? parseFasta(sequenceText) : sequenceText;
    return cleanSequence(raw);
  }, [sequenceText]);

  const guides = useMemo(() => {
    if (!isSubmitted || !cleanedSequence || cleanedSequence.length < guideLength + pamChoice.length) {
      return [];
    }
    return computeGuideTable(cleanedSequence, guideLength, pamChoice, advancedScores);
  }, [cleanedSequence, guideLength, pamChoice, advancedScores, isSubmitted]);

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => g.gcPercent >= gcRange[0] && g.gcPercent <= gcRange[1]);
  }, [guides, gcRange]);

  const isSequenceValid = cleanedSequence.length >= guideLength + pamChoice.length;
  const canSubmit = cleanedSequence.length > 0 && isSequenceValid;

  const handleSubmit = () => {
    if (canSubmit) {
      setIsLoading(true);
      // Add to history
      addToHistory(cleanedSequence);
      // Simulate async processing for loading animation
      setTimeout(() => {
        setIsSubmitted(true);
        setIsLoading(false);
      }, 800);
    }
  };

  const handleSequenceChange = (value: string) => {
    setSequenceText(value);
    setIsSubmitted(false);
  };

  const handleSelectFromHistory = (sequence: string) => {
    setSequenceText(sequence);
    setIsSubmitted(false);
  };

  const SettingsPanelContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-glow">
          <FlaskConical className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Settings</h2>
          <p className="text-xs text-muted-foreground">Configure analysis</p>
        </div>
      </div>
      <SettingsPanel
        casSystem={casSystem}
        setCasSystem={setCasSystem}
        guideLength={guideLength}
        setGuideLength={setGuideLength}
        advancedScores={advancedScores}
        setAdvancedScores={setAdvancedScores}
        gcRange={gcRange}
        setGcRange={setGcRange}
      />
    </div>
  );

  const reopenTutorial = () => {
    localStorage.removeItem("crispr-onboarding-completed");
    setShowTutorial(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Onboarding Tutorial */}
      <OnboardingTutorial onComplete={() => setShowTutorial(false)} />
      
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      {/* Loading Overlay */}
      {isLoading && <LoadingSpinner />}

      <div className="flex flex-col lg:flex-row relative z-10 pt-16 lg:pt-0">
        {/* Mobile Header */}
        <MobileHeader
          theme={theme}
          toggleTheme={toggleTheme}
          pamChoice={pamChoice}
          guideLength={guideLength}
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMenuOpen={isMobileMenuOpen}
          hamburgerIcon={<HamburgerIcon isOpen={isMobileMenuOpen} />}
        />
        
        {/* Mobile Settings Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-80 bg-background/70 backdrop-blur-3xl backdrop-saturate-200 border-white/10 p-0 [&>button]:hidden overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <div className="mb-6">
                <span className="font-bold text-lg">Settings</span>
              </div>
              {SettingsPanelContent}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-80 lg:min-h-screen lg:border-r border-white/10 bg-background/60 backdrop-blur-3xl backdrop-saturate-200 shrink-0 overflow-hidden">
          <div className="h-screen overflow-y-auto p-6 scrollbar-thin">
            <div className="sticky top-0 scroll-fade-in">
              {SettingsPanelContent}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Premium iOS Header */}
          <AppHeader
            theme={theme}
            toggleTheme={toggleTheme}
            pamChoice={pamChoice}
            guideLength={guideLength}
            onTutorialClick={reopenTutorial}
          />

          {/* Tabs */}
          <Tabs defaultValue="input" className="space-y-6">
            <TabsList className="grid grid-cols-5 gap-1 sm:gap-2 ios-preview-card p-1.5 sm:p-2 h-auto scroll-fade-in stagger-1">
              <TabsTrigger
                value="input"
                className="flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-lg transition-all text-xs sm:text-sm font-medium"
              >
                <FileInput className="w-4 h-4" />
                <span className="hidden sm:inline">Input</span>
              </TabsTrigger>
              <TabsTrigger
                value="guides"
                disabled={!isSubmitted || !isSequenceValid}
                className="flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-lg transition-all disabled:opacity-40 text-xs sm:text-sm font-medium"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Guides</span>
              </TabsTrigger>
              <TabsTrigger
                value="map"
                disabled={!isSubmitted || !isSequenceValid || filteredGuides.length === 0}
                className="flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-lg transition-all disabled:opacity-40 text-xs sm:text-sm font-medium"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
              <TabsTrigger
                value="plots"
                disabled={!isSubmitted || !isSequenceValid || filteredGuides.length === 0}
                className="flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-lg transition-all disabled:opacity-40 text-xs sm:text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Plots</span>
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                disabled={!isSubmitted || !isSequenceValid}
                className="flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-lg transition-all disabled:opacity-40 text-xs sm:text-sm font-medium"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="mt-6 scroll-fade-in stagger-2">
              <div className="ios-preview-card p-6">
                <InputTab
                  sequenceText={sequenceText}
                  setSequenceText={handleSequenceChange}
                  cleanedSequence={cleanedSequence}
                  casSystem={casSystem}
                  canSubmit={canSubmit}
                  isSubmitted={isSubmitted}
                  isLoading={isLoading}
                  onSubmit={handleSubmit}
                  history={history}
                  onSelectFromHistory={handleSelectFromHistory}
                  onRemoveFromHistory={removeFromHistory}
                  onClearHistory={clearHistory}
                />
              </div>
            </TabsContent>

            <TabsContent value="guides" className="mt-6 scroll-fade-in stagger-2">
              <div className="ios-preview-card p-6">
                {isSubmitted && isSequenceValid ? (
                  <GuidesTab
                    guides={guides}
                    filteredGuides={filteredGuides}
                    casSystem={casSystem}
                    cleanedSequence={cleanedSequence}
                    guideLength={guideLength}
                    gcRange={gcRange}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Dna className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Please submit a valid DNA sequence first.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-6 scroll-fade-in stagger-2">
              <div className="ios-preview-card p-6">
                {isSubmitted && isSequenceValid && filteredGuides.length > 0 ? (
                  <SequenceMapTab
                    filteredGuides={filteredGuides}
                    cleanedSequence={cleanedSequence}
                    casSystem={casSystem}
                    topN={topN}
                    setTopN={setTopN}
                    charsPerLine={charsPerLine}
                    setCharsPerLine={setCharsPerLine}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No guides available to display.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="plots" className="mt-6 scroll-fade-in stagger-2">
              <div className="ios-preview-card p-6">
                {isSubmitted && isSequenceValid && filteredGuides.length > 0 ? (
                  <PlotsTab filteredGuides={filteredGuides} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No guides available to plot.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="compare" className="mt-6 scroll-fade-in stagger-2">
              <div className="ios-preview-card p-6">
                {isSubmitted && isSequenceValid ? (
                  <SequenceCompareTab primarySequence={cleanedSequence} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Submit a sequence first to enable comparison.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
