import React from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  React.useEffect(() => {
    document.body.dataset.theme = theme;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("themechange"));
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="fixed bottom-4 left-4 z-[120] flex h-10 w-10 items-center justify-center rounded-full border border-strong bg-surface-elevated text-ink shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span className="sr-only">Switch theme</span>
    </button>
  );
};

export default ThemeToggle;
