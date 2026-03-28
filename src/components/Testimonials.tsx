import React, { useMemo } from "react";
import ProfileCard from "./ProfileCard";
import { fetchTestimonials } from "../services/testimonials";
import { isOffline } from "../lib/media";

interface TestimonialsState {
  id: string;
  avatar: { img: string; name: string; personalDetails: string };
  testimonial: string;
}

const avatars = {
  elderKojo: "/offline-media/presenters/elder-kojo.jpg",
  pastorJoel: "/offline-media/presenters/pastor-joel.jpg",
  sisterAma: "/offline-media/presenters/sister-ama.jpg",
} as const;

const Testimonials: React.FC = () => {
  const fallbackTestimonials = useMemo(() => {
    const testimonials: TestimonialsState[] = [
      {
        id: "fallback-1",
        avatar: {
          img: avatars.elderKojo,
          name: "Tavonga Nyamaropa",
          personalDetails: "Form 3",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.",
      },
      {
        id: "fallback-2",
        avatar: {
          img: avatars.pastorJoel,
          name: "Jeid Knoner",
          personalDetails: "Form 1",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. uidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.",
      },
      {
        id: "fallback-3",
        avatar: {
          img: avatars.sisterAma,
          name: "Ryan Zheing",
          personalDetails: "Lower Sixth",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.Lo",
      },
      {
        id: "fallback-4",
        avatar: {
          img: avatars.sisterAma,
          name: "Ryan Zheing",
          personalDetails: "Lower Sixth",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.Lo",
      },
      {
        id: "fallback-5",
        avatar: {
          img: avatars.pastorJoel,
          name: "Jeid Knoner",
          personalDetails: "Form 1",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. uidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.",
      },
      {
        id: "fallback-6",
        avatar: {
          img: avatars.pastorJoel,
          name: "Jeid Knoner",
          personalDetails: "Form 1",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. uidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.",
      },
    ];
    return testimonials;
  }, []);

  const [testimonials, setTestimonials] =
    React.useState<TestimonialsState[]>(fallbackTestimonials);

  React.useEffect(() => {
    if (isOffline) {
      return;
    }

    let isActive = true;

    fetchTestimonials()
      .then((items) => {
        if (!isActive || !items.length) {
          return;
        }

        const mapped: TestimonialsState[] = items.map((item) => ({
          id: item.id,
          avatar: {
            img: item.avatarUrl ?? avatars.elderKojo,
            name: item.name,
            personalDetails: item.profileDetails ?? "",
          },
          testimonial: item.testimonial,
        }));

        setTestimonials(mapped);
      })
      .catch(() => {
        if (isActive) {
          setTestimonials(fallbackTestimonials);
        }
      });

    return () => {
      isActive = false;
    };
  }, [fallbackTestimonials]);

  function spread(
    testimonials: TestimonialsState[],
  ): [TestimonialsState[], TestimonialsState[], TestimonialsState[]] {
    // Splits testimonials into 3 sequential columns with near-even distribution.
    const number = testimonials.length;
    const baseSet = Math.floor(number / 3);
    const remainder = number % 3;
    const columnSizes = [
      baseSet + (remainder > 0 ? 1 : 0),
      baseSet + (remainder > 1 ? 1 : 0),
      baseSet,
    ];
    const spreadedArr: [
      TestimonialsState[],
      TestimonialsState[],
      TestimonialsState[],
    ] = [[], [], []];

    let start = 0;
    columnSizes.forEach((size, index) => {
      const end = start + size;
      spreadedArr[index] = testimonials.slice(start, end);
      start = end;
    });

    return spreadedArr;
  }

  const columns = spread(testimonials);

  const scrollDirections = ["up", "down", "up"] as const;

  return (
    <section
      id="testimonials-section"
      data-nav-theme="light"
      className="relative min-h-screen w-screen bg-page p-4 md:p-8 lg:p-14 flex flex-col gap-15"
    >
      <div className="section-fade-top"></div>
      <div className="section-fade-bottom"></div>
      {/* SECTION HEADER */}
      <h2 className="relative z-10 text-heading-xl font-bold text-center text-ink">
        Testimonials
      </h2>

      {/* MARQUEE COLUMNS */}
      <div className="relative z-10 h-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-hidden">
        {columns.map((testimonialCol, i) => (
          <div
            className={`testimonial-marquee relative z-[1] ${i === 1 ? "hidden md:block" : ""} ${i === 2 ? "hidden lg:block" : ""}`}
            key={i}
          >
            <div
              className={`testimonial-marquee__track testimonial-marquee__track--${scrollDirections[i]}`}
            >
              {[...testimonialCol, ...testimonialCol].map((testimonial, j) => (
                <div
                  key={`${testimonial.id}-${j}`}
                  className="flex flex-col border border-subtle rounded-3xl p-3 gap-4 h-fit cursor-pointer bg-surface"
                >
                  <p className="text-body-sm text-muted">
                    {testimonial.testimonial}
                  </p>
                  <ProfileCard
                    imageSrc={testimonial.avatar.img}
                    imageAlt={testimonial.avatar.name}
                    name={testimonial.avatar.name}
                    details={testimonial.avatar.personalDetails}
                    className="pt-1"
                    nameClassName="text-heading-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
