import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Dna,
  Settings,
  FileInput,
  List,
  Map,
  BarChart3,
  Download,
  ChevronRight,
  ChevronLeft,
  Play,
  Sparkles,
  X,
} from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tip?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to CRISPR Designer",
    description:
      "This educational tool helps you explore CRISPR guide RNA design. Scan DNA sequences for PAM sites, extract guides, and visualize results.",
    icon: <Dna className="w-10 h-10" />,
    color: "from-blue-500 to-cyan-400",
    tip: "This tool is for learning purposes only.",
  },
  {
    title: "Configure Settings",
    description:
      "Choose your CRISPR system (SpCas9, SaCas9, etc.), set guide length (18-24 nt), and adjust GC% filters to refine your results.",
    icon: <Settings className="w-10 h-10" />,
    color: "from-purple-500 to-pink-400",
    tip: "Different Cas proteins recognize different PAM sequences.",
  },
  {
    title: "Input Your Sequence",
    description:
      "Paste your DNA sequence (FASTA or raw) in the Input tab. The tool accepts standard nucleotides (A, T, G, C) and cleans your input automatically.",
    icon: <FileInput className="w-10 h-10" />,
    color: "from-green-500 to-emerald-400",
    tip: "Sequences are saved in history for quick access.",
  },
  {
    title: "Explore Guide RNAs",
    description:
      "View ranked guides in the Guides tab. Sort by score, GC%, or position. Lower scores indicate potentially better candidates.",
    icon: <List className="w-10 h-10" />,
    color: "from-orange-500 to-amber-400",
    tip: "Click any row to see detailed context.",
  },
  {
    title: "Visualize on Map",
    description:
      "See guide positions highlighted on your sequence. Guides appear in green, PAM sites in red. Adjust display settings as needed.",
    icon: <Map className="w-10 h-10" />,
    color: "from-teal-500 to-cyan-400",
    tip: "Use the line width slider for better readability.",
  },
  {
    title: "Analyze with Charts",
    description:
      "The Plots tab shows score distributions, GC% histograms, and position analysis. Great for understanding your guide pool.",
    icon: <BarChart3 className="w-10 h-10" />,
    color: "from-rose-500 to-pink-400",
    tip: "Charts are included in the PDF export.",
  },
  {
    title: "Export & Share",
    description:
      "Download CSV for data analysis or generate a comprehensive PDF report. Share results via social media or email directly!",
    icon: <Download className="w-10 h-10" />,
    color: "from-indigo-500 to-violet-400",
    tip: "Email reports directly from the app.",
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("crispr-onboarding-completed");
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("crispr-onboarding-completed", "true");
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden ios-onboarding-dialog border-0">
        {/* Progress bar */}
        <div className="h-1 bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-8">
          {/* Video toggle */}
          {currentStep === 0 && (
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setShowVideo(!showVideo)}
                className="ios-video-button w-full group"
              >
                <div className={`flex items-center justify-center transition-transform duration-300 ${showVideo ? 'rotate-90' : ''}`}>
                  <Play className="w-4 h-4 mr-2" />
                </div>
                {showVideo ? "Hide Video Tutorial" : "Watch Video Tutorial"}
              </Button>

              <div className={`grid transition-all duration-500 ease-out ${showVideo ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                <div className="overflow-hidden">
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10 bg-black/40 backdrop-blur-sm">
                    <video
                      src="/videos/tutorial-crispr.mp4"
                      controls
                      className="w-full aspect-video"
                      poster=""
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="px-4 py-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3 h-3" />
                        Complete walkthrough
                      </span>
                      <span>~2 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step content */}
          <div className="text-center">
            {/* Icon */}
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 bg-gradient-to-br ${step.color} text-white shadow-lg ios-spring`}
            >
              {step.icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>

            {/* Description */}
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {step.description}
            </p>

            {/* Tip */}
            {step.tip && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                <Sparkles className="w-4 h-4" />
                {step.tip}
              </div>
            )}
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex-1 ios-button-secondary"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button onClick={nextStep} className="flex-1 ios-button-primary">
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Button to re-open tutorial
export function TutorialButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground"
    >
      <Sparkles className="w-4 h-4 mr-1" />
      Tutorial
    </Button>
  );
}
