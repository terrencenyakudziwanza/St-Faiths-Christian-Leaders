import React from "react";

import close from "../assets/icons/close.svg";
import video from "../assets/icons/videocam.svg";
import pic from "../assets/icons/image-fill.svg";
import share from "../assets/icons/share.svg";
import like from "../assets/icons/empty-heart 1.svg";
import arrowDown from "../assets/icons/arrow-down.svg";
import bookOpen from "../assets/icons/book-open.svg";
import muteIcon from "../assets/icons/mute.svg";
import volumeIcon from "../assets/icons/volume.svg";
import fallbackProfile from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";

import type {
  EventItem,
  EventMedia,
  MediaType,
  ServiceComponent,
  ServiceLeader,
} from "../types/domain";
import { formatLongDate } from "../utils/date";

interface EventsModalProps {
  show: boolean;
  event: EventItem | null;
  media: EventMedia[];
  loading: boolean;
  mediaError: string | null;
  onClose: () => void;
}

type MobilePane = "clips" | "details";

function getComponentChip(component: ServiceComponent): string {
  if (component === "Preaching") {
    return "Preacher";
  }

  return component;
}

function getLeadVerb(component: ServiceComponent): string {
  if (component === "Preaching") {
    return "was the";
  }

  if (component === "Intercession") {
    return "led the";
  }

  return "led";
}

function getComponentLeader(
  leaders: ServiceLeader[],
  component: ServiceComponent,
): ServiceLeader | null {
  return leaders.find((leader) => leader.component === component) ?? null;
}

