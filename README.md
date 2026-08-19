# 🐎 Ford Mustang — Premium Landing Page Redesign

A cinematic, Product Hunt-style landing page concept for the **Ford Mustang**, built with **React + Vite**.

The centerpiece is a **scroll-driven video reveal** — the Mustang starts hidden under a dark cloth, and the user physically uncovers it by scrolling.

![Ford Mustang Landing Page](.public\mustang\dark-horse-sc\hero.png)

---

## ✨ Features

- **Scroll-driven video scrubbing** — native page scroll controls `video.currentTime` via `requestAnimationFrame`
- **Mobile touch support** — native swipe gesture on 390px (no `touch-action: none`)
- **Cinematic hero** — deep black background, bold typography, vignette overlay
- **Three content sections** — Design, Performance, Interior
- **One micro-interaction** — card hover lift + text brighten + accent bar
- **Fully responsive** — 390px mobile and 1440px desktop
- **Accessible** — semantic HTML, ARIA labels, focus styles, `prefers-reduced-motion`
- **Performance optimized** — RAF batching, `loadedmetadata` guard, `muted` + `playsInline`

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Navbar/           # Minimal fixed nav with glass scroll effect + mobile menu
│   ├── HeroReveal/       # ⭐ Scroll-driven video scrub (the core interaction)
│   ├── DesignSection/    # Design story with SVG silhouette card
│   ├── PerformanceSection/ # 3 feature cards with hover micro-interaction
│   ├── InteriorSection/  # Split layout with dashboard SVG illustration
│   └── Footer/           # Brand footer with navigation
├── App.jsx               # Root component
├── main.jsx              # React entry point
└── index.css             # Global design system tokens & utilities
```

---

## 🎬 How the Scroll-Driven Video Works

### 1. Scroll Position → `video.currentTime`

```js
// HeroReveal.jsx — core mapping logic
const { top, height } = section.getBoundingClientRect();
const scrollable = height - window.innerHeight;  // total scrollable px
const raw = -top;                                 // px scrolled into section
const progress = Math.min(1, Math.max(0, raw / scrollable)); // 0 → 1

video.currentTime = progress * video.duration;
```

The hero section is `500vh` tall. As you scroll through it, the sticky viewport stays pinned and the progress `0→1` is mapped linearly to the video's duration (`0s → 14.4s`).

### 2. Mobile Touch (390px)

Native `scroll` events fire on mobile exactly like desktop — no custom touch handlers needed. The `{ passive: true }` scroll listener ensures the browser never blocks the swipe gesture. Native scrolling moves the page → page scroll position changes → `requestAnimationFrame` picks it up → `video.currentTime` advances.

**What was NOT used:**
- `touch-action: none` ❌
- `touchmove` event interception ❌
- Custom drag interaction ❌

### 3. Performance Optimizations

| Technique | Why |
|---|---|
| `requestAnimationFrame` | Batches DOM writes to paint cycles |
| `lastProgressRef` delta check | Skips seeks if progress hasn't changed meaningfully (< 0.05%) |
| `{ passive: true }` scroll listener | Never blocks browser scroll performance |
| `loadedmetadata` guard | Only seeks after `video.duration` is valid |
| `video.load()` on mount | Triggers iOS/Safari to buffer seekable ranges |
| `muted` + `playsInline` | Required for autoplay/seek on mobile browsers |
| No React state in scroll handler | Zero re-renders during scrubbing |

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## 📦 Building for Production

```bash
npm run build
# Output in /dist
```

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

### Option B — Vercel Dashboard

1. Push to GitHub (this repo)
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**

> **Note:** The video file (`~19MB`) is served from `/public` and will be included in the Vercel deployment automatically.

---

## 🎨 Design Principles

- **Pure black background** — entire site is intentionally dark
- **No fabricated data** — no fake testimonials, stats, or social proof
- **Qualitative copy only** — honest product language throughout
- **One micro-interaction** — hover on performance cards (lift + brighten + accent bar)
- **Typography** — Bebas Neue (display) + Rajdhani (headings) + Inter (body)

---

## 📋 Tech Stack

- **React 18** + **Vite 8**
- **Vanilla CSS** (design system tokens via CSS custom properties)
- **Google Fonts** — Bebas Neue, Rajdhani, Inter
- **No external UI libraries**

---

*This is a concept design project for portfolio/educational purposes. Not an official Ford Motor Company communication. Ford® and Mustang® are registered trademarks of Ford Motor Company.*
