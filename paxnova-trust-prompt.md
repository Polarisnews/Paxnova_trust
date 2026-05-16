# Paxnova Trust Bank — Build Spec (Claude Code Prompt)

You are building **Paxnova Trust Bank**, a sophisticated, modern banking marketing
website. Design language is *inspired by* eastwestbank.com's information
architecture and section composition — but the visual identity, copy, color
palette, logo, and brand voice are entirely original. Goal: a site that feels
like a premium 2026 fintech (Mercury × Revolut × Chase Private Client) while
structurally covering the product surface area a traditional bank covers.

---

## Critical Constraints (read first, do not violate)

- **DO NOT** copy any text, image, logo, or asset from eastwestbank.com. Use the
  URL only as a structural reference (which sections exist, what order they
  appear in, what product categories are offered). All copy is original, written
  in a confident modern-bank tone.
- **DO NOT** use "lorem ipsum" — write real, plausible marketing copy throughout.
- **DO NOT** add real authentication, real payments, or collect real personal
  data. All forms validate locally and simulate submission with a success state.
- **DO NOT** include emoji in production output unless used as a deliberate icon.
- Make sensible decisions autonomously. Only stop to ask the user if a
  constraint here is genuinely ambiguous.

---

## Tech Stack (use exactly this)

- **Framework**: Next.js 15 (App Router) with TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: shadcn/ui (install only the primitives actually used)
- **Animation**: Framer Motion for section/page transitions, `tailwindcss-animate` for micro-interactions
- **Icons**: lucide-react
- **Fonts**: Inter (body) + Geist (display) via `next/font/google`
- **Forms**: react-hook-form + zod
- **Charts**: recharts (savings calculator, dashboard sparklines)
- **Map**: react-leaflet + OpenStreetMap tiles (branch locator demo)
- **Client state**: zustand (mock dashboard)
- **Command palette**: cmdk
- **Toasts**: sonner
- Node 20+. Prefer `pnpm`; fall back to `npm` if pnpm is unavailable.

---

## Setup Steps

1. Initialize at the current working directory root:
   `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --no-turbopack`
2. Install deps: `pnpm add framer-motion lucide-react react-hook-form zod @hookform/resolvers zustand recharts react-leaflet leaflet cmdk sonner`
3. Init shadcn: `npx shadcn@latest init -d` (defaults, neutral base)
4. Add shadcn primitives: `button card input label dialog sheet dropdown-menu tabs accordion badge separator tooltip navigation-menu select`
5. Run `pnpm dev`, verify the placeholder loads at http://localhost:3000 before continuing.

---

## Brand & Design System

### Color tokens (define in `src/app/globals.css` as Tailwind v4 `@theme` block)

```
--color-navy-50:    #EEF1F8
--color-navy-100:   #D6DDEB
--color-navy-500:   #1E3A6B
--color-navy-700:   #0F2451
--color-navy-900:   #0A1A3C   /* primary */
--color-violet-300: #B9A3FA
--color-violet-500: #6E3FF3   /* accent */
--color-violet-700: #4F22C7
--color-gold-300:   #E8C76A
--color-gold-500:   #D4AF37   /* highlight */
--color-gold-700:   #A6831A
--color-canvas:     #F7F8FC   /* page background */
--color-ink:        #0B1220   /* body text */
--color-ink-muted:  #4A5568
--color-success:    #0E9F6E
--color-danger:     #E11D48
```

Tailwind utility aliases: `bg-primary` → navy-900, `bg-accent` → violet-500,
`bg-highlight` → gold-500, `text-ink`, `text-ink-muted`, `bg-canvas`.

### Dark mode tokens

- canvas: `#07090C`
- surface: `#0F1216`
- elevated: `#1A1F2A`
- ink: `#FFFFFF`
- ink-muted: `#A3B0C2`
- primary stays navy-900 but used sparingly; violet-500 becomes the dominant brand color in dark mode.

### Typography scale

- Display (hero H1): Geist 64 / 1.05 / -0.02em / weight 600
- H2: 40 / 1.15 / -0.015em
- H3: 28 / 1.25
- Body: Inter 16 / 1.6
- Small: 14 / 1.5
- Caption: 12 / 1.4 uppercase tracking-wider

