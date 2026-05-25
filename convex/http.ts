import { httpRouter } from "convex/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import {
  parsePrintfulWebhook,
  verifyPrintfulWebhookSignature,
} from "./printfulWebhook";

const http = httpRouter();

function countryToString(country: unknown): string {
  if (typeof country === "string") return country;
  return String(country ?? "US");
}

http.route({
  path: "/webhooks/polar",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.POLAR_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Polar webhook secret not configured", {
        status: 500,
      });
    }

    const rawBody = await request.text();
    const headers = {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    };

    let event: ReturnType<typeof validateEvent>;
    try {
      event = validateEvent(rawBody, headers, secret);
    } catch (e) {
      if (e instanceof WebhookVerificationError) {
        return new Response("Forbidden", { status: 403 });
      }
      throw e;
    }

    if (event.type !== "order.paid") {
      return new Response(null, { status: 200 });
    }

    const order = event.data;
    const rawDraft = order.metadata?.checkoutDraftId;
    const checkoutDraftId =
      typeof rawDraft === "string"
        ? rawDraft
        : typeof rawDraft === "number"
          ? String(rawDraft)
          : undefined;
    if (!checkoutDraftId) {
      return new Response("Missing checkoutDraftId in order metadata", {
        status: 400,
      });
    }

    const addr = order.billingAddress;
    const country = addr ? countryToString(addr.country) : "US";

    await ctx.runMutation(internal.orders.handlePolarOrderPaid, {
      polarOrderId: order.id,
      polarCheckoutId: order.checkoutId ?? undefined,
      checkoutDraftId,
      clerkExternalId: order.customer.externalId ?? undefined,
      totalAmountCents: order.totalAmount,
      billingName: order.billingName ?? undefined,
      addressLine1: addr?.line1 ?? undefined,
      addressLine2: addr?.line2 ?? undefined,
      city: addr?.city ?? undefined,
      state: addr?.state ?? undefined,
      postalCode: addr?.postalCode ?? undefined,
      country,
    });

    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/webhooks/printful",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const secret = process.env.PRINTFUL_WEBHOOK_SECRET;

    if (secret) {
      const signature =
        request.headers.get("X-Printful-Signature") ??
        request.headers.get("X-Printful-Webhook-Signature");
      const valid = await verifyPrintfulWebhookSignature(
        rawBody,
        signature,
        secret,
      );
      if (!valid) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody) as unknown;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    let parsed;
    try {
      parsed = parsePrintfulWebhook(body);
    } catch {
      return new Response("Invalid payload", { status: 400 });
    }

    if (parsed.kind === "ignored") {
      return new Response(null, { status: 200 });
    }

    if (parsed.kind === "package_shipped") {
      await ctx.runMutation(internal.orders.handlePrintfulWebhook, {
        externalEventId: parsed.externalEventId,
        eventKind: "package_shipped",
        orderExternalId: parsed.orderExternalId,
        printfulOrderId: parsed.printfulOrderId,
        trackingNumber: parsed.trackingNumber,
        trackingUrl: parsed.trackingUrl,
      });
    } else {
      await ctx.runMutation(internal.orders.handlePrintfulWebhook, {
        externalEventId: parsed.externalEventId,
        eventKind: "order_failed",
        orderExternalId: parsed.orderExternalId,
        printfulOrderId: parsed.printfulOrderId,
        failureReason: parsed.reason,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
