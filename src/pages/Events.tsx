import React from "react";
import EventCard from "../components/EventCard";
import EventsModal from "../components/EventsModal";
import ShortCard from "../components/ShortCard";
import LeaderDropdown from "../components/LeaderDropdown";
import { Calendar, Flame, Search } from "lucide-react";

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
const EVENTS_REVEAL_STEP = 5;

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
  { id: "family-page", label: "Family", path: "/family" },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

const Events: React.FC = () => {
  const [modalShown, setModalShown] = React.useState(false);
  const [feedTypeIndex, setFeedTypeIndex] = React.useState(0);
  const [visibleEventCount, setVisibleEventCount] =
    React.useState(EVENTS_REVEAL_STEP);

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

  /* ---------------- SEARCH + FILTER STATE ---------------- */

  const [searchQuery, setSearchQuery] = React.useState("");
  const [leaderFilter, setLeaderFilter] = React.useState("All");
  const [eventTypeFilter, setEventTypeFilter] = React.useState("All");
  const [dateFilter, setDateFilter] = React.useState("");

  /* ---------------- FETCH DATA ---------------- */

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
    setVisibleEventCount(EVENTS_REVEAL_STEP);
  }, [activeFeedType]);

  /* ---------------- DERIVED FILTER DATA ---------------- */

  const allLeaders = React.useMemo(() => {
    const names = new Set<string>();

    events.forEach((event) => {
      event.serviceLeaders.forEach((l) => names.add(l.name));
      if (event.presenterName) names.add(event.presenterName);
    });

    return ["All", ...Array.from(names)];
  }, [events]);

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      const query = searchQuery.toLowerCase();

      const leaders = [
        ...event.serviceLeaders.map((l) => l.name),
        event.presenterName,
      ];

      const leaderMatch =
        leaderFilter === "All" || leaders.includes(leaderFilter);

      const typeMatch =
        eventTypeFilter === "All" || activeFeedType === eventTypeFilter;

      const textMatch =
        event.themeTopic.toLowerCase().includes(query) ||
        leaders.join(" ").toLowerCase().includes(query);

      const dateMatch =
        !dateFilter || new Date(event.eventDate) >= new Date(dateFilter);

      return leaderMatch && typeMatch && textMatch && dateMatch;
    });
  }, [
    events,
    searchQuery,
    leaderFilter,
    eventTypeFilter,
    dateFilter,
    activeFeedType,
  ]);

  const visibleEvents = filteredEvents.slice(0, visibleEventCount);

  const canToggleVisibleEvents = filteredEvents.length > EVENTS_REVEAL_STEP;
  const showingAllVisibleEvents = visibleEventCount >= filteredEvents.length;

  /* ---------------- MODAL ---------------- */

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

  /* ---------------- PAGE ---------------- */

  return (
    <div className="w-full overflow-x-hidden">
      {/* MAIN NAVIGATION */}
      <Navbar navPages={eventPageNavPages} />

      <div className="w-full flex flex-col items-center pt-[10%] text-ink">
        {/* SEARCH + FILTER BAR */}
        <div className="events-search-wrapper">
          {/* SEARCH INPUT */}

          <div className="events-search-input">
            <span className="events-search-icon text-heading-xs">
              <Search className="h-4 w-4 text-ink" />
            </span>

            <input
              type="text"
              placeholder="Search events or leaders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-body-sm text-ink"
            />
          </div>

          {/* FILTER ROW */}

          <div className="events-filter-row">
            {/* LEADER FILTER */}

            <LeaderDropdown
              leaders={allLeaders}
              value={leaderFilter}
              onChange={setLeaderFilter}
            />

            {/* EVENT TYPE PILLS */}

            <div className="events-type-wrapper">
              {feedTypes.map((btn, i) => (
                <button
                  key={btn}
                  className={`events-type-pill text-body-sm ${
                    i === feedTypeIndex ? "active" : ""
                  }`}
                  onClick={() => setFeedTypeIndex(i)}
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* DATE FILTER */}

            <label className="events-date-filter">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span className="text-heading-xs">
                <Calendar className="h-4 w-4 text-ink" />
              </span>
            </label>
          </div>
        </div>

        {/* EVENTS LIST */}
        <section
          id="events-section"
          className="flex flex-col gap-16 p-4 w-full max-w-325 sm:gap-12"
        >
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} onOpen={openEventModal} />
          ))}

          {canToggleVisibleEvents && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleEventCount((prev) =>
                    prev >= filteredEvents.length
                      ? EVENTS_REVEAL_STEP
                      : Math.min(
                          prev + EVENTS_REVEAL_STEP,
                          filteredEvents.length,
                        ),
                  )
                }
                className="rounded-[30px] border-[1.5px] border-strong px-5 py-2 font-medium text-body-sm text-ink hover:bg-contrast hover:text-inverse"
              >
                {showingAllVisibleEvents ? "Hide" : "Show More"}
              </button>
            </div>
          )}

          {/* EVENT DETAILS MODAL */}
          <EventsModal
            show={modalShown}
            event={selectedEvent}
            media={selectedMedia}
            loading={mediaLoading}
            mediaError={mediaError}
            onClose={() => setModalShown(false)}
          />
        </section>

        {/* SHORTS GRID */}
        <section id="shorts-section" className="p-4 pt-8 w-full max-w-325">
          <div className="w-full h-px bg-[color:var(--border)]" />
          <div className="flex justify-center items-center gap-4 py-8">
            <Flame className="h-6 w-6 text-ink" />
            <h2 className="text-heading-xl font-bold">
              Latest Shorts From Media
            </h2>
          </div>

          <div className="flex justify-center flex-wrap sm:gap-10 gap-16 py-8 pb-12">
            {shorts.map((short) => (
              <ShortCard key={short.id} short={short} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Events;
