"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import img1 from "../assets/images/50044.jpg";
import img2 from "../assets/images/pexels-ivan-stecko-305645871-13438939.jpg";

gsap.registerPlugin(ScrollTrigger, SplitText);

const slides = [
  { img: img1, title: "Faith Begins With a Step" },
  { img: img2, title: "Serving Communities With Love" },
  { img: img1, title: "Gathered in Worship" },
  { img: img2, title: "Strength Through Fellowship" },
  { img: img1, title: "Moments of Reflection" },
  { img: img2, title: "Growing the Kingdom" },
  { img: img1, title: "One Week In Christian Leaders" },
];

export default function ImmersiveWeek() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const slidesDOM = gsap.utils.toArray<HTMLElement>(".immersive-slide");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${slides.length * 1200}`,
          scrub: true,
          pin: true,
        },
      });

      slidesDOM.forEach((slide, i) => {
        const img = slide.querySelector(".immersive-image") as HTMLElement;
        const title = slide.querySelector(".immersive-title") as HTMLElement;

        const direction = i % 2 === 0 ? -120 : 120;

        /* STACK ORDER */

        gsap.set(slide, {
          zIndex: i + 1,
        });

        /* SPLIT TEXT */

        const split = new SplitText(title, { type: "chars" });

        gsap.set(split.chars, {
          yPercent: 120,
        });

        /* IMAGE ENTRY */

        tl.fromTo(
          img,
          {
            yPercent: direction,
            scale: 1.15,
            filter: "blur(30px)",
          },
          {
            yPercent: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            onComplete: () => {
              /* TEXT POP ANIMATION */

              gsap.to(split.chars, {
                yPercent: 0,
                stagger: 0.03,
                duration: 0.7,
                ease: "power3.out",
              });
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-surface-soft"
    >
      {/* INTRO TEXT */}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-auto max-w-[620px] text-center">
          <p className="text-overline font-semibold text-accent">
            Christian Leaders Board
          </p>

          <h1 className="mt-4 text-display font-semibold leading-[0.95] text-ink">
            One Week In Christian Leaders
          </h1>

          <p className="mx-auto mt-5 max-w-[520px] text-body text-muted leading-7">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui
            doloremque dolorum quaerat magni earum neque quam blanditiis vel
            quos nisi repellat reiciendis.
          </p>
        </div>
      </div>

      {/* SLIDES */}

      {slides.map((slide, i) => (
        <div
          key={i}
          className="immersive-slide absolute inset-0 flex items-center justify-center"
        >
          {/* IMAGE */}

          <img
            src={slide.img}
            className="immersive-image absolute inset-0 h-full w-full object-cover"
          />

          {/* DARK OVERLAY */}

          <div className="absolute inset-0 bg-black/30" />

          {/* TEXT */}

          <div className="relative z-10 max-w-[900px] px-8 text-center overflow-hidden">
            <h2 className="immersive-title text-display font-semibold text-inverse">
              {slide.title}
            </h2>
          </div>
        </div>
      ))}
    </section>
  );
}
