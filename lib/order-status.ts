export const orderStatusLabel: Record<string, string> = {
  paid: "Paid",
  fulfilling: "Processing",
  shipped: "Shipped",
  failed: "Failed",
  refunded: "Refunded",
};

export function labelOrderStatus(status: string): string {
  return orderStatusLabel[status] ?? status;
}
