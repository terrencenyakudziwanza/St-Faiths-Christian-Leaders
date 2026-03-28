import introImg from "../assets/images/50044.jpg";
import introImg3 from "../assets/images/pexels-ivan-stecko-305645871-13438939.jpg";
import slideTwo from "../assets/images/hand-writing.jpg";
import type {
  CmsContentMap,
  CmsFocusContent,
  CmsHeroContent,
  CmsWeekContent,
} from "../types/cms";

const heroContent: CmsHeroContent = {
  heroHeader: ['"Do Not Hold Them,', "Let The Children Come To Me"],
  heroSecondary: ["Lorem Ipsum Dolor Sit Amet"],
  slides: [
    {
      id: "hero-slide-1",
      label: "Praise & Worship",
      image: { url: introImg },
    },
    {
      id: "hero-slide-2",
      label: "Bible Study",
      image: { url: introImg3 },
    },
    {
      id: "hero-slide-3",
      label: "Intercession",
      image: { url: introImg },
    },
    {
      id: "hero-slide-4",
      label: "Soul Winning",
      image: { url: introImg3 },
    },
  ],
};

const focusContent: CmsFocusContent = {
  overline: "Christian Leaders Focus",
  title: "Intercession, Study, Power, and Worship",
  description:
    "Christian Leaders is shaped by a rhythm of prayer that births transformation. We press in through intercession, grow through Bible study, and testify through the demonstration of power (healing and the miraculous). Every gathering culminates in praise and worship that keeps our hearts aligned with heaven.",
  items: [
    {
      id: "intercession",
      title: "Intercession",
      copy: "Strategic prayer, warfare, and focused supplication for our campus.",
      image: { url: introImg3 },
    },
    {
      id: "bible-study",
      title: "Bible Study",
      copy: "Scripture discovery that forms conviction, clarity, and action.",
      image: { url: slideTwo },
    },
    {
      id: "power",
      title: "Demonstration of Power",
      copy: "We celebrate healing and the miraculous as signs of faith.",
      image: { url: introImg },
    },
    {
      id: "praise",
      title: "Praise and Worship",
      copy: "Unreserved worship that keeps our hearts close to God.",
      image: { url: introImg3 },
    },
  ],
};

const weekContent: CmsWeekContent = {
  overline: "Weekly Rhythm",
  title: "A Week In Christian Leaders",
  description:
    "Every day carries a distinct expression of faith. Watch the week unfold through the rhythm of prayer, worship, and study.",
  slides: [
    {
      id: "week-sun",
      day: "Sunday",
      title: "Main SU Service",
      description:
        "We open the week with a full service that blends prayer, praise, and the Word.",
      activities: ["Intercession", "Praise and Worship", "Preaching"],
      image: { url: introImg },
    },
    {
      id: "week-mon",
      day: "Monday",
      title: "Intercession",
      description:
        "Focused prayer that covers our families, leaders, and the campus mission.",
      activities: ["Intercession"],
      image: { url: introImg3 },
    },
    {
      id: "week-tue",
      day: "Tuesday",
      title: "Intercession",
      description:
        "A steady rhythm of warfare and thanksgiving that keeps the fire burning.",
      activities: ["Intercession"],
      image: { url: introImg },
    },
    {
      id: "week-wed",
      day: "Wednesday",
      title: "Intercession + Unending Praise",
      description:
        "Midweek we mix sustained prayer with unending praise to reset our focus.",
      activities: ["Intercession", "Praise and Worship"],
      image: { url: introImg3 },
    },
    {
      id: "week-thu",
      day: "Thursday",
      title: "Intercession",
      description:
        "We contend for breakthrough and alignment across every sphere of influence.",
      activities: ["Intercession"],
      image: { url: introImg },
    },
    {
      id: "week-fri",
      day: "Friday",
      title: "SU Service",
      description:
        "A high-energy service anchored in worship and preaching to close the week.",
      activities: ["Praise and Worship", "Preaching"],
      image: { url: introImg3 },
    },
    {
      id: "week-sat",
      day: "Saturday",
      title: "Bible Discussion",
      description:
        "We gather in smaller circles to discuss Scripture and live it out.",
      activities: ["Bible Discussion"],
      image: { url: slideTwo },
    },
  ],
};

export const cmsDefaults: CmsContentMap = {
  "home.hero": heroContent,
  "home.focus": focusContent,
  "home.week": weekContent,
};

export const cmsSectionLabels: Record<keyof CmsContentMap, string> = {
  "home.hero": "Home Hero",
  "home.focus": "Focus Section",
  "home.week": "Week In Leaders",
};

export const cmsSectionOrder: Array<keyof CmsContentMap> = [
  "home.hero",
  "home.focus",
  "home.week",
];
