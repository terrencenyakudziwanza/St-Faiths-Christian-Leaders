import React from "react";

import { Facebook, Instagram, Mail, MessageCircle, Phone, X } from "lucide-react";
import { supabase } from "../lib/supabase";

type FooterSettings = { phone?: string; email?: string; socials?: { instagram?: string; facebook?: string; whatsapp?: string } };

const Footer: React.FC = () => {
  const [settings, setSettings] = React.useState<FooterSettings>({});
  const [developersOpen, setDevelopersOpen] = React.useState(false);
  React.useEffect(() => {
    let active = true;
    void supabase.from("cms_content").select("content").eq("section_key", "site.footer_contacts").eq("is_published", true).maybeSingle().then(({ data }) => {
      if (active && data?.content) setSettings(data.content as FooterSettings);
    });
    return () => { active = false; };
  }, []);
  const year = new Date().getFullYear();
  const links: {
    pageName: string;
    pageSections: { sectionName: string; sectionId: string }[];
  }[] = [
    {
      pageName: "Home",
      pageSections: [
        { sectionName: "Home", sectionId: "home-section" },
        { sectionName: "Focus", sectionId: "focus-section" },
        { sectionName: "Week", sectionId: "week-section" },
        { sectionName: "Testimonials", sectionId: "testimonials-section" },
      ],
    },
    {
      pageName: "Events",
      pageSections: [
        { sectionName: "Services", sectionId: "home-section" },
        { sectionName: "Highlights", sectionId: "highlights-section" },
      ],
    },
    {
      pageName: "Family",
      pageSections: [
        { sectionName: "Board", sectionId: "home-section" },
        { sectionName: "Departments", sectionId: "focus-section" },
      ],
    },
  ];

  return (
    <footer className="mx-4 mb-4 rounded-2xl border border-subtle bg-surface shadow-sm">
      {/* FOOTER LINK COLUMNS */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-8 sm:px-8 sm:py-12 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
        {links.map((link, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-caption font-semibold uppercase tracking-wider text-ink">
              {link.pageName}
            </h3>
            <ul className="space-y-2">
              {link.pageSections.map((section, sectionIndex) => (
                <li key={sectionIndex}>
                  <a
                    href={`#${section.sectionId}`}
                    className="text-body-sm text-muted transition-colors duration-300 hover:text-ink"
                  >
                    {section.sectionName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* CONTACT COLUMN */}
        <div className="space-y-4">
          <h3 className="text-caption font-semibold uppercase tracking-wider text-ink">
            Contact
          </h3>

          <div className="space-y-3 text-body-sm text-muted">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-ink opacity-70" />
              <a href={`tel:${(settings.phone || "+263 000 000").replace(/[^+\d]/g, "")}`}>{settings.phone || "+263 000 000"}</a>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-ink opacity-70" />
              <a href={`mailto:${settings.email || "someemail@gmail.com"}`}>{settings.email || "someemail@gmail.com"}</a>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: MessageCircle, label: "WhatsApp" },
            ].map(({ Icon, label }, index) => {
              const href = index === 0 ? settings.socials?.instagram : index === 1 ? settings.socials?.facebook : settings.socials?.whatsapp;
              return href ? <a
                key={index}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-subtle transition duration-300 hover:bg-surface-muted"
                aria-label={label}
              >
                <Icon className="h-4 w-4 text-ink opacity-70 transition" />
              </a> : <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full border border-subtle opacity-40" aria-label={`${label} link not set`}><Icon className="h-4 w-4 text-ink" /></span>;
            })}
          </div>
        </div>

        {/* DEVELOPER COLUMN */}
        <div className="space-y-4">
          <h3 className="text-caption font-semibold uppercase tracking-wider text-ink">
            Website Developed By
          </h3>

        </div>
      </div>
      {developersOpen && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDevelopersOpen(false); }} className="fixed inset-0 z-[200] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="developer-dialog-title" className="w-full max-w-lg rounded-3xl border border-subtle bg-surface-elevated p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 id="developer-dialog-title" className="text-heading-md font-semibold text-ink">Website developers</h2><button type="button" onClick={() => setDevelopersOpen(false)} aria-label="Close developers" className="grid h-9 w-9 place-items-center rounded-full border border-subtle"><X size={18} /></button></div><div className="mt-5 divide-y divide-subtle">{[{ name: "Hola!", role: "Creative Web Development" }, { name: "Website Design Team", role: "Design and Content" }, { name: "Technical Team", role: "Development and Support" }].map((person) => <div key={person.name} className="flex items-center gap-3 py-4"><span className="h-2 w-2 rounded-full bg-accent"/><span className="font-semibold text-ink">{person.name}</span><span className="ml-auto text-right text-body-sm text-muted">{person.role}</span></div>)}</div></section></div>}

      {/* FOOTER BASELINE */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-subtle px-8 py-4 text-body-sm text-muted md:flex-row">
        <p>
          Copyright {year} Christian Leaders @ St Faith&apos;s. All rights
          reserved.
        </p>
        <p className="text-caption">
          <a href="#">Back To Top</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