### Radii, shadows, motion

- Radii: sm=6, md=10, lg=16, xl=24, pill=9999
- Shadows: `shadow-soft` = `0 4px 20px rgba(10,26,60,0.06)`, `shadow-elev` = `0 12px 40px rgba(10,26,60,0.12)`
- Motion easing: `cubic-bezier(0.16,1,0.3,1)`; default duration 280ms; always wrap motion in a `useReducedMotion` guard.

---

## Logo

Build `src/components/brand/Logo.tsx` as pure inline SVG (no PNG):

- **Mark**: a geometric "N" formed by two interlocking chevrons — one navy
  `#0A1A3C`, one violet `#6E3FF3` — with a thin gold `#D4AF37` accent stroke
  bridging them (symbolizing trust + forward motion).
- **Wordmark**: "Paxnova Trust" in Geist 600, navy, with the crossbar of the "T"
  extended slightly in gold.
- Export three variants: `variant="full"` (mark + wordmark), `variant="mark"`
  (icon only), `variant="mono-light"` (white-on-dark for dark backgrounds and
  the footer).
- Also produce `src/app/icon.svg` (32×32 mark) for the favicon.

---

## Page Inventory (build all 6 plus the bonus dashboard)

### 1. `/` — Homepage

Top to bottom:

1. **Sticky nav** — transparent over the hero, becomes solid navy + backdrop blur on scroll. Mega-menu under "Personal," "Business," "Wealth," "About." Right side: "Find a Branch," search icon, "Sign In" (violet pill).
2. **Hero** — full-bleed dark gradient (navy → violet 30%). Eyebrow caption ("Banking, refined."), display headline, 2-line subhead, two CTAs (primary gold "Open an account," secondary outline "Explore products"). Right column: a 3D-feel stack of three credit cards fanned, gently rotating on mouse parallax (Framer Motion `useMotionValue` + `useTransform` on mousemove).
3. **Trust strip** — five "as featured in" credits as styled text only (Financial Times, Bloomberg, Forbes, WSJ, TechCrunch). No real logos.
4. **Product grid 3×2** — Checking, Savings, Credit Cards, Mortgages, Wealth Management, Business Banking. Each card: lucide icon, 1-line value prop, "Learn more →" link. Hover: lift + violet glow.
5. **Rates ticker** — horizontal marquee of mocked rates (`30Y Fixed 6.42%`, `HYSA 4.85% APY`, etc.). Pauses on hover.
6. **Interactive savings calculator** — sliders for monthly deposit + years, live recharts area chart of projected balance at 4.85% APY compounding monthly. Real math.
7. **Mobile app showcase** — copy + App Store/Play Store badges on the left; pure-CSS/SVG phone mockup on the right with a fake app screen (no real app shots).
8. **Testimonials** — 3 cards, initials-in-circle avatars, original quotes, name, role.
9. **Branch locator teaser** — small react-leaflet map centered on NYC with 5 mock pins, "Find your branch" CTA → `/locations` (stub route OK).
10. **Footer mega-menu** — 5 columns (Products, Company, Resources, Legal, Connect) + newsletter signup + social icons + FDIC disclosure stub + © 2026 Paxnova Trust Bank.

### 2. `/personal` — Personal Banking

Hero + shadcn Tabs (Checking / Savings / Credit Cards / Loans / Mortgages). Each tab: feature list, rate table, eligibility, "Apply now" CTA opening a simulated multi-step modal that ends in a success state. Side rail: "Compare accounts" widget.

### 3. `/business` — Business Banking

Hero + 3 pricing-style tier cards (Startup / Growth / Enterprise) with feature checklists + "Talk to a specialist" CTAs. Treasury Services accordion. Animated counter stats strip ("$2.4B managed for SMBs," etc.) using Framer Motion `useMotionValue` interpolation.

### 4. `/about` — About

Brand story (3 short paragraphs, original). Timeline component (founded 2026, fictional but tasteful milestones). Leadership grid (6 fictional execs with initials avatars, titles, 1-line bios). ESG section. Careers CTA.

### 5. `/contact` — Contact

Two-column: contact form (react-hook-form + zod, simulated submit → sonner toast success) and an info card (phone, email, HQ, hours, secure-message link). Below: FAQ accordion with 6 entries.

