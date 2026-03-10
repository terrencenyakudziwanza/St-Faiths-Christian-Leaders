import type { FeedType, MediaType } from "../types/domain";

export type OfflineEventRow = {
  id: string;
  slug: string;
  title: string;
  feed_type: FeedType;
  summary: string;
  event_date: string;
  presenter_name: string;
  presenter_role: string;
  presenter_avatar_path: string | null;
  is_published: boolean;
};

export type OfflineEventMediaRow = {
  id: string;
  event_id: string;
  media_type: MediaType;
  storage_path: string;
  caption: string | null;
  tags: string[] | null;
  sort_order: number | null;
};

export type OfflineShortRow = {
  id: string;
  title: string;
  storage_path: string;
  thumbnail_path: string | null;
  like_count: number | null;
  published_at: string;
  is_published: boolean;
};

export const offlineEventRows: OfflineEventRow[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "sunday-prayer-service",
    title: "Sunday Prayer Service",
    feed_type: "Services",
    summary:
      "A guided prayer and worship gathering focused on scripture and community care.",
    event_date: "2026-02-10T18:00:00Z",
    presenter_name: "Pastor Joel Mensah",
    presenter_role: "Lead Pastor",
    presenter_avatar_path: "presenters/pastor-joel.jpg",
    is_published: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "city-revival-night",
    title: "City Revival Night",
    feed_type: "Revivals",
    summary:
      "An evening revival focused on testimony, prayer, and youth ministry outreach.",
    event_date: "2026-02-15T19:30:00Z",
    presenter_name: "Sister Ama Boateng",
    presenter_role: "Revival Lead",
    presenter_avatar_path: "presenters/sister-ama.jpg",
    is_published: true,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "family-thanksgiving-gathering",
    title: "Family Thanksgiving Gathering",
    feed_type: "Specials",
    summary:
      "A thanksgiving service featuring worship sets, thanksgiving prayers, and shared meals.",
    event_date: "2026-02-21T17:00:00Z",
    presenter_name: "Elder Kojo Asare",
    presenter_role: "Special Programs",
    presenter_avatar_path: "presenters/elder-kojo.jpg",
    is_published: true,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    slug: "breakthrough-prayer-watch",
    title: "Breakthrough Prayer Watch",
    feed_type: "Services",
    summary:
      "A late-evening prayer service marked by focused intercession, scripture declarations, and worship response.",
    event_date: "2026-03-07T18:30:00Z",
    presenter_name: "Pastor Joel Mensah",
    presenter_role: "Lead Pastor",
    presenter_avatar_path: "presenters/pastor-joel.jpg",
    is_published: true,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    slug: "word-and-worship-sunday",
    title: "Word and Worship Sunday",
    feed_type: "Services",
    summary:
      "A Sunday gathering centered on worship, community prayer, and a word on spiritual endurance.",
    event_date: "2026-03-05T17:30:00Z",
    presenter_name: "Sister Ama Boateng",
    presenter_role: "Service Lead",
    presenter_avatar_path: "presenters/sister-ama.jpg",
    is_published: true,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    slug: "morning-glory-service",
    title: "Morning Glory Service",
    feed_type: "Services",
    summary:
      "An early gathering focused on thanksgiving, quiet worship, and practical faith encouragement.",
    event_date: "2026-03-03T06:30:00Z",
    presenter_name: "Elder Kojo Asare",
    presenter_role: "Morning Service Lead",
    presenter_avatar_path: "presenters/elder-kojo.jpg",
    is_published: true,
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    slug: "healing-and-hope-service",
    title: "Healing and Hope Service",
    feed_type: "Services",
    summary:
      "A healing-focused service with testimony moments, prayer ministry, and worship-led encouragement.",
    event_date: "2026-03-01T16:00:00Z",
    presenter_name: "Pastor Joel Mensah",
    presenter_role: "Prayer Minister",
    presenter_avatar_path: "presenters/pastor-joel.jpg",
    is_published: true,
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    slug: "victory-prayer-gathering",
    title: "Victory Prayer Gathering",
    feed_type: "Services",
    summary:
      "A prayer gathering emphasizing thanksgiving, breakthrough, and intercession for families and students.",
    event_date: "2026-02-27T18:00:00Z",
    presenter_name: "Sister Ama Boateng",
    presenter_role: "Prayer Lead",
    presenter_avatar_path: "presenters/sister-ama.jpg",
    is_published: true,
  },
  {
    id: "99999999-9999-9999-9999-999999999999",
    slug: "midweek-faith-service",
    title: "Midweek Faith Service",
    feed_type: "Services",
    summary:
      "A midweek word service with practical teaching, worship, and community prayer support.",
    event_date: "2026-02-25T17:00:00Z",
    presenter_name: "Elder Kojo Asare",
    presenter_role: "Teaching Lead",
    presenter_avatar_path: "presenters/elder-kojo.jpg",
    is_published: true,
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    slug: "overflow-night-service",
    title: "Overflow Night Service",
    feed_type: "Services",
    summary:
      "An evening service designed around worship overflow, intercession, and a focused altar call.",
    event_date: "2026-02-23T19:00:00Z",
    presenter_name: "Pastor Joel Mensah",
    presenter_role: "Night Service Lead",
    presenter_avatar_path: "presenters/pastor-joel.jpg",
    is_published: true,
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    slug: "family-altar-service",
    title: "Family Altar Service",
    feed_type: "Services",
    summary:
      "A family-centered service built around household prayer, scripture reflection, and worship response.",
    event_date: "2026-02-19T17:30:00Z",
    presenter_name: "Sister Ama Boateng",
    presenter_role: "Family Care Lead",
    presenter_avatar_path: "presenters/sister-ama.jpg",
    is_published: true,
  },
];

