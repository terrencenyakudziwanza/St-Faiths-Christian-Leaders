import React from "react";
import ProfileCard from "./ProfileCard";
import { fetchTestimonials } from "../services/testimonials";

type TestimonialItem = {
  id: string;
  avatar: { img: string; name: string; personalDetails: string };
  testimonial: string;
};

const Testimonials: React.FC = () => {
  const [items, setItems] = React.useState<TestimonialItem[]>([]);

  React.useEffect(() => {
    let active = true;
    fetchTestimonials()
      .then((rows) => {
        if (!active) return;
        setItems(rows.map((row) => ({
          id: row.id,
          avatar: {
            img: row.avatarUrl ?? "/offline-media/presenters/elder-kojo.jpg",
            name: row.name,
            personalDetails: row.profileDetails ?? "",
          },
          testimonial: row.testimonial,
        })));
      })
      .catch(() => { if (active) setItems([]); });
    return () => { active = false; };
  }, []);

  const columns: TestimonialItem[][] = [[], [], []];
  items.forEach((item, index) => columns[index % columns.length].push(item));
  const directions = ["up", "down", "up"] as const;

  return (
    <section id="testimonials-section" data-nav-theme="light" className="relative min-h-screen w-screen bg-page p-4 md:p-8 lg:p-14 flex flex-col gap-15">
      <div className="section-fade-top" />
      <div className="section-fade-bottom" />
      <h2 className="relative z-10 text-heading-xl font-bold text-center text-ink">Testimonials</h2>
      {items.length === 0 ? (
        <p className="relative z-10 text-center text-body-sm text-muted">No testimonials have been published yet.</p>
      ) : (
        <div className="relative z-10 h-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-hidden">
          {columns.map((column, index) => column.length > 0 && (
            <div className={`testimonial-marquee relative z-[1] ${index === 1 ? "hidden md:block" : ""} ${index === 2 ? "hidden lg:block" : ""}`} key={index}>
              <div className={`testimonial-marquee__track testimonial-marquee__track--${directions[index]} ${column.length < 2 ? "testimonial-marquee__track--static" : ""}`}>
                {(column.length < 2 ? column : [...column, ...column]).map((item, copyIndex) => (
                  <div key={`${item.id}-${copyIndex}`} className="flex flex-col border border-subtle rounded-3xl p-3 gap-4 h-fit cursor-pointer bg-surface">
                    <p className="text-body-sm text-muted">{item.testimonial}</p>
                    <ProfileCard imageSrc={item.avatar.img} imageAlt={item.avatar.name} name={item.avatar.name} details={item.avatar.personalDetails} className="pt-1" nameClassName="text-heading-sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
