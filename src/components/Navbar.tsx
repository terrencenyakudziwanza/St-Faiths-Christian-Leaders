import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import arrowDown from "../assets/icons/arrow-down.svg";
import login from "../assets/icons/log-in.svg";
import useStore from "../store";
import type { NavPage, NavSection } from "../types/nav";

type NavTheme = "dark" | "light";

interface NavbarProps {
  navPages: NavPage[];
}

const Navbar: React.FC<NavbarProps> = ({ navPages }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showAuthNotice, setShowAuthNotice] = useState(false);
  const [navTheme, setNavTheme] = useState<NavTheme>("dark");
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobilePageId, setExpandedMobilePageId] = useState<string | null>(
    null,
  );

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
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.slice(1);
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [location.pathname, location.hash]);

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

  const handlePageClick = (page: NavPage) => {
    setHoveredPageId(null);
    setMobileMenuOpen(false);

    if (page.path !== location.pathname) {
      navigate(page.path);
      return;
    }

    if (!page.sections?.length) {
      return;
    }

    const firstSection = page.sections[0];
    setCurrSection(firstSection.id);
    document.getElementById(firstSection.sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSectionClick = (page: NavPage, section: NavSection) => {
    setCurrSection(section.id);
    setHoveredPageId(null);
    setMobileMenuOpen(false);

    if (page.path !== location.pathname) {
      navigate(`${page.path}#${section.sectionId}`);
      return;
    }

    document.getElementById(section.sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const darkTheme = navTheme === "dark";
  const shellThemeClass = darkTheme
    ? isScrolling
      ? "bg-black/15 backdrop-blur-sm"
      : "bg-transparent"
    : "bg-white/80 backdrop-blur-md border-b border-black/10 shadow-[0_6px_24px_rgba(0,0,0,0.08)]";

  const textClass = darkTheme ? "text-white" : "text-[#111]";
  const pageBtnDefaultClass = darkTheme
    ? "text-white hover:bg-[rgba(255,255,255,0.16)]"
    : "text-[#111] hover:bg-[rgba(0,0,0,0.09)]";
  const pageBtnActiveClass = darkTheme
    ? "bg-[rgba(255,255,255,0.22)] text-white"
    : "bg-[#111] text-white";
  const sectionBtnDefaultClass = darkTheme
    ? "text-white/95 hover:bg-[rgba(255,255,255,0.14)]"
    : "text-[#111] hover:bg-[rgba(0,0,0,0.08)]";
  const sectionBtnActiveClass = darkTheme
    ? "bg-[rgba(255,255,255,0.2)] text-white"
    : "bg-[#111] text-white";
  const borderClass = darkTheme ? "border-white" : "border-black/20";
  const menuBarClass = darkTheme ? "bg-white" : "bg-[#111]";
  const dropdownPanelClass = darkTheme
    ? "border-white/20 bg-black/75 backdrop-blur-xl"
    : "border-black/10 bg-white/95 backdrop-blur-xl";
  const mobileSheetClass = darkTheme
    ? "border-l border-white/15 bg-[#0e0e10]/95 text-white"
    : "border-l border-black/10 bg-white text-[#111]";
  const mobileCardClass = darkTheme
    ? "border-white/15 bg-[rgba(255,255,255,0.02)]"
    : "border-black/10 bg-[#f7f7f7]";

  // Keep intro-gated visibility only on home route.
  const shouldShowNavbar = location.pathname !== "/" || introAnimDone;

  return (
    <>
      <div
        ref={navRef}
        className={`flex w-full fixed z-20 ${shouldShowNavbar ? "top-0" : "-top-40"} ${shellThemeClass} transition-all duration-700`}
      >
        <div className="w-full p-2 px-4 md:px-8 flex justify-between items-center gap-4">
          <p className={`${textClass} text-lg md:text-3xl truncate`}>Christian Leaders SU</p>

          <div className="hidden md:flex items-center gap-2 rounded-[15px] p-1">
            {navPages.map((page) => {
              const hasSections = Boolean(page.sections?.length);
              const isPageActive = location.pathname === page.path;
              const isHovered = hoveredPageId === page.id;

              return (
                <div
                  key={page.id}
                  className="relative"
                  onMouseEnter={() => setHoveredPageId(page.id)}
                  onMouseLeave={() => setHoveredPageId(null)}
                >
                  <button
                    type="button"
                    className={`${isPageActive ? pageBtnActiveClass : pageBtnDefaultClass} rounded-[15px] cursor-pointer px-3 py-2 duration-300 flex items-center gap-2`}
                    onClick={() => handlePageClick(page)}
                  >
                    <span>{page.label}</span>
                  </button>

                  {hasSections && (
                    <div
                      className={`absolute left-1/2 top-full -translate-x-1/2 pt-2 transition-all duration-200 ${isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none -translate-y-1"}`}
                    >
                      <div
                        className={`min-w-48 rounded-2xl border p-2 shadow-[0_14px_34px_rgba(0,0,0,0.2)] ${dropdownPanelClass}`}
                      >
                        {page.sections?.map((section) => {
                          const isActiveSection =
                            isPageActive && currSection === section.id;

                          return (
                            <button
                              type="button"
                              key={section.id}
                              className={`${isActiveSection ? sectionBtnActiveClass : sectionBtnDefaultClass} w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200`}
                              onClick={() => handleSectionClick(page, section)}
                            >
                              {section.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className={`hidden md:flex login-btn outline-none h-full p-2.5 px-4 bg-transparent ${textClass} rounded-[15px] items-center gap-2 border-[1.5px] ${borderClass} cursor-pointer`}
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

          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAuthNotice(true)}
              className={`h-10 w-10 rounded-full border ${borderClass} flex items-center justify-center backdrop-blur-sm`}
            >
              <img
                src={login}
                className={darkTheme ? "icon scale-75" : "icon-dk scale-100"}
                alt=""
              />
            </button>

            <button
              type="button"
              className={`h-10 w-10 rounded-full border ${borderClass} flex items-center justify-center backdrop-blur-sm`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <span className="flex flex-col gap-1.5">
                <span className={`h-0.5 w-4 rounded-full ${menuBarClass}`}></span>
                <span className={`h-0.5 w-4 rounded-full ${menuBarClass}`}></span>
              </span>
            </button>
          </div>
        </div>

        <div
          className={`absolute right-4 md:right-8 top-[calc(100%+8px)] rounded-xl border px-3 py-2 text-xs transition-all duration-300 ${
            darkTheme
              ? "border-white/40 bg-black/70 text-white"
              : "border-black/10 bg-white/90 text-[#111]"
          } ${
            showAuthNotice
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0 pointer-events-none"
          }`}
        >
          Auth is coming in a later phase.
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-30 transition-all duration-300 ${
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close navigation menu"
        ></button>

        <aside
          className={`absolute right-0 top-0 h-full w-[86vw] max-w-[370px] ${mobileSheetClass} shadow-[-12px_0_38px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-inherit">
            <p className="text-sm tracking-[0.08em] uppercase opacity-80">Navigate</p>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="h-9 w-9 rounded-full border border-inherit flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <span className="relative h-3.5 w-3.5 block">
                <span className={`absolute left-0 top-1/2 h-0.5 w-full ${menuBarClass} rotate-45`}></span>
                <span className={`absolute left-0 top-1/2 h-0.5 w-full ${menuBarClass} -rotate-45`}></span>
              </span>
            </button>
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {navPages.map((page) => {
              const hasSections = Boolean(page.sections?.length);
              const isPageActive = location.pathname === page.path;
              const expanded = expandedMobilePageId === page.id;

              return (
                <div
                  key={page.id}
                  className={`rounded-2xl border ${mobileCardClass} overflow-hidden`}
                >
                  <div className="flex items-center gap-2 px-2 py-2">
                    <button
                      type="button"
                      className={`${isPageActive ? pageBtnActiveClass : pageBtnDefaultClass} flex-1 rounded-xl px-3 py-2.5 text-left text-base transition-colors duration-200`}
                      onClick={() => handlePageClick(page)}
                    >
                      {page.label}
                    </button>

                    {hasSections && (
                      <button
                        type="button"
                        className={`${pageBtnDefaultClass} h-10 w-10 rounded-xl flex items-center justify-center`}
                        onClick={() =>
                          setExpandedMobilePageId((prev) =>
                            prev === page.id ? null : page.id,
                          )
                        }
                        aria-label={`Toggle ${page.label} sections`}
                      >
                        <img
                          src={arrowDown}
                          alt=""
                          className={`h-2.5 w-2.5 ${darkTheme ? "icon -my-1" : "icon-dk"} transition-transform duration-200 ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSections && (
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ${
                        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden px-3 pb-3 flex flex-col gap-2">
                        {page.sections?.map((section) => {
                          const isActiveSection =
                            isPageActive && currSection === section.id;

                          return (
                            <button
                              type="button"
                              key={section.id}
                              className={`${isActiveSection ? sectionBtnActiveClass : sectionBtnDefaultClass} rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200`}
                              onClick={() => handleSectionClick(page, section)}
                            >
                              {section.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
