import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/tailwind.css";
import { lazy, Suspense, useEffect, useState } from "react";
import gsap from "gsap";
import { CustomEase, Flip, SplitText } from "gsap/all";
import useStore from "./store";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import ThemeToggle from "./components/ThemeToggle";
import Gallery from "./components/Gallery";
import RequireAuth from "./components/RequireAuth";
import ThemeRibbon from "./components/ThemeRibbon";
import { supabase } from "./lib/supabase";
import SeoManager from "./components/SeoManager";
import GamePreloader from "./components/GamePreloader";
import { resolveMediaUrl } from "./lib/media";
// import ImmersiveWeek from "./components/ImmersiveWeek";

const Events = lazy(() => import("./pages/Events"));
const Family = lazy(() => import("./pages/Family"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

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
  const [initialMediaLoading, setInitialMediaLoading] = useState(true);
  const setCurrSection = useStore((state) => state.setCurrSection);
  const location = useLocation();
  const hideRibbon =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/dashboard");

  useEffect(() => {
    let active = true;
    void supabase.from("cms_content").select("content").eq("section_key", "site.theme").maybeSingle().then(({ data }) => {
      if (!active || !data) return;
      const theme = data.content as { accent?: unknown; secondaryAccent?: unknown };
      const accent = theme?.accent;
      const secondaryAccent = theme?.secondaryAccent;
      if (typeof accent === "string" && /^#[0-9a-f]{6}$/i.test(accent)) {
        document.documentElement.style.setProperty("--accent", accent);
        document.documentElement.style.setProperty("--accent-strong", accent);
        document.documentElement.style.setProperty("--accent-soft", `color-mix(in srgb, ${accent} 18%, transparent)`);
        document.documentElement.style.setProperty("--accent-soft-faint", `color-mix(in srgb, ${accent} 10%, transparent)`);
        document.documentElement.style.setProperty("--accent-soft-subtle", `color-mix(in srgb, ${accent} 6%, transparent)`);
      }
      if (typeof secondaryAccent === "string" && /^#[0-9a-f]{6}$/i.test(secondaryAccent)) {
        document.documentElement.style.setProperty("--accent-purple", secondaryAccent);
        document.documentElement.style.setProperty("--accent-purple-soft", `color-mix(in srgb, ${secondaryAccent} 22%, transparent)`);
        document.documentElement.style.setProperty("--accent-purple-glow", `color-mix(in srgb, ${secondaryAccent} 58%, transparent)`);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadInitialMedia = async () => {
      try {
        const results = await Promise.allSettled([
          supabase.from("cms_content").select("content").eq("is_published", true),
          supabase.from("event_media").select("storage_path, media_type"),
          supabase.from("board_members").select("image_path"),
          supabase.from("testimonials").select("avatar_path"),
          supabase.from("shorts").select("thumbnail_path").eq("is_published", true),
        ]);
        const paths = new Set<string>();
        const visit = (value: unknown) => {
          if (!value || typeof value !== "object") return;
          if (Array.isArray(value)) { value.forEach(visit); return; }
          const record = value as Record<string, unknown>;
          if (typeof record.storagePath === "string") paths.add(record.storagePath);
          Object.values(record).forEach(visit);
        };
        const cmsRows = results[0].status === "fulfilled" ? results[0].value.data ?? [] : [];
        cmsRows.forEach((row) => visit(row.content));
        for (const result of results.slice(1)) {
          if (result.status !== "fulfilled") continue;
          for (const row of result.value.data ?? []) {
            for (const value of Object.values(row)) if (typeof value === "string") paths.add(value);
          }
        }
        const urls = Array.from(paths, resolveMediaUrl).filter((url): url is string => Boolean(url));
        await Promise.all(urls.map((url) => new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
          if (image.complete) resolve();
        })));
      } catch {
        // A backend failure should release the page to its empty state.
      } finally {
        if (active) setInitialMediaLoading(false);
      }
    };
    void loadInitialMedia();
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
      <SeoManager />
      {initialMediaLoading && <GamePreloader />}
      <ThemeToggle />
      {!hideRibbon && <ThemeRibbon />}
      <Suspense fallback={<div className="min-h-screen bg-page" aria-busy="true" aria-label="Loading page" />}>
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
      </Suspense>
    </>
  );
}

export default App;
