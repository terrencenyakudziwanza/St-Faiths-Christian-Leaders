# Combined Site Architecture Specification

## Purpose and identity

Christian Leaders SU is a modern ministry brand site with a public-facing experience and a Supabase-backed content management dashboard. Keep the experience cinematic at the entry point, media-led for events, and warm and editorial for leadership/family content. The visual DNA is deliberate motion, image-first composition, soft glass-like surfaces, generous whitespace, and substantial rounded corners. Avoid generic SaaS styling, dense layouts, sharp geometry, loud palettes, and gratuitous animation.

## Frontend design system

- **Typography:** SpaceGrotesk throughout. Use large bold or semibold display headings, clear body hierarchy, muted gray copy, and tracked uppercase labels.
- **Palette/materials:** Mostly black, white, and soft grays. Use dark overlays for cinematic areas, translucent white and blur for light UI, and warm ivory/gold accents for the Family page. Keep accents restrained.
- **Shape/layout:** Rounded controls, cards, and panels are a defining motif (roughly 15–50px depending on scale, plus pills/circles). Center content in readable max-width wrappers, allow generous vertical space, and let media carry as much weight as text. Prevent document-level horizontal overflow.
- **Shared navigation:** Fixed top-level navbar with `data-nav-theme`-aware light/dark presentation. Desktop uses brand, pill-like page/section navigation, dropdowns, and login. Mobile uses circular login/menu controls and a rounded right-side sheet over a dim blurred backdrop. The home navbar appears after its intro. Login is implemented as a dedicated route now; older design notes describing a “Coming Soon” notice are stale.
- **Motion:** Keep motion smooth and purposeful. The home intro assembles imagery and typography cinematically; testimonials use masked alternating vertical marquees; Family uses slow orbit/card transitions and gentle portrait/detail motion; event modal transitions are restrained. Respect responsive layout and do not add motion merely as decoration.

## Public site structure

- **Home (`/`):** Full-viewport image hero with layered intro, dark readability overlay, centered oversized text, then testimonials and footer. Keep this page sparse and bold. `About.tsx` exists and navigation references an About section, but the section is currently not mounted in `App.tsx`.
- **Testimonials:** Light section with centered title, one to three columns by breakpoint, rounded white cards, profile rows, and gradient-masked continuous marquee motion.
- **Events (`/events`):** Bright, polished media-feed feel. Centered pill filters; editorial event cards with layered media and soft gray detail panels; event detail modal with desktop details/media split and mobile full-height sheet with pane switching; portrait Shorts cards below. Keep metadata secondary to imagery.
- **Family (`/family`):** Warm ivory/gold art direction in a translucent rounded shell. Desktop uses an orbit composition, left control rail, and featured portrait; mobile shifts to a portrait-anchored slot/carousel layout and bottom control dock. Executive cards have a restrained rotating gold band; preserve the curated, sculptural feel.
- **Footer:** Light rounded shell with link groups, contact/social details, developer credit, and copyright. Current duplicated Home link groups are placeholders and should not be treated as settled information architecture.
- **Dashboard:** Authenticated CMS area for managing content and users. Preserve the public site's typography, rounded geometry, soft surfaces, and restrained palette while making editing workflows clear and efficient; avoid turning it into an unrelated generic admin template.

## Backend architecture

Supabase provides email/password authentication (and OTP-based invite activation), Postgres persistence, and public object storage. The frontend signs in through Supabase Auth; an authenticated CMS identity must also have an active `cms_users` row with an admin or editor role. `cms_permissions` maps editors to permitted sections, and `cms_invites` supports admin-managed invitations. Authorization is enforced with Postgres/storage Row Level Security and helpers such as `is_admin()` and `is_editor()`; never rely on UI role checks as the security boundary.

Main data tables are `cms_users`, `cms_permissions`, `cms_invites`, `cms_content`, `events`, `event_media`, `shorts`, and `testimonials`. CMS page sections are JSON records in `cms_content`, keyed by the frontend/backend contract: `home.hero`, `home.focus`, `home.week`, `content.events`, and `content.testimonials`. Media references inside these payloads use `storagePath` values.

The public bucket is `media`. Static seed assets live under `seed/`; CMS-managed assets live under `cms/`; event and short media use `events/<event_id>/pictures|videos/` and `shorts/<short_id>/`. CMS section folders map to `cms/home/hero`, `cms/home/focus`, `cms/home/week`, `cms/content/testimonials`, and `cms/content/events/presenters`. Dashboard uploads must stay under `cms/`. Storage policies require bucket `media`, an object name prefixed `cms/`, and an authenticated active admin/editor. Seed assets are managed through CLI/service-role tooling, not dashboard uploads. The dashboard upload flow is: upload via `uploadMediaFile` → save returned `storagePath` with `upsertCmsContent` → resolve public display URLs with `resolveMediaUrl`.

Apply migrations in order: `supabase/migrations/0001_initial_content.sql`, `0002_cms.sql`, then `0003_content_extensions.sql`. Confirm the public `media` bucket exists and CMS accounts are active in `cms_users`. If uploads fail with an RLS violation, verify the bucket/path and CMS identity/role before changing policies.

## Co-development guardrails and known caveats

Treat CMS section keys, storage paths, table roles, and RLS policies as shared contracts. Keep public reads and CMS writes aligned with existing Supabase helpers and policies. Keep the brand's contrast between dark cinematic home and bright content pages, while the Family page retains its warmer premium tone. Mobile must meaningfully recompose cards, modals, orbit controls, and navigation rather than simply shrink desktop layouts. Login is now implemented in `src/pages/Login.tsx`; dashboard is in `src/pages/Dashboard.tsx`. The About mount and footer link groups remain known content/IA gaps. There is no documented dummy administrator credential in the supplied project files; see `credentials.md` for the status.
