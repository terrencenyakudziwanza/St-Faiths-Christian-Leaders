import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ChevronDown, LogIn, LogOut } from "lucide-react";
import useStore from "../store";
import type { NavPage, NavSection } from "../types/nav";
import { useAuth } from "../contexts/AuthContext";

type NavTheme = "dark" | "light";

interface NavbarProps {
  navPages: NavPage[];
}

const Navbar: React.FC<NavbarProps> = ({ navPages }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [navTheme, setNavTheme] = useState<NavTheme>("dark");
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobilePageId, setExpandedMobilePageId] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();
  const location = useLocation();

  const { introAnimDone, currSection, setCurrSection } = useStore();
  const { cmsUser, session, signOut } = useAuth();
  const isAuthenticated = Boolean(session && cmsUser?.is_active);

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

  const resolveNavTheme = useCallback((): NavTheme => {
    const globalTheme = document.documentElement.dataset.theme;

    if (globalTheme === "dark") {
      return "dark";
    }

    if (location.pathname !== "/") {
      return "light";
    }

    const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 68;
    const probeY = Math.max(0, Math.min(window.innerHeight - 1, navBottom + 8));
    const probeX = Math.max(
      0,
      Math.min(window.innerWidth - 1, window.innerWidth / 2),
    );
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
    window.addEventListener("themechange", updateNavTheme);

    return () => {
      window.removeEventListener("scroll", updateNavTheme);
      window.removeEventListener("resize", updateNavTheme);
      window.removeEventListener("themechange", updateNavTheme);
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
      ? "bg-black/20 backdrop-blur-sm"
      : "bg-transparent"
    : "bg-surface-elevated backdrop-blur-md border-b border-subtle shadow-[0_6px_24px_rgba(0,0,0,0.08)]";

  const textClass = darkTheme ? "text-inverse" : "text-ink";
  const pageBtnDefaultClass = darkTheme
    ? "text-inverse hover:bg-white/15"
    : "text-ink hover:bg-black/10";
  const pageBtnActiveClass = darkTheme
    ? "bg-white/20 text-inverse"
    : "bg-contrast text-inverse";
  const sectionBtnDefaultClass = darkTheme
    ? "text-inverse opacity-90 hover:bg-white/10"
    : "text-ink hover:bg-black/5";
  const sectionBtnActiveClass = darkTheme
    ? "bg-white/18 text-inverse"
    : "bg-contrast text-inverse";
  const borderClass = "border-strong";
  const menuBarClass = darkTheme ? "bg-inverse" : "bg-contrast";
  const dropdownPanelClass =
    "border border-strong bg-surface-elevated backdrop-blur-xl";
  const mobileSheetClass = darkTheme
    ? "border-l border-strong bg-surface-elevated text-inverse"
    : "border-l border-subtle bg-surface text-ink";
  const mobileCardClass = "border-subtle bg-surface-muted";

  // Keep intro-gated visibility only on home route.
  const shouldShowNavbar = location.pathname !== "/" || introAnimDone;

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <>
      {/* DESKTOP / TOP NAV BAR */}
      <div
        ref={navRef}
        className={`fixed z-[90] flex w-full ${shouldShowNavbar ? "top-0" : "-top-40"} ${shellThemeClass} transition-all duration-700`}
      >
        <div className="w-full p-2 px-4 md:px-8 flex justify-between items-center gap-4">
          <p className={`${textClass} text-heading-fluid truncate`}>
            Christian Leaders
          </p>

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
                    className={`${isPageActive ? pageBtnActiveClass : pageBtnDefaultClass} rounded-[15px] cursor-pointer px-3 py-2 duration-300 flex items-center gap-2 text-body-sm`}
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
                              className={`${isActiveSection ? sectionBtnActiveClass : sectionBtnDefaultClass} w-full rounded-xl px-3 py-2 text-left text-body-sm transition-colors duration-200`}
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

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  className={`outline-none h-full p-2.5 px-4 bg-transparent ${textClass} rounded-[15px] items-center gap-2 border-[1.5px] ${borderClass} cursor-pointer text-body-sm flex`}
                  onClick={handleDashboard}
                  type="button"
                >
                  <span>Dashboard</span>
                </button>
                <button
                  className={`outline-none h-full p-2.5 px-4 bg-transparent ${textClass} rounded-[15px] items-center gap-2 border-[1.5px] ${borderClass} cursor-pointer text-body-sm flex`}
                  onClick={handleSignOut}
                  type="button"
                >
                  <LogOut
                    className={`h-4 w-4 ${darkTheme ? "text-inverse" : "text-ink"}`}
                  />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                className={`login-btn outline-none h-full p-2.5 px-4 bg-transparent ${textClass} rounded-[15px] items-center gap-2 border-[1.5px] ${borderClass} cursor-pointer text-body-sm flex`}
                onClick={handleLogin}
                type="button"
              >
                <LogIn
                  className={`h-4 w-4 ${darkTheme ? "text-inverse" : "text-ink"}`}
                />
                <p>Login</p>
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleDashboard}
                className={`h-10 w-10 rounded-full ${borderClass} flex items-center justify-center cursor-pointer hover:bg-surface-muted duration-300`}
                aria-label="Open dashboard"
              >
                <LogIn
                  className={`h-4 w-4 ${darkTheme ? "text-inverse" : "text-ink"}`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className={`h-10 w-10 rounded-full ${borderClass} flex items-center justify-center cursor-pointer hover:bg-surface-muted duration-300`}
                aria-label="Login"
              >
                <LogIn
                  className={`h-4 w-4 ${darkTheme ? "text-inverse" : "text-ink"}`}
                />
              </button>
            )}

            <button
              type="button"
              className={`h-10 w-10 rounded-full ${borderClass} flex items-center justify-center cursor-pointer hover:bg-surface-muted duration-300`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <span className="flex flex-col gap-1.5">
                <span
                  className={`h-0.5 w-4 rounded-full ${menuBarClass}`}
                ></span>
                <span
                  className={`h-0.5 w-4 rounded-full ${menuBarClass}`}
                ></span>
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
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
            <p className="text-caption tracking-[0.08em] uppercase opacity-80">
              Navigate
            </p>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="h-9 w-9 rounded-full hover:bg-surface-muted duration-300 border-inherit flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <span className="relative h-3.5 w-3.5 block">
                <span
                  className={`absolute left-0 top-1/2 h-0.5 w-full ${menuBarClass} rotate-45`}
                ></span>
                <span
                  className={`absolute left-0 top-1/2 h-0.5 w-full ${menuBarClass} -rotate-45`}
                ></span>
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
                      className={`${isPageActive ? pageBtnActiveClass : pageBtnDefaultClass} flex-1 rounded-xl px-3 py-2.5 text-left text-body transition-colors duration-200`}
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
                        <ChevronDown
                          className={`h-4 w-4 ${darkTheme ? "text-inverse" : "text-ink"} transition-transform duration-200 ${
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
                              className={`${isActiveSection ? sectionBtnActiveClass : sectionBtnDefaultClass} rounded-xl px-3 py-2 text-left text-body-sm transition-colors duration-200`}
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
