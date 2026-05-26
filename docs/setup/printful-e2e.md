# Printful end-to-end test setup

Automation scripts live under `scripts/`. NPM shortcuts:

| Command | Purpose |
|---------|---------|
| `npm run e2e:sync-convex` | Push `PRINTFUL_*` and `POLAR_WEBHOOK_SECRET` from `.env.local` to Convex |
| `npm run e2e:register-webhooks` | Register Printful + Polar webhooks → `https://<deployment>.convex.site/webhooks/*` |
| `npm run e2e:webhook` | Seed a fulfilling order, send `package_shipped`, assert `shipped` |
| `npm run e2e:pipeline` | Simulate Polar `order.paid` → Printful submit → `package_shipped` (no hosted checkout) |
| `npm run e2e:webhook-urls` | Print webhook URLs for manual dashboard setup |
| `npm run e2e:polar-products` | List Polar product IDs for `POLAR_MERCH_PRODUCT_ID` |
| `npm run e2e:test-printful-webhook` | Manual webhook POST (`--order-id`, `--printful-id`) |

## 1. Fill `.env.local`

Copy from [`.env.example`](../../.env.example). Required for full E2E:

- `PRINTFUL_API_KEY` — Printful store API token (shop + Convex fulfillment)
- `PRINTFUL_WEBHOOK_SECRET` — shared with Printful webhook HMAC (or run `openssl rand -hex 32`)
- `POLAR_ACCESS_TOKEN` — Polar sandbox or production token
- `POLAR_WEBHOOK_SECRET` — from Polar after webhook registration
- `POLAR_MERCH_PRODUCT_ID` — Polar product UUID for checkout
- `POLAR_SERVER=sandbox` — for sandbox checkout
- `NEXT_PUBLIC_CONVEX_SITE_URL` — e.g. `https://tangible-gnat-626.convex.site`

Set the Printful token without editing the file by hand:

```bash
PRINTFUL_API_KEY=your_token npm run e2e:set-printful-key
```

Then:

```bash
npx convex dev --once
npm run e2e:register-webhooks
```

Polar registration may print a new webhook secret — add it to `.env.local` and run `e2e:sync-convex` again.

## 2. Webhook URLs

| Provider | URL | Events |
|----------|-----|--------|
| Printful | `{NEXT_PUBLIC_CONVEX_SITE_URL}/webhooks/printful` | `package_shipped`, `order_failed` |
| Polar | `{NEXT_PUBLIC_CONVEX_SITE_URL}/webhooks/polar` | `order.paid` |

## 3. Simulator (without a real shipment)

After a sandbox checkout reaches **Processing**, or run:

```bash
npm run e2e:webhook
```

Or use [Printful’s webhook simulator](https://www.printful.com/api/webhook-simulator) with `external_id` = Convex order `_id` and `order.id` = `printfulOrderId`.

## 4. Sandbox checkout

1. Sign in, add items from `/shop`, go to `/checkout`, pay in Polar sandbox.
2. Open `/account/orders` — expect **Paid** → **Processing** → **Shipped** (simulator or real shipment).

If stuck on **Paid**, set `PRINTFUL_API_KEY` on **Convex** (`npm run e2e:sync-convex`) and check Convex logs for `fulfillment/submitToPrintful`.
