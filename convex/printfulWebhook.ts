/** Printful v1 webhook helpers (parse + HMAC verification). */

export type ParsedPrintfulWebhook =
  | { kind: "ignored"; type: string }
  | {
      kind: "package_shipped";
      externalEventId: string;
      orderExternalId: string | undefined;
      printfulOrderId: number | undefined;
      trackingNumber: string | undefined;
      trackingUrl: string | undefined;
    }
  | {
      kind: "order_failed";
      externalEventId: string;
      orderExternalId: string | undefined;
      printfulOrderId: number | undefined;
      reason: string | undefined;
    };

type PrintfulOrderRef = {
  id?: number;
  external_id?: string | null;
};

type PrintfulShipmentRef = {
  id?: number;
  tracking_number?: string | null;
  tracking_url?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readOrder(value: unknown): PrintfulOrderRef | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: typeof record.id === "number" ? record.id : undefined,
    external_id:
      typeof record.external_id === "string"
        ? record.external_id
        : record.external_id === null
          ? null
          : undefined,
  };
}

function readShipment(value: unknown): PrintfulShipmentRef | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: typeof record.id === "number" ? record.id : undefined,
    tracking_number:
      typeof record.tracking_number === "string"
        ? record.tracking_number
        : record.tracking_number === null
          ? null
          : undefined,
    tracking_url:
      typeof record.tracking_url === "string"
        ? record.tracking_url
        : record.tracking_url === null
          ? null
          : undefined,
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function computePrintfulWebhookSignature(
  rawBody: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPrintfulWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const normalized = signatureHeader.replace(/^sha256=/i, "").trim();
  const expected = await computePrintfulWebhookSignature(rawBody, secret);
  return timingSafeEqual(expected.toLowerCase(), normalized.toLowerCase());
}

export function parsePrintfulWebhook(body: unknown): ParsedPrintfulWebhook {
  const root = asRecord(body);
  if (!root) {
    throw new Error("Invalid Printful webhook payload");
  }

  const type = typeof root.type === "string" ? root.type : "";
  const created = typeof root.created === "number" ? root.created : 0;
  const data = asRecord(root.data);
  const order = readOrder(data?.order);
  const shipment = readShipment(data?.shipment);

  if (type === "package_shipped") {
    const shipmentId = shipment?.id;
    const printfulOrderId = order?.id;
    const externalEventId =
      shipmentId !== undefined
        ? `printful:package_shipped:${shipmentId}`
        : printfulOrderId !== undefined
          ? `printful:package_shipped:order:${printfulOrderId}:${created}`
          : `printful:package_shipped:${created}`;

    return {
      kind: "package_shipped",
      externalEventId,
      orderExternalId: order?.external_id ?? undefined,
      printfulOrderId,
      trackingNumber: shipment?.tracking_number ?? undefined,
      trackingUrl: shipment?.tracking_url ?? undefined,
    };
  }

  if (type === "order_failed") {
    const printfulOrderId = order?.id;
    const externalEventId =
      printfulOrderId !== undefined
        ? `printful:order_failed:${printfulOrderId}:${created}`
        : `printful:order_failed:${created}`;

    const reason =
      typeof data?.reason === "string"
        ? data.reason
        : typeof root.reason === "string"
          ? root.reason
          : undefined;

    return {
      kind: "order_failed",
      externalEventId,
      orderExternalId: order?.external_id ?? undefined,
      printfulOrderId,
      reason,
    };
  }

  return { kind: "ignored", type: type || "unknown" };
}
