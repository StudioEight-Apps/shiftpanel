import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import type { Listing, SourceType } from "@/lib/types";

interface AddEditListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
  type: "villa" | "car" | "yacht";
  onSave: (listing: any) => void;
}

export function AddEditListingModal({
  open,
  onOpenChange,
  listing,
  type,
  onSave,
}: AddEditListingModalProps) {
  const isEditing = !!listing;
  const isExternalSource =
    listing?.sourceType === "pms" || listing?.sourceType === "api";

  // Common fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // Villa
  const [pricePerNight, setPricePerNight] = useState(0);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [maxGuests, setMaxGuests] = useState(2);
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [minimumStay, setMinimumStay] = useState(1);
  const [market, setMarket] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");

  // Car
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [pricePerDay, setPricePerDay] = useState(0);
  const [bodyStyle, setBodyStyle] = useState("");
  const [seats, setSeats] = useState(2);
  const [power, setPower] = useState("");

  // Yacht
  const [pricePerHour, setPricePerHour] = useState(0);
  const [yachtLength, setYachtLength] = useState("");
  const [yachtMaxGuests, setYachtMaxGuests] = useState(6);
  const [crewIncluded, setCrewIncluded] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (listing) {
      setName(listing.name);
      setDescription(listing.description);
      setLocation(listing.location);
      if (listing.type === "villa") {
        setPricePerNight(listing.pricePerNight);
        setBedrooms(listing.bedrooms);
        setBathrooms(listing.bathrooms);
        setMaxGuests(listing.maxGuests);
        setAddress(listing.address);
        setNeighborhood(listing.neighborhood);
        setMinimumStay(listing.minimumStay);
        setMarket(listing.market);
        setAmenitiesText(listing.amenities.join(", "));
      } else if (listing.type === "car") {
        setBrand(listing.brand);
        setModelName(listing.model);
        setPricePerDay(listing.pricePerDay);
        setBodyStyle(listing.bodyStyle);
        setSeats(listing.seats);
        setPower(listing.power);
      } else if (listing.type === "yacht") {
        setPricePerHour(listing.pricePerHour);
        setYachtLength(listing.length);
        setYachtMaxGuests(listing.maxGuests);
        setCrewIncluded(listing.crewIncluded);
        setAmenitiesText(listing.amenities.join(", "));
      }
    } else {
      setName("");
      setDescription("");
      setLocation("");
      setPricePerNight(0);
      setBedrooms(1);
      setBathrooms(1);
      setMaxGuests(2);
      setAddress("");
      setNeighborhood("");
      setMinimumStay(1);
      setMarket("");
      setAmenitiesText("");
      setBrand("");
      setModelName("");
      setPricePerDay(0);
      setBodyStyle("");
      setSeats(2);
      setPower("");
      setPricePerHour(0);
      setYachtLength("");
      setYachtMaxGuests(6);
      setCrewIncluded(false);
    }
  }, [open, listing]);

  const handleSave = () => {
    const base = {
      id: listing?.id ?? `${type[0]}${Date.now()}`,
      name,
      description,
      location,
      photos: listing?.photos ?? [],
      sourceType: listing?.sourceType ?? ("shift_fleet" as SourceType),
      sourceName: listing?.sourceName,
      status: listing?.status ?? ("active" as const),
      featured: listing?.featured ?? false,
      blockedDates: listing?.blockedDates ?? [],
      syncedBlockedDates: listing?.syncedBlockedDates ?? [],
      lastSynced: listing?.lastSynced,
    };

    const amenities = amenitiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let full: any;
    switch (type) {
      case "villa":
        full = {
          ...base,
          type: "villa",
          pricePerNight,
          bedrooms,
          bathrooms,
          maxGuests,
          amenities,
          address,
          neighborhood,
          minimumStay,
          market,
        };
        break;
      case "car":
        full = {
          ...base,
          type: "car",
          brand,
          model: modelName,
          pricePerDay,
          bodyStyle,
          seats,
          power,
        };
        break;
      case "yacht":
        full = {
          ...base,
          type: "yacht",
          pricePerHour,
          length: yachtLength,
          maxGuests: yachtMaxGuests,
          crewIncluded,
          amenities,
        };
        break;
    }
    onSave(full);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {isEditing ? `Edit ${listing!.name}` : `Add New ${type}`}
          </DialogTitle>
        </DialogHeader>

        {isExternalSource && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Synced from <strong>{listing?.sourceName}</strong>. Some fields are
              read-only.
            </span>
          </div>
        )}

        <div className="space-y-6 py-2">
          {/* Basic Info */}
          <Section title="Basic Info">
            <Field label="Name" value={name} onChange={setName} readOnly={isExternalSource} />
            <Field label="Description" value={description} onChange={setDescription} readOnly={isExternalSource} textarea />
          </Section>

          {/* Villa-specific */}
          {type === "villa" && (
            <>
              <Section title="Pricing">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price per night ($)" value={String(pricePerNight)} onChange={(v) => setPricePerNight(Number(v) || 0)} type="number" readOnly={isExternalSource} />
                  <Field label="Minimum stay (nights)" value={String(minimumStay)} onChange={(v) => setMinimumStay(Number(v) || 1)} type="number" readOnly={isExternalSource} />
                </div>
              </Section>
              <Section title="Capacity">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Bedrooms" value={String(bedrooms)} onChange={(v) => setBedrooms(Number(v) || 1)} type="number" readOnly={isExternalSource} />
                  <Field label="Bathrooms" value={String(bathrooms)} onChange={(v) => setBathrooms(Number(v) || 1)} type="number" readOnly={isExternalSource} />
                  <Field label="Max guests" value={String(maxGuests)} onChange={(v) => setMaxGuests(Number(v) || 1)} type="number" readOnly={isExternalSource} />
                </div>
              </Section>
              <Section title="Location">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Market / City" value={market} onChange={setMarket} readOnly={isExternalSource} />
                  <Field label="Neighborhood" value={neighborhood} onChange={setNeighborhood} readOnly={isExternalSource} />
                </div>
                <Field label="Full Address" value={address} onChange={setAddress} readOnly={isExternalSource} />
                <Field label="Display Location" value={location} onChange={setLocation} readOnly={isExternalSource} />
              </Section>
              <Section title="Amenities">
                <Field label="Amenities (comma-separated)" value={amenitiesText} onChange={setAmenitiesText} readOnly={isExternalSource} placeholder="Pool, Sea View, Chef, Spa..." />
              </Section>
            </>
          )}

          {/* Car-specific */}
          {type === "car" && (
            <>
              <Section title="Vehicle Details">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Brand" value={brand} onChange={setBrand} readOnly={isExternalSource} />
                  <Field label="Model" value={modelName} onChange={setModelName} readOnly={isExternalSource} />
                </div>
              </Section>
              <Section title="Pricing">
                <Field label="Price per day ($)" value={String(pricePerDay)} onChange={(v) => setPricePerDay(Number(v) || 0)} type="number" readOnly={isExternalSource} />
              </Section>
              <Section title="Specifications">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Body Style" value={bodyStyle} onChange={setBodyStyle} readOnly={isExternalSource} />
                  <Field label="Seats" value={String(seats)} onChange={(v) => setSeats(Number(v) || 1)} type="number" readOnly={isExternalSource} />
                  <Field label="Power" value={power} onChange={setPower} readOnly={isExternalSource} placeholder="e.g., 640 HP" />
                </div>
              </Section>
              <Section title="Location">
                <Field label="Location" value={location} onChange={setLocation} readOnly={isExternalSource} />
              </Section>
            </>
          )}

          {/* Yacht-specific */}
          {type === "yacht" && (
            <>
              <Section title="Pricing">
                <Field label="Price per hour ($)" value={String(pricePerHour)} onChange={(v) => setPricePerHour(Number(v) || 0)} type="number" readOnly={isExternalSource} />
              </Section>
              <Section title="Specifications">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Length" value={yachtLength} onChange={setYachtLength} readOnly={isExternalSource} placeholder="e.g., 77 ft" />
                  <Field label="Max Guests" value={String(yachtMaxGuests)} onChange={(v) => setYachtMaxGuests(Number(v) || 1)} type="number" readOnly={isExternalSource} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {isExternalSource ? (
                    <p className="text-sm text-foreground">
                      Crew included: {crewIncluded ? "Yes" : "No"}
                    </p>
                  ) : (
                    <>
                      <Checkbox
                        checked={crewIncluded}
                        onCheckedChange={(c) => setCrewIncluded(c === true)}
                      />
                      <Label className="text-sm">Crew included</Label>
                    </>
                  )}
                </div>
              </Section>
              <Section title="Location">
                <Field label="Location" value={location} onChange={setLocation} readOnly={isExternalSource} />
              </Section>
              <Section title="Amenities">
                <Field label="Amenities (comma-separated)" value={amenitiesText} onChange={setAmenitiesText} readOnly={isExternalSource} placeholder="Jacuzzi, Water Toys, Full Bar..." />
              </Section>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isExternalSource && (
            <Button onClick={handleSave}>
              {isEditing
                ? "Save Changes"
                : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  type = "text",
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  if (readOnly) {
    return (
      <div>
        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value || "—"}</p>
      </div>
    );
  }

  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 border-border bg-secondary"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 border-border bg-secondary"
        />
      )}
    </div>
  );
}
