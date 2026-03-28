import React from "react";
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

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => {
        setPreviousIndex(prev);
        return weekSlides.length ? (prev + 1) % weekSlides.length : 0;
      });
    }, 5200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-10 w-full max-w-300 px-6 pb-24">
        <div className="week-slider relative h-[90vh] w-full overflow-hidden rounded-[36px] border border-subtle shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <div className="week-halo"></div>

          <div className="week-rail">
            {weekSlides.map((slide, index) => (
              <div
                key={slide.day}
                className={`week-rail-item ${
                  activeIndex === index ? "week-rail-item--active" : ""
                }`}
              >
                <span className="week-rail-dot"></span>
                <span>{slide.day}</span>
              </div>
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
                      <span
                        key={`${slide.day}-${item}`}
                        className="week-slide__tag"
                      >
                        {item}
                      </span>
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
