import React from "react";

import imgWorship from "../assets/images/50044.jpg";
import imgGather from "../assets/images/pexels-ivan-stecko-305645871-13438939.jpg";
import imgStudy from "../assets/images/hand-writing.jpg";

type WeekSlide = {
  day: string;
  title: string;
  description: string;
  activities: string[];
  image: string;
};

const weekSlides: WeekSlide[] = [
  {
    day: "Sunday",
    title: "Main SU Service",
    description:
      "We open the week with a full service that blends prayer, praise, and the Word.",
    activities: ["Intercession", "Praise and Worship", "Preaching"],
    image: imgWorship,
  },
  {
    day: "Monday",
    title: "Intercession",
    description:
      "Focused prayer that covers our families, leaders, and the campus mission.",
    activities: ["Intercession"],
    image: imgGather,
  },
  {
    day: "Tuesday",
    title: "Intercession",
    description:
      "A steady rhythm of warfare and thanksgiving that keeps the fire burning.",
    activities: ["Intercession"],
    image: imgWorship,
  },
  {
    day: "Wednesday",
    title: "Intercession + Unending Praise",
    description:
      "Midweek we mix sustained prayer with unending praise to reset our focus.",
    activities: ["Intercession", "Praise and Worship"],
    image: imgGather,
  },
  {
    day: "Thursday",
    title: "Intercession",
    description:
      "We contend for breakthrough and alignment across every sphere of influence.",
    activities: ["Intercession"],
    image: imgWorship,
  },
  {
    day: "Friday",
    title: "SU Service",
    description:
      "A high-energy service anchored in worship and preaching to close the week.",
    activities: ["Praise and Worship", "Preaching"],
    image: imgGather,
  },
  {
    day: "Saturday",
    title: "Bible Discussion",
    description:
      "We gather in smaller circles to discuss Scripture and live it out.",
    activities: ["Bible Discussion"],
    image: imgStudy,
  },
];

const WeekInLeaders: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [previousIndex, setPreviousIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => {
        setPreviousIndex(prev);
        return (prev + 1) % weekSlides.length;
      });
    }, 5200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      id="week-section"
      data-nav-theme="light"
      className="relative w-full overflow-hidden bg-surface-soft text-ink"
    >
      <div className="section-fade-top"></div>
      <div className="section-fade-bottom"></div>
      <div className="pointer-events-none absolute inset-0 week-backdrop"></div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-20">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="text-overline font-semibold text-accent-strong">
            Weekly Rhythm
          </p>
          <h2 className="mt-4 text-display-sm font-semibold text-ink">
            A Week In Christian Leaders
          </h2>
          <p className="mt-3 text-body-sm text-muted">
            Every day carries a distinct expression of faith. Watch the week
            unfold through the rhythm of prayer, worship, and study.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1200px] px-6 pb-24">
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