### 6. `/signin` — Sign In (simulated)

Centered card, username + password fields, "Sign in" routes to `/dashboard` with seeded mock state. Below the card: "Open an account" link, "Forgot username/password," biometric login icon (visual only). Right rail: "Security tips" sidebar.

### Bonus: `/dashboard` — Simulated logged-in view

Sidebar nav (Accounts, Transfer, Pay Bills, Cards, Investments, Settings). Main: three account cards (Checking $8,432.10, Savings $24,910.55, Credit Card $-1,204.33) with sparklines. Recent transactions list (10 seeded entries). "Transfer money" CTA opens a shadcn Sheet drawer; transfers update displayed balances in real time via Zustand (state resets on refresh — no persistence).

---

## 2026 UX Features (must include)

- **Dark mode** toggle in nav (system + manual), persisted to `localStorage`.
- **Command palette** (Cmd/Ctrl+K) via `cmdk` for jumping to pages, products, FAQ entries.
- **Scroll-driven animations**: hero card parallax; section reveals via `whileInView`; one sticky-pinned product showcase on the homepage.
- **Reduced motion** respected everywhere (`useReducedMotion` guard).
- **Skeleton loaders** for dashboard cards and the map.
- **Mobile-first**: bottom tab bar on the mobile dashboard; hamburger → full-screen sheet menu on marketing pages with staggered link reveal.
- **Accessibility**: keyboard navigation works end-to-end; visible violet focus rings; ARIA labels on icon-only buttons; AA body contrast, AAA on primary CTAs.
- **Perf**: `next/image` everywhere; `next/font` with `display: swap`; Lighthouse Performance ≥ 90 desktop, ≥ 85 mobile on `/`.
- **SEO**: per-page metadata via Next 15 `generateMetadata`; OG images via `next/og`.

---

## File Structure (target)

```
src/
  app/
    layout.tsx
    page.tsx                 (/)
    personal/page.tsx
    business/page.tsx
    about/page.tsx
    contact/page.tsx
    signin/page.tsx
    dashboard/
      layout.tsx
      page.tsx
    globals.css
    icon.svg
  components/
    brand/Logo.tsx
    layout/Header.tsx
    layout/Footer.tsx
    layout/MobileMenu.tsx
    layout/CommandPalette.tsx
    layout/ThemeToggle.tsx
    home/Hero.tsx
    home/ProductGrid.tsx
    home/RatesTicker.tsx
    home/SavingsCalculator.tsx
    home/AppShowcase.tsx
    home/Testimonials.tsx
    home/BranchTeaser.tsx
    dashboard/AccountCard.tsx
    dashboard/TransactionList.tsx
    dashboard/TransferDrawer.tsx
    ui/...                   (shadcn primitives)
  lib/
    mock-data.ts
    utils.ts
    store.ts                 (zustand)
```

---

## Execution Order (do in this order, don't skip ahead)

1. Run Setup Steps 1–5. Verify dev server runs.
2. Define design tokens in `globals.css`, set up `next/font` in `layout.tsx`.
3. Build `Logo.tsx` and verify the 3 variants on a scratch route.
4. Build `Header`, `Footer`, `MobileMenu`, mount them in root layout.
5. Build homepage section by section, top to bottom. Commit after the hero, after the product grid, after the calculator, after testimonials, after the footer.
6. Build `/personal`, `/business`, `/about`, `/contact`, `/signin` in that order.
7. Build `/dashboard` last.
8. Polish pass: command palette, dark-mode toggle, reduced-motion audit.
9. Run `pnpm build` and resolve all TS / lint errors before declaring done.

---

## Definition of Done

- `pnpm build` succeeds with zero errors and zero TS warnings.
- All 7 routes load without console errors in dev.
- No copy or asset is verbatim copied from eastwestbank.com.
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95 on `/`.
- Keyboard-only navigation works for the homepage and the sign-in flow.
- Dark mode toggle works on every page.
- Cmd/Ctrl+K opens the command palette and can jump to all 7 pages.

---

## Reporting

When complete, output:

- Routes built + word count of original copy per page.
- Any product specs you invented (rates, fees, exec names) and your assumptions.
- Mock data sources, so the user knows what to swap when going to production.
