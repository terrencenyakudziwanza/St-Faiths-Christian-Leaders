import React from "react";

import depImg from "../assets/images/hand-writing.jpg";

const About: React.FC = () => {
  return (
    <section
      id="about-section"
      data-nav-theme="light"
      className="h-screen w-full grid grid-cols-[2fr_3fr] bg-page text-ink"
    >
      {/* ABOUT COPY */}
      <div className="flex flex-col py-[calc(10%+42px)] px-4">
        <div className="flex flex-col w-full h-full gap-4">
          <div className="text-heading-xl font-bold text-ink">
            Intercession
          </div>
          <p className="text-body text-muted">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum
            nemo rerum dolores itaque ad dolorem officia veniam a excepturi
            laudantium.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="p-2 px-4 rounded-lg bg-accent text-inverse text-body-sm">
            Prev
          </button>
          <button className="p-2 px-4 rounded-lg text-accent border-accent border-[1.5px] text-body-sm">
            Next
          </button>
        </div>
      </div>
      {/* ABOUT IMAGE */}
      <div className="p-4 flex items-center">
        <img
          src={depImg}
          className="object-cover rounded-[100px] h-[75%] w-full"
          alt=""
        />
      </div>
    </section>
  );
};

export default About;
