import React from "react";

import close from "../assets/icons/close.svg";
import contract from "../assets/icons/arrows-angle-contract.svg";
import video from "../assets/icons/videocam.svg";
import pic from "../assets/icons/image-fill.svg";
import share from "../assets/icons/share.svg";
import like from "../assets/icons/empty-heart 1.svg";
import arrowDown from "../assets/icons/arrow-down.svg";
import fallbackProfile from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";

import type { EventItem, EventMedia, MediaType } from "../types/domain";
import { formatLongDate } from "../utils/date";

interface EventsModalProps {
  show: boolean;
  event: EventItem | null;
  media: EventMedia[];
  loading: boolean;
  mediaError: string | null;
  onClose: () => void;
}

const EventsModal: React.FC<EventsModalProps> = ({
  show,
  event,
  media,
  loading,
  mediaError,
  onClose,
}) => {
  const clipsRef = React.useRef<HTMLDivElement | null>(null);
  const [activeMedia, setActiveMedia] = React.useState<MediaType>("picture");
  const [isMuted, setIsMuted] = React.useState(true);

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

    if (pictureClips.length > 0) {
      setActiveMedia("picture");
      return;
    }

    if (videoClips.length > 0) {
      setActiveMedia("video");
    }
  }, [show, pictureClips.length, videoClips.length, event?.id]);

  React.useEffect(() => {
    clipsRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeMedia, event?.id]);

  const scrollToClip = (direction: "up" | "down") => {
    const clipsEl = clipsRef.current;

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

  const activeButtonClass =
    "rounded-[30px] text-white border-[1.5px] bg-[#222] border-[#222] py-1 px-3 flex items-center gap-2";
  const inactiveButtonClass =
    "rounded-[30px] border-[1.5px] border-[#222] text-[#222] bg-transparent py-1 px-3 flex items-center gap-2";

  const activeItems = activeMedia === "picture" ? pictureClips : videoClips;
  const presenterAvatar = event?.presenterAvatarUrl ?? fallbackProfile;

  return (
    <div
      className={`modal fixed z-30 top-0 left-0 h-screen w-screen bg-[rgba(0,0,0,.7)] flex items-center justify-center gap-8 transition-opacity ease-out duration-500 ${
        show
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
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

      <div
        className={`h-[90vh] w-[92vw] lg:w-[70vw] bg-white rounded-[50px] relative flex items-center justify-center transition-transform ease-out duration-500 ${
          show ? "scale-100" : "scale-75"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-[3%] left-[2%] icon-wrapper cursor-pointer">
          <img src={contract} alt="" className="icon-dk scale-110" />
        </div>
        <button
          type="button"
          className="absolute top-[3%] right-[2%] icon-wrapper cursor-pointer"
          onClick={onClose}
        >
          <img src={close} alt="" className="icon-dk scale-110" />
        </button>

        <div className="flex h-full w-full gap-8 p-8 py-10 overflow-hidden flex-col lg:flex-row">
          <div className="flex flex-col justify-between h-full lg:w-[50%] py-[2.5%] min-w-0">
            <div className="flex flex-col gap-4 min-w-0">
              <h1 className="text-3xl font-bold bg-[rgb(240,240,240)] p-2 rounded-xl break-words">
                {event?.title ?? "Select an event"}
              </h1>
              <div className="flex gap-2 flex-wrap">
                <p className="px-2 bg-[rgb(220,220,220)] rounded-[10px]">
                  {event?.feedType ?? "Event"}
                </p>
                <p className="px-2 bg-[rgb(220,220,220)] rounded-[10px]">
                  {event ? formatLongDate(event.eventDate) : "Unknown date"}
                </p>
              </div>

              <div className="flex flex-col border-[1.5px] border-[#DDD] rounded-2xl px-4 py-3 gap-4">
                <span className="flex gap-2 pt-1">
                  <img
                    src={presenterAvatar}
                    className="rounded-[50%] h-12 w-12 object-cover"
                    alt={event?.presenterName ?? "Presenter"}
                  />
                  <div className="flex flex-col">
                    <h2 className="text-xl text-black font-medium">
                      {event?.presenterName ?? "Presenter"}
                    </h2>
                    <div className="flex gap-2">
                      <p className="text-[#555]">led</p>
                      <div className="px-1 py-px rounded-lg bg-[rgb(220,220,220)]">
                        {event?.presenterRole ?? "Service"}
                      </div>
                    </div>
                  </div>
                </span>

                <p className="text-[#333] leading-relaxed">
                  {event?.summary ?? ""}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveMedia("video")}
                className={
                  activeMedia === "video"
                    ? activeButtonClass
                    : inactiveButtonClass
                }
              >
                <img
                  src={video}
                  className={
                    activeMedia === "video" ? "icon scale-70" : "icon-dk"
                  }
                  alt=""
                />
                <p>Videos ({videoClips.length})</p>
              </button>
              <button
                type="button"
                onClick={() => setActiveMedia("picture")}
                className={
                  activeMedia === "picture"
                    ? activeButtonClass
                    : inactiveButtonClass
                }
              >
                <img
                  src={pic}
                  className={
                    activeMedia === "picture" ? "icon scale-70" : "icon-dk"
                  }
                  alt=""
                />
                <p>Pictures ({pictureClips.length})</p>
              </button>
            </div>
          </div>

          <div className="relative flex-1 h-full min-h-0">
            <div
              ref={clipsRef}
              className="clips h-full overflow-y-auto flex flex-col snap-y snap-mandatory scroll-smooth"
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
                  No {activeMedia === "picture" ? "pictures" : "videos"}{" "}
                  uploaded yet.
                </div>
              )}

              {!loading &&
                !mediaError &&
                activeMedia === "picture" &&
                pictureClips.map((clip) => (
                  <div
                    key={clip.id}
                    data-clip-item
                    className="min-h-full w-full flex gap-4 items-center justify-center p-4 snap-start"
                  >
                    <img
                      src={clip.publicUrl}
                      alt={clip.caption || event?.title || "Event picture"}
                      className="object-cover rounded-[60px] h-full w-[80%]"
                      loading="eager"
                    />
                    <div className="flex flex-col gap-4">
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
                    className="min-h-full w-full flex gap-4 items-center justify-center p-4 snap-start"
                  >
                    <div className="relative h-full w-[80%] rounded-[60px] overflow-hidden bg-black">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted((prev) => !prev);
                        }}
                        className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-white/25 px-3 py-2 text-white backdrop-blur-[2px]"
                      >
                        <img src={video} alt="" className="icon-dk icon" />
                        <span className="text-xs font-medium">
                          {isMuted ? "Muted" : "Sound On"}
                        </span>
                      </button>
                      <video
                        src={clip.publicUrl}
                        className="h-full w-full object-cover"
                        playsInline
                        muted={isMuted}
                        controls
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

                    <div className="flex flex-col gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsModal;
