# Sponsor

Sponsor lets a visitor send an inquiry. A successful submit replaces the form with a thank-you message and stores the inquiry in Convex.

## Sub-features

- `sponsor-open` opens the inquiry page.
- `sponsor-validation` keeps the form on the page when required fields are empty.
- `sponsor-submit` sends a complete inquiry and shows the thank-you state.

## How to get to it (user POV)

- Choose `Sponsor` in the sidebar.
- Open `/sponsor` directly.
- From About, choose the `sponsor` link.

## Driving it with agent-browser

Preconditions:

- `doctor` reports `url=http://127.0.0.1:3117` and `status=200`.
- Viewport is `1280 800`.
- Session is `wildflower-verify`.
- Submit only when the user asked to prove the write. It inserts a row in the shared Convex deployment from `.env.local`.

- **Sidebar entry.** Open home, snapshot, and click the ref on `link "Sponsor"` inside `navigation "Main"`. The URL ends in `/sponsor`. The snapshot contains `heading "Sponsor our shows"`, `textbox "Name"`, `textbox "Email"`, `textbox "Message"`, and `button "Send message"`.
- **Empty submit.** Click the `Send message` ref with the textboxes empty. The heading `Sponsor our shows` remains and the thank-you text does not appear.
- **Submit.** Snapshot, then `fill` the `Name`, `Email`, and `Message` refs with `Verify Wildflower`, `verify-wildflower@example.com`, and `Verification inquiry. Safe to ignore.` Click the `Send message` ref. The thank-you text `Thanks — we received your message and will get back to you soon.` replaces the form.
- **Proof.** For a read-only pass, screenshot the form at `tmp/verify-wildflower/evidence/sponsor/form.png` and record that submit was skipped. For a write pass, screenshot the thank-you state at `tmp/verify-wildflower/evidence/sponsor/thanks.png` after the button click.

## Gotchas

- The default verification pass does not submit. Saying the form is visible is not proof that submit works.
- There is no self-serve way in the UI to delete the inquiry afterward.
- Convex must accept the mutation. A red `role="alert"` message is a failed submit, not the thank-you state.
- The button label changes to `Sending…` while the request is in flight. Wait for the thank-you text.
