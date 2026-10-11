---
name: verify-wildflower
description: "Drive the Wildflower Media Next.js site in a browser and prove a user-facing change. Use when verifying pages, navigation, shop, shows, sponsor, or cart behavior in this repo."
---

# Verify Wildflower

Wildflower Media is a Next.js web app. Public pages (home, shows, shop, about, sponsor) are the primary surface. Cart, checkout, and account pages also use Clerk and the shared Convex deployment named in `.env.local`. Webhook and checkout scripts under `scripts/` (`npm run e2e:pipeline`, `npm run e2e:webhook`) hit Polar and Printful; they are not this skill's drive path.

Two `next dev` processes cannot share this checkout. They fight over `.next`. Convex and Clerk are remote and shared, so a second port does not isolate cart, account, or sponsor writes.

## Launch

From the repo root:

```bash
.cursor/skills/verify-wildflower/scripts/verify-wildflower.sh launch
```

This starts `npm run dev -- --port 3117`, records the pid in `tmp/verify-wildflower/run/pid`, and waits until `http://127.0.0.1:3117/shows` returns 200. Ready output includes `url=http://127.0.0.1:3117`.

Do not start `npm run convex:dev` for this. Public pages and Convex client calls use `NEXT_PUBLIC_CONVEX_URL` from `.env.local`.

If launch refuses because another `next dev` already uses this checkout, stop that server first. Do not point the browser at the user's existing dev server.

Teardown is `cleanup` below. Run it after a failed launch too.

## Doctor

```bash
.cursor/skills/verify-wildflower/scripts/verify-wildflower.sh doctor
```

Pass requires all of these:

- the pid in `tmp/verify-wildflower/run/pid` is alive
- port `3117` is listened on by that process or one of its descendants
- `GET /shows` returns 200

Anything else means this instance is not worth driving.

## Drive

Use `agent-browser` 0.31+ with session `wildflower-verify` so this run does not attach to another browser. Set a desktop viewport so the sidebar nav is visible (`lg` and up).

`find role` and `find text` return "Element not found" for links that `snapshot -i` lists. Drive by snapshot ref instead. Refs go stale after navigation, so snapshot again before the next click.

```bash
agent-browser --session wildflower-verify set viewport 1280 800
agent-browser --session wildflower-verify open http://127.0.0.1:3117/
agent-browser --session wildflower-verify snapshot -i
agent-browser --session wildflower-verify click @eN
```

`@eN` is the ref on the snapshot line with the accessible name in the feature file. Home can sit on Fireside iframes before the sidebar appears; snapshot until `link "Shows"` is listed, then click that ref.

Stable names: nav links `Shows`, `Merch`, `About`, `Sponsor`; headings `Shows`, `The Music Snobs`, `Snobs On Film`, `Wildflower Goods`, `About Wildflower`, `Sponsor our shows`; textboxes `Name`, `Email`, `Message`; buttons `Cart`, `Sign in`, `Send message`; mobile trigger `Open menu`. Show cards include the description in the link name, for example `link "The Music Snobs A weekly conversation about music, culture, and the records that shaped us. Episodes →"`.

Read `features/README.md` before a proof, then follow the feature file for the behavior under test. A proof that only hits one entry point is incomplete when that file lists more.

## Evidence

Write proof under `tmp/verify-wildflower/evidence/<feature-id>/`. Cleanup never deletes that directory.

For a UI proof, capture the action and the resulting state:

- the command that performed the action
- `agent-browser --session wildflower-verify get url`
- `agent-browser --session wildflower-verify snapshot -i` saved to a file
- `agent-browser --session wildflower-verify screenshot <path>`

The snapshot or screenshot must show the destination heading, not only the click. Do not treat a test-only Convex function or an internal setter as the user path.

Shop data comes from Printful (`PRINTFUL_API_KEY`). Sponsor submit and cart mutations write to the shared Convex deployment. Do not submit the sponsor form or change cart lines unless the user asked to prove that write. When a write is in scope, prove it with a second read of the resulting UI state (the thank-you copy, or the updated cart count), not only the click.

`npm run e2e:pipeline` and `npm run e2e:webhook` call Polar and Printful. They are not dry-runs.

## Cleanup

```bash
.cursor/skills/verify-wildflower/scripts/verify-wildflower.sh cleanup
```

This kills the recorded pid and its descendants, closes the `wildflower-verify` browser session, and removes `tmp/verify-wildflower/run`. It leaves `tmp/verify-wildflower/evidence` in place.

## Helpers

`.cursor/skills/verify-wildflower/scripts/verify-wildflower.sh` takes one argument: `launch`, `doctor`, or `cleanup`. Run it from anywhere; it locates the repo from its own path.
