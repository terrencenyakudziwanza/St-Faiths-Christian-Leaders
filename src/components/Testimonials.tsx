import React, { useMemo } from "react";

interface TestimonialsState {
  avatar: { img: string; name: string; personalDetails: string };
  testimonial: string;
}

const avatars = {
  elderKojo: "/offline-media/presenters/elder-kojo.jpg",
  pastorJoel: "/offline-media/presenters/pastor-joel.jpg",
  sisterAma: "/offline-media/presenters/sister-ama.jpg",
} as const;

const Testimonials: React.FC = () => {
  const testimonials = useMemo(() => {
    const testimonials: TestimonialsState[] = [
      {
        avatar: {
          img: avatars.elderKojo,
          name: "Tavonga Nyamaropa",
          personalDetails: "Form 3",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.",
      },
      {
        avatar: {
          img: avatars.pastorJoel,
          name: "Jeid Knoner",
          personalDetails: "Form 1",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. uidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.",
      },
      {
        avatar: {
          img: avatars.sisterAma,
          name: "Ryan Zheing",
          personalDetails: "Lower Sixth",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.Lo",
      },
      {
        avatar: {
          img: avatars.sisterAma,
          name: "Ryan Zheing",
          personalDetails: "Lower Sixth",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.Lo",
      },
      {
        avatar: {
          img: avatars.pastorJoel,
          name: "Jeid Knoner",
          personalDetails: "Form 1",
        },
        testimonial:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae commodi possimus voluptatibus minima perferendis ex quidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate. uidem natus necessitatibus at maxime itaque cupiditate autem, hic molestias, quo molestiae explicabo, saepe voluptate.",
      },
      {
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
      className="min-h-screen w-screen bg-white p-4 md:p-8 lg:p-14 flex flex-col gap-15"
    >
      <h2 className="text-4xl font-bold text-center">Testimonials</h2>
      <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative gap-6 overflow-x-hidden">
        <div
          className="absolute left-0 right-0 top-0 z-30 pointer-events-none h-[10vh]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 100%)",
          }}
        ></div>
        <div
          className="absolute left-0 right-0 bottom-0 z-30 pointer-events-none h-[10vh]"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 100%)",
          }}
        ></div>
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
                  key={`${testimonial.avatar.name}-${j}`}
                  className="flex flex-col border border-[#AAA] rounded-3xl p-3 gap-4 h-fit cursor-pointer bg-white"
                >
                  <p className="text-[14px] text-[#444]">
                    {testimonial.testimonial}
                  </p>
                  <span className="flex gap-2 pt-1 items-center">
                    <img
                      src={testimonial.avatar.img}
                      className="rounded-[50%] h-14 w-14 object-cover"
                      alt=""
                    />
                    <div className="flex flex-col">
                      <h2 className="text-xl text-black font-medium">
                        {testimonial.avatar.name}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[#555]">
                          {testimonial.avatar.personalDetails}
                        </p>
                      </div>
                    </div>
                  </span>
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
