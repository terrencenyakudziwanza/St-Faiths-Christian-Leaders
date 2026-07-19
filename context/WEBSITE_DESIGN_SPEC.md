# Website Design Spec

This file summarizes the design system currently implemented in the site, based on the code in `src/`. It is intended to give another AI enough visual, structural, and motion context to continue the website without rereading the full frontend.

## 1. Core Design DNA

The site currently combines three related moods:

- `Home`: cinematic, dark, immersive, intro-led
- `Events`: clean, bright, content-first, social-platform-adjacent
- `Family`: warm, editorial, premium, slightly ceremonial

Across all pages, the recurring preferences are:

- large rounded corners over sharp geometry
- image-led composition
- low color count, with contrast coming from light, blur, overlays, and motion
- one modern font family used consistently
- interfaces that feel soft, tactile, and designed rather than utilitarian

Useful keywords for continuation:

- cinematic
- reverent
- modern ministry brand
- soft glassmorphism
- warm editorial
- motion-led but controlled

## 2. Typography

- Global font: `SpaceGrotesk`
- Headings are usually bold or semibold and oversized.
- Letter spacing is used for labels, overlines, chips, and small metadata.
- Hierarchy is straightforward:
  - hero/display text is large and visually dominant
  - section headings sit around `text-4xl` to `text-7xl`
  - body copy is usually muted gray rather than pure black
  - micro labels are uppercase and tracked out

## 3. Color and Material System

### Main palette

- Base neutrals: black, white, near-black text, soft grays
- Frequently used supporting grays: `rgb(230,230,230)`, `rgb(240,240,240)`, `#555`, `#333`, `#111`
- Accent use:
  - warm gold matters on the `Family` page
  - blue appears in older navbar underline styling, but is not a primary active motif

### Material treatment

- Light pages often use translucent white surfaces.
- Blur is used in the navbar, family overlays, and modal chrome.
- Dark sections depend on black overlays, not saturated gradients.
- Surfaces usually layer like this:
  - image or gradient background
  - soft overlay or mask
  - rounded card/panel with light shadow

## 4. Shape Language

Rounded corners are central to the current style.

Common radii:

- `15px` for nav and small pills
- `20px` to `22px` for compact cards
- `26px` to `34px` for controls and media frames
- `38px` to `40px` for large feature cards
- `50px` for the desktop event modal shell
- full pills and circles are used heavily for toggles, icons, avatars, and chips

Future additions should keep the UI soft-edged and sculpted.

## 5. Global Layout Rules

- The site is full-width and disables horizontal overflow at the document level.
- Major sections often occupy full viewport height or close to it.
- Content is centered with max-width wrappers rather than dense full-width text blocks.
- Layout modes used across the site:
  - full-screen hero
  - centered content stack
  - split text/media panels
  - composition-driven orbit layout on `Family`

Repeated layout habits:

- navbar is always fixed and top-level
- sections get generous vertical breathing room
- media often carries equal or greater weight than text
- desktop layouts become stacked, docked, or pane-switched on mobile

## 6. Navigation System

The navbar is one of the main shared design anchors.

### Behavior

- Fixed at the top of the viewport
- Hidden on home until the intro animation completes
- Theme switches automatically based on the section under it via `data-nav-theme`

### Visual themes

- `dark` theme:
  - transparent or lightly darkened shell
  - white text and icons
  - subtle glassy dark treatment on scroll
- `light` theme:
  - translucent white shell
  - blur
  - bottom border and soft shadow
  - dark text and icons

### Desktop structure

- Brand on the left: `Christian Leaders SU`
- Pill-like page buttons in the middle/right
- Hover dropdowns for page sections
- Login action on the far right

### Mobile structure

- Circular login button
- Circular hamburger button
- Right-side slide-in sheet
- Rounded grouped page/section cards inside the sheet
- Darkened backdrop with slight blur

### Important product note

- Login is not a real auth flow yet. The current UI only shows a temporary `Coming Soon!` notice.

## 7. Page-by-Page Structure

