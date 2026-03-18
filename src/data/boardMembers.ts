export type BoardMember = {
  id: string;
  name: string;
  position: string;
  boardTier: string;
  quote: string;
  imageSrc: string;
  executive: boolean;
};

export const boardMembers: BoardMember[] = [
  {
    id: "pastor-joel",
    name: "Pastor Joel Mensah",
    position: "Board Chair",
    boardTier: "Executive Member",
    quote: "Lead with calm conviction and keep the family aligned around prayer.",
    imageSrc: "/offline-media/presenters/pastor-joel.jpg",
    executive: true,
  },
  {
    id: "sister-ama",
    name: "Sister Ama Boateng",
    position: "Board Secretary",
    boardTier: "Executive Member",
    quote: "Order creates room for warmth, follow-through, and shared peace.",
    imageSrc: "/offline-media/presenters/sister-ama.jpg",
    executive: true,
  },
  {
    id: "elder-kojo",
    name: "Elder Kojo Asare",
    position: "Treasurer",
    boardTier: "Executive Member",
    quote: "Stewardship is worship when every decision protects the people.",
    imageSrc: "/offline-media/presenters/elder-kojo.jpg",
    executive: true,
  },
  {
    id: "lydia-ofori",
    name: "Deacon Lydia Ofori",
    position: "Welfare Lead",
    boardTier: "Board Member",
    quote: "Care should feel practical, immediate, and impossible to miss.",
    imageSrc: "/offline-media/presenters/sister-ama.jpg",
    executive: false,
  },
  {
    id: "daniel-addo",
    name: "Brother Daniel Addo",
    position: "Youth Coordinator",
    boardTier: "Board Member",
    quote: "A healthy church always leaves room for the next generation to rise.",
    imageSrc: "/offline-media/presenters/pastor-joel.jpg",
    executive: false,
  },
  {
    id: "mabel-agyemang",
    name: "Sister Mabel Agyemang",
    position: "Prayer Director",
    boardTier: "Board Member",
    quote: "Prayer keeps every family conversation anchored in grace.",
    imageSrc: "/offline-media/presenters/pastor-joel.jpg",
    executive: false,
  },
  {
    id: "emmanuel-owusu",
    name: "Emmanuel Owusu",
    position: "Worship Liaison",
    boardTier: "Board Member",
    quote: "Worship softens the room before strategy ever speaks.",
    imageSrc: "/offline-media/presenters/elder-kojo.jpg",
    executive: false,
  },
  {
    id: "grace-nyarko",
    name: "Grace Nyarko",
    position: "Outreach Coordinator",
    boardTier: "Board Member",
    quote: "Every outward invitation should feel as warm as the room inside.",
    imageSrc: "/offline-media/presenters/pastor-joel.jpg",
    executive: false,
  },
  {
    id: "ruth-mensah",
    name: "Ruth Mensah",
    position: "Family Care Lead",
    boardTier: "Board Member",
    quote: "Care becomes visible when follow-up is gentle and consistent.",
    imageSrc: "/offline-media/presenters/pastor-joel.jpg",
    executive: false,
  },
  {
    id: "isaac-boadi",
    name: "Isaac Boadi",
    position: "Media Director",
    boardTier: "Board Member",
    quote: "Good media work should disappear into the clarity of the message.",
    imageSrc: "/offline-media/presenters/elder-kojo.jpg",
    executive: false,
  },
  {
    id: "deborah-quaye",
    name: "Deborah Quaye",
    position: "Discipleship Lead",
    boardTier: "Board Member",
    quote: "Growth is strongest when people feel seen before they are taught.",
    imageSrc: "/offline-media/presenters/pastor-joel.jpg",
    executive: false,
  },
  {
    id: "samuel-opoku",
    name: "Samuel Opoku",
    position: "Missions Liaison",
    boardTier: "Board Member",
    quote: "Mission stays alive when local faithfulness keeps meeting distant need.",
    imageSrc: "/offline-media/presenters/pastor-joel.jpg",
    executive: false,
  },
];
