import React, { useEffect, useState } from "react";

import login from "../assets/icons/log-in.svg";
import useStore, { type SectionName } from "../store";

const sectionIds: Record<SectionName, string> = {
  Home: "home-section",
  About: "about-section",
};

const Navbar: React.FC = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);
  const menuItms: SectionName[] = ["Home", "About"];

  const { introAnimDone, currSection, setCurrSection } = useStore();

  useEffect(() => {
    const onScroll = () => setIsScrolling(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jumpToSection = (section: SectionName) => {
    setCurrSection(section);
    document
      .getElementById(sectionIds[section])
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                className={`${currSection === m ? "bg-yellow-700 text-white active" : "bg-transparent text-yellow-700 hover:bg-[rgba(255,255,255,.3)]"} rounded-[15px] cursor-pointer p-1.5 duration-500`}
                onClick={() => jumpToSection(m)}
              >
                {m}
              </span>
            </div>
          ))}
        </div>
        <button className="login-btn outline-none h-full p-2.5 px-4 bg-transparent text-white rounded-[15px] flex items-center gap-2 border-[1.5px] border-white cursor-pointer">
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
    </div>
  );
};

export default Navbar;
