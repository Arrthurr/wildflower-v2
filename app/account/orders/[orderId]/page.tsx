"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type OrderLineItem = Doc<"orders">["lineItems"][number];
import { formatCents } from "@/lib/money";
import { labelOrderStatus } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as Id<"orders">;
  const order = useQuery(api.orders.getByIdForUser, { orderId });

  if (order === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (order === null) {
    return (
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to orders
        </Link>
        <p className="mt-6 text-sm text-muted-foreground">We couldn&apos;t find that order.</p>
      </div>
    );
  }

  const addr = order.shippingAddress;

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to orders
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Order · {new Date(order.createdAt).toLocaleString()}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Total <span className="text-foreground">{formatCents(order.totalCents)}</span>
          </p>
        </div>
        <Badge variant="secondary">{labelOrderStatus(order.status)}</Badge>
      </div>

      {order.trackingNumber || order.trackingUrl ? (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shipping</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {order.trackingNumber ? (
              <p>
                Tracking:{" "}
                {order.trackingUrl ? (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {order.trackingNumber}
                  </a>
                ) : (
                  order.trackingNumber
                )}
              </p>
            ) : order.trackingUrl ? (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Track shipment
              </a>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {order.printfulOrderId ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Printful order #{order.printfulOrderId}
        </p>
      ) : null}

      {order.lastFulfillmentError ? (
        <p className="mt-4 text-sm text-destructive">{order.lastFulfillmentError}</p>
      ) : null}

      <Separator className="my-8" />

      <h3 className="text-sm font-medium">Items</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {order.lineItems.map((line: OrderLineItem, i: number) => (
          <li
            key={`${line.printfulVariantId}-${i}`}
            className="flex flex-wrap justify-between gap-2 text-sm"
          >
            <span>
              <span className="font-medium text-foreground">{line.name}</span>
              <span className="text-muted-foreground"> × {line.quantity}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatCents(line.unitPriceCents * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <Separator className="my-8" />

      <h3 className="text-sm font-medium">Ship to</h3>
      <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
        {addr.name}
        <br />
        {addr.line1}
        {addr.line2 ? (
          <>
            <br />
            {addr.line2}
          </>
        ) : null}
        <br />
        {[addr.city, addr.state].filter(Boolean).join(", ")} {addr.postalCode}
        <br />
        {addr.country}
        {addr.phone ? (
          <>
            <br />
            {addr.phone}
          </>
        ) : null}
      </address>
    </div>
  );
}
