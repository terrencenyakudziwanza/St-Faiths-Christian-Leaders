import React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCmsSection } from "../hooks/useCmsSection";
import { resolveCmsMedia } from "../lib/cms";

type WeekSlide = {
  day: string;
  title: string;
  description: string;
  activities: string[];
  image: string;
};

const WeekInLeaders: React.FC = () => {
  const navigate = useNavigate();
  const weekContent = useCmsSection("home.week");
  const weekSlides: WeekSlide[] = weekContent.slides.map((slide) => ({
    day: slide.day,
    title: slide.title,
    description: slide.description,
    activities: slide.activities,
    image: resolveCmsMedia(slide.image) ?? "",
  }));

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [previousIndex, setPreviousIndex] = React.useState<number | null>(null);
  const [isAuto, setIsAuto] = React.useState(true);

  const goTo = React.useCallback((index: number) => {
    if (!weekSlides.length) return;
    setActiveIndex((current) => {
      const next = (index + weekSlides.length) % weekSlides.length;
      setPreviousIndex(current);
      return next;
    });
  }, [weekSlides.length]);

  React.useEffect(() => {
    if (!isAuto || weekSlides.length < 2) return;
    const intervalId = window.setInterval(() => goTo(activeIndex + 1), 5200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeIndex, goTo, isAuto, weekSlides.length]);

  React.useEffect(() => {
    if (!weekSlides.length) {
      return;
    }
    setActiveIndex((prev) => Math.min(prev, weekSlides.length - 1));
  }, [weekSlides.length]);

  return (
    <section
      id="week-section"
      data-nav-theme="light"
      className="relative w-full overflow-hidden bg-surface-soft text-ink"
    >
      <div className="section-fade-top"></div>
      <div className="section-fade-bottom"></div>
      <div className="pointer-events-none absolute inset-0 week-backdrop"></div>

      <div className="relative z-10 mx-auto w-full max-w-300 px-6 pt-20">
        <div className="mx-auto max-w-170 text-center">
          <p className="text-overline font-semibold text-accent-strong">
            {weekContent.overline}
          </p>
          <h2 className="mt-4 text-display-sm font-semibold text-ink">
            {weekContent.title}
          </h2>
          <p className="mt-3 text-body-sm text-muted">
            {weekContent.description}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-elevated p-1 shadow-sm">
            <button type="button" aria-label="Previous day" onClick={() => goTo(activeIndex - 1)} className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-accent-soft"><ChevronLeft size={18} /></button>
            <button type="button" aria-pressed={!isAuto} onClick={() => setIsAuto((value) => !value)} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-body-xs font-semibold text-inverse"><span>{isAuto ? <Pause size={14} /> : <Play size={14} />}</span>{isAuto ? "Pause" : "Play"}</button>
            <button type="button" aria-label="Next day" onClick={() => goTo(activeIndex + 1)} className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-accent-soft"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-10 w-full max-w-300 px-6 pb-24">
        <div className="week-slider relative h-[90vh] w-full overflow-hidden rounded-[36px] border border-subtle shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <div className="week-halo"></div>

          <div className="week-rail">
            {weekSlides.map((slide, index) => (
              <button type="button" onClick={() => goTo(index)} aria-current={activeIndex === index ? "step" : undefined}
                key={slide.day}
                className={`week-rail-item ${
                  activeIndex === index ? "week-rail-item--active" : ""
                }`}
              >
                <span className="week-rail-dot"></span>
                <span>{slide.day}</span>
              </button>
            ))}
          </div>

          {weekSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            const isPrevious = index === previousIndex;

            return (
              <article
                key={slide.day}
                className={`week-slide ${
                  isActive ? "week-slide--active" : ""
                } ${isPrevious ? "week-slide--previous" : ""}`}
              >
                <img
                  src={slide.image}
                  alt={`${slide.day} schedule`}
                  className="week-slide__image"
                />
                <div className="week-slide__overlay"></div>

                <div className="week-slide__panel">
                  <p className="text-overline text-inverse opacity-80">
                    {slide.day}
                  </p>
                  <h3 className="week-slide__heading text-inverse">
                    {slide.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-inverse opacity-80">
                    {slide.description}
                  </p>
                  <div className="week-slide__tags">
                    {slide.activities.map((item) => (
                      /intercession|prayer|praise|worship|bible|scripture|study/i.test(item) ? <button
                        key={`${slide.day}-${item}`}
                        type="button"
                        className="week-slide__tag cursor-pointer"
                        onClick={(event) => { event.stopPropagation(); const activity = /intercession|prayer/i.test(item) ? "Intercession" : /praise|worship/i.test(item) ? "Praise and Worship" : "Bible Study"; navigate(`/events?activity=${encodeURIComponent(activity)}#highlights-section`); }}
                      >
                        {item === "Bible Discussion" ? "Bible Study" : item} ↗
                      </button> : <span key={`${slide.day}-${item}`} className="week-slide__tag">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="week-slide__counter">
                  <span className="week-slide__counter-current">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="week-slide__counter-total">
                    /{String(weekSlides.length).padStart(2, "0")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeekInLeaders;
