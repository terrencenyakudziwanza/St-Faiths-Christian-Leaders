import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/tailwind.css";
import { useEffect } from "react";
import gsap from "gsap";
import { CustomEase, Flip, SplitText } from "gsap/all";
import useStore from "./store";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Family from "./pages/Family";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import ThemeToggle from "./components/ThemeToggle";
import Gallery from "./components/Gallery";
import RequireAuth from "./components/RequireAuth";
import ThemeRibbon from "./components/ThemeRibbon";
import { supabase } from "./lib/supabase";
// import ImmersiveWeek from "./components/ImmersiveWeek";

gsap.registerPlugin(CustomEase, Flip, SplitText);

type HomeSectionName = "Home" | "Focus" | "Week" | "Testimonials";

const sectionIds: Record<HomeSectionName, string> = {
  Home: "home-section",
  Focus: "focus-section",
  Week: "week-section",
  Testimonials: "testimonials-section",
};

type SectionEntry = {
  name: HomeSectionName;
  element: HTMLElement;
};

function App() {
  const setCurrSection = useStore((state) => state.setCurrSection);
  const location = useLocation();
  const hideRibbon =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/dashboard");

  useEffect(() => {
    let active = true;
    void supabase.from("cms_content").select("content").eq("section_key", "site.theme").maybeSingle().then(({ data }) => {
      if (!active || !data) return;
      const accent = (data.content as { accent?: unknown })?.accent;
      if (typeof accent === "string" && /^#[0-9a-f]{6}$/i.test(accent)) {
        document.documentElement.style.setProperty("--accent", accent);
        document.documentElement.style.setProperty("--accent-strong", accent);
        document.documentElement.style.setProperty("--accent-purple", accent);
        document.documentElement.style.setProperty("--accent-purple-soft", `color-mix(in srgb, ${accent} 22%, transparent)`);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const sections = (
      Object.entries(sectionIds) as Array<[HomeSectionName, string]>
    )
      .map(([name, id]) => {
        const element = document.getElementById(id);
        return element ? { name, element } : null;
      })
      .filter((entry): entry is SectionEntry => entry !== null);

    if (!sections.length) {
      return;
    }

    const activationRatio = 0.03;

    const updateCurrSection = () => {
      const activationLine = window.innerHeight * activationRatio;
      let activeSection = sections[0].name;

      sections.forEach(({ name, element }) => {
        const rect = element.getBoundingClientRect();

        if (rect.top <= activationLine) {
          activeSection = name;
        }
      });

      setCurrSection(activeSection);
    };
    updateCurrSection();

    window.addEventListener("scroll", updateCurrSection, { passive: true });
    window.addEventListener("resize", updateCurrSection);

    return () => {
      window.removeEventListener("scroll", updateCurrSection);
      window.removeEventListener("resize", updateCurrSection);
    };
  }, [location.pathname, setCurrSection]);

  return (
    <>
      <ThemeToggle />
      {!hideRibbon && <ThemeRibbon />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* HOME PAGE */}
              <Home />
              {/* <ImmersiveWeek /> */}
              {/* GALLERY PREVIEW */}
              <Gallery />
              {/* TESTIMONIALS */}
              <Testimonials />
              {/* SITE FOOTER */}
              <Footer />
            </>
          }
        />
        <Route
          path="/events"
          element={
            <>
              {/* EVENTS PAGE */}
              <Events />
              {/* SITE FOOTER */}
              <Footer />
            </>
          }
        />
        <Route
          path="/family"
          element={
            <>
              {/* FAMILY PAGE */}
              <Family />
              {/* SITE FOOTER */}
              <Footer />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

export default App;
