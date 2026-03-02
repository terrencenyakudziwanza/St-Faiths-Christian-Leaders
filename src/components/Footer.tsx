import React from "react";

import instagram from "../assets/icons/instagram.svg";
import facebook from "../assets/icons/facebook.svg";
import whatsapp from "../assets/icons/whatsapp.svg";

import envelope from "../assets/icons/envelope.svg";
import phone from "../assets/icons/phone.svg";

import avatar from '../../public/offline-media/presenters/sister-ama.jpg'

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
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
      <div className="max-w-7xl mx-auto px-8 py-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Navigation Links */}
        {links.map((link, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              {link.pageName}
            </h3>
            <ul className="space-y-2">
              {link.pageSections.map((section, index) => (
                <li key={index}>
                  <a
                    href={`#${section.sectionId}`}
                    className="text-gray-500 hover:text-black transition-colors duration-300 text-sm"
                  >
                    {section.sectionName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Section */}
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

          {/* Social Icons */}
          <div className="flex gap-3 pt-2">
            {[instagram, facebook, whatsapp].map((icon, i) => (
              <div
                key={i}
                className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition duration-300 cursor-pointer group"
              >
                <img
                  src={icon}
                  className="h-4 w-4 opacity-70 transition"
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>

        {/* Developer Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Website Developed By
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {Array.from({ length: 3 }).map((_, index) => (
                <img
                  key={index}
                  src={avatar}
                  className={`${
                    index === 0 ? "" : "-ml-4"
                  } h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm`}
                />
              ))}

              <div className="-ml-4 h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold border-2 border-white">
                +12
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Hola!</h4>
              <p className="text-xs text-gray-500">Creative Web Development</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 px-8 py-4 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {year} Christian Leaders St Faith's. All rights reserved.</p>
        <p className="text-xs">Be Blessed</p>
      </div>
    </footer>
  );
};

export default Footer;
