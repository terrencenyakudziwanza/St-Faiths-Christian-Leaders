import React from "react";
import EventCard from "../components/EventCard";
import EventsModal from "../components/EventsModal";
import LeaderDropdown from "../components/LeaderDropdown";
import { Calendar, Search } from "lucide-react";
import fallbackHighlight from "../assets/images/hand-writing.jpg";

import { fetchEventMedia, fetchEvents } from "../services/events";
import type {
  EventItem,
  EventMedia,
  FeedType,
} from "../types/domain";

import Navbar from "../components/Navbar";
import type { NavPage } from "../types/nav";
import useStore from "../store";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const feedTypes: FeedType[] = ["Services", "Revivals", "Specials"];
const EVENTS_REVEAL_STEP = 5;

const eventPageNavPages: NavPage[] = [
  {
    id: "home-page",
    label: "Home",
    path: "/",
    sections: [
      { id: "Home", label: "Home", sectionId: "home-section" },
      { id: "Focus", label: "Focus", sectionId: "focus-section" },
      { id: "Week", label: "Week", sectionId: "week-section" },
      { id: "Gallery", label: "Gallery", sectionId: "gallery-section" },
      { id: "Testimonials", label: "Testimonials", sectionId: "testimonials-section" },
    ],
  },
  {
    id: "events-page",
    label: "Events",
    path: "/events",
    sections: [
      { id: "Events", label: "Events", sectionId: "events-section" },
      { id: "Highlights", label: "Highlights", sectionId: "highlights-section" },
    ],
  },
  {
    id: "family-page",
    label: "Family",
    path: "/family",
    sections: [
      { id: "PatronMatron", label: "Patron & Matron", sectionId: "family-patron-matron-section" },
      { id: "Board", label: "Board", sectionId: "family-board-section" },
    ],
  },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

type HighlightMoment = { event: EventItem; media: EventMedia; activity: string; label?: string };
const highlightActivities = ["Praise and Worship", "Intercession", "Bible Study", "Preaching"];
const activityForMedia = (media: EventMedia): string => {
  const text = `${media.component} ${media.caption} ${media.tags.join(" ")}`.toLowerCase();
  if (/praise|worship|choir/.test(text)) return "Praise and Worship";
  if (/intercession|prayer/.test(text)) return "Intercession";
  if (/preach|sermon|message/.test(text)) return "Preaching";
  return "Bible Study";
};

const HighlightCard: React.FC<{ moment: HighlightMoment; featured?: boolean; onOpen: () => void }> = ({ moment, featured = false, onOpen }) => (
  <button type="button" onClick={onOpen} className={`highlight-moment group relative block w-full overflow-hidden rounded-[28px] border border-subtle bg-surface-elevated text-left shadow-[0_16px_44px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(0,0,0,0.16)] ${featured ? "min-h-[420px] md:row-span-2 md:min-h-[496px]" : "min-h-[240px]"}`}>
    {moment.media.mediaType === "video" ? <video src={moment.media.publicUrl} poster={moment.event.presenterAvatarUrl ?? undefined} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" muted playsInline preload="metadata" /> : <img src={moment.media.publicUrl || fallbackHighlight} alt={moment.media.caption || moment.event.themeTopic} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />}
    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
    <span className="absolute left-4 top-4 rounded-full border border-white/35 bg-black/30 px-3 py-1.5 text-body-xs text-white backdrop-blur-sm">{moment.activity}</span>
    <span className="absolute inset-x-5 bottom-5 text-white"><span className="block text-heading-sm font-semibold">{moment.label || moment.media.caption || moment.event.themeTopic}</span><span className="mt-1 block text-body-xs text-white/80">{moment.event.title} · {moment.event.presenterName}</span><span className="mt-1 block text-body-xs text-white/70">{new Date(moment.event.eventDate).toLocaleDateString()}</span></span>
    {moment.media.mediaType === "video" && <span aria-hidden="true" className="absolute right-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/35 text-white">▶</span>}
  </button>
);

const Events: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [initialMediaId, setInitialMediaId] = React.useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = React.useState(false);
  const [mediaError, setMediaError] = React.useState<string | null>(null);

  const [highlightEvents, setHighlightEvents] = React.useState<EventItem[]>([]);
  const [configuredHighlights, setConfiguredHighlights] = React.useState<HighlightMoment[] | null>(null);
  const [upcomingEvents, setUpcomingEvents] = React.useState<EventItem[]>([]);
  const highlightsRef = React.useRef<HTMLElement | null>(null);
  const [activityFilter, setActivityFilter] = React.useState(() => new URLSearchParams(window.location.search).get("activity") ?? "All");

  const setCurrSection = useStore((state) => state.setCurrSection);

  const activeFeedType = feedTypes[feedTypeIndex];

  /* ---------------- SEARCH + FILTER STATE ---------------- */

  const [searchQuery, setSearchQuery] = React.useState("");
  const [leaderFilter, setLeaderFilter] = React.useState("All");
  const [eventTypeFilter] = React.useState("All");
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

  const loadHighlightEvents = React.useCallback(async () => {
    try {
      const groups = await Promise.all(feedTypes.map((type) => fetchEvents(type)));
      const allEvents = groups.flat();
      setHighlightEvents(groups[feedTypes.indexOf("Specials")] ?? []);
      const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
      setUpcomingEvents(allEvents.filter((event) => new Date(event.eventDate) >= startOfToday).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()));
      const { data } = await supabase.from("cms_content").select("content").eq("section_key", "site.highlights").eq("is_published", true).maybeSingle();
      const content = data?.content as { items?: { eventId: string; mediaId: string; activity: string; label: string }[] } | undefined;
      if (Array.isArray(content?.items)) {
        const moments = content.items.flatMap((entry) => {
          const event = allEvents.find((item) => item.id === entry.eventId);
          const media = event?.media.find((item) => item.id === entry.mediaId);
          return event && media ? [{ event, media, activity: entry.activity, label: entry.label }] : [];
        });
        setConfiguredHighlights(moments);
      }
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }, []);

  React.useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  React.useEffect(() => {
    void loadHighlightEvents();
  }, [loadHighlightEvents]);

  React.useEffect(() => {
    const requested = new URLSearchParams(location.search).get("activity") ?? "All";
    setActivityFilter(highlightActivities.includes(requested) ? requested : "All");
  }, [location.search]);

  React.useEffect(() => {
    const section = highlightsRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add("highlights-visible");
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    setCurrSection("Events");
  }, [setCurrSection]);

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

      const searchableText = [event.title, event.themeTopic, event.summary, leaders.join(" "), event.serviceLeaders.map((leader) => leader.component).join(" "), event.praiseHighlights.join(" "), event.intercessionPrayerPoints.join(" ")].join(" ").toLowerCase();
      const textMatch = searchableText.includes(query);

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

  const highlightMoments = React.useMemo(() => {
    if (configuredHighlights) return configuredHighlights;
    const ordered = highlightEvents.map((event) => [...event.media].sort((a, b) => a.sortOrder - b.sortOrder));
    const moments: HighlightMoment[] = [];
    for (let index = 0; moments.length < 6 && ordered.some((media) => media[index]); index += 1) {
      ordered.forEach((media, eventIndex) => {
        const item = media[index];
        const event = highlightEvents[eventIndex];
        if (item && event) moments.push({ event, media: item, activity: activityForMedia(item) });
      });
    }
    return moments.slice(0, 6);
  }, [configuredHighlights, highlightEvents]);
  const filteredHighlights = activityFilter === "All" ? highlightMoments : highlightMoments.filter((moment) => moment.activity === activityFilter);
  const selectActivity = (activity: string) => {
    setActivityFilter(activity);
    navigate({ pathname: "/events", search: activity === "All" ? "" : `?activity=${encodeURIComponent(activity)}`, hash: "#highlights-section" }, { replace: true });
  };

  const canToggleVisibleEvents = filteredEvents.length > EVENTS_REVEAL_STEP;
  const showingAllVisibleEvents = visibleEventCount >= filteredEvents.length;

  /* ---------------- MODAL ---------------- */

  const openEventModal = React.useCallback(async (event: EventItem, preferredMediaId: string | null = null) => {
    setSelectedEvent(event);
    setSelectedMedia(event.media);
    setInitialMediaId(preferredMediaId);
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

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get("event");
    if (!slug) return;
    let cancelled = false;
    void Promise.all(feedTypes.map((feedType) => fetchEvents(feedType))).then((groups) => {
      if (cancelled) return;
      const sharedEvent = groups.flat().find((item) => item.slug === slug);
      if (sharedEvent) void openEventModal(sharedEvent, params.get("media"));
    }).catch((error) => console.error(getErrorMessage(error)));
    return () => { cancelled = true; };
  }, [location.search, openEventModal]);

  const closeEventModal = React.useCallback(() => {
    setModalShown(false);
    setInitialMediaId(null);
    const params = new URLSearchParams(location.search);
    params.delete("event");
    params.delete("media");
    navigate({ pathname: location.pathname, search: params.size ? `?${params.toString()}` : "", hash: location.hash }, { replace: true });
  }, [location.hash, location.pathname, location.search, navigate]);

  /* ---------------- PAGE ---------------- */

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 events-backdrop"></div>
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

        {upcomingEvents.length > 0 && <section className="w-full max-w-325 px-4 pt-8" aria-labelledby="upcoming-events-title">
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-overline font-semibold text-accent">Mark your calendar</p><h2 id="upcoming-events-title" className="mt-1 text-heading-lg font-semibold text-ink">Upcoming Events</h2></div><span className="rounded-full border border-subtle bg-surface-elevated px-3 py-1 text-body-xs text-muted">{upcomingEvents.length} scheduled</span></div>
          <div className="grid gap-4 md:grid-cols-2">{upcomingEvents.slice(0, 4).map((event) => <button key={`upcoming-${event.id}`} type="button" onClick={() => openEventModal(event)} className="flex items-center justify-between gap-4 rounded-2xl border border-subtle bg-surface-elevated p-4 text-left shadow-sm transition hover:-translate-y-0.5"><span className="min-w-0"><span className="block truncate font-semibold text-ink">{event.title}</span><span className="mt-1 block truncate text-body-xs text-muted">{event.themeTopic}</span></span><time dateTime={event.eventDate} className="shrink-0 rounded-xl bg-accent-soft px-3 py-2 text-center text-body-sm font-semibold text-ink">{new Date(event.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time></button>)}</div>
        </section>}

        {/* EVENTS LIST */}
        <section
          id="events-section"
          className="flex flex-col gap-16 p-4 w-full max-w-325 sm:gap-12"
        >
          {eventsLoading && (
            <p className="text-center text-body-sm text-muted">Loading events...</p>
          )}

          {eventsError && (
            <p className="text-center text-body-sm text-danger">{eventsError}</p>
          )}

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
            initialMediaId={initialMediaId}
            onClose={closeEventModal}
          />
        </section>

        {/* HIGHLIGHTS GRID */}
        <section ref={highlightsRef} id="highlights-section" className="w-full max-w-325 scroll-mt-24 px-4 pb-16 pt-12">
          <div className="h-px w-full bg-[color:var(--border)]" />
          <div className="flex flex-col gap-5 py-8 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-overline font-semibold text-accent">Moments from our gatherings</p><h2 className="mt-2 text-heading-xl font-bold">Highlights</h2><p className="mt-2 text-body-sm text-muted">A few moments worth remembering.</p></div>
            <div className="flex flex-wrap gap-2" aria-label="Filter highlights by activity">{["All", ...highlightActivities].map((activity) => <button key={activity} type="button" aria-pressed={activityFilter === activity} onClick={() => selectActivity(activity)} className={`rounded-full border px-4 py-2 text-body-xs transition ${activityFilter === activity ? "border-accent bg-accent-soft text-accent" : "border-subtle bg-surface-elevated text-muted hover:text-ink"}`}>{activity}</button>)}</div>
          </div>
          {filteredHighlights.length > 0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredHighlights.slice(0, 6).map((moment, index) => <HighlightCard key={moment.media.id} moment={moment} featured={index === 0} onOpen={() => { setSelectedEvent(moment.event); setSelectedMedia(moment.event.media); setInitialMediaId(moment.media.id); setMediaError(null); setMediaLoading(false); setModalShown(true); }} />)}</div> : <div className="rounded-2xl border border-subtle bg-surface-muted p-6 text-center"><p className="font-semibold">{activityFilter === "All" ? "Event highlights are coming soon" : `No ${activityFilter} highlights yet`}</p><p className="mt-2 text-body-sm text-muted">Add event photos or videos to create a collection of memorable moments.</p></div>}
        </section>
      </div>
    </div>
  );
};

export default Events;
