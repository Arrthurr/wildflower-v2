# Cart

Cart opens a drawer. Signed-out visitors are asked to sign in before they can see lines or check out.

## Sub-features

- `cart-open-signed-out` opens the drawer and shows the sign-in prompt.
- `cart-shop-link` is absent until the visitor is signed in and the cart is empty.

## How to get to it (user POV)

- Choose `Cart` in the sidebar, next to `Sign in`.
- The drawer title is `Cart`.

## Driving it with agent-browser

Preconditions:

- `doctor` reports `url=http://127.0.0.1:3117` and `status=200`.
- Viewport is `1280 800`.
- Session is `wildflower-verify`.
- No Clerk session is loaded in `wildflower-verify`. Do not sign in during this recipe.

- **Open the drawer.** Open `http://127.0.0.1:3117/shows`, snapshot, and click the ref on `button "Cart"`. A dialog shows `heading "Cart"` and the text `Sign in to view your cart and check out.`
- **Sign-in control.** The drawer contains a `Sign in` button. Do not click it unless the user asked to prove auth.
- **Proof.** Save `agent-browser --session wildflower-verify snapshot -i` and `agent-browser --session wildflower-verify screenshot tmp/verify-wildflower/evidence/cart/signed-out.png`. Both show the heading `Cart` and the sign-in sentence.

## Gotchas

- `Cart` is a button, not a link. The URL stays on the page that was open.
- A signed-in browser session shows cart lines or `Your cart is empty.` instead of the sign-in prompt. That is a different entry state. Close the session and start `wildflower-verify` clean rather than proving the signed-out path through it.
- Adding or removing lines writes to the shared Convex deployment. This recipe does not do that.
- Clerk's sign-in modal is a third-party frame. Do not drive it as a stand-in for the cart drawer.
