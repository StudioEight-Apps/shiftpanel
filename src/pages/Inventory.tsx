import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockVillas, mockCars, mockYachts } from "@/lib/mock-data";
import { formatPrice } from "@/lib/booking-utils";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Plus, Calendar, Pencil, Trash2, Home, Car, Ship, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Listing, VillaListing, CarListing, YachtListing, SourceType } from "@/lib/types";
import { AddEditListingModal } from "@/components/inventory/AddEditListingModal";
import { CalendarModal } from "@/components/inventory/CalendarModal";
import { DeleteConfirmDialog } from "@/components/inventory/DeleteConfirmDialog";

type Tab = "villas" | "cars" | "yachts";
type SourceFilter = "all" | "shift_fleet" | "external";
type TabSingular = "villa" | "car" | "yacht";

const tabToSingular: Record<Tab, TabSingular> = {
  villas: "villa", cars: "car", yachts: "yacht",
};

function getSourceBadge(sourceType: SourceType, sourceName?: string) {
  switch (sourceType) {
    case "shift_fleet": return <Badge variant="shift">Shift Fleet</Badge>;
    case "pms": return <Badge variant="pms">PMS: {sourceName ?? "Unknown"}</Badge>;
    case "api": return <Badge variant="api">{sourceName ?? "API"}</Badge>;
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
  const [search, setSearch] = useState("");

  // Managed listing state
  const [villas, setVillas] = useState<VillaListing[]>([...mockVillas]);
  const [cars, setCars] = useState<CarListing[]>([...mockCars]);
  const [yachts, setYachts] = useState<YachtListing[]>([...mockYachts]);

  // Modal state
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const canEdit = role ? hasPermission(role, "add_edit_listings") : false;
  const canDelete = role ? hasPermission(role, "delete_listings") : false;
  const canToggle = role ? hasPermission(role, "toggle_status_featured") : false;

  const tabCounts = useMemo(
    () => ({ villas: villas.length, cars: cars.length, yachts: yachts.length }),
    [villas, cars, yachts]
  );

  const listings: Listing[] = useMemo(() => {
    let items: Listing[];
    switch (activeTab) {
      case "villas": items = villas; break;
      case "cars": items = cars; break;
      case "yachts": items = yachts; break;
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }
    if (sourceFilter === "shift_fleet") return items.filter((i) => i.sourceType === "shift_fleet");
    if (sourceFilter === "external") return items.filter((i) => i.sourceType !== "shift_fleet");
    return items;
  }, [activeTab, sourceFilter, search, villas, cars, yachts]);

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

  // Handlers
  const updateListingField = (id: string, updates: Partial<Listing>) => {
    const updater = (items: any[]) =>
      items.map((item: any) => (item.id === id ? { ...item, ...updates } : item));
    switch (activeTab) {
      case "villas": setVillas(updater); break;
      case "cars": setCars(updater); break;
      case "yachts": setYachts(updater); break;
    }
  };

  const handleToggleStatus = (listing: Listing) => {
    updateListingField(listing.id, {
      status: listing.status === "active" ? "hidden" : "active",
    });
  };

  const handleToggleFeatured = (listing: Listing) => {
    updateListingField(listing.id, { featured: !listing.featured });
  };

  const handleAddNew = () => {
    setSelectedListing(null);
    setIsAdding(true);
    setAddEditOpen(true);
  };

  const handleEdit = (listing: Listing) => {
    setSelectedListing(listing);
    setIsAdding(false);
    setAddEditOpen(true);
  };

  const handleCalendar = (listing: Listing) => {
    setSelectedListing(listing);
    setCalendarOpen(true);
  };

  const handleDeleteClick = (listing: Listing) => {
    setSelectedListing(listing);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedListing) return;
    const filterer = (items: any[]) => items.filter((i: any) => i.id !== selectedListing.id);
    switch (activeTab) {
      case "villas": setVillas(filterer); break;
      case "cars": setCars(filterer); break;
      case "yachts": setYachts(filterer); break;
    }
    setDeleteOpen(false);
  };

  const handleSaveListing = (data: any) => {
    if (isAdding) {
      switch (activeTab) {
        case "villas": setVillas((prev) => [...prev, data]); break;
        case "cars": setCars((prev) => [...prev, data]); break;
        case "yachts": setYachts((prev) => [...prev, data]); break;
      }
    } else {
      const updater = (items: any[]) =>
        items.map((item: any) => (item.id === data.id ? data : item));
      switch (activeTab) {
        case "villas": setVillas(updater); break;
        case "cars": setCars(updater); break;
        case "yachts": setYachts(updater); break;
      }
    }
    setAddEditOpen(false);
  };

  const handleUpdateCalendar = (blockedDates: string[]) => {
    if (!selectedListing) return;
    updateListingField(selectedListing.id, { blockedDates });
    setSelectedListing((prev) => (prev ? { ...prev, blockedDates } : prev));
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage villas, cars, and yachts
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleAddNew}>
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
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Source Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-card pl-9"
          />
        </div>
        <div className="flex gap-1">
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
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
                <tr
                  key={listing.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-secondary/30"
                >
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
                        <Switch
                          checked={listing.status === "active"}
                          onCheckedChange={() => handleToggleStatus(listing)}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={listing.featured}
                          onCheckedChange={() => handleToggleFeatured(listing)}
                        />
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCalendar(listing)}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                      </Button>
                      {canEdit && listing.sourceType !== "api" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(listing)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && listing.sourceType === "shift_fleet" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-status-declined hover:text-status-declined"
                          onClick={() => handleDeleteClick(listing)}
                        >
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
          <div className="py-12 text-center text-sm text-muted-foreground">
            No listings found
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEditListingModal
        open={addEditOpen}
        onOpenChange={setAddEditOpen}
        listing={selectedListing}
        type={tabToSingular[activeTab]}
        onSave={handleSaveListing}
      />

      {selectedListing && (
        <CalendarModal
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          listing={selectedListing}
          onUpdateDates={handleUpdateCalendar}
        />
      )}

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        listingName={selectedListing?.name ?? ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
