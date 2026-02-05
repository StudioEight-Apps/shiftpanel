import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers, mockBookings } from "@/lib/mock-data";
import { hasPermission, maskEmail, maskPhone } from "@/lib/permissions";
import { formatDate, formatPrice, deriveBookingStatus, getStatusVariant, formatRelative } from "@/lib/booking-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Phone, Send, Home, Car, Ship, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ItemStatus, ItemType } from "@/lib/types";

type TabType = "profile" | "trips" | "activity";

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case "Approved": return <Check className="h-3 w-3 text-status-approved" />;
    case "Declined": return <X className="h-3 w-3 text-status-declined" />;
    case "Pending": return <Clock className="h-3 w-3 text-status-pending" />;
  }
}

function ItemIcon({ type }: { type: ItemType }) {
  switch (type) {
    case "villa": return <Home className="h-3.5 w-3.5" />;
    case "car": return <Car className="h-3.5 w-3.5" />;
    case "yacht": return <Ship className="h-3.5 w-3.5" />;
  }
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, user: adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [newNote, setNewNote] = useState("");

  const showPII = role ? hasPermission(role, "view_pii") : false;
  const canNote = role ? hasPermission(role, "add_user_notes") : false;
  const canEditLTV = role ? hasPermission(role, "edit_lifetime_value") : false;

  const [userProfile, setUserProfile] = useState(() => mockUsers.find((u) => u.uid === id) ?? null);

  const userBookings = useMemo(() => {
    if (!userProfile) return [];
    return mockBookings.filter((b) => b.customer.uid === userProfile.uid);
  }, [userProfile]);

  const handleAddNote = useCallback(() => {
    if (!newNote.trim() || !adminUser || !userProfile) return;
    const note = { text: newNote.trim(), author: adminUser.email, timestamp: new Date() };
    setUserProfile((prev) => prev ? { ...prev, notes: [note, ...prev.notes] } : prev);
    setNewNote("");
  }, [newNote, adminUser, userProfile]);

  if (!userProfile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const tabs: TabType[] = ["profile", "trips", "activity"];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/users")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{userProfile.name}</h1>
          <p className="text-xs text-muted-foreground">Customer since {formatDate(userProfile.createdAt)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "border-b-2 pb-3 pt-1 text-sm font-medium capitalize transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {/* Contact */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h2>
              <p className="text-lg font-semibold text-foreground">{userProfile.name}</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Mail className="h-3.5 w-3.5" />
                  {showPII ? userProfile.email : maskEmail(userProfile.email)}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Phone className="h-3.5 w-3.5" />
                  {showPII ? userProfile.phone : maskPhone(userProfile.phone)}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                  <p className="text-lg font-bold text-foreground">{userProfile.totalTrips}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Trip</p>
                  <p className="text-sm font-medium text-foreground">
                    {userProfile.lastTripDate ? formatDate(userProfile.lastTripDate) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lifetime Value</p>
                  <p className="text-lg font-bold text-primary">{formatPrice(userProfile.lifetimeValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(userProfile.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Notes</h2>
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
            {userProfile.notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {userProfile.notes.map((note, i) => (
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
      )}

      {/* Trips Tab */}
      {activeTab === "trips" && (
        <div className="space-y-3">
          {userBookings.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
              No trips yet
            </div>
          ) : (
            userBookings.map((booking) => {
              const bookingStatus = deriveBookingStatus(booking);
              const items: { type: ItemType; name: string; price: number; status: ItemStatus }[] = [];
              if (booking.villa) items.push({ type: "villa", name: booking.villa.name, price: booking.villa.price, status: booking.villa.status });
              if (booking.car) items.push({ type: "car", name: booking.car.name, price: booking.car.price, status: booking.car.status });
              if (booking.yacht) items.push({ type: "yacht", name: booking.yacht.name, price: booking.yacht.price, status: booking.yacht.status });

              return (
                <div
                  key={booking.id}
                  onClick={() => navigate(`/requests/${booking.id}`)}
                  className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{booking.id}</span>
                    <Badge variant={getStatusVariant(bookingStatus)}>{bookingStatus}</Badge>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.type}
                        className={cn(
                          "flex items-center gap-2 text-sm",
                          item.status === "Declined" && "line-through opacity-50"
                        )}
                      >
                        <ItemIcon type={item.type} />
                        <span className="flex-1 text-muted-foreground">{item.name}</span>
                        <StatusIcon status={item.status} />
                        <span className="text-foreground">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(booking.createdAt)}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-4">
            {userBookings.flatMap((b) =>
              b.activityLog.map((entry, i) => ({
                ...entry,
                bookingId: b.id,
                key: `${b.id}-${i}`,
              }))
            )
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((entry) => (
                <div key={entry.key} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" />
                  <div>
                    <p className="text-sm text-foreground">
                      {entry.action}
                      <span className="ml-2 text-xs text-muted-foreground">{entry.bookingId}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.actor} · {formatRelative(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            {userBookings.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
