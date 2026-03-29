import React, { useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import { CustomEase, SplitText } from "gsap/all";
import useStore from "../store";
import { ChevronDown } from "lucide-react";
import type { NavPage } from "../types/nav";
import IntercessionSection from "../components/IntercessionSection";
import WeekInLeaders from "../components/WeekInLeaders";
import { useCmsSection } from "../hooks/useCmsSection";
import { resolveCmsMedia } from "../lib/cms";

const homeNavPages: NavPage[] = [
  {
    id: "home-page",
    label: "Home",
    path: "/",
    sections: [
      { id: "Home", label: "Home", sectionId: "home-section" },
      { id: "Focus", label: "Focus", sectionId: "focus-section" },
      { id: "Week", label: "Week", sectionId: "week-section" },
      {
        id: "Testimonials",
        label: "Testimonials",
        sectionId: "testimonials-section",
      },
    ],
  },
  { id: "events-page", label: "Events", path: "/events" },
  { id: "family-page", label: "Family", path: "/family" },
];

const Home: React.FC = () => {
  const homeRef = useRef<HTMLDivElement>(null);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);

  const { introAnimDone, setIntroAnimDone } = useStore();

  const heroContent = useCmsSection("home.hero");
  const heroSlides = useMemo(
    () =>
      heroContent.slides.map((slide) => ({
        ...slide,
        imageUrl: resolveCmsMedia(slide.image) ?? "",
      })),
    [heroContent.slides],
  );
  const introSlides = heroSlides.slice(0, -1);
  const fixedBgImage = heroSlides[heroSlides.length - 1]?.imageUrl;
  const heroKey = useMemo(
    () =>
      `${heroContent.heroHeader.join("|")}::${heroContent.heroSecondary.join("|")}::${heroSlides
        .map((slide) => slide.label)
        .join("|")}`,
    [heroContent.heroHeader, heroContent.heroSecondary, heroSlides],
  );

  const heroGradientStyle = introAnimDone
    ? {
        backgroundImage:
          "linear-gradient(110deg, var(--accent), var(--accent-purple))",
      }
    : undefined;


  useGSAP(() => {
    if (!homeRef.current) {
      return;
    }

    const slides = homeRef.current.querySelectorAll(".introImg");
    const heroContent = homeRef.current.querySelector(".hero-content");

    if (!heroContent) {
      return;
    }

    const rollSplits: SplitText[] = [];

    // Prepare for text character-roll animation.
    Array.from(slides).forEach((slide) => {
      const revealText = slide.querySelector(".reveal-text");

      if (!revealText) {
        return;
      }

      const rollSplit = SplitText.create(revealText, {
        type: "chars",
        charsClass: "reveal-text-split",
      });
      rollSplits.push(rollSplit);

      const topHalf: Element[] = [];
      const bottomHalf: Element[] = [];

      rollSplit.chars.forEach((ch, i) => {
        if (i % 2 === 0) {
          topHalf.push(ch);
        } else {
          bottomHalf.push(ch);
        }
      });

      gsap.set(topHalf, { yPercent: -120 });
      gsap.set(bottomHalf, { yPercent: 100 });
    });

    // Setting up timeline.
    const tl = gsap.timeline();
    introTlRef.current = tl;

    tl.set(heroContent, { opacity: 0 });

    if (!slides.length) {
      tl.to(heroContent, {
        opacity: 1,
        duration: 0.8,
        onComplete: () => setIntroAnimDone(true),
      });
      return () => {
        rollSplits.forEach((split) => split.revert());
        introTlRef.current = null;
      };
    }

    // First scale down the first.
    tl.to(slides[0], {
      scale: 1,
      duration: 1,
      ease: "power4.inOut",
    });

    // For all others scale down and fade in.
    const rollSettleGap = 0.3;
    slides.forEach((introImg, index) => {
      tl.to(
        introImg,
        { opacity: 1, duration: 1.75, ease: "power3.out" },
        index === 0 ? ">-0.5" : `>+${rollSettleGap}`,
      );
      tl.to(introImg.querySelector("img"), { scale: 1, duration: 1.75 }, "<");
      tl.to(
        introImg.querySelectorAll(".reveal-text-split"),
        { yPercent: 0, duration: 0.75 },
        ">-0.1",
      );
    });

    CustomEase.create(
      "hop",
      "M0,0 C0.355,0.022 0.448,0.079 0.5,0.5 0.542,0.846 0.615,1 1,1",
    );
    tl.to(heroContent, { opacity: 1, duration: 1 }, ">+0.1");

    // Setting up for the final text join.
    const headingSplits = Array.from(
      homeRef.current.querySelectorAll(".text-split-heading"),
    ).map((node) => SplitText.create(node, { type: "chars" }));
    const secondarySplits = Array.from(
      homeRef.current.querySelectorAll(".text-split-secondary"),
    ).map((node) => SplitText.create(node, { type: "chars" }));
    const allTextSplits = [...headingSplits, ...secondarySplits];
    let headingSplitsReverted = false;

    const revertHeadingSplits = () => {
      if (headingSplitsReverted) {
        return;
      }

      headingSplits.forEach((split) => split.revert());
      headingSplitsReverted = true;
    };

    allTextSplits.forEach((split) => {
      const chars = split.chars as HTMLElement[];

      const midpoint = Math.ceil(chars.length / 2);
      const leftHalf = chars.slice(0, midpoint);
      const rightHalf = chars.slice(midpoint);

      gsap.set(leftHalf, { x: -120, opacity: 0 });
      gsap.set(rightHalf, { x: 120, opacity: 0 });
    });

    // Effecting.
    const headingChars = headingSplits.flatMap(
      (split) => split.chars as HTMLElement[],
    );
    const secondaryChars = secondarySplits.flatMap(
      (split) => split.chars as HTMLElement[],
    );
    let introImagesFaded = false;

    const fadeOutIntroImages = () => {
      if (introImagesFaded) {
        return;
      }

      const introImageElements = homeRef.current?.querySelectorAll(".introImg");

      if (!introImageElements?.length) {
        return;
      }

      introImagesFaded = true;
      gsap.to(introImageElements, {
        opacity: 0,
        pointerEvents: "none",
        duration: 1.25,
      });
    };

    tl.add("hero-text-join", ">-0.1");
    tl.call(fadeOutIntroImages, [], "hero-text-join+=0.35");

    if (headingChars.length) {
      tl.to(
        headingChars,
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "hop",
          stagger: 0.02,
          onComplete: () => {
            revertHeadingSplits();
            setIntroAnimDone(true);
          },
        },
        "hero-text-join",
      );
    }

    if (secondaryChars.length) {
      tl.to(
        secondaryChars,
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "hop",
          stagger: 0.02,
          onComplete: () => {
            if (!headingChars.length) {
              setIntroAnimDone(true);
            }
          },
        },
        "hero-text-join",
      );
    }

    if (!headingChars.length && !secondaryChars.length) {
      tl.call(() => setIntroAnimDone(true), [], "hero-text-join");
    }

    return () => {
      rollSplits.forEach((split) => split.revert());
      revertHeadingSplits();
      secondarySplits.forEach((split) => split.revert());
      introTlRef.current = null;
    };
  }, [heroKey]);

  const handleSkipIntro = () => {
    if (!introAnimDone) {
      introTlRef.current?.progress(1);
      setIntroAnimDone(true);
    }
  };

  return (
    <>
      <section
        id="home-section"
        data-nav-theme="dark"
        className="h-screen w-full relative flex justify-center items-center overflow-hidden bg-cover bg-center bg-fixed"
        style={
          fixedBgImage
            ? {
                backgroundImage: `url(${fixedBgImage})`,
              }
            : undefined
        }
        ref={homeRef}
      >
        {/* MAIN NAVIGATION */}
        <Navbar navPages={homeNavPages} />
        <div className="section-fade-top"></div>
        <div className="section-fade-bottom"></div>

        {/* INTRO SKIP BUTTON */}
        <button
          type="button"
          onClick={handleSkipIntro}
          className={`absolute left-6 top-6 z-30 flex items-center gap-2 rounded-full border-white border-[1.5px] p-2 text-body-sm text-inverse transition-all ease-out duration-300 outline-0 cursor-pointer ${
            introAnimDone
              ? "-translate-x-[180%] opacity-0 pointer-events-none duration-1000"
              : "translate-x-0 opacity-100 duration-300"
          }`}
        >
          <ChevronDown className="h-3 w-3 -rotate-90 text-inverse" />
          <span>Skip</span>
        </button>

        {/* INTRO SLIDES STACK */}
        {introSlides.map((img, i) => (
          <div
            key={i}
            className={`introImg absolute inset-0 z-0 flex items-center justify-center ${i === 0 ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={img.imageUrl}
              className="absolute inset-0 h-full w-full object-cover z-0 scale-150"
              alt="reveal-image"
            />
            <div className="h-full w-full flex items-center justify-center relative z-0 bg-[rgba(0,0,0,.3)]">
              <h1 className="reveal-text relative z-0 p-2 text-display text-inverse overflow-hidden">
                {img.label}
              </h1>
            </div>
          </div>
        ))}

        {/* HERO COPY + OVERLAY */}
        <div className="hero-content absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 bg-[rgba(0,0,0,.6)] relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,var(--accent-soft),transparent_35%),radial-gradient(circle_at_78%_30%,var(--accent-purple-soft),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.7),rgba(0,0,0,0.6))]"></div>
          {heroContent.heroHeader.map((h, i) => (
            <div
              key={i}
              className={`text-split text-split-heading font-bold text-[clamp(2.1rem,5.4vw,4.1rem)] leading-[0.95] relative ${
                introAnimDone
                  ? "text-transparent bg-clip-text"
                  : "text-inverse"
              }`}
              style={heroGradientStyle}
            >
              {h}
            </div>
          ))}
          {heroContent.heroSecondary.map((s, i) => (
            <div
              key={i}
              className="text-split text-split-secondary text-inverse text-body-lg"
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      <IntercessionSection />
      <WeekInLeaders />
    </>
  );
};

export default Home;
