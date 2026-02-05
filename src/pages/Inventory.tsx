import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockVillas, mockCars, mockYachts } from "@/lib/mock-data";
import { formatPrice } from "@/lib/booking-utils";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar, Pencil, Trash2, Home, Car, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Listing, SourceType } from "@/lib/types";

type Tab = "villas" | "cars" | "yachts";
type SourceFilter = "all" | "shift_fleet" | "external";

function getSourceBadge(sourceType: SourceType, sourceName?: string) {
  switch (sourceType) {
    case "shift_fleet":
      return <Badge variant="shift">Shift Fleet</Badge>;
    case "pms":
      return <Badge variant="pms">PMS: {sourceName ?? "Unknown"}</Badge>;
    case "api":
      return <Badge variant="api">{sourceName ?? "API"}</Badge>;
  }
}

function TabIcon({ tab }: { tab: Tab }) {
  switch (tab) {
    case "villas": return <Home className="h-4 w-4" />;
    case "cars": return <Car className="h-4 w-4" />;
    case "yachts": return <Ship className="h-4 w-4" />;
  }
}

export default function Inventory() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("villas");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const canEdit = role ? hasPermission(role, "add_edit_listings") : false;
  const canDelete = role ? hasPermission(role, "delete_listings") : false;
  const canToggle = role ? hasPermission(role, "toggle_status_featured") : false;

  const tabCounts = useMemo(() => ({
    villas: mockVillas.length,
    cars: mockCars.length,
    yachts: mockYachts.length,
  }), []);

  const listings: Listing[] = useMemo(() => {
    let items: Listing[];
    switch (activeTab) {
      case "villas": items = mockVillas; break;
      case "cars": items = mockCars; break;
      case "yachts": items = mockYachts; break;
    }
    if (sourceFilter === "shift_fleet") return items.filter((i) => i.sourceType === "shift_fleet");
    if (sourceFilter === "external") return items.filter((i) => i.sourceType !== "shift_fleet");
    return items;
  }, [activeTab, sourceFilter]);

  const getPrice = (listing: Listing) => {
    switch (listing.type) {
      case "villa": return `${formatPrice(listing.pricePerNight)}/night`;
      case "car": return `${formatPrice(listing.pricePerDay)}/day`;
      case "yacht": return `${formatPrice(listing.pricePerHour)}/hour`;
    }
  };

  const getSubtitle = (listing: Listing) => {
    switch (listing.type) {
      case "villa": return `${listing.bedrooms} bed · ${listing.maxGuests} guests`;
      case "car": return `${listing.bodyStyle} · ${listing.seats} seats`;
      case "yacht": return `${listing.length} · ${listing.maxGuests} guests`;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage villas, cars, and yachts</p>
        </div>
        {canEdit && (
          <Button>
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-6 border-b border-border">
        {(["villas", "cars", "yachts"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-medium capitalize transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <TabIcon tab={tab} />
            {tab}
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{tabCounts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Source Filter */}
      <div className="mb-4 flex gap-1">
        {([
          { key: "all", label: "All" },
          { key: "shift_fleet", label: "Shift Fleet" },
          { key: "external", label: "External" },
        ] as { key: SourceFilter; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setSourceFilter(f.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              sourceFilter === f.key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Source</th>
                {canToggle && (
                  <>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Active</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Featured</th>
                  </>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{listing.name}</p>
                      <p className="text-xs text-muted-foreground">{getSubtitle(listing)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{listing.location}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{getPrice(listing)}</td>
                  <td className="px-4 py-3">{getSourceBadge(listing.sourceType, listing.sourceName)}</td>
                  {canToggle && (
                    <>
                      <td className="px-4 py-3 text-center">
                        <Switch checked={listing.status === "active"} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch checked={listing.featured} />
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Calendar className="h-3.5 w-3.5" />
                      </Button>
                      {canEdit && listing.sourceType !== "api" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && listing.sourceType === "shift_fleet" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-status-declined hover:text-status-declined">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {listings.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No listings found</div>
        )}
      </div>
    </div>
  );
}
