import React from "react";
import { BookOpen, X } from "lucide-react";
import { useCmsSection } from "../hooks/useCmsSection";
import { fetchBibleVerse } from "../services/bibleApi";

type RibbonTextState = "active" | "exit" | "hidden";

const ThemeRibbon: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [showTheme, setShowTheme] = React.useState(false);
  const [exiting, setExiting] = React.useState<"verse" | "theme" | null>(null);
  const [resolvedVerse, setResolvedVerse] = React.useState<string | null>(null);

  const weekContent = useCmsSection("home.week");
  const themeTitle = weekContent.themeOfWeek.title || "Theme of the Week";
  const verseReference = weekContent.themeOfWeek.verseReference || "";
  const verseVersion = weekContent.themeOfWeek.verseVersion;
  const verseText = weekContent.themeOfWeek.verseText || "";

  const verseLine = React.useMemo(() => {
    const resolved = resolvedVerse ?? verseText;
    if (verseReference && resolved) {
      const versionLabel = verseVersion ? ` (${verseVersion.toUpperCase()})` : "";
      return `${verseReference}${versionLabel} — ${resolved}`;
    }
    return resolved || verseReference || "Add a theme verse in the dashboard.";
  }, [verseReference, verseText, verseVersion, resolvedVerse]);

  const themeLine = React.useMemo(
    () => `THEME OF THE WEEK: ${themeTitle}`,
    [themeTitle],
  );

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setShowTheme((prev) => {
        setExiting(prev ? "theme" : "verse");
        return !prev;
      });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!exiting) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setExiting(null);
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [exiting]);

  React.useEffect(() => {
    if (!verseReference || verseText) {
      setResolvedVerse(null);
      return;
    }

    let isActive = true;

    fetchBibleVerse(verseReference, verseVersion)
      .then((verse) => {
        if (isActive) {
          setResolvedVerse(verse.text);
        }
      })
      .catch(() => {
        if (isActive) {
          setResolvedVerse(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [verseReference, verseVersion, verseText]);

  if (!isOpen) {
    return null;
  }

  const verseState: RibbonTextState = showTheme
    ? exiting === "verse"
      ? "exit"
      : "hidden"
    : "active";
  const themeState: RibbonTextState = showTheme
    ? "active"
    : exiting === "theme"
      ? "exit"
      : "hidden";

  return (
    <div className="theme-ribbon" role="status" aria-live="polite">
      <div className="theme-ribbon__inner">
        <div className="theme-ribbon__content">
          <StaggeredText
            text={verseLine}
            state={verseState}
            icon={<BookOpen className="h-4 w-4" />}
          />
          <StaggeredText text={themeLine} state={themeState} variant="theme" />
        </div>
        <button
          type="button"
          className="theme-ribbon__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close ribbon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const StaggeredText: React.FC<{
  text: string;
  state: RibbonTextState;
  icon?: React.ReactNode;
  variant?: "theme" | "verse";
}> = ({ text, state, icon, variant = "verse" }) => {
  const words = React.useMemo(() => text.split(" "), [text]);

  return (
    <div
      className={`theme-ribbon__text ${
        variant === "theme" ? "theme-ribbon__text--theme" : ""
      }`}
      data-state={state}
    >
      {icon && <span className="theme-ribbon__icon">{icon}</span>}
      <span className="theme-ribbon__words">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="theme-ribbon__word"
            style={{ transitionDelay: `${index * 45}ms` }}
          >
            {word}
          </span>
        ))}
      </span>
    </div>
  );
};

export default ThemeRibbon;