### Home

Route: `/`

Current structure:

1. full-screen hero
2. testimonials section
3. footer

Important caveat:

- Navigation and shared section tracking still reference an `About` section, and `About.tsx` exists, but that section is not currently mounted in `App.tsx`.

#### Hero style

- Full viewport height
- Fixed background image
- Dark overlay for readability
- Intro sequence uses stacked full-screen image layers before settling into the final hero state
- Final hero content is centered both horizontally and vertically

#### Hero content style

- Large stacked heading lines
- Small secondary line below
- White text during intro
- After intro, the main heading becomes a gray-to-white gradient fill
- `Skip` pill button appears at top-left during intro only

#### Home mood

- This is the most cinematic page in the site.
- It should stay sparse, bold, and image-dominant.

### Testimonials

Mounted below the home hero.

Structure:

- white background
- centered section heading
- 1 to 3 vertical columns depending on breakpoint
- cards scrolling continuously in alternating directions

Card style:

- white card
- light border
- large rounded corners
- profile row at the bottom

Top and bottom gradient fades make the marquee feel masked rather than cut off.

### Events

Route: `/events`

Current structure:

1. navbar
2. centered feed-type pills
3. event card list
4. event modal on demand
5. shorts section
6. footer

#### Events mood

- clean
- bright
- media-first
- more like a polished content platform than a traditional ministry info page

#### Feed filters

- centered pill controls
- active pill becomes black with white text
- inactive pills remain outlined

#### Event cards

- desktop: media stack on one side, detail card on the other
- mobile: stacked vertically
- media side uses layered offset images
- hover state reveals a dark overlay and play icon
- detail side is a soft gray rounded panel with stacked leader avatars

The cards should continue to feel editorial and visual, not table-like.

#### Event modal

This is the most feature-dense UI in the site and should stay polished.

Desktop:

- large white rounded shell
- details panel on the left
- vertically scrollable media pane on the right
- external up/down controls floating beside the shell

Mobile:

- full-height sheet
- sticky top bar
- pane switch between `Clips` and `Details`
- compact media toggle chips

Modal tone:

- white shell
- strong rounding
- soft gray support surfaces
- social-like action icons
- media is the star, metadata is secondary

### Shorts

Part of `/events`.

Structure:

- divider line
- centered heading with flame icon
- wrapped portrait-oriented short cards

Short card style:

- portrait thumbnail
- very rounded image corners
- simple metadata row underneath
- lightweight feed-card feel

### Family

Route: `/family`

This is the most art-directed page after the home hero.

#### Family mood

- premium
- warm ivory/gold
- ceremonial but modern
- glass plus editorial plus motion-sculpture

#### Family background and shell

- page background uses layered warm gradients and subtle radial highlights
- main content sits inside a large rounded translucent shell
- borders stay soft and pale
- shadows are warm rather than cold

#### Family composition

Desktop:

- centered intro copy at the top
- large orbit arena below
- board cards arranged around an ellipse
- active portrait near the center-right
- control rail on the left

Mobile:

- portrait stays central
- cards collapse into a shallow horizontal slot arrangement near the bottom
- controls move into a bottom dock

#### Board cards

There are two visual card types:

- executive members:
  - premium framed look
  - rotating gold/white band behind the content
  - translucent white inner shell
- standard members:
  - rounded translucent white card
  - soft shadow
  - thin dark border

The active card switches to a minimal `Active` state rather than showing the full profile row.

#### Active portrait block

- large portrait in a rounded frame
- diagonal mask treatment
- warm light overlays near the lower/right edges
- floating quote/detail panel
- detail panel gently bobs on desktop

The Family page should remain more sculptural and curated than conventional.

### Footer

The footer is currently a clean light card with:

- rounded outer shell
- four-column grid on desktop
- section link groups
- contact info
- social icons
- "developed by" avatar cluster
- copyright row

Important implementation note:

- The current link columns are duplicated `Home` groups rather than unique page groups. This looks like placeholder IA, not a finished content decision.

## 8. Animation and Motion Spec

