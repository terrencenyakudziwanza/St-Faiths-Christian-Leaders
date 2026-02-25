insert into public.events (
  id,
  slug,
  title,
  feed_type,
  summary,
  event_date,
  presenter_name,
  presenter_role,
  presenter_avatar_path,
  is_published
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'sunday-prayer-service',
    'Sunday Prayer Service',
    'Services',
    'A guided prayer and worship gathering focused on scripture and community care.',
    '2026-02-10T18:00:00Z',
    'Pastor Joel Mensah',
    'Lead Pastor',
    'presenters/pastor-joel.jpg',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'city-revival-night',
    'City Revival Night',
    'Revivals',
    'An evening revival focused on testimony, prayer, and youth ministry outreach.',
    '2026-02-15T19:30:00Z',
    'Sister Ama Boateng',
    'Revival Lead',
    'presenters/sister-ama.jpg',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'family-thanksgiving-gathering',
    'Family Thanksgiving Gathering',
    'Specials',
    'A thanksgiving service featuring worship sets, thanksgiving prayers, and shared meals.',
    '2026-02-21T17:00:00Z',
    'Elder Kojo Asare',
    'Special Programs',
    'presenters/elder-kojo.jpg',
    true
  )
on conflict (id) do nothing;

insert into public.event_media (
  id,
  event_id,
  media_type,
  storage_path,
  caption,
  tags,
  sort_order
)
values
  (
    'aaaaaaaa-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'picture',
    'events/11111111-1111-1111-1111-111111111111/pictures/cover.jpg',
    'Opening worship at Sunday Prayer Service',
    array['#prayer', '#worship'],
    1
  ),
  (
    'aaaaaaaa-2222-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'picture',
    'events/11111111-1111-1111-1111-111111111111/pictures/congregation.jpg',
    'Congregation in intercession',
    array['#community', '#faith'],
    2
  ),
  (
    'aaaaaaaa-3333-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'video',
    'events/11111111-1111-1111-1111-111111111111/videos/highlight.mp4',
    'Sunday Prayer Service highlight',
    array['#service', '#highlight'],
    3
  ),
  (
    'bbbbbbbb-1111-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'picture',
    'events/22222222-2222-2222-2222-222222222222/pictures/cover.jpg',
    'Worship session at revival night',
    array['#revival', '#worship'],
    1
  ),
  (
    'bbbbbbbb-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'video',
    'events/22222222-2222-2222-2222-222222222222/videos/message.mp4',
    'Message excerpt from revival night',
    array['#teaching', '#prayer'],
    2
  ),
  (
    'cccccccc-1111-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'picture',
    'events/33333333-3333-3333-3333-333333333333/pictures/cover.jpg',
    'Family thanksgiving opening procession',
    array['#thanksgiving', '#family'],
    1
  ),
  (
    'cccccccc-2222-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'picture',
    'events/33333333-3333-3333-3333-333333333333/pictures/choir.jpg',
    'Choir performance',
    array['#music', '#special'],
    2
  )
on conflict (id) do nothing;

insert into public.shorts (
  id,
  title,
  storage_path,
  thumbnail_path,
  like_count,
  published_at,
  is_published
)
values
  (
    'dddddddd-1111-4444-4444-444444444444',
    'Prayer Focus in 60 Seconds',
    'shorts/dddddddd-1111-4444-4444-444444444444/clip.mp4',
    'shorts/dddddddd-1111-4444-4444-444444444444/thumbnail.jpg',
    42,
    '2026-02-22T09:00:00Z',
    true
  ),
  (
    'dddddddd-2222-4444-4444-444444444444',
    'Revival Night Recap',
    'shorts/dddddddd-2222-4444-4444-444444444444/clip.mp4',
    'shorts/dddddddd-2222-4444-4444-444444444444/thumbnail.jpg',
    18,
    '2026-02-20T14:30:00Z',
    true
  ),
  (
    'dddddddd-3333-4444-4444-444444444444',
    'Scripture of the Week',
    'shorts/dddddddd-3333-4444-4444-444444444444/clip.mp4',
    'shorts/dddddddd-3333-4444-4444-444444444444/thumbnail.jpg',
    27,
    '2026-02-18T12:00:00Z',
    true
  ),
  (
    'dddddddd-4444-4444-4444-444444444444',
    'Youth Fellowship Highlight',
    'shorts/dddddddd-4444-4444-4444-444444444444/clip.mp4',
    'shorts/dddddddd-4444-4444-4444-444444444444/thumbnail.jpg',
    35,
    '2026-02-16T16:45:00Z',
    true
  )
on conflict (id) do nothing;
