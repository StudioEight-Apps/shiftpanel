import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockBookings } from "@/lib/mock-data";
import { deriveBookingStatus, formatDate, formatPrice, getStatusVariant } from "@/lib/booking-utils";
import { hasPermission, maskEmail } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Home, Car, Ship, Search, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingRequest, BookingStatus, ItemStatus } from "@/lib/types";

const statusFilters: (BookingStatus | "All")[] = ["All", "Pending", "Approved", "Partial", "Declined"];

function ItemIcon({ type, className }: { type: "villa" | "car" | "yacht"; className?: string }) {
  switch (type) {
    case "villa": return <Home className={cn("h-3.5 w-3.5", className)} />;
    case "car": return <Car className={cn("h-3.5 w-3.5", className)} />;
    case "yacht": return <Ship className={cn("h-3.5 w-3.5", className)} />;
  }
}

function MiniStatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case "Approved": return <Check className="h-2.5 w-2.5 text-status-approved" />;
    case "Declined": return <X className="h-2.5 w-2.5 text-status-declined" />;
    case "Pending": return <Clock className="h-2.5 w-2.5 text-status-pending" />;
  }
}

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">("All");

  const filteredBookings = useMemo(() => {
    return mockBookings.filter((b) => {
      const status = deriveBookingStatus(b);
      if (statusFilter !== "All" && status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          b.customer.name.toLowerCase().includes(q) ||
          b.customer.email.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const counts = { total: mockBookings.length, Pending: 0, Approved: 0, Partial: 0, Declined: 0 };
    mockBookings.forEach((b) => {
      const s = deriveBookingStatus(b);
      counts[s]++;
    });
    return counts;
  }, []);

  const getDateRange = (b: BookingRequest) => {
    const dates: Date[] = [];
    if (b.villa) { dates.push(b.villa.checkIn); dates.push(b.villa.checkOut); }
    if (b.car) { dates.push(b.car.pickupDate); dates.push(b.car.dropoffDate); }
    if (b.yacht) dates.push(b.yacht.date);
    if (dates.length === 0) return "—";
    const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
    if (sorted.length === 1) return formatDate(sorted[0]);
    return `${formatDate(sorted[0])} – ${formatDate(sorted[sorted.length - 1])}`;
  };

  const getLocation = (b: BookingRequest) => {
    if (b.villa) return b.villa.location;
    if (b.car) return "—";
    if (b.yacht) return "—";
    return "—";
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage and review booking requests</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.Pending, color: "text-status-pending" },
          { label: "Approved", value: stats.Approved, color: "text-status-approved" },
          { label: "Partial", value: stats.Partial, color: "text-status-partial" },
          { label: "Declined", value: stats.Declined, color: "text-status-declined" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border-border pl-9"
          />
        </div>
        <div className="flex gap-1">
          {statusFilters.map((sf) => (
            <button
              key={sf}
              onClick={() => setStatusFilter(sf)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === sf
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {sf}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      <div className="space-y-2">
        {filteredBookings.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
            No bookings found
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const status = deriveBookingStatus(booking);
            const showPII = role ? hasPermission(role, "view_pii") : false;

            return (
              <div
                key={booking.id}
                onClick={() => navigate(`/requests/${booking.id}`)}
                className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-secondary/50"
              >
                {/* Customer */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{booking.customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {showPII ? booking.customer.email : maskEmail(booking.customer.email)}
                  </p>
                </div>

                {/* Item badges with mini status */}
                <div className="flex items-center gap-2">
                  {booking.villa && (
                    <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
                      <ItemIcon type="villa" className="text-muted-foreground" />
                      {status === "Partial" && <MiniStatusIcon status={booking.villa.status} />}
                    </div>
                  )}
                  {booking.car && (
                    <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
                      <ItemIcon type="car" className="text-muted-foreground" />
                      {status === "Partial" && <MiniStatusIcon status={booking.car.status} />}
                    </div>
                  )}
                  {booking.yacht && (
                    <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
                      <ItemIcon type="yacht" className="text-muted-foreground" />
                      {status === "Partial" && <MiniStatusIcon status={booking.yacht.status} />}
                    </div>
                  )}
                </div>

                {/* Date range */}
                <div className="hidden w-40 text-xs text-muted-foreground lg:block">
                  {getDateRange(booking)}
                </div>

                {/* Location */}
                <div className="hidden w-32 text-xs text-muted-foreground xl:block">
                  {getLocation(booking)}
                </div>

                {/* Price */}
                <div className="w-24 text-right text-sm font-semibold text-foreground">
                  {formatPrice(booking.grandTotal)}
                </div>

                {/* Status */}
                <Badge variant={getStatusVariant(status)} className="w-20 justify-center">
                  {status}
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