export const offlineEventMediaRows: OfflineEventMediaRow[] = [
  {
    id: "aaaaaaaa-1111-1111-1111-111111111111",
    event_id: "11111111-1111-1111-1111-111111111111",
    media_type: "picture",
    storage_path: "events/11111111-1111-1111-1111-111111111111/pictures/cover.jpg",
    caption: "Opening worship at Sunday Prayer Service",
    tags: ["#prayer", "#worship"],
    sort_order: 1,
  },
  {
    id: "aaaaaaaa-2222-1111-1111-111111111111",
    event_id: "11111111-1111-1111-1111-111111111111",
    media_type: "picture",
    storage_path: "events/11111111-1111-1111-1111-111111111111/pictures/congregation.jpg",
    caption: "Congregation in intercession",
    tags: ["#community", "#faith"],
    sort_order: 2,
  },
  {
    id: "aaaaaaaa-3333-1111-1111-111111111111",
    event_id: "11111111-1111-1111-1111-111111111111",
    media_type: "video",
    storage_path: "events/11111111-1111-1111-1111-111111111111/videos/highlight.mp4",
    caption: "Sunday Prayer Service highlight",
    tags: ["#service", "#highlight"],
    sort_order: 3,
  },
  {
    id: "bbbbbbbb-1111-2222-2222-222222222222",
    event_id: "22222222-2222-2222-2222-222222222222",
    media_type: "picture",
    storage_path: "events/22222222-2222-2222-2222-222222222222/pictures/cover.jpg",
    caption: "Worship session at revival night",
    tags: ["#revival", "#worship"],
    sort_order: 1,
  },
  {
    id: "bbbbbbbb-2222-2222-2222-222222222222",
    event_id: "22222222-2222-2222-2222-222222222222",
    media_type: "video",
    storage_path: "events/22222222-2222-2222-2222-222222222222/videos/message.mp4",
    caption: "Message excerpt from revival night",
    tags: ["#teaching", "#prayer"],
    sort_order: 2,
  },
  {
    id: "cccccccc-1111-3333-3333-333333333333",
    event_id: "33333333-3333-3333-3333-333333333333",
    media_type: "picture",
    storage_path: "events/33333333-3333-3333-3333-333333333333/pictures/cover.jpg",
    caption: "Family thanksgiving opening procession",
    tags: ["#thanksgiving", "#family"],
    sort_order: 1,
  },
  {
    id: "cccccccc-2222-3333-3333-333333333333",
    event_id: "33333333-3333-3333-3333-333333333333",
    media_type: "picture",
    storage_path: "events/33333333-3333-3333-3333-333333333333/pictures/choir.jpg",
    caption: "Choir performance",
    tags: ["#music", "#special"],
    sort_order: 2,
  },
  {
    id: "eeeeeeee-1111-4444-4444-444444444444",
    event_id: "44444444-4444-4444-4444-444444444444",
    media_type: "picture",
    storage_path: "events/11111111-1111-1111-1111-111111111111/pictures/cover.jpg",
    caption: "Breakthrough Prayer Watch opening worship",
    tags: ["#service", "#prayer", "#breakthrough"],
    sort_order: 1,
  },
  {
    id: "eeeeeeee-2222-4444-4444-444444444444",
    event_id: "44444444-4444-4444-4444-444444444444",
    media_type: "video",
    storage_path: "events/11111111-1111-1111-1111-111111111111/videos/highlight.mp4",
    caption: "Breakthrough Prayer Watch highlight",
    tags: ["#service", "#video"],
    sort_order: 2,
  },
  {
    id: "ffffffff-1111-5555-5555-555555555555",
    event_id: "55555555-5555-5555-5555-555555555555",
    media_type: "picture",
    storage_path: "events/22222222-2222-2222-2222-222222222222/pictures/cover.jpg",
    caption: "Word and Worship Sunday congregation",
    tags: ["#worship", "#sunday"],
    sort_order: 1,
  },
  {
    id: "ffffffff-2222-6666-6666-666666666666",
    event_id: "66666666-6666-6666-6666-666666666666",
    media_type: "picture",
    storage_path: "events/33333333-3333-3333-3333-333333333333/pictures/cover.jpg",
    caption: "Morning Glory Service opening moment",
    tags: ["#morning", "#service"],
    sort_order: 1,
  },
  {
    id: "abababab-1111-7777-7777-777777777777",
    event_id: "77777777-7777-7777-7777-777777777777",
    media_type: "picture",
    storage_path: "events/11111111-1111-1111-1111-111111111111/pictures/congregation.jpg",
    caption: "Healing and Hope Service prayer moment",
    tags: ["#healing", "#prayer"],
    sort_order: 1,
  },
  {
    id: "abababab-2222-7777-7777-777777777777",
    event_id: "77777777-7777-7777-7777-777777777777",
    media_type: "video",
    storage_path: "events/22222222-2222-2222-2222-222222222222/videos/message.mp4",
    caption: "Healing and Hope Service message excerpt",
    tags: ["#healing", "#message"],
    sort_order: 2,
  },
  {
    id: "bcbcbcbc-1111-8888-8888-888888888888",
    event_id: "88888888-8888-8888-8888-888888888888",
    media_type: "picture",
    storage_path: "events/33333333-3333-3333-3333-333333333333/pictures/choir.jpg",
    caption: "Victory Prayer Gathering worship team",
    tags: ["#victory", "#worship"],
    sort_order: 1,
  },
  {
    id: "cdcdcdcd-1111-9999-9999-999999999999",
    event_id: "99999999-9999-9999-9999-999999999999",
    media_type: "picture",
    storage_path: "events/22222222-2222-2222-2222-222222222222/pictures/cover.jpg",
    caption: "Midweek Faith Service worship set",
    tags: ["#midweek", "#faith"],
    sort_order: 1,
  },
  {
    id: "dededede-1111-aaaa-aaaa-aaaaaaaaaaaa",
    event_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    media_type: "picture",
    storage_path: "events/11111111-1111-1111-1111-111111111111/pictures/cover.jpg",
    caption: "Overflow Night Service altar response",
    tags: ["#overflow", "#service"],
    sort_order: 1,
  },
  {
    id: "efefefef-1111-bbbb-bbbb-bbbbbbbbbbbb",
    event_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    media_type: "picture",
    storage_path: "events/33333333-3333-3333-3333-333333333333/pictures/cover.jpg",
    caption: "Family Altar Service prayer circle",
    tags: ["#family", "#altar"],
    sort_order: 1,
  },
];

