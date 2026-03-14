import React from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem("theme");
    return storedTheme === "light" ? "light" : "dark";
  });

  React.useEffect(() => {
    document.body.dataset.theme = theme;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("themechange"));
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className="theme-toggle__icon">
        {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      </span>
      <span className="theme-toggle__label">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
};

export default ThemeToggle;
