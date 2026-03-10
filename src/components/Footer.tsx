import React from "react";

import instagram from "../assets/icons/instagram.svg";
import facebook from "../assets/icons/facebook.svg";
import whatsapp from "../assets/icons/whatsapp.svg";
import envelope from "../assets/icons/envelope.svg";
import phone from "../assets/icons/phone.svg";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const developerAvatar = "/offline-media/presenters/sister-ama.jpg";
  const links: {
    pageName: string;
    pageSections: { sectionName: string; sectionId: string }[];
  }[] = [
    {
      pageName: "Home",
      pageSections: [
        { sectionName: "Home", sectionId: "home-section" },
        { sectionName: "About", sectionId: "about-section" },
        { sectionName: "Testimonials", sectionId: "testimonials-section" },
      ],
    },
    {
      pageName: "Home",
      pageSections: [
        { sectionName: "Home", sectionId: "home-section" },
        { sectionName: "About", sectionId: "about-section" },
        { sectionName: "Testimonials", sectionId: "testimonials-section" },
      ],
    },
    {
      pageName: "Home",
      pageSections: [
        { sectionName: "Home", sectionId: "home-section" },
        { sectionName: "About", sectionId: "about-section" },
        { sectionName: "Testimonials", sectionId: "testimonials-section" },
      ],
    },
  ];

  return (
    <footer className="mx-4 mb-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="mx-auto grid max-w-7xl gap-12 px-8 py-12 md:grid-cols-2 lg:grid-cols-4">
        {links.map((link, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              {link.pageName}
            </h3>
            <ul className="space-y-2">
              {link.pageSections.map((section, sectionIndex) => (
                <li key={sectionIndex}>
                  <a
                    href={`#${section.sectionId}`}
                    className="text-sm text-gray-500 transition-colors duration-300 hover:text-black"
                  >
                    {section.sectionName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Contact
          </h3>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <img src={phone} className="h-4 w-4 opacity-70" alt="" />
              <p>+263 000 000</p>
            </div>

            <div className="flex items-center gap-3">
              <img src={envelope} className="h-4 w-4 opacity-70" alt="" />
              <p>someemail@gmail.com</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {[instagram, facebook, whatsapp].map((icon, index) => (
              <div
                key={index}
                className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 transition duration-300 hover:bg-gray-200"
              >
                <img src={icon} className="h-4 w-4 opacity-70 transition" alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Website Developed By
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {Array.from({ length: 3 }).map((_, index) => (
                <img
                  key={index}
                  src={developerAvatar}
                  className={`${
                    index === 0 ? "" : "-ml-4"
                  } h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm`}
                  alt=""
                />
              ))}

              <div className="-ml-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-xs font-semibold text-white">
                +12
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900">Hola!</h4>
              <p className="text-xs text-gray-500">Creative Web Development</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-8 py-4 text-sm text-gray-500 md:flex-row">
        <p>Copyright {year} Christian Leaders St Faith&apos;s. All rights reserved.</p>
        <p className="text-xs">Be Blessed</p>
      </div>
    </footer>
  );
};

export default Footer;
