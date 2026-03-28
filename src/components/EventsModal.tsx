import React from "react";

import {
  BookOpen,
  ChevronDown,
  Heart,
  Image,
  Pause,
  Play,
  Share2,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import fallbackProfile from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";
import ProfileCard from "./ProfileCard";

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
type ClipIndicatorAction = "play" | "pause";

type LikeBurst = {
  id: number;
  clipId: string;
  offsetX: number;
};

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
  const videoRefs = React.useRef(new Map<string, HTMLVideoElement>());
  const clipIndicatorTimeoutRef = React.useRef<number | null>(null);
  const likeBurstIdRef = React.useRef(0);
  const likeBurstTimeoutsRef = React.useRef<number[]>([]);
  const [mobilePane, setMobilePane] = React.useState<MobilePane>("clips");
  const [activeMedia, setActiveMedia] = React.useState<MediaType>("picture");
  const [isMuted, setIsMuted] = React.useState(true);
  const [autoPlayRequested, setAutoPlayRequested] = React.useState(false);
  const autoPlayRequestedRef = React.useRef(false);
  const [activeClipId, setActiveClipId] = React.useState<string | null>(null);
  const [clipIndicator, setClipIndicator] = React.useState<{
    clipId: string;
    action: ClipIndicatorAction;
  } | null>(null);
  const [likeBursts, setLikeBursts] = React.useState<LikeBurst[]>([]);
  const [likePulseVersions, setLikePulseVersions] = React.useState<
    Record<string, number>
  >({});
  const [likeCounts, setLikeCounts] = React.useState<Record<string, number>>(
    {},
  );
  const [shareCounts, setShareCounts] = React.useState<Record<string, number>>(
    {},
  );

  React.useEffect(() => {
    autoPlayRequestedRef.current = autoPlayRequested;
  }, [autoPlayRequested]);

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
    "rounded-[30px] text-inverse text-body-sm border-[1.5px] bg-contrast border-[color:var(--surface-contrast)] py-1 px-3 flex items-center gap-2";
  const inactiveButtonClass =
    "rounded-[30px] border-[1.5px] border-strong text-ink text-body-sm bg-transparent py-1 px-3 flex items-center gap-2";
  const compactToggleBaseClass =
    "rounded-[16px] border-[1.5px] px-3 py-1.5 text-body-sm flex items-center justify-center gap-1.5 min-w-[92px]";
  const compactToggleActiveClass =
    "bg-contrast text-inverse border-[color:var(--surface-contrast)]";
  const compactToggleInactiveClass = "bg-transparent text-ink border-subtle";

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
  const verseLabel = event?.themeScriptureReference ?? "John 15:5";
  const verseVersionLabel = event?.themeScriptureVersion
    ? ` (${event.themeScriptureVersion.toUpperCase()})`
    : "";

  const registerVideoRef = React.useCallback(
    (clipId: string, element: HTMLVideoElement | null) => {
      if (element) {
        videoRefs.current.set(clipId, element);
        return;
      }

      videoRefs.current.delete(clipId);
    },
    [],
  );

  const clearLikeBurstTimeouts = React.useCallback(() => {
    likeBurstTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    likeBurstTimeoutsRef.current = [];
  }, []);

  const pauseAllVideos = React.useCallback((exceptClipId?: string) => {
    videoRefs.current.forEach((video, clipId) => {
      if (clipId === exceptClipId) {
        return;
      }

      if (!video.paused) {
        video.pause();
      }
    });
  }, []);

  const showClipIndicator = React.useCallback(
    (clipId: string, action: ClipIndicatorAction) => {
      if (clipIndicatorTimeoutRef.current !== null) {
        window.clearTimeout(clipIndicatorTimeoutRef.current);
      }

      setClipIndicator({ clipId, action });
      clipIndicatorTimeoutRef.current = window.setTimeout(() => {
        setClipIndicator((current) =>
          current?.clipId === clipId && current.action === action
            ? null
            : current,
        );
        clipIndicatorTimeoutRef.current = null;
      }, 560);
    },
    [],
  );

  const toggleVideoPlayback = React.useCallback(
    async (clipId: string) => {
      const video = videoRefs.current.get(clipId);

      if (!video) {
        return;
      }

      if (video.paused || video.ended) {
        pauseAllVideos(clipId);

        try {
          if (video.readyState < 2) {
            video.load();
          }
          await video.play();
          showClipIndicator(clipId, "play");
        } catch {
          return;
        }

        return;
      }

      video.pause();
      showClipIndicator(clipId, "pause");
    },
    [pauseAllVideos, showClipIndicator],
  );

  React.useEffect(() => {
    if (!show || activeMedia !== "video" || !autoPlayRequested) {
      return;
    }

    const firstClip = activeItems[0];

    if (!firstClip) {
      setAutoPlayRequested(false);
      return;
    }

    let attempts = 0;
    let cancelled = false;

    const tryPlay = () => {
      if (cancelled) {
        return;
      }

      const video = videoRefs.current.get(firstClip.id);

      if (video) {
        pauseAllVideos(firstClip.id);

        if (video.readyState < 2) {
          video.load();
        }

        void video.play().catch(() => null);
        showClipIndicator(firstClip.id, "play");
        setActiveClipId(firstClip.id);
        setAutoPlayRequested(false);
        return;
      }

      if (attempts < 8) {
        attempts += 1;
        window.requestAnimationFrame(tryPlay);
      } else {
        setAutoPlayRequested(false);
      }
    };

    tryPlay();

    return () => {
      cancelled = true;
    };
  }, [
    show,
    activeMedia,
    autoPlayRequested,
    activeItems,
    pauseAllVideos,
    showClipIndicator,
  ]);

  const handleLikeClick = React.useCallback((clipId: string) => {
    const burstId = likeBurstIdRef.current++;
    const offsetX = ((burstId % 5) - 2) * 7;

    setLikeBursts((prev) => [...prev, { id: burstId, clipId, offsetX }]);
    setLikePulseVersions((prev) => ({
      ...prev,
      [clipId]: (prev[clipId] ?? 0) + 1,
    }));
    setLikeCounts((prev) => ({
      ...prev,
      [clipId]: (prev[clipId] ?? 0) + 1,
    }));

    const timeoutId = window.setTimeout(() => {
      setLikeBursts((prev) => prev.filter((burst) => burst.id !== burstId));
      likeBurstTimeoutsRef.current = likeBurstTimeoutsRef.current.filter(
        (item) => item !== timeoutId,
      );
    }, 780);

    likeBurstTimeoutsRef.current.push(timeoutId);
  }, []);

  const handleShareClick = React.useCallback((clipId: string) => {
    setShareCounts((prev) => ({
      ...prev,
      [clipId]: (prev[clipId] ?? 0) + 1,
    }));
  }, []);

  React.useEffect(() => {
    if (!show) {
      return;
    }

    setActiveClipId(activeItems[0]?.id ?? null);
  }, [show, activeMedia, activeItems]);

  React.useEffect(() => {
    if (show && activeMedia === "video") {
      return;
    }

    pauseAllVideos();
    setClipIndicator(null);
  }, [show, activeMedia, event?.id, pauseAllVideos]);

  React.useEffect(() => {
    if (show) {
      return;
    }

    pauseAllVideos();
    clearLikeBurstTimeouts();
    if (clipIndicatorTimeoutRef.current !== null) {
      window.clearTimeout(clipIndicatorTimeoutRef.current);
      clipIndicatorTimeoutRef.current = null;
    }
    setLikeBursts([]);
    setLikePulseVersions({});
    setClipIndicator(null);
    setAutoPlayRequested(false);
  }, [show, clearLikeBurstTimeouts, pauseAllVideos]);

  React.useEffect(
    () => () => {
      pauseAllVideos();
      clearLikeBurstTimeouts();

      if (clipIndicatorTimeoutRef.current !== null) {
        window.clearTimeout(clipIndicatorTimeoutRef.current);
      }
    },
    [clearLikeBurstTimeouts, pauseAllVideos],
  );

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

  const renderClipActions = (clipId: string, compact: boolean) => {
    const clipLikeBursts = likeBursts.filter(
      (burst) => burst.clipId === clipId,
    );
    const likePulseVersion = likePulseVersions[clipId] ?? 0;
    const likeCount = likeCounts[clipId] ?? 0;
    const shareCount = shareCounts[clipId] ?? 0;
    const countClassName = `text-micro font-semibold text-faint ${
      compact ? "tracking-[0.06em]" : "tracking-[0.04em]"
    }`;

    return (
      <div
        className={`flex gap-3 lg:gap-4 shrink-0 ${
          compact ? "w-full justify-start" : "flex-col"
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLikeClick(clipId);
            }}
            className="icon-wrapper like-button border border-like bg-like-soft cursor-pointer"
            aria-label="Like clip"
          >
            {clipLikeBursts.map((burst) => (
              <span
                key={burst.id}
                className="like-button__burst text-caption text-like font-semibold"
                style={
                  {
                    "--like-burst-offset": `${burst.offsetX}px`,
                  } as React.CSSProperties
                }
              >
                +1
              </span>
            ))}
            <span
              key={`${clipId}-${likePulseVersion}`}
              className={`like-button__heart ${
                likePulseVersion > 0 ? "like-button__heart--pulse" : ""
              }`}
            >
            <Heart className="h-4 w-4 text-like" />
            </span>
          </button>
          <span className={countClassName}>{likeCount}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleShareClick(clipId);
            }}
            className="icon-wrapper bg-surface-muted cursor-pointer"
            aria-label="Share clip"
          >
            <Share2 className="h-4 w-4 text-ink" />
          </button>
          <span className={countClassName}>{shareCount}</span>
        </div>
      </div>
    );
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
        onClick={() => {
          setActiveMedia("video");
          setAutoPlayRequested(true);
        }}
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
        <Video className="h-4 w-4" />
        {compact ? (
          <p className="font-semibold">{videoClips.length}</p>
        ) : (
          <p>Videos ({videoClips.length})</p>
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setActiveMedia("picture");
          setAutoPlayRequested(false);
        }}
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
        <Image className="h-4 w-4" />
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
        <h1 className="text-title-fluid leading-tight font-bold bg-surface-muted text-ink p-2 rounded-xl wrap-break-word">
          {event?.themeTopic ?? event?.title ?? "Select an event"}
        </h1>
        <div className="flex gap-3 lg:gap-4 flex-wrap">
          <p className="px-2.5 py-0.5 text-body-sm bg-surface-muted text-ink rounded-[7px]">
            {event?.feedType ?? "Event"}
          </p>
          <p className="px-2.5 py-0.5 text-body-sm bg-surface-muted text-ink rounded-[7px]">
            {event ? formatLongDate(event.eventDate) : "Unknown date"}
          </p>
        </div>

        <div className="flex flex-col border-[1.5px] border-subtle rounded-2xl px-4 py-3 gap-4">
          <ProfileCard
            imageSrc={activeLeader.avatarUrl ?? fallbackProfile}
            imageAlt={activeLeader.name}
            name={activeLeader.name}
            details={
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-body-sm text-muted">{detailVerb}</p>
                <div className="px-2 py-px rounded-lg bg-surface-muted text-body-sm text-ink shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
                  {detailChip}
                </div>
              </div>
            }
            avatarClassName="h-12 w-12"
            nameClassName="text-heading-sm"
            detailsClassName="mt-1.5"
            className="pt-1"
          />

          {activeComponent === "Preaching" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-muted shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-ink" />
                </div>
                <p className="text-body font-semibold text-ink">
                  {`${verseLabel}${verseVersionLabel}`}
                </p>
              </div>
              <p className="text-body text-muted leading-relaxed">
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
                  <div className="h-8 w-8 rounded-full bg-surface-muted shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-body-sm font-semibold text-ink shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-body-sm text-muted leading-relaxed">
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
      className={`clips h-full overflow-y-auto overscroll-y-contain flex flex-col snap-y snap-mandatory scroll-smooth ${
        compact ? "pr-1 pb-4" : ""
      }`}
    >
      {loading && (
        <div className="h-full min-h-[40vh] flex items-center justify-center text-body-sm text-muted">
          Loading media...
        </div>
      )}

      {!loading && mediaError && (
        <div className="h-full min-h-[40vh] flex items-center justify-center text-center text-body-sm text-danger px-8">
          {mediaError}
        </div>
      )}

      {!loading && !mediaError && activeItems.length === 0 && (
        <div className="h-full min-h-[40vh] flex items-center justify-center text-body-sm text-muted">
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
              compact
                ? "min-h-full flex-col justify-center"
                : "min-h-full flex-row"
            }`}
            onMouseEnter={() => setActiveClipId(clip.id)}
          >
            <div
              className={`relative ${
                compact
                  ? "h-[58dvh] w-full sm:h-[64dvh]"
                  : "h-full w-full lg:w-[80%]"
              }`}
            >
              <img
                src={clip.publicUrl}
                alt={clip.caption || event?.title || "Event picture"}
                className="object-cover rounded-[34px] lg:rounded-3xl h-full w-full"
                loading="eager"
              />
              <div className="absolute left-4 top-4 rounded-full bg-surface-elevated px-3 py-1 text-caption font-semibold text-ink">
                {clip.component}
              </div>
            </div>
            {renderClipActions(clip.id, compact)}
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
              compact
                ? "min-h-full flex-col justify-center"
                : "min-h-full flex-row"
            }`}
            onMouseEnter={() => setActiveClipId(clip.id)}
          >
            <div
              className={`relative rounded-[34px] lg:rounded-3xl overflow-hidden bg-black ${
                compact
                  ? "h-[58dvh] w-full sm:h-[64dvh]"
                  : "h-full w-full lg:w-[80%]"
              }`}
            >
              <div className="absolute left-4 top-4 z-20 rounded-full bg-surface-elevated px-3 py-1 text-caption font-semibold text-ink">
                {clip.component}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted((prev) => !prev);
                }}
                className="absolute top-4 right-4 z-20 rounded-full bg-surface-elevated px-3 py-1 text-caption font-semibold text-ink flex items-center gap-1.5 border border-subtle"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-ink" />
                ) : (
                  <Volume2 className="h-4 w-4 text-ink" />
                )}
                <span>{isMuted ? "Muted" : "Sound"}</span>
              </button>
              <video
                ref={(element) => registerVideoRef(clip.id, element)}
                src={clip.publicUrl}
                className="h-full w-full object-cover video-progress-only"
                playsInline
                muted={isMuted}
                autoPlay={activeMedia === "video" && clip.id === activeClipId}
                controls
                controlsList="nofullscreen nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                preload="auto"
                onClick={(e) => {
                  e.stopPropagation();
                  void toggleVideoPlayback(clip.id);
                }}
                onPlay={() => {
                  pauseAllVideos(clip.id);
                  setActiveClipId(clip.id);
                }}
                onLoadedData={(event) => {
                  if (!autoPlayRequestedRef.current) {
                    return;
                  }
                  if (activeMedia !== "video") {
                    return;
                  }
                  const firstClipId = activeItems[0]?.id ?? null;
                  if (clip.id !== firstClipId && clip.id !== activeClipId) {
                    return;
                  }
                  const video = event.currentTarget;
                  pauseAllVideos(clip.id);
                  void video.play().catch(() => null);
                  showClipIndicator(clip.id, "play");
                  setActiveClipId(clip.id);
                  setAutoPlayRequested(false);
                }}
                onStalled={(event) => {
                  const video = event.currentTarget;
                  if (!video.paused) {
                    void video.play().catch(() => null);
                  }
                }}
              />
              <div
                className={`clip-pause-indicator ${
                  clipIndicator?.clipId === clip.id ? "visible" : ""
                }`}
              >
                <div className="clip-pause-indicator__wrapper">
                  {clipIndicator?.action === "pause" ? (
                    <Pause className="clip-pause-indicator__icon" />
                  ) : (
                    <Play className="clip-pause-indicator__icon" />
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute left-5 right-5 bottom-8 text-inverse pointer-events-none">
                <p className="text-heading-xs font-medium">
                  {clip.caption || event?.title || "Event video"}
                </p>
                <div className="flex gap-2 text-body-sm text-inverse opacity-90">
                  {clip.tags.map((tag) => (
                    <span key={`${clip.id}-${tag}`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            {renderClipActions(clip.id, compact)}
          </div>
        ))}
    </div>
  );

  return (
    <div
      className={`modal fixed z-[140] top-0 left-0 h-screen w-screen bg-[rgba(0,0,0,.7)] flex items-center justify-center transition-opacity ease-out duration-500 ${
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
          <ChevronDown className="h-5 w-5 text-ink rotate-180" />
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
          <ChevronDown className="h-5 w-5 text-ink" />
        </button>
      </div>

      {/* Modal Wrapper */}
      <div
        className={`h-[100dvh] w-screen lg:h-[90vh] lg:w-[70vw] bg-surface rounded-none lg:rounded-[50px] relative flex flex-col overflow-hidden transition-transform ease-out duration-500 ${
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
          <X className="h-5 w-5 text-ink" />
        </button>

        <div className="lg:hidden sticky top-0 z-20 bg-surface-elevated backdrop-blur-sm border-b border-subtle px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading-md font-semibold text-ink truncate">
              {event?.themeTopic ?? event?.title ?? "Event"}
            </h2>
            <button
              type="button"
              className="icon-wrapper"
              onClick={onClose}
              aria-label="Close event modal"
            >
              <X className="h-5 w-5 text-ink" />
            </button>
          </div>

          <div className="mt-2">
            <div className="w-full flex items-center justify-between gap-2">
              {renderPaneSwitch()}

              {mobilePane === "clips" && renderMediaSwitch(true)}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full overflow-hidden px-4 pb-4 pt-4 lg:px-10 lg:py-4">
          <div className="hidden lg:flex h-full w-full overflow-hidden">
            <div className="lg:w-[50%] min-w-0 h-full py-[2.5%] px-4">
              {renderDetailsPanel(true)}
            </div>
            <div className="relative flex-1 h-full min-h-0">
              {renderClipsPane(desktopClipsRef, false)}
            </div>
          </div>

          <div className="lg:hidden h-full min-h-0">
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
