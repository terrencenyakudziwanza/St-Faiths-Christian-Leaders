import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import mainImage from "../assets/images/50044.jpg";
import slideOne from "../assets/images/pexels-ivan-stecko-305645871-13438939.jpg";
import slideTwo from "../assets/images/hand-writing.jpg";

type FocusItem = {
  id: string;
  title: string;
  copy: string;
  image: string;
};

type SliderSlot = {
  offset: number;
  left: string;
  scale: number;
  opacity: number;
  interactive: boolean;
  zIndex: number;
};

const focusItems: FocusItem[] = [
  {
    id: "intercession",
    title: "Intercession",
    copy: "Strategic prayer, warfare, and focused supplication for our campus.",
    image: slideOne,
  },
  {
    id: "bible-study",
    title: "Bible Study",
    copy: "Scripture discovery that forms conviction, clarity, and action.",
    image: slideTwo,
  },
  {
    id: "power",
    title: "Demonstration of Power",
    copy: "We celebrate healing and the miraculous as signs of faith.",
    image: mainImage,
  },
  {
    id: "praise",
    title: "Praise and Worship",
    copy: "Unreserved worship that keeps our hearts close to God.",
    image: slideOne,
  },
];

const sliderSlots: SliderSlot[] = [
  {
    offset: -2,
    left: "6%",
    scale: 0.84,
    opacity: 0.12,
    interactive: false,
    zIndex: 6,
  },
  {
    offset: -1,
    left: "28%",
    scale: 0.94,
    opacity: 0.6,
    interactive: true,
    zIndex: 12,
  },
  {
    offset: 0,
    left: "50%",
    scale: 1.08,
    opacity: 1,
    interactive: true,
    zIndex: 22,
  },
  {
    offset: 1,
    left: "72%",
    scale: 0.94,
    opacity: 0.6,
    interactive: true,
    zIndex: 12,
  },
  {
    offset: 2,
    left: "94%",
    scale: 0.84,
    opacity: 0.12,
    interactive: false,
    zIndex: 6,
  },
];

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

const IntercessionSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAuto, setIsAuto] = React.useState(true);
  const activeItem = focusItems[activeIndex] ?? focusItems[0];
  const activeItemRef = React.useRef(activeItem);
  const [previousItem, setPreviousItem] = React.useState<FocusItem | null>(null);

  React.useEffect(() => {
    if (!isAuto) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => wrapIndex(prev + 1, focusItems.length));
    }, 3800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuto]);

  React.useEffect(() => {
    if (activeItemRef.current.id === activeItem.id) {
      return;
    }

    setPreviousItem(activeItemRef.current);
    activeItemRef.current = activeItem;

    const timeoutId = window.setTimeout(() => {
      setPreviousItem(null);
    }, 720);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeItem]);

  const handleRotate = (direction: "prev" | "next") => {
    setActiveIndex((prev) =>
      wrapIndex(
        prev + (direction === "next" ? 1 : -1),
        focusItems.length,
      ),
    );
  };

  const sliderItems = sliderSlots.map((slot) => {
    const itemIndex = wrapIndex(activeIndex + slot.offset, focusItems.length);

    return {
      item: focusItems[itemIndex],
      itemIndex,
      slot,
    };
  });

  return (
    <section
      id="focus-section"
      data-nav-theme="light"
      className="relative w-full overflow-hidden bg-page text-ink"
    >
      <div className="section-fade-top"></div>
      <div className="section-fade-bottom"></div>
      <div className="pointer-events-none absolute inset-0 intercession-backdrop"></div>

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 pb-24 pt-20">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="text-overline font-semibold text-accent">
            Christian Leaders Focus
          </p>
          <h2 className="mt-4 text-display-sm font-semibold text-ink">
            Intercession, Study, Power, and Worship
          </h2>
          <p className="mt-4 text-body text-muted leading-relaxed">
            Christian Leaders is shaped by a rhythm of prayer that births
            transformation. We press in through intercession, grow through Bible
            study, and testify through the demonstration of power (healing and
            the miraculous). Every gathering culminates in praise and worship
            that keeps our hearts aligned with heaven.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.92fr)] lg:items-start">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[34px] border border-subtle shadow-[0_26px_70px_rgba(18,10,4,0.18)]">
              <div className="intercession-main-image">
                {previousItem ? (
                  <img
                    src={previousItem.image}
                    alt={previousItem.title}
                    className="intercession-main-image__previous"
                  />
                ) : null}
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className={`intercession-main-image__current ${
                    previousItem ? "" : "intercession-main-image__idle"
                  }`}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/10 to-transparent"></div>
            </div>

            <div className="intercession-orbit intercession-orbit--outer"></div>
            <div className="intercession-orbit intercession-orbit--inner"></div>

            <div className="intercession-slider">
              {sliderItems.map(({ item, itemIndex, slot }) => (
                <button
                  type="button"
                  key={`${item.id}-${slot.offset}`}
                  onClick={() => {
                    if (!isAuto && slot.interactive) {
                      setActiveIndex(itemIndex);
                    }
                  }}
                  className="intercession-slide"
                  style={{
                    left: slot.left,
                    top: "50%",
                    opacity: slot.opacity,
                    zIndex: slot.zIndex,
                    pointerEvents: !isAuto && slot.interactive ? "auto" : "none",
                    transform: `translate(-50%, -50%) scale(${slot.scale})`,
                  }}
                  aria-hidden={!slot.interactive}
                  tabIndex={!isAuto && slot.interactive ? 0 : -1}
                >
                  <img src={item.image} alt={item.title} />
                </button>
              ))}
            </div>

            <div className="intercession-controls">
              <button
                type="button"
                onClick={() => handleRotate("prev")}
                disabled={isAuto}
                className={`intercession-arrow ${isAuto ? "is-disabled" : ""}`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4 text-ink" />
              </button>

              <button
                type="button"
                onClick={() => setIsAuto((prev) => !prev)}
                className="intercession-toggle"
                aria-pressed={isAuto}
                aria-label="Toggle auto rotation"
              >
                <span className="intercession-toggle__label">
                  {isAuto ? "Auto Glide" : "Manual"}
                </span>
                <span
                  className={`intercession-toggle__track ${
                    isAuto ? "is-on" : "is-off"
                  }`}
                >
                  <span className="intercession-toggle__thumb"></span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRotate("next")}
                disabled={isAuto}
                className={`intercession-arrow ${isAuto ? "is-disabled" : ""}`}
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4 text-ink" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {focusItems.map((item) => (
              <div
                key={item.id}
                className={`intercession-card ${
                  item.id === activeItem.id ? "intercession-card--active" : ""
                }`}
              >
                <h3 className="text-heading-sm font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-body-sm text-muted leading-relaxed">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntercessionSection;
