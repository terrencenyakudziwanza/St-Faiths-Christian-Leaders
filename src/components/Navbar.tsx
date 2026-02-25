import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import login from "../assets/icons/log-in.svg";
import useStore, { type SectionName } from "../store";

const sectionIds = {
  Home: "home-section",
  About: "about-section",
};

type NavTheme = "dark" | "light";

const Navbar: React.FC = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);
  const [showAuthNotice, setShowAuthNotice] = useState(false);
  const [navTheme, setNavTheme] = useState<NavTheme>("dark");
  const menuItms: SectionName[] = ["Home", "About", "Events"];
  const navigate = useNavigate();
  const location = useLocation();

  const { introAnimDone, currSection, setCurrSection } = useStore();

  useEffect(() => {
    const onScroll = () => setIsScrolling(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!showAuthNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowAuthNotice(false);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showAuthNotice]);

  const resolveNavTheme = useCallback((): NavTheme => {
    if (location.pathname !== "/") {
      return "light";
    }

    const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 68;
    const probeY = Math.max(0, Math.min(window.innerHeight - 1, navBottom + 8));
    const probeX = Math.max(0, Math.min(window.innerWidth - 1, window.innerWidth / 2));
    const probeElement = document.elementFromPoint(probeX, probeY);
    const themedParent = probeElement?.closest<HTMLElement>("[data-nav-theme]");
    const theme = themedParent?.dataset.navTheme;

    return theme === "light" ? "light" : "dark";
  }, [location.pathname]);

  useEffect(() => {
    const updateNavTheme = () => {
      setNavTheme(resolveNavTheme());
    };

    updateNavTheme();
    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme);

    return () => {
      window.removeEventListener("scroll", updateNavTheme);
      window.removeEventListener("resize", updateNavTheme);
    };
  }, [resolveNavTheme]);

  const jumpToSection = (section: SectionName) => {
    setCurrSection(section);

    if (section === "Events") {
      navigate("/events");
      setMenuClicked(false);
      return;
    }

    const sectionId = sectionIds[section];

    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      setMenuClicked(false);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMenuClicked(false);
  };

  const darkTheme = navTheme === "dark";
  const shellThemeClass = darkTheme
    ? isScrolling
      ? "bg-black/15 backdrop-blur-sm"
      : "bg-transparent"
    : "bg-white/80 backdrop-blur-md border-b border-black/10 shadow-[0_6px_24px_rgba(0,0,0,0.08)]";

  const textClass = darkTheme ? "text-white" : "text-[#111]";
  const hoverClass = darkTheme
    ? "bg-transparent text-white hover:bg-[rgba(255,255,255,.3)]"
    : "bg-transparent text-[#111] hover:bg-[rgba(0,0,0,.09)]";
  const borderClass = darkTheme ? "border-white" : "border-black/20";
  const menuBarClass = darkTheme ? "bg-white" : "bg-[#111]";


  // Keep intro-gated visibility only on home route.
  const shouldShowNavbar = location.pathname !== "/" || introAnimDone;

  return (
    <div
      ref={navRef}
      className={`flex flex-col w-full fixed z-20 ${shouldShowNavbar ? "top-0" : "-top-40"} ${shellThemeClass} transition-all duration-700`}
    >
      <div className="w-full p-2 px-8 flex justify-between items-center">
        <p className={`${textClass} text-3xl`}>Logo</p>
        <div className="menu-itm-container flex gap-3 rounded-[15px] p-1 sm:display-none">
          {menuItms.map((m, i) => (
            <div
              key={i}
              className="menu-itm relative flex flex-col items-center p-2"
            >
              <span
                className={`${currSection === m ? "bg-blue-700 text-white active" : hoverClass} rounded-[15px] cursor-pointer p-1.5 duration-500`}
                onClick={() => jumpToSection(m)}
              >
                {m}
                
              </span>
            </div>
          ))}
        </div>
        <button
          className={`login-btn outline-none h-full p-2.5 px-4 bg-transparent ${textClass} rounded-[15px] flex items-center gap-2 border-[1.5px] ${borderClass} cursor-pointer`}
          onClick={() => setShowAuthNotice(true)}
          type="button"
        >
          <img
            src={login}
            className={darkTheme ? "icon" : "icon-dk scale-110"}
            alt=""
          />
          <p>Login</p>
        </button>
        <span
          className="drop-menu h-full gap-2 cursor-pointer"
          onClick={() => {
            setMenuClicked((prev) => !prev);
          }}
        >
          <div
            className={`w-7 h-0.5 ${menuBarClass} ${menuClicked ? "rotate-45 translate-y-2.5 duration-300 transition-transform" : ""}`}
          ></div>
          <div
            className={`w-7 h-0.5 ${menuBarClass} ${menuClicked ? "opacity-0 duration-300" : ""}`}
          ></div>
          <div
            className={`w-7 h-0.5 ${menuBarClass} ${menuClicked ? "-rotate-45 -translate-y-2.5 duration-300" : ""}`}
          ></div>
        </span>
      </div>
      <div
        className={`drop-menu-content w-full px-8 z-10 duration-800 ${menuClicked ? "top-0 opacity-100 pointer-events-auto active" : "-top-[10%] opacity-0 pointer-events-none"} flex flex-col ${darkTheme ? "bg-transparent" : "bg-white/90 backdrop-blur-md border-t border-black/10"}`}
      >
        {menuItms.map((itm, j) => (
          <div
            key={j}
            className={`${currSection === itm ? "font-semibold text-blue-700" : textClass} text-2xl cursor-pointer`}
            onClick={() => jumpToSection(itm)}
          >
            {itm}
          </div>
        ))}
      </div>
      <div
        className={`absolute right-8 top-[calc(100%+8px)] rounded-xl border px-3 py-2 text-xs transition-all duration-300 ${
          darkTheme ? "border-white/40 bg-black/70 text-white" : "border-black/10 bg-white/90 text-[#111]"
        } ${
          showAuthNotice
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        Auth is coming in a later phase.
      </div>
    </div>
  );
};

export default Navbar;
