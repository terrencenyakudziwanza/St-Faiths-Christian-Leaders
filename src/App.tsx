import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/tailwind.css";
import { useEffect } from "react";
import gsap from "gsap";
import { CustomEase, Flip, SplitText } from "gsap/all";
import useStore, { type SectionName } from "./store";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";

gsap.registerPlugin(CustomEase, Flip, SplitText);

type HomeSectionName = Exclude<SectionName, "Events">;

const sectionIds: Record<HomeSectionName, string> = {
  Home: "home-section",
  About: "about-section",
};

type SectionEntry = {
  name: HomeSectionName;
  element: HTMLElement;
};

function App() {
  const setCurrSection = useStore((state) => state.setCurrSection);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const sections = (Object.entries(sectionIds) as Array<
      [HomeSectionName, string]
    >)
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
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Home />
            <About />
          </>
        }
      />
      <Route path="/events" element={<Events />} />
    </Routes>
  );
}

export default App;
