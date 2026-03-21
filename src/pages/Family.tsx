import React from "react";

import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import { ChevronDown } from "lucide-react";
import fallbackProfile from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";
import useStore from "../store";
import type { NavPage } from "../types/nav";
import { boardMembers, type BoardMember } from "../data/boardMembers";

type OrbitLayout = {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  cardWidthClassName: string;
  portraitWidth: string;
  portraitHeight: string;
  detailsWidth: string;
  detailsRight: string;
  detailsBottom: string;
};

type MobileSlot = {
  offset: number;
  left: string;
  top: string;
  scale: number;
  opacity: number;
  interactive: boolean;
  zIndex: number;
};

const familyNavPages: NavPage[] = [
  { id: "home-page", label: "Home", path: "/" },
  { id: "events-page", label: "Events", path: "/events" },
  {
    id: "family-page",
    label: "Family",
    path: "/family",
    sections: [{ id: "Board", label: "Board", sectionId: "family-board-section" }],
  },
];


const mobileSlots: MobileSlot[] = [
  {
    offset: -2,
    left: "6%",
    top: "72%",
    scale: 0.9,
    opacity: 0.05,
    interactive: false,
    zIndex: 8,
  },
  {
    offset: -1,
    left: "28%",
    top: "72%",
    scale: 0.96,
    opacity: 0.7,
    interactive: true,
    zIndex: 14,
  },
  {
    offset: 0,
    left: "50%",
    top: "72%",
    scale: 1.12,
    opacity: 1,
    interactive: true,
    zIndex: 24,
  },
  {
    offset: 1,
    left: "72%",
    top: "72%",
    scale: 0.96,
    opacity: 0.7,
    interactive: true,
    zIndex: 14,
  },
  {
    offset: 2,
    left: "94%",
    top: "72%",
    scale: 0.9,
    opacity: 0.05,
    interactive: false,
    zIndex: 8,
  },
];

function getWrappedOffset(index: number, activeIndex: number, length: number): number {
  let offset = index - activeIndex;

  if (offset > length / 2) {
    offset -= length;
  }

  if (offset < -length / 2) {
    offset += length;
  }

  return offset;
}

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function wrapAngle(angle: number): number {
  let normalized = angle;

  while (normalized <= -Math.PI) {
    normalized += Math.PI * 2;
  }

  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }

  return normalized;
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function getReadableCardTarget(viewportWidth: number): number {
  if (viewportWidth < 1200) {
    return 6;
  }

  return 7;
}

function getVisibilityFactor(absAngle: number, readableHalfAngle: number): number {
  if (readableHalfAngle >= Math.PI - 0.001) {
    return 1;
  }

  const fullyReadableHalfAngle = readableHalfAngle * 0.72;

  if (absAngle <= fullyReadableHalfAngle) {
    return 1;
  }

  if (absAngle >= readableHalfAngle) {
    return 0.03;
  }

  const fadeProgress =
    1 - (absAngle - fullyReadableHalfAngle) /
      (readableHalfAngle - fullyReadableHalfAngle);

  return 0.03 + smoothstep(fadeProgress) * 0.97;
}

function getOrbitLayout(viewportWidth: number): OrbitLayout {
  if (viewportWidth < 1200) {
    return {
      centerX: 47,
      centerY: 54,
      radiusX: 28,
      radiusY: 42,
      cardWidthClassName: "w-[166px]",
      portraitWidth: "clamp(260px,30vw,360px)",
      portraitHeight: "clamp(320px,42vw,440px)",
      detailsWidth: "min(220px,58vw)",
      detailsRight: "6%",
      detailsBottom: "1.4rem",
    };
  }

  return {
    centerX: 45,
    centerY: 52,
    radiusX: 30,
    radiusY: 40,
    cardWidthClassName: "w-[196px]",
    portraitWidth: "clamp(200px,24vw,320px)",
    portraitHeight: "clamp(320px,44vw,520px)",
    detailsWidth: "min(220px,58vw)",
    detailsRight: "8%",
    detailsBottom: "1.5rem",
  };
}

const PORTRAIT_TRANSITION_MS = 900;

