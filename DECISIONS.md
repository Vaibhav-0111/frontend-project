# DECISIONS.md

**Track:** Part 2 — The Premium Home Page
**Project:** Ford Mustang concept landing page (React + Vite + Framer Motion)

## 1. Why this approach over the obvious alternative I rejected

The obvious route for a "wow in 3 seconds" hero is a static full-bleed photo with a fade-in
headline — safe, fast to ship, zero risk. I rejected it for a **scroll-scrubbed hero video**
instead: the reveal video's `currentTime` is driven directly by scroll position (via a
Framer Motion spring on `scrollYProgress`), so the car "unveils" itself as the user scrolls
rather than on a timer. It's a more expensive build (had to hand-roll the rAF sync loop,
guard against `loadedmetadata` races, and handle autoplay-block fallbacks) but it's the one
thing on the page that can't be mistaken for a template — it's the actual differentiator a
Product Hunt audience stops scrolling for.

I also rejected pulling in Three.js for the `/performance` sub-page simulator in favor of
plain Canvas 2D (custom `roadRenderer`/`gaugeRenderer`/`carRenderer`). Three.js is the
"obvious" choice for a car scene, but for a 2D gauge cluster + parallax road it's a bundle-size
tax with no payoff — Canvas 2D kept that route's JS small and let it be lazy-loaded separately
from the landing page bundle.

## 2. One trade-off under the time limit — and what I'd do with a real week

**Trade-off:** the loader is gated on a full ~8s music cycle finishing (car drives across screen
in sync with `loader_music.mp3`) rather than dismissing the instant assets are ready. It's a nice
piece of choreography but it forces every visitor through a fixed intro with no skip control —
the wrong call for a page that's supposed to earn attention in 3 seconds, not spend 8 of them.

**With a real week** I'd: (1) add a skip-intro tap target and shorten the fallback ceiling,
(2) re-encode the 19MB hero MP4 to a properly keyframe-dense, multi-resolution asset with a
poster frame so first paint isn't blocked on video weight, and (3) replace the single reveal
animation pattern (opacity + translateY, reused across all three sections) with distinct motion
per section so the page doesn't read as one effect copy-pasted three times.

## 3. Where I used AI tools, and what I verified/changed afterward

Used Claude throughout for: scaffolding component structure, debugging the scroll-sync rAF loop
(an early version drifted out of sync with the video on resize — I traced and fixed the
`travel`/geometry remeasure logic myself after AI flagged the symptom), and a subsequent code
review pass that surfaced real issues I hadn't caught — no route-level code splitting (fixed by
lazy-loading `PerformanceLab`), sections defaulting to `opacity: 0` with no no-JS fallback, and
two unused/unrelated audio files sitting in `/public` (one a copyrighted commercial track) that
I deleted before submission. All copy, spec data, and the design decisions above are mine —
no fabricated testimonials, user counts, or logos anywhere on the page, per the brief's honesty
constraint.
