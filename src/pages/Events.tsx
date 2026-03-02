import React from "react";
import EventCard from "../components/EventCard";
import EventsModal from "../components/EventsModal";
import ShortCard from "../components/ShortCard";
import fire from "../assets/icons/fire.svg";

import { fetchEventMedia, fetchEvents } from "../services/events";
import { fetchShorts } from "../services/shorts";
import type {
  EventItem,
  EventMedia,
  FeedType,
  ShortItem,
} from "../types/domain";
import Navbar from "../components/Navbar";
import type { NavPage } from "../types/nav";
import useStore from "../store";

const feedTypes: FeedType[] = ["Services", "Revivals", "Specials"];
const eventPageNavPages: NavPage[] = [
  { id: "home-page", label: "Home", path: "/" },
  {
    id: "events-page",
    label: "Events",
    path: "/events",
    sections: [
      { id: "Events", label: "Events", sectionId: "events-section" },
      { id: "Shorts", label: "Shorts", sectionId: "shorts-section" },
    ],
  },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

const Events: React.FC = () => {
  const [modalShown, setModalShown] = React.useState(false);
  const [feedTypeIndex, setFeedTypeIndex] = React.useState(0);
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = React.useState(true);
  const [eventsError, setEventsError] = React.useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = React.useState<EventItem | null>(
    null,
  );
  const [selectedMedia, setSelectedMedia] = React.useState<EventMedia[]>([]);
  const [mediaLoading, setMediaLoading] = React.useState(false);
  const [mediaError, setMediaError] = React.useState<string | null>(null);

  const [shorts, setShorts] = React.useState<ShortItem[]>([]);
  const [shortsLoading, setShortsLoading] = React.useState(true);
  const [shortsError, setShortsError] = React.useState<string | null>(null);
  const setCurrSection = useStore((state) => state.setCurrSection);

  const activeFeedType = feedTypes[feedTypeIndex];

  const loadEvents = React.useCallback(async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      const data = await fetchEvents(activeFeedType);
      setEvents(data);
    } catch (error) {
      setEventsError(getErrorMessage(error));
    } finally {
      setEventsLoading(false);
    }
  }, [activeFeedType]);

  const loadShorts = React.useCallback(async () => {
    try {
      setShortsLoading(true);
      setShortsError(null);
      const data = await fetchShorts(8);
      setShorts(data);
    } catch (error) {
      setShortsError(getErrorMessage(error));
    } finally {
      setShortsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  React.useEffect(() => {
    void loadShorts();
  }, [loadShorts]);

  React.useEffect(() => {
    const currentPageSections =
      eventPageNavPages.find((page) => page.path === "/events")?.sections ?? [];

    const sections = currentPageSections
      .map((item) => {
        const element = document.getElementById(item.sectionId);
        return element ? { id: item.id, element } : null;
      })
      .filter(
        (
          entry,
        ): entry is {
          id: string;
          element: HTMLElement;
        } => entry !== null,
      );

    if (!sections.length) {
      return;
    }

    const activationRatio = 0.16;

    const updateCurrSection = () => {
      const activationLine = window.innerHeight * activationRatio;
      let activeSection = sections[0].id;

      sections.forEach(({ id, element }) => {
        const rect = element.getBoundingClientRect();

        if (rect.top <= activationLine) {
          activeSection = id;
        }
      });

      setCurrSection(activeSection);
    };

    updateCurrSection();
    window.addEventListener("scroll", updateCurrSection, { passive: true });
    window.addEventListener("resize", updateCurrSection);

    return () => {
      window.removeEventListener("scroll", updateCurrSection);
      window.removeEventListener("resize", updateCurrSection);
    };
  }, [setCurrSection, events.length, shorts.length]);

  const openEventModal = React.useCallback(async (event: EventItem) => {
    setSelectedEvent(event);
    setSelectedMedia(event.media);
    setMediaError(null);
    setModalShown(true);

    try {
      setMediaLoading(true);
      const media = await fetchEventMedia(event.id);
      setSelectedMedia(media);
    } catch (error) {
      setMediaError(getErrorMessage(error));
    } finally {
      setMediaLoading(false);
    }
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <Navbar navPages={eventPageNavPages} />
      <div className="w-full flex flex-col items-center pt-[10%]">
        <div className="flex p-1 my-4 mb-12 gap-4 rounded-[30px] flex-wrap justify-center">
          {feedTypes.map((btn, i) => (
            <button
              key={btn}
              className={`${i === feedTypeIndex ? "bg-black text-white" : ""} rounded-[30px] p-1 px-4 border-[1.5px] border-black text-black cursor-pointer duration-500`}
              onClick={() => setFeedTypeIndex(i)}
            >
              {btn}
            </button>
          ))}
        </div>

        <section
          id="events-section"
          className="flex flex-col gap-12 p-4 w-full max-w-325"
        >
          {eventsLoading && (
            <div className="rounded-[30px] bg-[rgb(240,240,240)] p-6 text-[#444]">
              Loading events...
            </div>
          )}

          {!eventsLoading && eventsError && (
            <div className="rounded-[30px] border border-[#f5c2c2] bg-[#fff6f6] p-6 text-[#B91C1C]">
              <p>{eventsError}</p>
              <button
                className="mt-3 rounded-[20px] border border-[#B91C1C] px-3 py-1 cursor-pointer"
                onClick={() => void loadEvents()}
              >
                Retry
              </button>
            </div>
          )}

          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="rounded-[30px] bg-[rgb(240,240,240)] p-6 text-[#444]">
              No published events found in the {activeFeedType} feed.
            </div>
          )}

          {!eventsLoading &&
            !eventsError &&
            events.map((event) => (
              <EventCard key={event.id} event={event} onOpen={openEventModal} />
            ))}

          <EventsModal
            show={modalShown}
            event={selectedEvent}
            media={selectedMedia}
            loading={mediaLoading}
            mediaError={mediaError}
            onClose={() => setModalShown(false)}
          />
        </section>

        <section id="shorts-section" className="p-4 pt-8 w-full max-w-325">
          <div className="w-full h-px bg-[#DDD]"></div>
          <div className="flex justify-center items-center gap-4 py-8">
            <img src={fire} alt="" className="icon-dk scale-150" />
            <h2 className="text-4xl font-bold">Latest Shorts From Media</h2>
          </div>

          {shortsLoading && <p className="text-[#555]">Loading shorts...</p>}

          {!shortsLoading && shortsError && (
            <div className="rounded-[20px] border border-[#f5c2c2] bg-[#fff6f6] p-4 text-[#B91C1C]">
              <p>{shortsError}</p>
              <button
                className="mt-3 rounded-[20px] border border-[#B91C1C] px-3 py-1 cursor-pointer"
                onClick={() => void loadShorts()}
              >
                Retry
              </button>
            </div>
          )}

          {!shortsLoading && !shortsError && (
            <div className="flex justify-center flex-wrap sm:gap-10 gap-16 py-8 pb-12">
              {shorts.map((short) => (
                <ShortCard key={short.id} short={short} />
              ))}
            </div>
          )}

          {!shortsLoading && !shortsError && shorts.length === 0 && (
            <p className="text-[#555] pb-10">No published shorts yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Events;
