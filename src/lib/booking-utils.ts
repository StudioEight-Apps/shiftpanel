import { BookingRequest, BookingStatus, ItemStatus } from "./types";
import { format, formatDistanceToNow } from "date-fns";

export function deriveBookingStatus(booking: BookingRequest): BookingStatus {
  const statuses: ItemStatus[] = [];
  if (booking.villa) statuses.push(booking.villa.status);
  if (booking.car) statuses.push(booking.car.status);
  if (booking.yacht) statuses.push(booking.yacht.status);

  if (statuses.length === 0) return "Pending";
  if (statuses.every((s) => s === "Approved")) return "Approved";
  if (statuses.every((s) => s === "Declined")) return "Declined";
  if (statuses.every((s) => s === "Pending")) return "Pending";
  return "Partial";
}

export function getActiveTotal(booking: BookingRequest): number {
  let total = 0;
  if (booking.villa && booking.villa.status !== "Declined") total += booking.villa.price;
  if (booking.car && booking.car.status !== "Declined") total += booking.car.price;
  if (booking.yacht && booking.yacht.status !== "Declined") total += booking.yacht.price;
  return total;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(date: Date): string {
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getStatusVariant(status: BookingStatus | ItemStatus): "pending" | "approved" | "declined" | "partial" {
  switch (status) {
    case "Pending": return "pending";
    case "Approved": return "approved";
    case "Declined": return "declined";
    case "Partial": return "partial";
    default: return "pending";
  }
}
