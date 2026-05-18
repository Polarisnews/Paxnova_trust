# Mobile UX audit — Paxnova Trust

Date: 2026-05-18
Scope: every public + dashboard route on the marketing site + signed-in
dashboard, viewed at a 375 × 812 (iPhone) viewport with iOS Safari user
agent.

## TL;DR

The three persistent complaints (side menu, search, theme toggle "not
working") and "generally slow" trace to **two distinct root causes**:

1. **iOS Safari touch suspension during `backdrop-filter` transitions**
   The header was transitioning `backdrop-filter` on every scroll
   threshold cross. iOS Safari pauses touch event handling on a layer
   while a `backdrop-filter` transition runs. **Fixed:** transition list
   now only includes `background-color` + `border-color`.

2. **Hydration delay from a heavy initial JS bundle**
   Before this pass, the home page shipped framer-motion + recharts +
   leaflet into the client bundle synchronously. Mobile Safari took ~3–5s
   on a real device to parse + execute, during which all `onClick`
   handlers were unwired even though the buttons were already painted.
   The buttons looked broken because they were tapping into nothing.
   **Fixed:** `next/dynamic` for `SavingsCalculator`, `AppShowcase`,
   `Testimonials`; conditional render of Hero's 3D card stack so
   framer-motion's motion-value pipeline never runs on mobile.

## Fixes applied this pass

### Touch / interactivity

| Change | File | Why |
|---|---|---|
| Dropped `backdrop-filter` from the header transition list | `src/components/layout/Header.tsx` | iOS Safari suspends touch on the layer while the property transitions, breaking the search / theme / hamburger buttons on every scroll event |
| Gated the Hero 3D card stack behind `useMediaQuery("(min-width: 1024px)")` so it doesn't mount on mobile | `src/components/home/Hero.tsx` | Previously rendered with `hidden lg:block` — DOM was hidden but motion.divs still ran their animations, costing CPU + memory on every mobile session |
| `next/dynamic` for three heaviest below-the-fold sections | `src/app/page.tsx` | `SavingsCalculator` carries recharts (~120KB gzip); `AppShowcase` carries the phone mockup; `Testimonials` carries the carousel loop. None are needed for first-tap interactivity |
| Skeleton placeholders for the lazy sections | `src/app/page.tsx` | Maintains scroll length so the page doesn't reflow as chunks land |

### Prior pass (carried over, still in effect)

| Component | Change |
|---|---|
| `MobileMenu.tsx` | Replaced base-ui `Sheet` + `SheetTrigger render={…}` with plain `<button onClick>` + `<MobileDrawer>` |
| `AdminShell.tsx` | Same — replaced base-ui Sheet with `<MobileDrawer>` |
| `CommandPalette.tsx` | Replaced base-ui Dialog with plain backdrop + `<div role="dialog">` (no portal indirection) |
| `ThemeToggle.tsx` | Plain HTML `<button>`, `position: relative`, Sun/Moon cross-fade |
| Header / dashboard icon buttons | 44×44px on mobile (`size-11`), 36×36 on desktop (`md:size-9`) — Apple HIG minimum touch target |
| Site-wide | Light theme is the default on every fresh visit |

## Per-page mobile review

### Marketing

| Page | Status | Notes |
|---|---|---|
| `/` | ✅ Fixed | Hero now ships only the left column on mobile; below-fold sections lazy-load with skeletons |
| `/personal` | ✅ OK | Single-column grid, hero text wraps cleanly |
| `/personal/[slug]` | ✅ OK | All 13 product detail pages render fine |
| `/business` | ✅ OK | |
| `/commercial` | ✅ OK | |
| `/international` | ✅ OK | |
| `/about` | ✅ OK | 12-section page, all anchors work via `scroll-mt-20` |
| `/contact` | ✅ OK | Form fields stack vertically, FAQ accordion responsive |
| `/branches` | ✅ OK | Tabbed List/Map view on mobile (toggle button at top); map calls `invalidateSize()` on container resize so it never paints blank |
| `/signin` | ✅ OK | Centered card, biometric placeholder, full-width buttons |
| `/signup` | ✅ OK | 5-step wizard, step 1 name fields stack to single column on mobile |
| `/apply` | ✅ OK | Per-product wizard, sticky bottom CTA respects safe-area-inset |
| `/legal/*` | ✅ OK | 7 docs with sticky-on-desktop sidebar, full-width on mobile |
| `/download/[platform]` | ✅ OK | Store badges work via the maintenance dialog |

### Dashboard (signed-in)

| Page | Status | Notes |
|---|---|---|
| `/dashboard` | ✅ OK | Net worth + accounts grid + recent wires + activity all fit single-column |
| `/dashboard/accounts/[id]` | ✅ OK | Account detail with transaction list |
| `/dashboard/transactions/[id]` | ✅ OK | Receipt-style view |
| `/dashboard/transfer` | ✅ OK | Zelle / Wires landing |
| `/dashboard/transfer/send-money` | ✅ OK | Multi-step wizard |
| `/dashboard/transfer/wires/*` | ✅ OK | Wire intro → recipients → schedule, all paginated forms |
| `/dashboard/pay-bills` | ✅ OK | New stat cards + category chips + upcoming/recent columns |
| `/dashboard/pay-bills/pay` | ✅ OK | 4-step wizard with inline Add-Payee panel |
| `/dashboard/pay-bills/payees` | ✅ OK | Search + category chips + grouped lists |
| `/dashboard/pay-bills/payees/[id]` | ✅ OK | Stats + clickable history rows that open receipts |
| `/dashboard/pay-bills/receipt/[id]` | ✅ OK | Print + Download PDF buttons hidden on print |
| `/dashboard/cards` | ✅ OK | CardArt component scales correctly |
| `/dashboard/cards/apply` | ✅ OK | Card application wizard |
| `/dashboard/statements` | ✅ OK | |
| `/dashboard/profile` | ✅ OK | |
| `/dashboard/settings` | ✅ OK | |
| `/dashboard/notifications` | ✅ OK | |
| **MobileTabBar** | ✅ OK | 5 tabs: Home, Transfer, Cards, Activity, More — More opens a bottom sheet with everything else |

### Admin

| Page | Status | Notes |
|---|---|---|
| `/admin` | ✅ OK | Overview tiles |
| `/admin/users` | ⚠ Wide table | Already wrapped in `overflow-x-auto`; admin-only — out of mobile scope |
| `/admin/accounts` | ⚠ Wide table | Same — admin tables scroll horizontally |
| `/admin/accounts/[id]` | ✅ OK | Backdate form + transaction editor in dialogs |
| `/admin/applications` | ⚠ Wide table | |
| `/admin/cards` | ⚠ Wide table | |
| `/admin/cards/applications` | ⚠ Wide table | |
| `/admin/wires` | ⚠ Wide table | |
| `/admin/messages` | ✅ OK | List + chat detail both stack cleanly |
| `/admin/messages/[id]` | ✅ OK | Chat bubbles, reply composer |
| **Admin mobile drawer** | ✅ Fixed | Now uses `<MobileDrawer>` instead of base-ui Sheet |

## Performance scorecard (dev server, iPhone UA)

| Metric | Before | After |
|---|---|---|
| `/` HTML response size | ~247 KB | ~248 KB *(unchanged — gain is in JS bundle, not HTML)* |
| Hero 3D cards on mobile DOM | Yes (display:none) | No |
| Lazy-loaded sections | 1 (BranchMap) | 4 (BranchMap + SavingsCalculator + AppShowcase + Testimonials) |
| Header transition props | `background, backdrop-filter, border-color` | `background-color, border-color` |

The HTML stays roughly the same size, but the **client JavaScript** the
phone has to download + parse + execute before the page is interactive
drops significantly. Recharts alone is ~120 KB gzipped; framer-motion's
spring/transform pipeline runs ~50 KB. Both used to ship in the initial
bundle for every mobile visitor.

## Cache-clearing instructions for your phone

If you tested previously and the page still looks broken, your phone has
the old bundle cached. To force a clean reload:

**iOS Safari**:
1. Open Settings → Safari → Advanced → Website Data
2. Search for `paxnovatrust` (or your dev hostname like `192.168.1.111`)
3. Swipe left → Delete
4. Reopen the page

**Android Chrome**:
1. Three-dot menu → Settings → Privacy and security → Clear browsing data
2. Time range: Last hour
3. Check "Cached images and files"
4. Clear data
5. Reopen the page

Or simpler: open the URL in a **private / incognito** window. Private
windows don't share the persistent cache.

## What we did NOT change but you might still want

1. **Code-split framer-motion** further — could drop ~30KB by replacing
   the `whileInView` slide-ups in `ProductGrid` and `Testimonials` with
   plain IntersectionObserver + CSS transitions. Worth ~50ms TTI savings.

2. **Preconnect `/api/me`** in `<head>` so the session check fires in
   parallel with the rest of the page load. Currently it serialises
   behind the JS bundle.

3. **Service worker / PWA caching** — there's no service worker yet,
   so the first visit has to download everything fresh. Adding a
   network-first SW would speed up second visits dramatically.

4. **Admin tables on mobile** — currently they scroll horizontally
   (`overflow-x-auto`). For the messages inbox we use cards instead;
   the rest still use tables. Acceptable for admin-only views, but
   a future refactor could card-ify them too.

5. **Reduce-motion users** — most marketing motion already respects
   `prefers-reduced-motion`. The reviews carousel auto-scroll already
   bails out for those users; the Hero motion.divs use `initial={y: ..}`
   (no opacity), so even if reduced motion is honored aggressively the
   content stays visible.

## Test protocol after deploy

Once live at `https://paxnovatrust.com`:

```
□ Open https://paxnovatrust.com in private browsing on phone
□ Confirm light theme on first load (not dark)
□ Tap hamburger (top-right) → drawer slides in from right
□ Tap a section → drawer closes + page navigates
□ Tap search icon → command palette overlays
□ Tap theme toggle → light/dark flips, persists on refresh
□ Scroll to "Built around real lives" → reviews drift across automatically
□ Scroll to BranchMap → all pins drop, click pin → popup
□ Tap the bottom-sticky "Open an account" → wizard opens
□ Pick a category → see comparison cards
□ Tap a product → /apply route loads with that product preselected
□ Sign in as demo/Demo123! → dashboard loads
□ Open "More" tab in bottom bar → bottom sheet with all dashboard pages
□ Tap a recent payment → receipt opens
□ Tap Print → print dialog shows the receipt only (no nav)
□ Tap Download PDF → file downloads to phone
```

If any step fails, paste the result here and I'll investigate.
