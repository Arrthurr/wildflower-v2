/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cartItems from "../cartItems.js";
import type * as checkout from "../checkout.js";
import type * as fulfillment from "../fulfillment.js";
import type * as http from "../http.js";
import type * as orders from "../orders.js";
import type * as shareEvents from "../shareEvents.js";
import type * as sponsorInquiries from "../sponsorInquiries.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  cartItems: typeof cartItems;
  checkout: typeof checkout;
  fulfillment: typeof fulfillment;
  http: typeof http;
  orders: typeof orders;
  shareEvents: typeof shareEvents;
  sponsorInquiries: typeof sponsorInquiries;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
