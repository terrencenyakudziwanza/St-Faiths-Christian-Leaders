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
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'breakthrough-prayer-watch',
    'Breakthrough Prayer Watch',
    'Services',
    'A late-evening prayer service marked by focused intercession, scripture declarations, and worship response.',
    '2026-03-07T18:30:00Z',
    'Pastor Joel Mensah',
    'Lead Pastor',
    'presenters/pastor-joel.jpg',
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'word-and-worship-sunday',
    'Word and Worship Sunday',
    'Services',
    'A Sunday gathering centered on worship, community prayer, and a word on spiritual endurance.',
    '2026-03-05T17:30:00Z',
    'Sister Ama Boateng',
    'Service Lead',
    'presenters/sister-ama.jpg',
    true
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'morning-glory-service',
    'Morning Glory Service',
    'Services',
    'An early gathering focused on thanksgiving, quiet worship, and practical faith encouragement.',
    '2026-03-03T06:30:00Z',
    'Elder Kojo Asare',
    'Morning Service Lead',
    'presenters/elder-kojo.jpg',
    true
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'healing-and-hope-service',
    'Healing and Hope Service',
    'Services',
    'A healing-focused service with testimony moments, prayer ministry, and worship-led encouragement.',
    '2026-03-01T16:00:00Z',
    'Pastor Joel Mensah',
    'Prayer Minister',
    'presenters/pastor-joel.jpg',
    true
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'victory-prayer-gathering',
    'Victory Prayer Gathering',
    'Services',
    'A prayer gathering emphasizing thanksgiving, breakthrough, and intercession for families and students.',
    '2026-02-27T18:00:00Z',
    'Sister Ama Boateng',
    'Prayer Lead',
    'presenters/sister-ama.jpg',
    true
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'midweek-faith-service',
    'Midweek Faith Service',
    'Services',
    'A midweek word service with practical teaching, worship, and community prayer support.',
    '2026-02-25T17:00:00Z',
    'Elder Kojo Asare',
    'Teaching Lead',
    'presenters/elder-kojo.jpg',
    true
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'overflow-night-service',
    'Overflow Night Service',
    'Services',
    'An evening service designed around worship overflow, intercession, and a focused altar call.',
    '2026-02-23T19:00:00Z',
    'Pastor Joel Mensah',
    'Night Service Lead',
    'presenters/pastor-joel.jpg',
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'family-altar-service',
    'Family Altar Service',
    'Services',
    'A family-centered service built around household prayer, scripture reflection, and worship response.',
    '2026-02-19T17:30:00Z',
    'Sister Ama Boateng',
    'Family Care Lead',
    'presenters/sister-ama.jpg',
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
  ),
  (
    'eeeeeeee-1111-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'picture',
    'events/11111111-1111-1111-1111-111111111111/pictures/cover.jpg',
    'Breakthrough Prayer Watch opening worship',
    array['#service', '#prayer', '#breakthrough'],
    1
  ),
  (
    'eeeeeeee-2222-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'video',
    'events/11111111-1111-1111-1111-111111111111/videos/highlight.mp4',
    'Breakthrough Prayer Watch highlight',
    array['#service', '#video'],
    2
  ),
  (
    'ffffffff-1111-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    'picture',
    'events/22222222-2222-2222-2222-222222222222/pictures/cover.jpg',
    'Word and Worship Sunday congregation',
    array['#worship', '#sunday'],
    1
  ),
  (
    'ffffffff-2222-6666-6666-666666666666',
    '66666666-6666-6666-6666-666666666666',
    'picture',
    'events/33333333-3333-3333-3333-333333333333/pictures/cover.jpg',
    'Morning Glory Service opening moment',
    array['#morning', '#service'],
    1
  ),
  (
    'abababab-1111-7777-7777-777777777777',
    '77777777-7777-7777-7777-777777777777',
    'picture',
    'events/11111111-1111-1111-1111-111111111111/pictures/congregation.jpg',
    'Healing and Hope Service prayer moment',
    array['#healing', '#prayer'],
    1
  ),
  (
    'abababab-2222-7777-7777-777777777777',
    '77777777-7777-7777-7777-777777777777',
    'video',
    'events/22222222-2222-2222-2222-222222222222/videos/message.mp4',
    'Healing and Hope Service message excerpt',
    array['#healing', '#message'],
    2
  ),
  (
    'bcbcbcbc-1111-8888-8888-888888888888',
    '88888888-8888-8888-8888-888888888888',
    'picture',
    'events/33333333-3333-3333-3333-333333333333/pictures/choir.jpg',
    'Victory Prayer Gathering worship team',
    array['#victory', '#worship'],
    1
  ),
  (
    'cdcdcdcd-1111-9999-9999-999999999999',
    '99999999-9999-9999-9999-999999999999',
    'picture',
    'events/22222222-2222-2222-2222-222222222222/pictures/cover.jpg',
    'Midweek Faith Service worship set',
    array['#midweek', '#faith'],
    1
  ),
  (
    'dededede-1111-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'picture',
    'events/11111111-1111-1111-1111-111111111111/pictures/cover.jpg',
    'Overflow Night Service altar response',
    array['#overflow', '#service'],
    1
  ),
  (
    'efefefef-1111-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'picture',
    'events/33333333-3333-3333-3333-333333333333/pictures/cover.jpg',
    'Family Altar Service prayer circle',
    array['#family', '#altar'],
    1
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
