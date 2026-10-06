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
    <div className="flex w-full flex-col items-stretch overflow-hidden rounded-[32px] border border-subtle bg-surface-muted shadow-[0_18px_42px_rgba(0,0,0,0.12)] lg:flex-row lg:items-center lg:gap-8 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none">
      {/* EVENT MEDIA STACK */}
      <button
        type="button"
        className="relative h-[38vh] min-h-[240px] w-full shrink-0 text-left lg:h-[50vh] lg:w-100"
        onClick={() => onOpen(event)}
      >
        <div className="stacked-imgs flex h-full w-full flex-col items-center lg:h-[50vh] lg:w-100">
          {stackImages.map((img, i) => (
            <img
              key={`${event.id}-cover-${i}`}
              src={img}
              alt={event.title}
              className="absolute left-0 top-0 h-full w-full max-w-full rounded-t-[32px] object-cover lg:rounded-[40px]"
            />
          ))}
        </div>

        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-t-[32px] bg-[rgba(0,0,0,.3)] opacity-0 duration-500 hover:opacity-100 lg:rounded-[40px]">
          <Play className="h-10 w-10 text-inverse" />
        </div>
      </button>

      {/* EVENT DETAILS PANEL */}
      <div className="flex min-h-[220px] w-full min-w-0 flex-1 flex-col gap-4 border-t border-subtle p-5 sm:p-6 lg:h-[50vh] lg:w-[60vw] lg:rounded-[40px] lg:border-0 lg:bg-surface-muted">
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
