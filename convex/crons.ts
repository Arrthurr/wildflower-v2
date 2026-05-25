import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "reconcile stuck paid orders",
  { minutes: 15 },
  internal.orders.reconcileStuckPaidOrders,
  {},
);

export default crons;