const Family: React.FC = () => {
  const setCurrSection = useStore((state) => state.setCurrSection);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAuto, setIsAuto] = React.useState(true);
  const [previousPortraitMember, setPreviousPortraitMember] =
    React.useState<BoardMember | null>(null);
  const [viewportWidth, setViewportWidth] = React.useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );

  const activeMember = boardMembers[activeIndex] ?? boardMembers[0];
  const activeMemberRef = React.useRef<BoardMember>(activeMember);
  const isMobile = viewportWidth < 768;
  const orbitLayout = React.useMemo(
    () => getOrbitLayout(viewportWidth),
    [viewportWidth],
  );

  React.useEffect(() => {
    setCurrSection("Board");
  }, [setCurrSection]);

  React.useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  React.useEffect(() => {
    if (!isAuto) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % boardMembers.length);
    }, 3800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuto]);

  React.useEffect(() => {
    if (activeMemberRef.current.id === activeMember.id) {
      return;
    }

    setPreviousPortraitMember(activeMemberRef.current);
    activeMemberRef.current = activeMember;

    const timeoutId = window.setTimeout(() => {
      setPreviousPortraitMember(null);
    }, PORTRAIT_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeMember]);

  const outerRingStyle = React.useMemo(
    () => ({
      left: `${orbitLayout.centerX - (orbitLayout.radiusX + 9)}%`,
      top: `${orbitLayout.centerY - (orbitLayout.radiusY + 7)}%`,
      width: `${(orbitLayout.radiusX + 9) * 2}%`,
      height: `${(orbitLayout.radiusY + 7) * 2}%`,
    }),
    [orbitLayout],
  );

  const innerRingStyle = React.useMemo(
    () => ({
      left: `${orbitLayout.centerX - (orbitLayout.radiusX + 2)}%`,
      top: `${orbitLayout.centerY - (orbitLayout.radiusY + 2)}%`,
      width: `${(orbitLayout.radiusX + 2) * 2}%`,
      height: `${(orbitLayout.radiusY + 2) * 2}%`,
    }),
    [orbitLayout],
  );

  const orbitPortraitStyle = React.useMemo(
    () => ({
      left: `${orbitLayout.centerX}%`,
      top: `${orbitLayout.centerY}%`,
      width: orbitLayout.portraitWidth,
      height: orbitLayout.portraitHeight,
    }),
    [orbitLayout],
  );

  const orbitDetailsStyle = React.useMemo(
    () => ({
      width: orbitLayout.detailsWidth,
      right: orbitLayout.detailsRight,
      bottom: orbitLayout.detailsBottom,
    }),
    [orbitLayout],
  );

  const orbitMembers = React.useMemo(() => {
    const readableCardTarget = Math.min(
      getReadableCardTarget(viewportWidth),
      boardMembers.length,
    );
    const readableHalfAngle = Math.min(
      Math.PI,
      (Math.PI * readableCardTarget) / boardMembers.length,
    );

    return boardMembers.map((member, index) => {
      const offset = getWrappedOffset(index, activeIndex, boardMembers.length);
      const angle = (offset / boardMembers.length) * Math.PI * 2;
      const wrappedAngle = wrapAngle(angle);
      const depth = (Math.cos(wrappedAngle) + 1) / 2;
      const visibilityFactor = getVisibilityFactor(
        Math.abs(wrappedAngle),
        readableHalfAngle,
      );
      const baseScale = 0.76 + depth * 0.24;
      const baseOpacity = 0.3 + depth * 0.7;

      return {
        member,
        index,
        isActive: index === activeIndex,
        left: orbitLayout.centerX + Math.cos(wrappedAngle) * orbitLayout.radiusX,
        top: orbitLayout.centerY + Math.sin(wrappedAngle) * orbitLayout.radiusY,
        scale: baseScale * (0.84 + visibilityFactor * 0.16),
        opacity: baseOpacity * visibilityFactor,
        visibilityFactor,
        zIndex: Math.round(20 + depth * 50),
      };
    });
  }, [activeIndex, orbitLayout, viewportWidth]);

  const mobileCards = React.useMemo(
    () =>
      mobileSlots.map((slot) => {
        const memberIndex = wrapIndex(activeIndex + slot.offset, boardMembers.length);

        return {
          ...slot,
          member: boardMembers[memberIndex],
          memberIndex,
          isActive: slot.offset === 0,
        };
      }),
    [activeIndex],
  );

  const rotateBoard = (direction: "up" | "down") => {
    setActiveIndex((prev) => {
      if (direction === "up") {
        return (prev - 1 + boardMembers.length) % boardMembers.length;
      }

      return (prev + 1) % boardMembers.length;
    });
  };

  const renderActiveCardContent = (memberName: string) => (
    <div className="flex min-h-[66px] flex-col items-center justify-center px-3 py-2 text-caption font-semibold text-accent">
      <span className="text-center text-caption font-semibold leading-tight text-ink">
        {memberName}
      </span>
      <span className="mt-1 text-micro font-semibold uppercase tracking-[0.3em] text-accent">
        Active
      </span>
    </div>
  );

  const renderBoardCard = (
    member: BoardMember,
    isActive: boolean,
    compact: boolean,
  ) => {
    if (compact) {
      return (
        <div
          className={`relative h-[92px] w-[92px] overflow-hidden rounded-full shadow-[0_10px_24px_rgba(31,23,13,0.12)] ${
            isActive ? "ring-2 ring-[#c3a260]" : ""
          }`}
        >
          <img
            src={member.imageSrc ?? fallbackProfile}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    if (member.executive) {
      return (
        <div className="family-executive-card rounded-[22px]">
          <div className="family-executive-card__stick"></div>
          <div className="family-executive-card__content">
            {isActive ? (
              renderActiveCardContent(member.name)
            ) : (
              <ProfileCard
                imageSrc={member.imageSrc}
                imageAlt={member.name}
                name={member.name}
                details={member.position}
                meta={member.boardTier}
                className="gap-2.5 px-3.5 py-2.5"
                avatarClassName="h-10 w-10 ring-0 sm:h-11 sm:w-11"
                contentClassName="min-w-[92px] sm:min-w-0"
                nameClassName="text-body-sm font-semibold leading-[1.15]"
                detailsClassName="mt-0.5 text-micro leading-[1.35]"
                metaClassName="mt-1 text-pico uppercase tracking-[0.14em] text-faint"
              />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[22px] border border-subtle bg-surface-elevated shadow-[0_12px_24px_rgba(35,24,12,0.08)] backdrop-blur-sm">
        {isActive ? (
          renderActiveCardContent(member.name)
        ) : (
          <ProfileCard
            imageSrc={member.imageSrc}
            imageAlt={member.name}
            name={member.name}
            details={member.position}
            meta={member.boardTier}
            className="gap-2.5 px-3.5 py-2.5"
            avatarClassName="h-10 w-10 ring-0 sm:h-11 sm:w-11"
            contentClassName="min-w-[92px] sm:min-w-0"
            nameClassName="text-body-sm font-semibold leading-[1.15]"
            detailsClassName="mt-0.5 text-micro leading-[1.35]"
            metaClassName="mt-1 text-pico uppercase tracking-[0.14em] text-faint"
          />
        )}
      </div>
    );
  };

  const renderPortrait = (
    portraitStyle: React.CSSProperties,
    detailsStyle: React.CSSProperties,
    animatedDetails: boolean,
  ) => (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={portraitStyle}
    >
      <div
        className={`absolute z-20 rounded-[20px] border border-subtle bg-surface-elevated px-3 py-2.5 shadow-[0_12px_30px_rgba(31,23,13,0.12)] backdrop-blur-sm ${
          animatedDetails ? "family-hover-panel" : ""
        }`}
        style={detailsStyle}
      >
        <h2 className="text-body-sm font-semibold text-ink">
          {activeMember.name}
        </h2>
        <p className="mt-0.5 text-caption text-muted">
          {activeMember.position}
        </p>
        <p className="mt-2 text-caption text-subtle leading-5">
          "{activeMember.quote}"
        </p>
      </div>

      <div className="relative family-portrait-shell h-full w-full overflow-hidden rounded-[22px]">
        {previousPortraitMember ? (
          <img
            src={previousPortraitMember.imageSrc ?? fallbackProfile}
            alt={previousPortraitMember.name}
            className="family-portrait-mask family-portrait-image family-portrait-image--previous"
          />
        ) : null}
        <img
          src={activeMember.imageSrc ?? fallbackProfile}
          alt={activeMember.name}
          className={`family-portrait-mask family-portrait-image ${
            previousPortraitMember
              ? "family-portrait-image--current"
              : "family-portrait-image--idle"
          }`}
        />
      </div>
    </div>
  );

  return (
    <section
      id="family-board-section"
      data-nav-theme="light"
      className="relative min-h-screen overflow-hidden bg-page text-ink"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--family-hero-gradient)" }}
      ></div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40"></div>

      {/* MAIN NAVIGATION */}
      <Navbar navPages={familyNavPages} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 pb-16 pt-28 sm:px-6 lg:px-10">
        {/* PAGE INTRO COPY */}
        <div className="mx-auto max-w-[620px] text-center">
          <p className="text-overline font-semibold text-accent">
            Christian Leaders Board
          </p>
          <h1 className="mt-4 text-display font-semibold leading-[0.95] text-ink">
            Lorem Ipsum Dolor Sit Amet
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-body text-muted leading-7">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui doloremque dolorum quaerat magni earum neque quam blanditiis vel quos nisi repellat reiciendis aliquam aliquid, aspernatur iure cumque animi in possimus!
          </p>
        </div>

        {/* BOARD ORBIT STAGE */}
        <div
          className="relative mt-10 min-h-[620px] flex-1 overflow-hidden rounded-[38px] border border-subtle shadow-[0_28px_80px_rgba(67,46,18,0.14)] sm:min-h-[700px]"
          style={{ background: "var(--family-panel-gradient)" }}
        >
          {isMobile ? (
            <>
              {/* MOBILE PORTRAIT + RAIL */}
              <div
                className="pointer-events-none absolute left-[8%] top-[72%] z-0 h-px w-[84%] -translate-y-1/2"
                style={{ background: "var(--family-divider-gradient)" }}
              ></div>

              {renderPortrait(
                {
                  left: "50%",
                  top: "37%",
                  width: "clamp(230px,60vw,300px)",
                  height: "clamp(300px,78vw,380px)",
                },
                {
                  width: "min(200px,58vw)",
                  right: "11%",
                  bottom: "16%",
                },
                false,
              )}

              {/* MOBILE MEMBER CARDS */}
              {mobileCards.map(
                ({
                  member,
                  memberIndex,
                  isActive,
                  left,
                  top,
                  scale,
                  opacity,
                  interactive,
                  zIndex,
                }) => (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => {
                      if (!isAuto && interactive) {
                        setActiveIndex(memberIndex);
                      }
                    }}
                    className="absolute top-0 left-0 w-[92px] min-w-[92px] transition-[left,top,transform,opacity] duration-[850ms] [transition-timing-function:cubic-bezier(0.355,0.022,0.615,1)]"
                    style={{
                      left,
                      top,
                      opacity,
                      zIndex,
                      pointerEvents: interactive ? "auto" : "none",
                      transform: `translate(-50%, -50%) scale(${scale})`,
                    }}
                    tabIndex={interactive ? 0 : -1}
                    aria-hidden={!interactive}
                    aria-label={`${member.name} profile`}
                  >
                    {renderBoardCard(member, isActive, true)}
                  </button>
                ),
              )}

              {/* MOBILE CONTROLS */}
              <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 rounded-[22px] border border-subtle bg-surface-elevated px-2 py-1.5 shadow-[0_12px_34px_rgba(28,21,14,0.08)]">
                <button
                  type="button"
                  onClick={() => rotateBoard("up")}
                  disabled={isAuto}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-subtle bg-surface transition-colors ${
                    isAuto
                      ? "cursor-no-drop opacity-40"
                      : "cursor-pointer hover:bg-surface-muted"
                  }`}
                  aria-label="Rotate board backward"
                >
                  <ChevronDown className="h-4 w-4 text-ink rotate-90" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAuto((prev) => !prev)}
                  className="flex flex-col items-center gap-1.5 rounded-[20px] border border-subtle bg-surface px-2.5 py-1.5 shadow-[0_10px_28px_rgba(28,21,14,0.08)]"
                  aria-pressed={isAuto}
                  aria-label="Toggle auto rotation"
                >
                  <span className="text-nano font-semibold uppercase tracking-[0.2em] text-faint">
                    Auto
                  </span>
                  <span
                    className={`relative flex h-6 w-[40px] items-center rounded-full border transition-colors ${
                      isAuto
                        ? "border-[color:var(--surface-contrast)] bg-contrast"
                        : "border-subtle bg-surface"
                    }`}
                  >
                    <span
                      className={`block h-3.5 w-3.5 rounded-full transition-transform duration-300 ${
                        isAuto
                          ? "translate-x-[20px] bg-surface"
                          : "translate-x-[4px] bg-contrast"
                      }`}
                    ></span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => rotateBoard("down")}
                  disabled={isAuto}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-subtle bg-surface transition-colors ${
                    isAuto
                      ? "cursor-no-drop opacity-40"
                      : "cursor-pointer hover:bg-surface-muted"
                  }`}
                  aria-label="Rotate board forward"
                >
                  <ChevronDown className="h-4 w-4 text-ink -rotate-90" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* DESKTOP FADE + RINGS */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[120px] sm:w-[150px] lg:w-[190px]"
                style={{ background: "var(--family-left-fade)" }}
              ></div>

              <div
                className="pointer-events-none absolute z-0 rounded-full border border-strong"
                style={outerRingStyle}
              ></div>
              <div
                className="pointer-events-none absolute z-0 rounded-full border border-subtle"
                style={innerRingStyle}
              ></div>

              {/* DESKTOP CONTROLS */}
              <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-4 sm:right-6">
                <button
                  type="button"
                  onClick={() => rotateBoard("up")}
                  disabled={isAuto}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-subtle bg-surface-elevated shadow-[0_10px_30px_rgba(28,21,14,0.08)] transition-colors ${
                    isAuto
                      ? "cursor-no-drop opacity-40"
                      : "cursor-pointer hover:bg-surface-muted"
                  }`}
                  aria-label="Rotate board backward"
                >
                  <ChevronDown className="h-4 w-4 text-ink rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAuto((prev) => !prev)}
                  className="flex flex-col items-center gap-2 rounded-[22px] border border-subtle bg-surface-elevated px-2 py-3 shadow-[0_12px_34px_rgba(28,21,14,0.08)]"
                  aria-pressed={isAuto}
                  aria-label="Toggle auto rotation"
                >
                  <span className="text-micro font-semibold uppercase tracking-[0.24em] text-faint">
                    Auto
                  </span>
                  <span
                    className={`relative flex h-7 w-[46px] items-center rounded-full border transition-colors ${
                      isAuto
                        ? "border-[color:var(--surface-contrast)] bg-contrast"
                        : "border-subtle bg-surface"
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full transition-transform duration-300 ${
                        isAuto
                          ? "translate-x-[24px] bg-surface"
                          : "translate-x-[5px] bg-contrast"
                      }`}
                    ></span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => rotateBoard("down")}
                  disabled={isAuto}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-subtle bg-surface-elevated shadow-[0_10px_30px_rgba(28,21,14,0.08)] transition-colors ${
                    isAuto
                      ? "cursor-no-drop opacity-40"
                      : "cursor-pointer hover:bg-surface-muted"
                  }`}
                  aria-label="Rotate board forward"
                >
                  <ChevronDown className="h-4 w-4 text-ink" />
                </button>
              </div>

              {/* ACTIVE PORTRAIT */}
              {renderPortrait(orbitPortraitStyle, orbitDetailsStyle, true)}

              {/* ORBITING MEMBER CARDS */}
              {orbitMembers.map(
                ({
                  member,
                  index,
                  isActive,
                  left,
                  top,
                  scale,
                  opacity,
                  visibilityFactor,
                  zIndex,
                }) => (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => {
                      if (!isAuto) {
                        setActiveIndex(index);
                      }
                    }}
                    className={`absolute top-0 left-0 transition-[left,top,transform,opacity,filter] duration-[1100ms] [transition-timing-function:cubic-bezier(0.355,0.022,0.615,1)] ${orbitLayout.cardWidthClassName}`}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      opacity,
                      zIndex,
                      pointerEvents: visibilityFactor > 0.12 ? "auto" : "none",
                      transform: `translate(-50%, -50%) scale(${scale})`,
                    }}
                    tabIndex={visibilityFactor > 0.12 ? 0 : -1}
                    aria-hidden={visibilityFactor <= 0.12}
                    aria-label={`${member.name} profile`}
                  >
                    {renderBoardCard(member, isActive, false)}
                  </button>
                ),
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Family;
