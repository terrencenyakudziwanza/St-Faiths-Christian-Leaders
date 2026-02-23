import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/tailwind.css";
import { useEffect } from "react";
import Home from "./components/Home";
import gsap from "gsap";
import { CustomEase, Flip, SplitText } from "gsap/all";
import About from "./components/About";
import useStore, { type SectionName } from "./store";

gsap.registerPlugin(CustomEase, Flip, SplitText);

const sectionIds: Record<SectionName, string> = {
  Home: "home-section",
  About: "about-section",
};

type SectionEntry = {
  name: SectionName;
  element: HTMLElement;
};

function App() {
  const setCurrSection = useStore((state) => state.setCurrSection);

  useEffect(() => {
    const sections = (Object.entries(sectionIds) as Array<[SectionName, string]>)
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
  }, [setCurrSection]);

  return (
    <>
      <Home />
      <About />
    </>
  );
}

export default App;
