import React from "react";

import depImg from "../assets/images/hand-writing.jpg";

const About: React.FC = () => {
  return (
    <section
      id="about-section"
      data-nav-theme="light"
      className="h-screen w-full grid grid-cols-[2fr_3fr]"
    >
      <div className="flex flex-col py-[calc(10%+42px)] px-4">
        <div className="flex flex-col w-full h-full gap-4">
          <div className="text-5xl font-bold">Intercession</div>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum
            nemo rerum dolores itaque ad dolorem officia veniam a excepturi
            laudantium.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="p-2 px-4 rounded-lg bg-yellow-700 text-white">
            Prev
          </button>
          <button className="p-2 px-4 rounded-lg text-yellow-700 border-yellow-700 border-[1.5px]">
            Next
          </button>
        </div>
      </div>
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
