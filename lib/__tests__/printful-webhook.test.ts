import { describe, expect, it } from "vitest";
import {
  classifyPrintfulSubmissionFailure,
  fulfillmentRetryDelayMs,
} from "../../convex/fulfillmentPolicy";
import {
  computePrintfulWebhookSignature,
  parsePrintfulWebhook,
  verifyPrintfulWebhookSignature,
} from "../../convex/printfulWebhook";

describe("parsePrintfulWebhook", () => {
  it("parses package_shipped with tracking", () => {
    const parsed = parsePrintfulWebhook({
      type: "package_shipped",
      created: 1700000000,
      retries: 0,
      store: 1,
      data: {
        order: { id: 99, external_id: "order_abc123" },
        shipment: {
          id: 55,
          tracking_number: "9400111899223344556677",
          tracking_url: "https://track.example/9400",
        },
      },
    });

    expect(parsed.kind).toBe("package_shipped");
    if (parsed.kind !== "package_shipped") return;
    expect(parsed.externalEventId).toBe("printful:package_shipped:55");
    expect(parsed.orderExternalId).toBe("order_abc123");
    expect(parsed.printfulOrderId).toBe(99);
    expect(parsed.trackingNumber).toBe("9400111899223344556677");
    expect(parsed.trackingUrl).toBe("https://track.example/9400");
  });

  it("parses order_failed with reason", () => {
    const parsed = parsePrintfulWebhook({
      type: "order_failed",
      created: 1700000001,
      data: {
        order: { id: 42, external_id: "order_xyz" },
        reason: "Invalid address",
      },
    });

    expect(parsed.kind).toBe("order_failed");
    if (parsed.kind !== "order_failed") return;
    expect(parsed.reason).toBe("Invalid address");
    expect(parsed.externalEventId).toBe("printful:order_failed:42:1700000001");
  });

  it("ignores unrelated event types", () => {
    const parsed = parsePrintfulWebhook({ type: "order_updated", created: 1, data: {} });
    expect(parsed).toEqual({ kind: "ignored", type: "order_updated" });
  });
});

describe("verifyPrintfulWebhookSignature", () => {
  it("accepts a valid HMAC signature", async () => {
    const body = '{"type":"package_shipped"}';
    const secret = "test-secret";
    const signature = await computePrintfulWebhookSignature(body, secret);
    await expect(
      verifyPrintfulWebhookSignature(body, signature, secret),
    ).resolves.toBe(true);
    await expect(
      verifyPrintfulWebhookSignature(body, `sha256=${signature}`, secret),
    ).resolves.toBe(true);
  });
});

describe("fulfillmentRetryDelayMs", () => {
  it("backs off exponentially with a cap", () => {
    expect(fulfillmentRetryDelayMs(1)).toBe(30_000);
    expect(fulfillmentRetryDelayMs(2)).toBe(60_000);
    expect(fulfillmentRetryDelayMs(6)).toBe(960_000);
    expect(fulfillmentRetryDelayMs(7)).toBe(1_800_000);
  });
});

describe("classifyPrintfulSubmissionFailure", () => {
  it("treats 5xx as retryable", () => {
    expect(classifyPrintfulSubmissionFailure(503, "{}").retryable).toBe(true);
  });

  it("treats typical 4xx as terminal", () => {
    expect(
      classifyPrintfulSubmissionFailure(400, '{"error":{"message":"Invalid address"}}')
        .retryable,
    ).toBe(false);
  });
});
