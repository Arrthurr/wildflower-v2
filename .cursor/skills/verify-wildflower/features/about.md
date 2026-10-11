# About

About explains the network and links to the sponsor page.

## Sub-features

- `about-open` opens the about page from the sidebar.
- `about-sponsor-link` follows the in-page sponsor link.

## How to get to it (user POV)

- Choose `About` in the sidebar.
- Open `/about` directly.
- On the page, choose the `sponsor` link in the contact paragraph.

## Driving it with agent-browser

Preconditions:

- `doctor` reports `url=http://127.0.0.1:3117` and `status=200`.
- Viewport is `1280 800`.
- Session is `wildflower-verify`.

- **Sidebar entry.** Open home, snapshot, and click the ref on `link "About"` inside `navigation "Main"`. The URL ends in `/about` and the snapshot contains `heading "About Wildflower"`. The footer link `ABOUT` is a different control.
- **Sponsor link.** Snapshot the about page and click the ref on `link "sponsor"`. The URL ends in `/sponsor` and the snapshot contains `heading "Sponsor our shows"`.
- **Proof.** Save `agent-browser --session wildflower-verify get url`, `agent-browser --session wildflower-verify snapshot -i`, and `agent-browser --session wildflower-verify screenshot tmp/verify-wildflower/evidence/about/about.png` while still on `/about`, before following the sponsor link.

## Gotchas

- `sponsor` is a lowercase link inside the contact paragraph. The sidebar item `Sponsor` is a different entry point, mapped in the sponsor feature.
- The tagline `Precision in Podcasting.` is body copy, not the page heading.
