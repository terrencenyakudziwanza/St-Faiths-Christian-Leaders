import React from "react";
import type { EventItem } from "../types/domain";
import { formatLongDate } from "../utils/date";
import { Play } from "lucide-react";

import fallbackImg from "../assets/images/hand-writing.jpg";
import fallbackProfile from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";

interface EventsCardProps {
  event: EventItem;
  onOpen: (event: EventItem) => void;
}

const EventCard: React.FC<EventsCardProps> = ({ event, onOpen }) => {
  const orderedMedia = [...event.media].sort((a, b) => a.sortOrder - b.sortOrder);
  const imageUrls = orderedMedia
    .filter((item) => item.mediaType === "picture")
    .slice(0, 3)
    .map((item) => item.publicUrl);

  const stackImages = imageUrls.length ? imageUrls : [fallbackImg];
  const leaders = event.serviceLeaders.length
    ? event.serviceLeaders
    : [
        {
          component: "Preaching" as const,
          name: event.presenterName,
          roleLabel: event.presenterRole,
          avatarPath: event.presenterAvatarPath,
          avatarUrl: event.presenterAvatarUrl,
        },
      ];

  const preacher = leaders.find((leader) => leader.component === "Preaching") ?? leaders[0];
  const totalLeaders = leaders.length;
  const visibleLeaders = leaders.slice(0, 2);
  const remainingLeaderCount = Math.max(totalLeaders - visibleLeaders.length, 0);
  const othersLedCount = Math.max(totalLeaders - 1, 0);
  const subtitle =
    othersLedCount > 0
      ? `${preacher.name} +${othersLedCount} others led`
      : `${preacher.name} led`;

  return (
    <div className="flex items-center w-full gap-8 flex-col lg:flex-row">
      {/* EVENT MEDIA STACK */}
      <button
        type="button"
        className="relative h-[50vh] w-[80%] sm:w-[60%] lg:w-100 shrink-0 text-left"
        onClick={() => onOpen(event)}
      >
        <div className="stacked-imgs flex items-center flex-col h-[50vh] lg:w-100">
          {stackImages.map((img, i) => (
            <img
              key={`${event.id}-cover-${i}`}
              src={img}
              alt={event.title}
              className="rounded-[40px] h-full w-full max-w-[80%] sm:max-w-[60vw] left-0 top-0 object-cover absolute"
            />
          ))}
        </div>

        <div className="absolute left-0 top-0 w-full h-full bg-[rgba(0,0,0,.3)] duration-500 rounded-[40px] flex justify-center items-center opacity-0 hover:opacity-100">
          <Play className="h-10 w-10 text-inverse" />
        </div>
      </button>

      {/* EVENT DETAILS PANEL */}
      <div className="rounded-[40px] w-[60vw] h-[50vh] bg-surface-muted flex-1 min-w-0 p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row  gap-4 items-center">
            <div className="flex items-center shrink-0">
              {visibleLeaders.map((leader, index) => (
                <img
                  key={`${event.id}-${leader.component}`}
                  src={leader.avatarUrl ?? fallbackProfile}
                  className={`${index === 0 ? "" : "-ml-3"} rounded-full h-12 w-12 object-cover border-2 border-[color:var(--surface-muted)]`}
                  alt={`${leader.name} (${leader.roleLabel})`}
                />
              ))}
            {remainingLeaderCount > 0 && (
              <div className="-ml-3 rounded-full h-12 w-12 border-2 border-[color:var(--surface-muted)] bg-contrast text-inverse flex flex-col items-center justify-center">
                <span className="text-micro font-semibold leading-none">
                  +{remainingLeaderCount}
                </span>
                <span className="text-pico leading-none tracking-[0.08em] uppercase opacity-90">
                  more
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-sm text-ink font-semibold">
              {event.themeTopic}
            </h2>
            <p className="text-body-sm text-muted">{subtitle}</p>
          </div>
        </div>

        <p className="text-body text-subtle line-clamp-3">
          {event.summary}
        </p>
        <p className="text-body-sm text-subtle">
          {formatLongDate(event.eventDate)}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