Motion matters to this site. It should feel smooth, deliberate, and atmospheric rather than loud.

### Home intro animation

Driven by GSAP with `SplitText` and `CustomEase`.

Sequence:

1. intro images start enlarged
2. images scale down into place
3. each slide fades in
4. slide label characters roll in from alternating top/bottom directions
5. final hero content fades in
6. hero heading characters join from left and right toward center
7. intro image layers fade away
8. navbar becomes available once intro completes

Notes:

- This is the most branded animation in the project.
- It should stay polished and cinematic.
- Future changes should preserve the idea of "assembled revelation" rather than switching to a basic fade.

### Navbar motion

- top-position reveal/hide on home
- theme adaptation on scroll/section changes
- small fade/slide behavior for dropdowns
- right-side slide-in for the mobile sheet
- notice badge fades and shifts in lightly

Typical timing is roughly `200ms` to `700ms`.

### Testimonials motion

- vertical marquee loops forever
- directions alternate `up / down / up`
- loop duration is `40s`
- marquee pauses on hover
- mask/fade treatment hides the loop seam

### Family motion

- executive gold band rotates continuously: `5.2s linear infinite`
- detail panel floats gently: `6s ease-in-out infinite`
- portrait crossfade: about `520ms`
- desktop orbit card transition: about `1100ms` with a smooth custom easing curve
- mobile board card transition: about `850ms`
- board auto-rotation interval: `3.8s`

Motion intent on Family:

- calm
- premium
- kinetic without chaos
- almost exhibition-like

### Event modal motion

- dark overlay fades in/out
- shell scales in/out
- mobile panes switch cleanly without theatrical effects
- clip navigation is driven mainly by scroll snapping and scroll position

The modal should feel modern and responsive, not overly dramatic.

## 9. Responsive Behavior

### Global

- mobile prioritizes stacked layouts, sheets, and compact controls
- desktop allows wider compositions and more ambient negative space

### Home

- hero remains centered
- intro treatment scales but stays full-screen

### Testimonials

- 1 column on small screens
- 2 columns on medium screens
- 3 columns on large screens

### Events

- event cards stack on smaller screens
- modal becomes a full-screen mobile experience
- desktop keeps the split details/media arrangement

### Family

- desktop orbit becomes a mobile slot-based carousel-like layout
- controls move from left rail to bottom dock
- portrait remains the visual anchor in both modes

## 10. Reusable Visual Patterns

Patterns that another model should keep reusing:

- rounded translucent white panels with light blur
- avatar stacks to signal people/groups
- pill filters and pill chips
- soft gray utility surfaces instead of harsh dividers
- image-first cards with text secondary
- gradient masks and softened edges
- motion that clarifies hierarchy rather than acting as decoration only

## 11. Things To Preserve

- Keep the font modern and geometric unless there is a strong reason to change it.
- Keep rounded-corner language strong.
- Preserve the contrast between dark cinematic hero areas and clean bright content sections.
- Keep the Family page warm, premium, and slightly artistic.
- Prefer blur, overlay, and layered surfaces over loud palettes.
- Preserve the navbar's dark/light theme awareness.
- When adding new sections, make them feel composed and art-directed, not generic app blocks.

## 12. Things To Avoid

- generic SaaS/dashboard styling
- flat white pages with no atmosphere
- too many accent colors
- tiny corner radii
- overly dense text blocks
- animation styles that break the current calm/cinematic tone
- replacing the Family concept with a plain grid unless the whole page is being intentionally simplified

## 13. Current Implementation Caveats

- `About.tsx` exists but is not currently rendered in `App.tsx`.
- Home nav/footer still reference `about-section`.
- Footer link groups are duplicated placeholders.
- Login is still a placeholder notice, not a real product flow.

## 14. One-Sentence Direction

If another AI needs a single guiding line: design this site like a modern ministry brand with a cinematic landing experience, clean media-driven event browsing, and a warm premium leadership/family page built from soft glassy layers, oversized rounding, and deliberate motion.
