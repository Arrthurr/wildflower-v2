# Wildflower verification map

This directory is the maintained source for verifying user-facing behavior of the Wildflower Media site. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `.cursor/skills/verify-wildflower/scripts/verify-wildflower.sh launch`.
- Require `doctor` to print `url=http://127.0.0.1:3117` and `status=200`.
- Drive only that process. Never attach to another `next dev` on this checkout.
- Use `agent-browser --session wildflower-verify` and viewport `1280 800` unless the recipe says mobile.
- `.env.local` must contain the Clerk and Convex public keys the app already uses. Shop listings also need `PRINTFUL_API_KEY`.
- Do not start `npm run convex:dev`.

## Driving conventions

- Start every recipe from the shows index unless its preconditions say otherwise.
- Snapshot with `agent-browser --session wildflower-verify snapshot -i`, then `click` or `fill` the `@eN` ref whose line matches the accessible name in the recipe.
- `find role` and `find text` do not see these links. Do not use them as the proof path.
- Treat every command as literal. Keep the session flag unchanged.
- Re-snapshot after navigation. The previous `@eN` values are stale.
- Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes the command, the URL, an interactive snapshot, and a screenshot.
- Record the feature id and the entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.
- Sponsor submit and cart edits write to the shared Convex deployment. Skip those writes unless the user asked for them, and say that they were skipped.

## Feature entry contract

Each feature file starts with an H1 and one paragraph, then exactly four H2 sections: `Sub-features`, `How to get to it (user POV)`, `Driving it with agent-browser`, and `Gotchas`.

## Features

- [Shows](./shows.md) covers the shows index and both show pages.
- [Shop](./shop.md) covers the merch catalog and a product page when Printful returns products.
- [About](./about.md) covers the about page and its sponsor link.
- [Sponsor](./sponsor.md) covers the inquiry form. Submitting it writes to shared Convex.
- [Cart](./cart.md) covers the signed-out cart drawer.