export const offlineShortRows: OfflineShortRow[] = [
  {
    id: "dddddddd-1111-4444-4444-444444444444",
    title: "Prayer Focus in 60 Seconds",
    storage_path: "shorts/dddddddd-1111-4444-4444-444444444444/clip.mp4",
    thumbnail_path:
      "shorts/dddddddd-1111-4444-4444-444444444444/thumbnail.jpg",
    like_count: 42,
    published_at: "2026-02-22T09:00:00Z",
    is_published: true,
  },
  {
    id: "dddddddd-2222-4444-4444-444444444444",
    title: "Revival Night Recap",
    storage_path: "shorts/dddddddd-2222-4444-4444-444444444444/clip.mp4",
    thumbnail_path:
      "shorts/dddddddd-2222-4444-4444-444444444444/thumbnail.jpg",
    like_count: 18,
    published_at: "2026-02-20T14:30:00Z",
    is_published: true,
  },
  {
    id: "dddddddd-3333-4444-4444-444444444444",
    title: "Scripture of the Week",
    storage_path: "shorts/dddddddd-3333-4444-4444-444444444444/clip.mp4",
    thumbnail_path:
      "shorts/dddddddd-3333-4444-4444-444444444444/thumbnail.jpg",
    like_count: 27,
    published_at: "2026-02-18T12:00:00Z",
    is_published: true,
  },
  {
    id: "dddddddd-4444-4444-4444-444444444444",
    title: "Youth Fellowship Highlight",
    storage_path: "shorts/dddddddd-4444-4444-4444-444444444444/clip.mp4",
    thumbnail_path:
      "shorts/dddddddd-4444-4444-4444-444444444444/thumbnail.jpg",
    like_count: 35,
    published_at: "2026-02-16T16:45:00Z",
    is_published: true,
  },
];
