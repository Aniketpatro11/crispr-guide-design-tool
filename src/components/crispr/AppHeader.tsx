import { Dna, Sun, Moon, Sparkles } from "lucide-react";

interface AppHeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  pamChoice: string;
  guideLength: number;
  onTutorialClick: () => void;
}

export function AppHeader({
  theme,
  toggleTheme,
  pamChoice,
  guideLength,
  onTutorialClick,
}: AppHeaderProps) {
  return (
    <header className="ios-toolbar mb-8 scroll-fade-in hidden lg:block">
      <div className="ios-toolbar-container">
        {/* Left section: App icon + Title */}
        <div className="flex items-center gap-4">
          {/* App Icon - iOS multicolor squircle */}
          <div className="ios-app-icon">
            <Dna className="w-5 h-5 text-white" />
          </div>

          {/* Title & Subtitle */}
          <div className="flex flex-col">
            <h1 className="ios-toolbar-title">CRISPR Guide Design Tool</h1>
            <p className="ios-toolbar-subtitle">
              Scan DNA for PAMs → extract guides → score & visualize
            </p>
          </div>
        </div>

        {/* Right section: Pills with iOS vibrant colors */}
        <div className="flex items-center gap-2">
          {/* Tutorial Pill - Purple */}
          <button
            onClick={onTutorialClick}
            className="ios-toolbar-pill ios-toolbar-pill-tutorial ios-toolbar-pill-interactive"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tutorial</span>
          </button>

          {/* Theme Toggle Pill - Yellow/Blue */}
          <button
            onClick={toggleTheme}
            className="ios-toolbar-pill ios-toolbar-pill-theme ios-toolbar-pill-interactive ios-toolbar-pill-icon"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-ios-yellow" />
            ) : (
              <Moon className="w-4 h-4 text-ios-indigo" />
            )}
          </button>

          {/* PAM Badge - Orange/Pink */}
          <div className="ios-toolbar-pill ios-toolbar-pill-pam">
            <span className="font-mono font-semibold">{pamChoice}</span>
          </div>

          {/* Guide Length Chip - Teal/Green */}
          <div className="ios-toolbar-pill ios-toolbar-pill-guide">
            <span className="font-mono font-semibold">{guideLength} nt</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// Mobile header variant
interface MobileHeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  pamChoice: string;
  guideLength: number;
  onMenuClick: () => void;
  isMenuOpen: boolean;
  hamburgerIcon: React.ReactNode;
}

export function MobileHeader({
  theme,
  toggleTheme,
  pamChoice,
  guideLength,
  onMenuClick,
  hamburgerIcon,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden ios-mobile-toolbar fixed top-0 left-0 right-0 z-50">
      <div className="ios-mobile-toolbar-container backdrop-blur-2xl backdrop-saturate-200 bg-background/70 dark:bg-background/60 border-b border-white/10 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20">
        {/* Left: App icon + Title */}
        <div className="flex items-center gap-3">
          <div className="ios-app-icon-small">
            <Dna className="w-4 h-4 text-white" />
          </div>
          <span className="ios-mobile-title">CRISPR Tool</span>
        </div>

        {/* Right: Pills + Menu */}
        <div className="flex items-center gap-1.5">
          {/* PAM Badge - compact */}
          <div className="ios-toolbar-pill-compact ios-toolbar-pill-pam">
            <span className="font-mono text-xs font-semibold">{pamChoice}</span>
          </div>

          {/* Guide Length - compact */}
          <div className="ios-toolbar-pill-compact ios-toolbar-pill-guide">
            <span className="font-mono text-xs font-semibold">{guideLength}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="ios-toolbar-pill-compact ios-toolbar-pill-theme ios-toolbar-pill-interactive"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-ios-yellow" />
            ) : (
              <Moon className="w-4 h-4 text-ios-indigo" />
            )}
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="ios-toolbar-pill-compact ios-toolbar-pill-interactive"
            aria-label="Open menu"
          >
            {hamburgerIcon}
          </button>
        </div>
      </div>
    </header>
  );
}
