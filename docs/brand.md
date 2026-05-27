# Wildflower Media brand (v1)

Design tokens and patterns used across the site. Implementation lives in [`app/globals.css`](../app/globals.css) and [`lib/brand.ts`](../lib/brand.ts).

## Logos

| Asset | Path | Usage |
|-------|------|--------|
| Network lockup | `/brand/wildflower-lockup.png` | Sidebar, footer |
| The Music Snobs | `/brand/tms-record.png` | TMS hero, show cards |
| Snobs On Film | `/brand/sof-logo.png` | SOF sections; invert on navy backgrounds |

Do not stretch or recolor logo marks independently of approved lockups.

## Color

| Token | Hex | Role |
|-------|-----|------|
| `tms-orange` | `#FA9819` | TMS accent, active nav, CTAs |
| `tms-orange-tint` | `#FFF4E5` | TMS section wash (hero backgrounds) |
| `deep-orange` | `#CD4900` | Hover / emphasis |
| `sof-navy` | `#1E3D59` | SOF sections, subscribe button |
| `primary` | `#022742` | Headlines, body links |
| `background` | `#f7fafe` | Page shell |
| `surface` | `#eef1f5` | Merch / alternate section background |
| `on-surface-variant` | `#43474d` | Secondary text |

Show pages: TMS uses light surfaces; SOF uses `bg-sof-navy` with white type.

## Typography

- **UI & headlines:** Rethink Sans (`font-sans`, `font-heading`)
- **Editorial body:** Hedvig Letters Serif (`font-editorial`)

Scale utilities: `text-display-lg`, `text-headline-lg`, `text-headline-lg-mobile`, `text-editorial-body`, `text-label-caps`, `text-ui-medium`.

## Layout

- Sidebar: `256px` (`w-64`), `bg-surface-container-low`
- Content max width: `container-max` (1280px)
- Horizontal padding: `px-margin-md` (40px)
- Section gaps: `gap-gutter` (24px), vertical `py-margin-lg` (80px)

## Components

- **Glass player:** Fireside embed wrapper (`.glass-player` or `variant="on-dark"` on navy)
- **Buttons:** `variant="brand"` for orange CTAs; `default` for navy
- **Merch cards:** `aspect-[4/5]`, hover scale on image

## Patterns

1. Featured show hero (TMS): eyebrow → headline → editorial dek → player → art
2. Peer show band (SOF): navy background, inverted logo, on-dark player
3. Wildflower Goods grid: 3-up product cards, link to `/shop`
4. Mission block: centered quote, `text-sof-navy` display line
