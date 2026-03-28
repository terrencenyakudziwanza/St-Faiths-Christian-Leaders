import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCmsSection } from "../hooks/useCmsSection";
import { resolveCmsMedia } from "../lib/cms";

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

const fallbackItems: FocusItem[] = [];

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
  const focusContent = useCmsSection("home.focus");
  const focusItems: FocusItem[] = focusContent.items.map((item) => ({
    id: item.id,
    title: item.title,
    copy: item.copy,
    image: resolveCmsMedia(item.image) ?? "",
  }));
  const items = focusItems.length ? focusItems : fallbackItems;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAuto, setIsAuto] = React.useState(true);
  const activeItem = items[activeIndex] ?? items[0];
  const activeItemRef = React.useRef(activeItem);
  const [previousItem, setPreviousItem] = React.useState<FocusItem | null>(null);

  React.useEffect(() => {
    if (!isAuto) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => wrapIndex(prev + 1, items.length));
    }, 3800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuto, items.length]);

  React.useEffect(() => {
    if (!items.length) {
      return;
    }
    setActiveIndex((prev) => wrapIndex(prev, items.length));
  }, [items.length]);

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
        items.length,
      ),
    );
  };

  const sliderItems = sliderSlots.map((slot) => {
    const itemIndex = wrapIndex(activeIndex + slot.offset, items.length);

    return {
      item: items[itemIndex],
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

      <div className="relative z-10 mx-auto w-full max-w-310 px-6 pb-24 pt-20">
        <div className="mx-auto max-w-180 text-center">
          <p className="text-overline font-semibold text-accent">
            {focusContent.overline}
          </p>
          <h2 className="mt-4 text-display-sm font-semibold text-ink">
            {focusContent.title}
          </h2>
          <p className="mt-4 text-body text-muted leading-relaxed">
            {focusContent.description}
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
              <div className="absolute inset-0 bg-linear-to-tr from-black/55 via-black/10 to-transparent"></div>
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
            {items.map((item) => (
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