const EventsModal: React.FC<EventsModalProps> = ({
  show,
  event,
  media,
  loading,
  mediaError,
  onClose,
}) => {
  const desktopClipsRef = React.useRef<HTMLDivElement | null>(null);
  const mobileClipsRef = React.useRef<HTMLDivElement | null>(null);
  const [mobilePane, setMobilePane] = React.useState<MobilePane>("clips");
  const [activeMedia, setActiveMedia] = React.useState<MediaType>("picture");
  const [isMuted, setIsMuted] = React.useState(true);
  const [activeClipId, setActiveClipId] = React.useState<string | null>(null);

  const pictureClips = React.useMemo(
    () => media.filter((item) => item.mediaType === "picture"),
    [media],
  );
  const videoClips = React.useMemo(
    () => media.filter((item) => item.mediaType === "video"),
    [media],
  );

  React.useEffect(() => {
    if (!show) {
      return;
    }

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [show]);

  React.useEffect(() => {
    if (!show) {
      return;
    }

    setMobilePane("clips");
  }, [show, event?.id]);

  React.useEffect(() => {
    if (!show) {
      return;
    }

    if (pictureClips.length > 0) {
      setActiveMedia("picture");
      return;
    }

    if (videoClips.length > 0) {
      setActiveMedia("video");
    }
  }, [show, pictureClips.length, videoClips.length, event?.id]);

  React.useEffect(() => {
    desktopClipsRef.current?.scrollTo({ top: 0, behavior: "auto" });
    mobileClipsRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeMedia, event?.id]);

  const activeButtonClass =
    "rounded-[30px] text-white border-[1.5px] bg-[#222] border-[#222] py-1 px-3 flex items-center gap-2";
  const inactiveButtonClass =
    "rounded-[30px] border-[1.5px] border-[#222] text-[#222] bg-transparent py-1 px-3 flex items-center gap-2";
  const compactToggleBaseClass =
    "rounded-[16px] border-[1.5px] px-3 py-1.5 text-sm flex items-center justify-center gap-1.5 min-w-[92px]";
  const compactToggleActiveClass = "bg-[#111] text-white border-[#111]";
  const compactToggleInactiveClass = "bg-transparent text-[#111] border-[#BBB]";

  const activeItems = activeMedia === "picture" ? pictureClips : videoClips;
  const activeClip = React.useMemo(
    () =>
      activeItems.find((item) => item.id === activeClipId) ??
      activeItems[0] ??
      null,
    [activeItems, activeClipId],
  );

  const activeComponent = activeClip?.component ?? "Preaching";
  const serviceLeaders = event?.serviceLeaders ?? [];
  const activeLeader = getComponentLeader(serviceLeaders, activeComponent) ??
    serviceLeaders[0] ?? {
      component: "Preaching" as const,
      name: event?.presenterName ?? "Service Leader",
      roleLabel: event?.presenterRole ?? "Leader",
      avatarPath: event?.presenterAvatarPath ?? null,
      avatarUrl: event?.presenterAvatarUrl ?? null,
    };

  const detailChip = getComponentChip(activeComponent);
  const detailVerb = getLeadVerb(activeComponent);
  const detailPoints =
    activeComponent === "Intercession"
      ? (event?.intercessionPrayerPoints ?? [])
      : (event?.praiseHighlights ?? []);

  React.useEffect(() => {
    if (!show) {
      return;
    }

    setActiveClipId(activeItems[0]?.id ?? null);
  }, [show, activeMedia, activeItems]);

  React.useEffect(() => {
    if (!show || activeItems.length === 0) {
      return;
    }

    const setupListener = (clipsEl: HTMLDivElement | null) => {
      if (!clipsEl) {
        return null;
      }

      const updateActiveClipFromScroll = () => {
        const clipItems = Array.from(
          clipsEl.querySelectorAll<HTMLElement>("[data-clip-item]"),
        );

        if (!clipItems.length) {
          return;
        }

        let closestClipId: string | null = null;
        let bestDistance = Number.POSITIVE_INFINITY;

        clipItems.forEach((item) => {
          const distance = Math.abs(item.offsetTop - clipsEl.scrollTop);

          if (distance < bestDistance) {
            bestDistance = distance;
            closestClipId = item.dataset.clipId ?? null;
          }
        });

        if (!closestClipId) {
          return;
        }

        setActiveClipId((prev) =>
          prev === closestClipId ? prev : closestClipId,
        );
      };

      updateActiveClipFromScroll();
      clipsEl.addEventListener("scroll", updateActiveClipFromScroll, {
        passive: true,
      });

      return () => {
        clipsEl.removeEventListener("scroll", updateActiveClipFromScroll);
      };
    };

    const cleanups = [
      setupListener(desktopClipsRef.current),
      setupListener(mobileClipsRef.current),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
    };
  }, [show, activeMedia, activeItems, mobilePane]);

  const scrollToClip = (direction: "up" | "down") => {
    const clipsEl =
      [desktopClipsRef.current, mobileClipsRef.current].find((el) =>
        Boolean(el && el.offsetParent !== null),
      ) ??
      desktopClipsRef.current ??
      mobileClipsRef.current;

    if (!clipsEl) {
      return;
    }

    const clipItems = Array.from(
      clipsEl.querySelectorAll<HTMLElement>("[data-clip-item]"),
    );

    if (!clipItems.length) {
      return;
    }

    let currentIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    clipItems.forEach((item, index) => {
      const distance = Math.abs(item.offsetTop - clipsEl.scrollTop);

      if (distance < bestDistance) {
        bestDistance = distance;
        currentIndex = index;
      }
    });

    const targetIndex =
      direction === "down"
        ? Math.min(currentIndex + 1, clipItems.length - 1)
        : Math.max(currentIndex - 1, 0);

    clipItems[targetIndex].scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };

  const renderPaneSwitch = () => (
    <div className="flex gap-1.5 flex-wrap">
      <button
        type="button"
        onClick={() => setMobilePane("clips")}
        className={`${compactToggleBaseClass} ${
          mobilePane === "clips"
            ? compactToggleActiveClass
            : compactToggleInactiveClass
        }`}
      >
        Clips
      </button>
      <button
        type="button"
        onClick={() => setMobilePane("details")}
        className={`${compactToggleBaseClass} ${
          mobilePane === "details"
            ? compactToggleActiveClass
            : compactToggleInactiveClass
        }`}
      >
        Details
      </button>
    </div>
  );

  const renderMediaSwitch = (compact: boolean) => (
    <div className="flex gap-1.5 lg:gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => setActiveMedia("video")}
        className={
          compact
            ? `${compactToggleBaseClass} ${
                activeMedia === "video"
                  ? compactToggleActiveClass
                  : compactToggleInactiveClass
              }`
            : `${activeMedia === "video" ? activeButtonClass : inactiveButtonClass}`
        }
      >
        <img
          src={video}
          className={activeMedia === "video" ? "icon scale-70" : "icon-dk"}
          alt=""
        />
        {compact ? (
          <p className="font-semibold">{videoClips.length}</p>
        ) : (
          <p>Videos ({videoClips.length})</p>
        )}
      </button>
      <button
        type="button"
        onClick={() => setActiveMedia("picture")}
        className={
          compact
            ? `${compactToggleBaseClass} ${
                activeMedia === "picture"
                  ? compactToggleActiveClass
                  : compactToggleInactiveClass
              }`
            : `${
                activeMedia === "picture"
                  ? activeButtonClass
                  : inactiveButtonClass
              }`
        }
      >
        <img
          src={pic}
          className={activeMedia === "picture" ? "icon scale-70" : "icon-dk"}
          alt=""
        />
        {compact ? (
          <p className="font-semibold">{pictureClips.length}</p>
        ) : (
          <p>Pictures ({pictureClips.length})</p>
        )}
      </button>
    </div>
  );

  const renderDetailsPanel = (withMediaSwitch: boolean) => (
    <div className="flex flex-col justify-between h-full min-w-0">
      <div className="flex flex-col gap-3 min-w-0">
        <h1 className="text-[28px] md:text-[34px] lg:text-[28px] leading-tight font-bold bg-[rgb(240,240,240)] p-2 rounded-xl wrap-break-word">
          {event?.themeTopic ?? event?.title ?? "Select an event"}
        </h1>
        <div className="flex gap-3 lg:gap-4 flex-wrap">
          <p className="px-2.5 py-0.5 text-sm bg-[rgb(240,240,240)] rounded-[7px]">
            {event?.feedType ?? "Event"}
          </p>
          <p className="px-2.5 py-0.5 text-sm bg-[rgb(240,240,240)] rounded-[7px]">
            {event ? formatLongDate(event.eventDate) : "Unknown date"}
          </p>
        </div>

        <div className="flex flex-col border-[1.5px] border-[#DDD] rounded-2xl px-4 py-3 gap-4">
          <span className="flex gap-2 pt-1">
            <img
              src={activeLeader.avatarUrl ?? fallbackProfile}
              className="rounded-[50%] h-12 w-12 object-cover"
              alt={activeLeader.name}
            />
            <div className="flex flex-col">
              <h2 className="text-xl text-black font-medium">
                {activeLeader.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[#555]">{detailVerb}</p>
                <div className="px-2 py-px rounded-lg bg-[rgb(240,240,240)] shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
                  {detailChip}
                </div>
              </div>
            </div>
          </span>

          {activeComponent === "Preaching" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[rgb(230,230,230)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center">
                  <img src={bookOpen} alt="" className="icon-dk scale-90" />
                </div>
                <p className="text-[15px] font-semibold text-[#222]">
                  {event?.themeScriptureReference ?? "John 15:5"}
                </p>
              </div>
              <p className="text-[#333] leading-relaxed">
                {event?.themeScriptureText ?? ""}
              </p>
            </div>
          )}

          {activeComponent !== "Preaching" && (
            <div className="flex flex-col gap-2">
              {detailPoints.slice(0, 3).map((point, index) => (
                <div
                  key={`${activeComponent}-${index}`}
                  className="flex gap-3 items-start"
                >
                  <div className="h-8 w-8 rounded-full bg-[rgb(230,230,230)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-sm font-semibold text-[#222] shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-[#333] text-[14px] leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {withMediaSwitch && (
        <div className="pt-4">{renderMediaSwitch(false)}</div>
      )}
    </div>
  );

  const renderClipsPane = (
    ref: React.RefObject<HTMLDivElement | null>,
    compact: boolean,
  ) => (
    <div
      ref={ref}
      className={`clips h-full overflow-y-auto flex flex-col snap-y snap-mandatory scroll-smooth ${
        compact ? "pr-1" : ""
      }`}
    >
      {loading && (
        <div className="h-full min-h-[40vh] flex items-center justify-center text-[#555]">
          Loading media...
        </div>
      )}

      {!loading && mediaError && (
        <div className="h-full min-h-[40vh] flex items-center justify-center text-center text-[#B91C1C] px-8">
          {mediaError}
        </div>
      )}

      {!loading && !mediaError && activeItems.length === 0 && (
        <div className="h-full min-h-[40vh] flex items-center justify-center text-[#555]">
          No {activeMedia === "picture" ? "pictures" : "videos"} uploaded yet.
        </div>
      )}

      {!loading &&
        !mediaError &&
        activeMedia === "picture" &&
        pictureClips.map((clip) => (
          <div
            key={clip.id}
            data-clip-item
            data-clip-id={clip.id}
            className={`w-full flex gap-3 lg:gap-4 items-center justify-center p-3 lg:p-4 snap-start ${
              compact ? "min-h-[58dvh] flex-row" : "min-h-full flex-row"
            }`}
            onMouseEnter={() => setActiveClipId(clip.id)}
          >
            <div
              className={`relative ${
                compact ? "h-[72dvh] flex-1" : "h-full w-full lg:w-[80%]"
              }`}
            >
              <img
                src={clip.publicUrl}
                alt={clip.caption || event?.title || "Event picture"}
                className="object-cover rounded-[34px] lg:rounded-3xl h-full w-full"
                loading="eager"
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#222]">
                {clip.component}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:gap-4 shrink-0">
              <div className="icon-wrapper bg-[rgb(230,230,230)]">
                <img src={like} alt="" className="icon-dk scale-90" />
              </div>
              <div className="icon-wrapper bg-[rgb(230,230,230)]">
                <img src={share} alt="" className="icon-dk" />
              </div>
            </div>
          </div>
        ))}

      {!loading &&
        !mediaError &&
        activeMedia === "video" &&
        videoClips.map((clip) => (
          <div
            key={clip.id}
            data-clip-item
            data-clip-id={clip.id}
            className={`w-full flex gap-3 lg:gap-4 items-center justify-center p-3 lg:p-4 snap-start ${
              compact ? "min-h-[58dvh] flex-row" : "min-h-full flex-row"
            }`}
            onMouseEnter={() => setActiveClipId(clip.id)}
          >
            <div
              className={`relative rounded-[34px] lg:rounded-3xl overflow-hidden bg-black ${
                compact ? "h-[72dvh] flex-1" : "h-full w-full lg:w-[80%]"
              }`}
            >
              <div className="absolute left-4 top-4 z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#222]">
                {clip.component}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted((prev) => !prev);
                }}
                className="absolute top-4 right-4 z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#222] flex items-center gap-1.5 border border-[#DDD]"
              >
                <img
                  src={isMuted ? muteIcon : volumeIcon}
                  alt=""
                  className="h-3.5 w-3.5"
                />
                <span>{isMuted ? "Muted" : "Sound"}</span>
              </button>
              <video
                src={clip.publicUrl}
                className="h-full w-full object-cover video-progress-only"
                playsInline
                muted={isMuted}
                controls
                controlsList="nofullscreen nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute left-5 right-5 bottom-8 text-white pointer-events-none">
                <p className="text-lg font-medium">
                  {clip.caption || event?.title || "Event video"}
                </p>
                <div className="flex gap-2 text-sm text-white/90">
                  {clip.tags.map((tag) => (
                    <span key={`${clip.id}-${tag}`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:gap-4 shrink-0">
              <div className="icon-wrapper bg-[rgb(230,230,230)]">
                <img src={like} alt="" className="icon-dk scale-90" />
              </div>
              <div className="icon-wrapper bg-[rgb(230,230,230)]">
                <img src={share} alt="" className="icon-dk" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div
      className={`modal fixed z-30 top-0 left-0 h-screen w-screen bg-[rgba(0,0,0,.7)] flex items-center justify-center transition-opacity ease-out duration-500 ${
        show
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-10 hidden lg:flex">
        {/* ScrollUp Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollToClip("up");
          }}
          className="h-11 w-11 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <img src={arrowDown} alt="" className="icon-dk rotate-180" />
        </button>

        {/* ScrollDown Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollToClip("down");
          }}
          className="h-11 w-11 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <img src={arrowDown} alt="" className="icon-dk" />
        </button>
      </div>

      {/* Modal Wrapper */}
      <div
        className={`h-[100dvh] w-screen lg:h-[90vh] lg:w-[70vw] bg-white rounded-none lg:rounded-[50px] relative transition-transform ease-out duration-500 ${
          show ? "scale-100" : "scale-95 lg:scale-75"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wrapper Close Btn */}
        <button
          type="button"
          className="hidden lg:flex absolute top-[3%] right-[2%] icon-wrapper cursor-pointer z-20"
          onClick={onClose}
        >
          <img src={close} alt="" className="icon-dk scale-110" />
        </button>

        <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#ECECEC] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold truncate">
              {event?.themeTopic ?? event?.title ?? "Event"}
            </h2>
            <button
              type="button"
              className="icon-wrapper"
              onClick={onClose}
              aria-label="Close event modal"
            >
              <img src={close} alt="" className="icon-dk scale-110" />
            </button>
          </div>

          <div className="mt-2">
            <div className="w-full flex items-center justify-between gap-2">
              {renderPaneSwitch()}

              {mobilePane === "clips" && renderMediaSwitch(true)}
            </div>
          </div>
        </div>

        <div className="h-full w-full overflow-hidden px-4 py-4 lg:px-10 lg:py-4">
          <div className="hidden lg:flex h-full w-full overflow-hidden">
            <div className="lg:w-[50%] min-w-0 h-full py-[2.5%] px-4">
              {renderDetailsPanel(true)}
            </div>
            <div className="relative flex-1 h-full min-h-0">
              {renderClipsPane(desktopClipsRef, false)}
            </div>
          </div>

          <div className="lg:hidden h-fit">
            {mobilePane === "details" && (
              <div className="h-full overflow-y-auto pr-1">
                {renderDetailsPanel(false)}
              </div>
            )}

            {mobilePane === "clips" && (
              <div className="h-full min-h-0 flex flex-col gap-3">
                <div className="relative flex-1 min-h-0">
                  {renderClipsPane(mobileClipsRef, true)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsModal;
