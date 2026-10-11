# Shows

Shows lists The Music Snobs and Snobs On Film, then opens a show page with that show's title and either episode cards or a Fireside fallback.

## Sub-features

- `shows-index` opens the shows index from the sidebar.
- `shows-music-snobs` opens The Music Snobs from the index card.
- `shows-snobs-on-film` opens Snobs On Film from the index card.
- `shows-episodes` shows episode titles or the Fireside fallback on the show page.

## How to get to it (user POV)

- Choose `Shows` in the sidebar.
- On a narrow viewport, choose `Open menu`, then `Shows`.
- Open `/shows` directly.
- From the index, choose the `The Music Snobs` card or the `Snobs On Film` card.

## Driving it with agent-browser

Preconditions:

- `doctor` reports `url=http://127.0.0.1:3117` and `status=200`.
- Viewport is `1280 800` so the sidebar is visible.
- Session is `wildflower-verify`.

- **Sidebar entry.** Open the home page. Run `agent-browser --session wildflower-verify open http://127.0.0.1:3117/` then `agent-browser --session wildflower-verify snapshot -i`. Click the ref on `link "Shows"`. The URL ends in `/shows` and the snapshot contains `heading "Shows"`.
- **Music Snobs card.** Snapshot `/shows`. Click the ref whose link name starts with `The Music Snobs`. The URL contains `/shows/music-snobs` and the snapshot contains `heading "The Music Snobs"`.
- **Snobs On Film card.** Open `http://127.0.0.1:3117/shows`, snapshot, and click the ref whose link name starts with `Snobs On Film`. The URL contains `/shows/snobs-on-film` and the snapshot contains `heading "Snobs On Film"`.
- **Episodes or fallback.** On the show page, snapshot the main content. Either episode headings are listed, or the text `Episodes could not be loaded right now.` is visible with a link named `Open the show on Fireside`.
- **Proof.** On The Music Snobs page, run `agent-browser --session wildflower-verify get url`, `agent-browser --session wildflower-verify snapshot -i`, and `agent-browser --session wildflower-verify screenshot tmp/verify-wildflower/evidence/shows/music-snobs.png`. The URL and heading both identify The Music Snobs.

## Gotchas

- Below the `lg` breakpoint the sidebar is hidden. Use `Open menu` first, or set the viewport to `1280 800`.
- The card's accessible name is the whole card, including the description and `Episodes →`. Match the link whose name starts with the show title.
- `find role` and `find text` miss `link "Shows"` even when the snapshot lists it. Click the snapshot ref.
- Episode bodies come from the Fireside RSS URL. A fallback message is a successful page load, not a failed navigation.
- `Search` in the sidebar is disabled. It is not a shows entry point.
