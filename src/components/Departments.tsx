import React from "react";
import { ChevronDown } from "lucide-react";
import { departments, type DepartmentMember } from "../data/departments";
import fallbackProfile from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";

type OrbitLayout = {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  cardWidthClassName: string;
  portraitWidth: string;
  portraitHeight: string;
};

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

function getOrbitLayout(viewportWidth: number): OrbitLayout {
  if (viewportWidth < 768) {
    return {
      centerX: 50,
      centerY: 42,
      radiusX: 32,
      radiusY: 26,
      cardWidthClassName: "w-[140px]",
      portraitWidth: "clamp(200px,50vw,280px)",
      portraitHeight: "clamp(260px,65vw,360px)",
    };
  }

  if (viewportWidth < 1200) {
    return {
      centerX: 50,
      centerY: 40,
      radiusX: 36,
      radiusY: 28,
      cardWidthClassName: "w-[160px]",
      portraitWidth: "clamp(260px,30vw,360px)",
      portraitHeight: "clamp(320px,42vw,440px)",
    };
  }

  return {
    centerX: 50,
    centerY: 38,
    radiusX: 40,
    radiusY: 30,
    cardWidthClassName: "w-[180px]",
    portraitWidth: "clamp(280px,28vw,380px)",
    portraitHeight: "clamp(340px,40vw,480px)",
  };
}

