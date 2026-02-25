import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import login from "../assets/icons/log-in.svg";
import useStore, { type SectionName } from "../store";

const sectionIds = {
  Home: "home-section",
  About: "about-section",
};

const Navbar: React.FC = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);
  const [showAuthNotice, setShowAuthNotice] = useState(false);
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

  return (
    <div
      className={`flex flex-col w-full fixed z-20 ${introAnimDone ? "top-0" : "-top-40"} ${isScrolling && currSection === 'Home' ? "backdrop-blur-sm" : ""} transition-all duration-1000`}
    >
      <div className="w-full p-2 px-8 flex justify-between items-center">
        <p className="text-white text-3xl">Logo</p>
        <div className="menu-itm-container flex gap-3 rounded-[15px] p-1 sm:display-none">
          {menuItms.map((m, i) => (
            <div
              key={i}
              className="menu-itm relative flex flex-col items-center p-2"
            >
              <span
                className={`${currSection === m ? "bg-blue-700 text-white active" : "bg-transparent text-white hover:bg-[rgba(255,255,255,.3)]"} rounded-[15px] cursor-pointer p-1.5 duration-500`}
                onClick={() => jumpToSection(m)}
              >
                {m}
                
              </span>
            </div>
          ))}
        </div>
        <button
          className="login-btn outline-none h-full p-2.5 px-4 bg-transparent text-white rounded-[15px] flex items-center gap-2 border-[1.5px] border-white cursor-pointer"
          onClick={() => setShowAuthNotice(true)}
          type="button"
        >
          <img src={login} className="icon" alt="" />
          <p>Login</p>
        </button>
        <span
          className="drop-menu h-full gap-2 cursor-pointer"
          onClick={() => {
            setMenuClicked((prev) => !prev);
          }}
        >
          <div
            className={`w-7 h-0.5 bg-white ${menuClicked ? "rotate-45 translate-y-2.5 duration-300 transition-transform" : ""}`}
          ></div>
          <div
            className={`w-7 h-0.5 bg-white ${menuClicked ? "opacity-0 duration-300" : ""}`}
          ></div>
          <div
            className={`w-7 h-0.5 bg-white ${menuClicked ? "-rotate-45 -translate-y-2.5 duration-300" : ""}`}
          ></div>
        </span>
      </div>
      <div
        className={`drop-menu-content w-full px-8 z-10 duration-800 ${menuClicked ? "top-0 opacity-100 pointer-events-auto active" : "-top-[10%] opacity-0 pointer-events-none"} flex flex-col bg-transparent`}
      >
        {menuItms.map((itm, j) => (
          <div
            key={j}
            className={`${currSection === itm ? "font-semibold" : ""} text-white text-2xl cursor-pointer`}
            onClick={() => jumpToSection(itm)}
          >
            {itm}
          </div>
        ))}
      </div>
      <div
        className={`absolute right-8 top-[calc(100%+8px)] rounded-xl border border-white/40 bg-black/70 px-3 py-2 text-xs text-white transition-all duration-300 ${
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
