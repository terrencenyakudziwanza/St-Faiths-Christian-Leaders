import type { LucideIcon } from "lucide-react";
import {
  Users,
  Camera,
  Utensils,
  Palette,
  Volume2,
  Monitor,
  Truck,
  Music,
  Handshake,
} from "lucide-react";

export type DepartmentMember = {
  id: string;
  name: string;
  role?: string;
  imageSrc: string;
  isLeader: boolean;
};

export type Department = {
  id: string;
  name: string;
  icon: LucideIcon;
  colorHex: string;
  colorRgb: string;
  members: DepartmentMember[];
};

export const departments: Department[] = [
  {
    id: "ushering",
    name: "Ushering",
    icon: Users,
    colorHex: "#3b82f6",
    colorRgb: "59, 130, 246",
    members: [
      {
        id: "ushering-1",
        name: "Brother Samuel",
        role: "Lead Usher",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: true,
      },
      {
        id: "ushering-2",
        name: "Sister Grace",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "ushering-3",
        name: "Brother Peter",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "ushering-4",
        name: "Sister Mary",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "ushering-5",
        name: "Brother David",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "ushering-6",
        name: "Sister Sarah",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "media",
    name: "Media",
    icon: Camera,
    colorHex: "#ef4444",
    colorRgb: "239, 68, 68",
    members: [
      {
        id: "media-1",
        name: "Brother Isaac",
        role: "Media Director",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: true,
      },
      {
        id: "media-2",
        name: "Sister Rachel",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "media-3",
        name: "Brother Thomas",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "media-4",
        name: "Sister Naomi",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "media-5",
        name: "Brother Joseph",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "hospitality",
    name: "Hospitality",
    icon: Utensils,
    colorHex: "#8b5cf6",
    colorRgb: "139, 92, 246",
    members: [
      {
        id: "hosp-1",
        name: "Sister Martha",
        role: "Hospitality Lead",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: true,
      },
      {
        id: "hosp-2",
        name: "Brother Andrew",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "hosp-3",
        name: "Sister Esther",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "hosp-4",
        name: "Brother Timothy",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "hosp-5",
        name: "Sister Deborah",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "hosp-6",
        name: "Brother Nathan",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "decor",
    name: "Decor",
    icon: Palette,
    colorHex: "#ec4899",
    colorRgb: "236, 72, 153",
    members: [
      {
        id: "decor-1",
        name: "Sister Priscilla",
        role: "Decor Lead",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: true,
      },
      {
        id: "decor-2",
        name: "Brother Daniel",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "decor-3",
        name: "Sister Catherine",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "decor-4",
        name: "Brother Leonard",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "decor-5",
        name: "Sister Victoria",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "sound",
    name: "Sound",
    icon: Volume2,
    colorHex: "#06b6d4",
    colorRgb: "6, 182, 212",
    members: [
      {
        id: "sound-1",
        name: "Brother Marcus",
        role: "Sound Lead",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: true,
      },
      {
        id: "sound-2",
        name: "Sister Abigail",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "sound-3",
        name: "Brother Felix",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "sound-4",
        name: "Sister Julianna",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "sound-5",
        name: "Brother Christopher",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "sound-6",
        name: "Sister Lillian",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "screens",
    name: "Screens",
    icon: Monitor,
    colorHex: "#10b981",
    colorRgb: "16, 185, 129",
    members: [
      {
        id: "screens-1",
        name: "Brother Kenneth",
        role: "Screens Lead",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: true,
      },
      {
        id: "screens-2",
        name: "Sister Vanessa",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "screens-3",
        name: "Brother Hugo",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "screens-4",
        name: "Sister Margot",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "screens-5",
        name: "Brother Silas",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "logistics",
    name: "Logistics",
    icon: Truck,
    colorHex: "#f59e0b",
    colorRgb: "245, 158, 11",
    members: [
      {
        id: "logistics-1",
        name: "Brother Victor",
        role: "Logistics Lead",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: true,
      },
      {
        id: "logistics-2",
        name: "Sister Paula",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "logistics-3",
        name: "Brother Russell",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "logistics-4",
        name: "Sister Eleanor",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "logistics-5",
        name: "Brother Gregory",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "logistics-6",
        name: "Sister Harriet",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "dance",
    name: "Dance",
    icon: Music,
    colorHex: "#f43f5e",
    colorRgb: "244, 63, 94",
    members: [
      {
        id: "dance-1",
        name: "Sister Diana",
        role: "Dance Lead",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: true,
      },
      {
        id: "dance-2",
        name: "Brother Alexander",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "dance-3",
        name: "Sister Constance",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "dance-4",
        name: "Brother Lawrence",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "dance-5",
        name: "Sister Margaret",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "dance-6",
        name: "Brother Philip",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
    ],
  },
  {
    id: "intercession",
    name: "Intercession",
    icon: Handshake,
    colorHex: "#a78bfa",
    colorRgb: "167, 139, 250",
    members: [
      {
        id: "intercession-1",
        name: "Sister Beatrice",
        role: "Intercession Lead",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: true,
      },
      {
        id: "intercession-2",
        name: "Brother Ernest",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "intercession-3",
        name: "Sister Francesca",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
      {
        id: "intercession-4",
        name: "Brother Harold",
        imageSrc: "/offline-media/presenters/elder-kojo.jpg",
        isLeader: false,
      },
      {
        id: "intercession-5",
        name: "Sister Imogen",
        imageSrc: "/offline-media/presenters/pastor-joel.jpg",
        isLeader: false,
      },
      {
        id: "intercession-6",
        name: "Brother Jonathan",
        imageSrc: "/offline-media/presenters/sister-ama.jpg",
        isLeader: false,
      },
    ],
  },
];
