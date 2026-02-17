import React, { useRef } from "react";
import Navbar from "./Navbar";
import { useGSAP } from "@gsap/react";

import { introImages } from "../data";
import gsap from "gsap";
import { CustomEase, SplitText } from "gsap/all";

const Home: React.FC = () => {
  const homeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!homeRef.current || !homeRef.current?.querySelectorAll(".introImgs"))
      return;
    const tl = gsap.timeline();

    tl.set(homeRef.current.querySelector(".hero-content"), { opacity: 0 });
    tl.to(homeRef.current.querySelector(".introImgs:first-child"), {
      scale: 1,
      duration: 1,
      ease: "power4.inOut",
    });

    homeRef.current
      .querySelectorAll(".introImgs:not(.introImgs:last-child)")
      .forEach((img) => {
        tl.to(
          img,
          { opacity: 1, scale: 1, duration: 1.25, ease: "power3.out" },
          ">-0.5",
        );
      });

    CustomEase.create(
      "hop",
      "M0,0 C0.355,0.022 0.448,0.079 0.5,0.5 0.542,0.846 0.615,1 1,1",
    );
    CustomEase.create(
      "hop2",
      "M0,0 C0.078,0.617 0.114,0.716 0.255,0.828 0.373,0.922 0.561,1 1,1",
    );

    const arr = Array.from(
      homeRef.current.querySelectorAll(".introImgs:not(.introImgs:last-child)"),
    );

    homeRef.current
      .querySelectorAll(".introImgs:not(.introImgs:last-child)")
      .forEach((_, i) => {
        tl.to(
          arr[arr.length - i],
          {
            xPercent: `${i % 2 === 0 ? "-" : ""}100%`,
            duration: 1.25,
            ease: "power3.out",
          },
          ">-0.5",
        );
      });

    const splits = Array.from(
      homeRef.current.querySelectorAll(".text-split"),
    ).map((node) => SplitText.create(node, { type: "chars" }));

    splits.forEach((split) => {
      const chars = split.chars as HTMLElement[];

      const midpoint = Math.ceil(chars.length / 2);
      const leftHalf = chars.slice(0, midpoint);
      const rightHalf = chars.slice(midpoint);

      gsap.set(leftHalf, { x: -120, opacity: 0 });
      gsap.set(rightHalf, { x: 120, opacity: 0 });
    });

    tl.to(
      homeRef.current.querySelector(".hero-content"),
      { opacity: 1, duration: 1 },
      ">-5.5",
    );

    const allChars = splits.flatMap((split) => split.chars as HTMLElement[]);
    tl.to(
      allChars,
      {
        x: 0,
        opacity: 1,
        duration: 0.9,
        ease: "hop",
        stagger: 0.02,
      },
      ">-0.1",
    );

    return () => {
      splits.forEach((split) => split.revert());
    };
  }, []);
  return (
    <div
      className="h-screen w-full relative flex justify-center items-center overflow-hidden"
      ref={homeRef}
    >
      <Navbar />

      {introImages.map((img, i) => (
        <img
          key={i}
          src={img}
          className={`introImgs h-full absolute left-0 top-0 w-full object-cover scale-150 ${i === 0 ? "opacity-100" : "opacity-0"}`}
          alt=""
        />
      ))}
      <div className="hero-content flex flex-col gap-2 absolute inset-0 items-center justify-center h-full w-full bg-[rgba(0,0,0,.5)]">
        <div className="text-split text-white text-5xl">Heading Text</div>
        <div className="text-split text-white text-lg">
          Supporting text and Supporting text
        </div>
      </div>
    </div>
  );
};

export default Home;