const Departments: React.FC = () => {
  const [activeDeptIndex, setActiveDeptIndex] = React.useState(0);
  const [activeMemberIndex, setActiveMemberIndex] = React.useState(0);
  const [isAuto, setIsAuto] = React.useState(true);
  const [viewportWidth, setViewportWidth] = React.useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );

  const activeDept = departments[activeDeptIndex] ?? departments[0];
  const orbitLayout = React.useMemo(
    () => getOrbitLayout(viewportWidth),
    [viewportWidth],
  );

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
      setActiveMemberIndex((prev) => (prev + 1) % activeDept.members.length);
    }, 3800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuto, activeDept.members.length]);

  const orbitMembers = React.useMemo(() => {
    return activeDept.members.map((member, index) => {
      const offset = getWrappedOffset(index, activeMemberIndex, activeDept.members.length);
      const angle = (offset / activeDept.members.length) * Math.PI; // Semicircle
      const wrappedAngle = angle - Math.PI / 2; // Adjust so top is at -PI/2
      
      // Calculate position
      const xPos = Math.cos(wrappedAngle);
      const yPos = -Math.sin(wrappedAngle); // Inverted because CSS top increases downward
      
      const depth = (xPos + 1) / 2; // 0 at left, 1 at right
      
      // Fade out cards below the center line
      // yPos ranges from -1 (top) to 1 (bottom)
      // We want full opacity when yPos < 0, then fade as it approaches and passes 0
      const fadeThreshold = 0.15;
      let fadeProgress = 1;
      if (yPos > 0) {
        fadeProgress = Math.max(0, 1 - (yPos / fadeThreshold));
      }

      const baseScale = 0.72 + depth * 0.28;
      const baseOpacity = 0.4 + depth * 0.6;
      const visibilityFactor = fadeProgress;

      return {
        member,
        index,
        isActive: index === activeMemberIndex,
        isLeader: member.isLeader,
        left: orbitLayout.centerX + xPos * orbitLayout.radiusX,
        top: orbitLayout.centerY + yPos * orbitLayout.radiusY,
        scale: baseScale * (0.8 + visibilityFactor * 0.2),
        opacity: baseOpacity * visibilityFactor,
        visibilityFactor,
        zIndex: Math.round(20 + depth * 50),
      };
    });
  }, [activeMemberIndex, activeDept, orbitLayout]);

  const rotateDepartment = (direction: "prev" | "next") => {
    if (direction === "next") {
      setActiveMemberIndex((prev) => (prev + 1) % activeDept.members.length);
    } else {
      setActiveMemberIndex((prev) => (prev - 1 + activeDept.members.length) % activeDept.members.length);
    }
  };

  const changeDepartment = (index: number) => {
    setActiveDeptIndex(index);
    setActiveMemberIndex(0);
  };

  const renderDepartmentCard = (member: DepartmentMember, isActive: boolean) => {
    const borderClass = member.isLeader
      ? "ring-2 ring-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.3)]"
      : "";

    return (
      <div
        className={`relative overflow-hidden rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ${borderClass}`}
      >
        <img
          src={member.imageSrc ?? fallbackProfile}
          alt={member.name}
          className="h-full w-full object-cover"
        />
        {isActive && (
          <div className="absolute inset-0 ring-2 ring-[color:var(--accent)] ring-inset"></div>
        )}
      </div>
    );
  };

  return (
    <section
      id="departments-section"
      className="relative w-full overflow-hidden bg-page text-ink py-20"
    >
      <div className="relative mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-10">
        {/* SECTION HEADER */}
        <div className="mx-auto max-w-[620px] text-center mb-16">
          <p className="text-overline font-semibold text-accent">Our Departments</p>
          <h2 className="mt-4 text-display-sm font-semibold text-ink">
            Ministry Teams
          </h2>
          <p className="mt-3 text-body-sm text-muted">
            Meet the dedicated teams serving the Christian Leaders community
          </p>
        </div>

        {/* DEPARTMENT NAVIGATION */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center flex-wrap">
          {departments.map((dept, index) => {
            const Icon = dept.icon;
            const isActive = index === activeDeptIndex;

            return (
              <button
                key={dept.id}
                onClick={() => changeDepartment(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-surface-elevated border border-[currentColor] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                    : "bg-surface border border-subtle hover:bg-surface-muted"
                }`}
                style={
                  isActive
                    ? {
                        color: dept.colorHex,
                        borderColor: dept.colorHex,
                      }
                    : {}
                }
              >
                <Icon size={16} />
                <span className="text-body-sm font-semibold whitespace-nowrap">
                  {dept.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* MAIN ORBITAL STAGE */}
        <div
          className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] rounded-[32px] border border-subtle shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden"
          style={{ background: "var(--family-panel-gradient)" }}
        >
          {/* GLOW BACKGROUND */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(circle at ${orbitLayout.centerX}% ${orbitLayout.centerY}%, rgba(${activeDept.colorRgb}, 0.2), transparent 50%)`,
            }}
          ></div>

          {/* CENTER CONTENT (NAME + ICON) */}
          <div
            className="absolute z-30 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${orbitLayout.centerX}%`,
              top: `${orbitLayout.centerY}%`,
            }}
          >
            {/* GLOW EFFECT */}
            <div
              className="absolute inset-[-40px] rounded-full blur-2xl opacity-40 -z-10"
              style={{
                background: `radial-gradient(circle, rgba(${activeDept.colorRgb}, 0.6), transparent 70%)`,
              }}
            ></div>

            {/* ICON */}
            <div
              className="mb-3 p-3 rounded-full transition-all duration-700"
              style={{
                background: `rgba(${activeDept.colorRgb}, 0.1)`,
                border: `2px solid rgba(${activeDept.colorRgb}, 0.3)`,
              }}
            >
              {React.createElement(activeDept.icon, {
                size: 40,
                style: { color: activeDept.colorHex },
              })}
            </div>

            {/* DEPARTMENT NAME - HOLLOW TEXT */}
            <h3
              className="text-heading-md sm:text-heading-lg font-bold text-center uppercase tracking-wider"
              style={{
                color: "transparent",
                WebkitTextStroke: `2px ${activeDept.colorHex}`,
              }}
            >
              {activeDept.name}
            </h3>
          </div>

          {/* FADE OVERLAY (TOP TO BOTTOM) */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: `linear-gradient(180deg, transparent 0%, transparent ${orbitLayout.centerY - 15}%, rgba(255,255,255,0.3) ${orbitLayout.centerY + 5}%, rgba(255,255,255,0.5) 100%)`,
            }}
          ></div>

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
                    setActiveMemberIndex(index);
                  }
                }}
                className={`absolute top-0 left-0 transition-[left,top,transform,opacity,filter] duration-1000 [transition-timing-function:cubic-bezier(0.355,0.022,0.615,1)] ${orbitLayout.cardWidthClassName}`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  opacity,
                  zIndex,
                  pointerEvents: visibilityFactor > 0.1 ? "auto" : "none",
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
                tabIndex={visibilityFactor > 0.1 ? 0 : -1}
                aria-hidden={visibilityFactor <= 0.1}
                aria-label={`${member.name}`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden">
                  {renderDepartmentCard(member, isActive)}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-caption font-semibold text-ink line-clamp-1">
                    {member.name}
                  </p>
                </div>
              </button>
            ),
          )}

          {/* CONTROLS */}
          <div className="absolute right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-6 sm:gap-4">
            {/* PREV BUTTON */}
            <button
              type="button"
              onClick={() => rotateDepartment("prev")}
              disabled={isAuto}
              className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-2xl border border-subtle bg-surface-elevated shadow-[0_10px_30px_rgba(28,21,14,0.08)] transition-colors ${
                isAuto
                  ? "cursor-no-drop opacity-40"
                  : "cursor-pointer hover:bg-surface-muted"
              }`}
              aria-label="Rotate members backward"
            >
              <ChevronDown size={18} className="text-ink rotate-180" />
            </button>

            {/* AUTO TOGGLE */}
            <button
              type="button"
              onClick={() => setIsAuto((prev) => !prev)}
              className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-[22px] border border-subtle bg-surface-elevated px-2 sm:px-2.5 py-2.5 sm:py-3 shadow-[0_12px_34px_rgba(28,21,14,0.08)]"
              aria-pressed={isAuto}
              aria-label="Toggle auto rotation"
            >
              <span className="text-nano sm:text-micro font-semibold uppercase tracking-[0.2em] text-faint">
                Auto
              </span>
              <span
                className={`relative flex h-6 sm:h-7 w-[40px] sm:w-[46px] items-center rounded-full border transition-colors ${
                  isAuto
                    ? "border-[color:var(--surface-contrast)] bg-contrast"
                    : "border-subtle bg-surface"
                }`}
              >
                <span
                  className={`block h-3.5 sm:h-4 w-3.5 sm:w-4 rounded-full transition-transform duration-300 ${
                    isAuto
                      ? "translate-x-[18px] sm:translate-x-[24px] bg-surface"
                      : "translate-x-1 sm:translate-x-[5px] bg-contrast"
                  }`}
                ></span>
              </span>
            </button>

            {/* NEXT BUTTON */}
            <button
              type="button"
              onClick={() => rotateDepartment("next")}
              disabled={isAuto}
              className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-2xl border border-subtle bg-surface-elevated shadow-[0_10px_30px_rgba(28,21,14,0.08)] transition-colors ${
                isAuto
                  ? "cursor-no-drop opacity-40"
                  : "cursor-pointer hover:bg-surface-muted"
              }`}
              aria-label="Rotate members forward"
            >
              <ChevronDown size={18} className="text-ink" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Departments;
