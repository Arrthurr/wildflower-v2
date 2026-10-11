# Shop

Shop lists Wildflower merch from Printful. Choosing a product opens its product page.

## Sub-features

- `shop-index` opens the merch catalog from the sidebar.
- `shop-empty` shows the empty catalog copy when Printful returns no products.
- `shop-error` shows the missing-key message when Printful cannot be called.
- `shop-product` opens a product from its card when the catalog has rows.

## How to get to it (user POV)

- Choose `Merch` in the sidebar.
- Open `/shop` directly.
- Choose a product card. The card name is the product name from Printful.

## Driving it with agent-browser

Preconditions:

- `doctor` reports `url=http://127.0.0.1:3117` and `status=200`.
- Viewport is `1280 800`.
- Session is `wildflower-verify`.
- `PRINTFUL_API_KEY` is set when the proof expects products.

- **Sidebar entry.** Open home, snapshot, and click the ref on `link "Merch"`. The URL ends in `/shop` and the snapshot contains `heading "Wildflower Goods"`.
- **Catalog state.** Snapshot the page. One of these is visible: product links, the text `No sync products yet.`, or a message that tells the reader to set `PRINTFUL_API_KEY`.
- **Open a product.** When a product link is present, click that ref. Product link names include the variant count, for example `87 Snob T-shirt (Unisex) 5 VARIANTS`. The URL matches `/shop/` plus an id, and the page shows that product name. Skip this step when the catalog is empty or in the error state, and record that skip.
- **Proof.** Save `agent-browser --session wildflower-verify get url`, `agent-browser --session wildflower-verify snapshot -i`, and `agent-browser --session wildflower-verify screenshot tmp/verify-wildflower/evidence/shop/catalog.png`. The heading `Wildflower Goods` is visible.

## Gotchas

- The nav label is `Merch`. The page heading is `Wildflower Goods`.
- Product names are remote data. Do not hard-code a product title that is not on the current snapshot.
- An empty catalog and a Printful error are different states. Do not treat either as a failed route.
