/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * Regenerate with `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as cartItems from "../cartItems.js";
import type * as checkout from "../checkout.js";
import type * as fulfillment from "../fulfillment.js";
import type * as orders from "../orders.js";
import type * as shareEvents from "../shareEvents.js";
import type * as sponsorInquiries from "../sponsorInquiries.js";
import type * as users from "../users.js";

declare const fullApi: ApiFromModules<{
  cartItems: typeof cartItems;
  checkout: typeof checkout;
  fulfillment: typeof fulfillment;
  orders: typeof orders;
  shareEvents: typeof shareEvents;
  sponsorInquiries: typeof sponsorInquiries;
  users: typeof users;
}>;

export declare const api: FilterApi<typeof fullApi, FunctionReference>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference>;
