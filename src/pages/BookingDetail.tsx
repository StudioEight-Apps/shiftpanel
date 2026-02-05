import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockBookings } from "@/lib/mock-data";
import { deriveBookingStatus, formatDate, formatDateTime, formatPrice, formatRelative, getStatusVariant, getActiveTotal } from "@/lib/booking-utils";
import { hasPermission, maskEmail, maskPhone } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Home, Car, Ship, Check, X, Clock, Mail, Phone, Send, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingRequest, ItemStatus, ItemType } from "@/lib/types";

function ItemIcon({ type, className }: { type: ItemType; className?: string }) {
  switch (type) {
    case "villa": return <Home className={cn("h-5 w-5", className)} />;
    case "car": return <Car className={cn("h-5 w-5", className)} />;
    case "yacht": return <Ship className={cn("h-5 w-5", className)} />;
  }
}

function StatusIcon({ status, className }: { status: ItemStatus; className?: string }) {
  switch (status) {
    case "Approved": return <Check className={cn("h-4 w-4", className)} />;
    case "Declined": return <X className={cn("h-4 w-4", className)} />;
    case "Pending": return <Clock className={cn("h-4 w-4", className)} />;
  }
}

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [newNote, setNewNote] = useState("");

  // In production, this would be a real-time listener. Using mock data with local state for demo.
  const [booking, setBooking] = useState<BookingRequest | null>(() => {
    return mockBookings.find((b) => b.id === id) ?? null;
  });

  const canAct = role ? hasPermission(role, "approve_decline_items") : false;
  const canNote = role ? hasPermission(role, "add_notes") : false;
  const showPII = role ? hasPermission(role, "view_pii") : false;

  const status = useMemo(() => (booking ? deriveBookingStatus(booking) : "Pending"), [booking]);
  const activeTotal = useMemo(() => (booking ? getActiveTotal(booking) : 0), [booking]);

  const handleAction = useCallback(
    (itemType: ItemType, action: ItemStatus) => {
      if (!booking || !user) return;
      const currentStatus = booking[itemType]?.status;
      if (currentStatus === action) return; // Idempotency guard

      setBooking((prev) => {
        if (!prev || !prev[itemType]) return prev;
        const newLog = {
          action: `${action === "Approved" ? "Approved" : action === "Declined" ? "Declined" : "Reset"} ${itemType}`,
          actor: user.email,
          timestamp: new Date(),
        };
        return {
          ...prev,
          [itemType]: { ...prev[itemType]!, status: action },
          activityLog: [newLog, ...prev.activityLog],
          updatedAt: new Date(),
        };
      });
    },
    [booking, user]
  );

  const handleUndo = useCallback(
    (itemType: ItemType) => {
      if (!booking || !user) return;
      setBooking((prev) => {
        if (!prev || !prev[itemType]) return prev;
        const newLog = {
          action: `Reset ${itemType} to pending`,
          actor: user.email,
          timestamp: new Date(),
        };
        return {
          ...prev,
          [itemType]: { ...prev[itemType]!, status: "Pending" as ItemStatus },
          activityLog: [newLog, ...prev.activityLog],
          updatedAt: new Date(),
        };
      });
    },
    [booking, user]
  );

  const handleAddNote = useCallback(() => {
    if (!newNote.trim() || !user || !booking) return;
    const note = { text: newNote.trim(), author: user.email, timestamp: new Date() };
    const logEntry = { action: "Added note", actor: user.email, timestamp: new Date() };
    setBooking((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: [note, ...prev.notes],
        activityLog: [logEntry, ...prev.activityLog],
      };
    });
    setNewNote("");
  }, [newNote, user, booking]);

  if (!booking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Booking not found</p>
      </div>
    );
  }

  const items: { type: ItemType; data: any }[] = [];
  if (booking.villa) items.push({ type: "villa", data: booking.villa });
  if (booking.car) items.push({ type: "car", data: booking.car });
  if (booking.yacht) items.push({ type: "yacht", data: booking.yacht });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{booking.id}</h1>
          <p className="text-xs text-muted-foreground">Submitted {formatRelative(booking.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column — 2/3 */}
        <div className="space-y-4 xl:col-span-2">
          {/* Customer Card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h2>
            <p className="text-lg font-semibold text-foreground">{booking.customer.name}</p>
            <div className="mt-2 flex flex-wrap gap-4">
              <a
                href={showPII ? `mailto:${booking.customer.email}` : undefined}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {showPII ? booking.customer.email : maskEmail(booking.customer.email)}
              </a>
              <a
                href={showPII ? `tel:${booking.customer.phone}` : undefined}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {showPII ? booking.customer.phone : maskPhone(booking.customer.phone)}
              </a>
            </div>
          </div>

          {/* Item Cards */}
          {items.map(({ type, data }) => {
            const isDeclined = data.status === "Declined";
            return (
              <div
                key={type}
                className={cn(
                  "rounded-xl border border-border bg-card p-5 transition-opacity",
                  isDeclined && "opacity-50"
                )}
              >
                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <ItemIcon type={type} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{type}</p>
                    <p className="text-sm font-semibold text-foreground">{data.name}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {type === "villa" && (
                    <>
                      <DetailCell label="Location" value={data.location} />
                      <DetailCell label="Check-in" value={formatDate(data.checkIn)} />
                      <DetailCell label="Check-out" value={formatDate(data.checkOut)} />
                      <DetailCell label="Nights" value={String(data.nights)} />
                      <DetailCell label="Price/Night" value={formatPrice(data.pricePerNight)} />
                      <DetailCell label="Total" value={formatPrice(data.price)} />
                    </>
                  )}
                  {type === "car" && (
                    <>
                      <DetailCell label="Pickup" value={formatDate(data.pickupDate)} />
                      <DetailCell label="Dropoff" value={formatDate(data.dropoffDate)} />
                      <DetailCell label="Days" value={String(data.days)} />
                      <DetailCell label="Price/Day" value={formatPrice(data.pricePerDay)} />
                      <DetailCell label="Total" value={formatPrice(data.price)} />
                    </>
                  )}
                  {type === "yacht" && (
                    <>
                      <DetailCell label="Date" value={formatDate(data.date)} />
                      <DetailCell label="Time" value={`${data.startTime} – ${data.endTime}`} />
                      <DetailCell label="Hours" value={String(data.hours)} />
                      <DetailCell label="Price/Hour" value={formatPrice(data.pricePerHour)} />
                      <DetailCell label="Total" value={formatPrice(data.price)} />
                    </>
                  )}
                </div>

                {/* Status + Actions */}
                <div className="border-t border-border pt-4">
                  {data.status === "Pending" && canAct && (
                    <div className="flex gap-3">
                      <Button
                        variant="approve"
                        size="lg"
                        className="flex-1"
                        onClick={() => handleAction(type, "Approved")}
                      >
                        <Check className="h-5 w-5" />
                        Approve
                      </Button>
                      <Button
                        variant="decline"
                        size="lg"
                        className="flex-1"
                        onClick={() => handleAction(type, "Declined")}
                      >
                        <X className="h-5 w-5" />
                        Decline
                      </Button>
                    </div>
                  )}
                  {data.status === "Approved" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="approved" className="gap-1">
                          <Check className="h-3 w-3" /> Approved
                        </Badge>
                        {type === "villa" && (
                          <span className="text-xs text-muted-foreground">
                            Dates blocked: {formatDate(data.checkIn)} – {formatDate(data.checkOut)}
                          </span>
                        )}
                      </div>
                      {canAct && (
                        <button
                          onClick={() => handleUndo(type)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Undo2 className="h-3 w-3" /> Undo
                        </button>
                      )}
                    </div>
                  )}
                  {data.status === "Declined" && (
                    <div className="flex items-center justify-between">
                      <Badge variant="declined" className="gap-1">
                        <X className="h-3 w-3" /> Declined
                      </Badge>
                      {canAct && (
                        <button
                          onClick={() => handleUndo(type)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Undo2 className="h-3 w-3" /> Undo
                        </button>
                      )}
                    </div>
                  )}
                  {data.status === "Pending" && !canAct && (
                    <Badge variant="pending" className="gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}

          {/* Notes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal Notes</h2>
            {canNote && (
              <div className="mb-4 flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="min-h-[60px] bg-secondary border-border text-sm"
                />
                <Button size="icon" onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            {booking.notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {booking.notes.map((note, i) => (
                  <div key={i} className="rounded-lg bg-secondary/50 px-3 py-2">
                    <p className="text-sm text-foreground">{note.text}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {note.author} · {formatRelative(note.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — 1/3 */}
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Booking Status</h2>
            <Badge variant={getStatusVariant(status)} className="mb-3 gap-1 text-sm px-3 py-1">
              <StatusIcon status={status as ItemStatus} className="h-4 w-4" />
              {status}
            </Badge>
            {status === "Partial" && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {items.map(({ type, data }) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{type}</span>
                    <Badge variant={getStatusVariant(data.status)} className="text-xs">
                      {data.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Submitted {formatDateTime(booking.createdAt)}
            </p>
          </div>

          {/* Pricing Summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing Summary</h2>
            <div className="space-y-2">
              {items.map(({ type, data }) => (
                <div
                  key={type}
                  className={cn(
                    "flex items-center justify-between text-sm",
                    data.status === "Declined" && "text-muted-foreground line-through opacity-50"
                  )}
                >
                  <span className="capitalize text-foreground">{data.name}</span>
                  <span>{formatPrice(data.price)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Active Total</span>
                <span className="text-lg font-bold text-primary">{formatPrice(activeTotal)}</span>
              </div>
              {activeTotal !== booking.grandTotal && (
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Original</span>
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(booking.grandTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity</h2>
            <div className="space-y-3">
              {booking.activityLog.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" />
                  <div>
                    <p className="text-sm text-foreground">{entry.action}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.actor} · {formatRelative(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
