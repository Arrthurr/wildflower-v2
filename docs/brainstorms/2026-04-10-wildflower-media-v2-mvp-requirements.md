---

## date: 2026-04-10

topic: wildflower-media-v2-mvp

# Wildflower Media v2: Commerce-First MVP

## Problem Frame

Wildflower Media currently operates a WordPress site (wildflowerpodcasts.com) that serves as a passive RSS support layer for two popular podcasts: **The Music Snobs** and **Snobs On Film**. The real consumption happens in podcast apps, not on the website. The current site provides minimal value beyond feed hosting and uses WordPress + Elementor, which the owner wants to move away from.

The goal is to transform this passive support site into a lightweight media brand hub that generates direct revenue through merchandise and builds toward future sponsorship and community features.

## Requirements

### Core Migration

- **R1. Platform Migration**: Move from WordPress/Elementor to Next.js hosted on Vercel. Maintain domain (wildflowerpodcasts.com).
- **R2. Episode Source**: Use Fireside as the source of truth for all episode content. Pull episode data (titles, descriptions, artwork, audio URLs) via Fireside API at build time or dynamically. Do not migrate 104 episodes from WordPress—link to or embed from Fireside.
- **R3. Show Structure**: Create dedicated landing pages for the two flagship shows: **The Music Snobs** and **Snobs On Film**. Each page displays recent episodes with Fireside embeddable players.

### Commerce (Phase 1)

- **R4. User Authentication**: Implement user accounts via Clerk. Support email/password and social login (Google, Apple). Users must authenticate before checkout.
- **R5. Product Catalog**: Display print-on-demand t-shirt designs via Printful integration. Show product images, sizes, pricing, and availability pulled from Printful API.
- **R6. Shopping Cart**: Persistent cart that survives across sessions (stored per-user in Convex or localStorage for guests). Add, remove, and update quantities.
- **R7. Checkout Flow**: Checkout powered by Polar. Handle payment processing, tax calculation, and order confirmation. Post-order, trigger Printful order creation for fulfillment.
- **R8. Order History**: Authenticated users can view their order history and order status.

### Content & Discovery

- **R9. Homepage**: Hero section featuring both shows, recent episodes, and prominent commerce CTA (shop t-shirts).
- **R10. Episode Display**: List recent episodes per show with artwork, title, publish date, and Fireside embed player. Limit to last 10-20 episodes; link to Fireside.fm for full archive.
- **R11. About/Network Page**: Brief description of Wildflower Media, hosts, and contact information.

### Foundation for Future Features

- **R12. Social Sharing Foundation**: Implement share buttons (Twitter/X, Facebook, copy link) on episode pages. Track share events in Convex for Phase 2 rewards program.
- **R13. Sponsor Page Placeholder**: Simple "Contact for Sponsorship" page with email form. No self-serve features in MVP—defer to Phase 2.

## Success Criteria

- Site loads significantly faster than current WordPress site (target: <2s Lighthouse performance score)
- Users can browse t-shirts, add to cart, and complete purchase end-to-end
- Episode pages display properly with working Fireside embeds
- Zero content management required in new platform—Fireside remains source of truth
- Site maintains SEO rankings for existing show/episode URLs (implement redirects if URL structure changes)

## Scope Boundaries

### In Scope (MVP)

- Next.js site with Vercel hosting
- Clerk authentication
- Printful catalog integration + Polar checkout
- Two show landing pages + homepage
- Fireside episode embedding (last 10-20 episodes)
- Basic social sharing buttons
- Contact form for sponsor inquiries

### Out of Scope (Phase 2)

- Full WordPress content migration (all 104 episodes)
- Self-serve sponsorship portal or booking system
- Social rewards program (track shares now, add rewards later)
- User-generated content (comments, reviews)
- Email newsletter system
- Mobile apps
- Advanced analytics dashboard

## Key Decisions

- **Next.js/Vercel**: Chosen for modern React ecosystem, excellent performance, and seamless integration with headless commerce APIs.
- **Fireside as Source of Truth**: Eliminates migration complexity and keeps content synchronized. Episode content lives in Fireside; new site is a presentation layer.
- **Commerce First**: Prioritizing revenue-generating features before social/community features. Validates business model before investing in engagement.
- **Hybrid Episode Strategy**: Show recent episodes natively; link to Fireside for full archive. Balances discovery experience with development scope.
- **Phase 2 Deferrals**: Sponsorship tools, social rewards program, and full archive migration deferred to keep MVP within 2-3 week timeline.

## Dependencies / Assumptions

- Fireside API provides sufficient episode metadata and embeddable player URLs
- Printful account is active with at least one t-shirt design ready for sale
- Clerk, Convex, and Polar accounts are provisioned and ready for integration
- Current WordPress site can remain live during development; DNS cutover happens at launch
- Polar supports webhooks or API for triggering Printful fulfillment on successful payment
- Domain DNS can be updated to point to Vercel

## Outstanding Questions

### Resolve Before Planning

- None—all key product decisions resolved during brainstorm.

### Deferred to Planning

- [Affects R5, R7][Needs research] Exact Printful API endpoints and authentication method for fetching products and creating orders
- [Affects R7][Needs research] Polar webhook structure and whether it supports automatic Printful order triggering or requires middleware
- [Affects R2][Technical] Fireside API rate limits and whether to use static generation (build-time fetch) or ISR (incremental static regeneration) for episode data
- [Affects R1][Technical] Current WordPress URL structure to plan 301 redirects for SEO preservation

## Alternatives Considered

- **Webflow**: Rejected due to limitations on custom commerce flows and long-term flexibility for social features
- **Migrate all 104 episodes from WordPress**: Rejected as unnecessary scope—Fireside is already the functional source of truth
- **Start with social features before commerce**: Rejected—commerce provides immediate revenue validation while building toward larger vision

## Next Steps

→ `/ce:plan` for structured implementation planning

Focus areas for planning:

1. Tech stack setup (Next.js + Tailwind + shadcn/ui)
2. Data architecture (Convex schemas for users, cart, orders)
3. Third-party integration sequencing (Clerk → Printful → Polar)
4. Content strategy (Fireside API exploration)
5. Deployment and DNS migration plan