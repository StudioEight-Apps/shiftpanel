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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { PhotoUpload } from "./PhotoUpload";
import { CAR_BRANDS, BODY_TYPES, TRANSMISSIONS, CITIES } from "@/lib/constants";
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
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "hidden">("active");
  const [featured, setFeatured] = useState(false);

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
  const [transmission, setTransmission] = useState<"Automatic" | "Manual">("Automatic");

  // Yacht
  const [pricePerHour, setPricePerHour] = useState(0);
  const [yachtLength, setYachtLength] = useState("");
  const [yachtMaxGuests, setYachtMaxGuests] = useState(6);
  const [captainIncluded, setCaptainIncluded] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (listing) {
      setName(listing.name);
      setDescription(listing.description);
      setLocation(listing.location);
      setPhotos([...listing.photos]);
      setStatus(listing.status);
      setFeatured(listing.featured);
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
        setTransmission(listing.transmission);
      } else if (listing.type === "yacht") {
        setPricePerHour(listing.pricePerHour);
        setYachtLength(listing.length);
        setYachtMaxGuests(listing.maxGuests);
        setCaptainIncluded(listing.captainIncluded);
        setAmenitiesText(listing.amenities.join(", "));
      }
    } else {
      setName("");
      setDescription("");
      setLocation("");
      setPhotos([]);
      setStatus("active");
      setFeatured(false);
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
      setTransmission("Automatic");
      setPricePerHour(0);
      setYachtLength("");
      setYachtMaxGuests(6);
      setCaptainIncluded(false);
    }
  }, [open, listing]);

  const handleSave = () => {
    const base = {
      id: listing?.id ?? `${type[0]}${Date.now()}`,
      name,
      description,
      location,
      photos,
      sourceType: listing?.sourceType ?? ("shift_fleet" as SourceType),
      sourceName: listing?.sourceName,
      status,
      featured,
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
          transmission,
        };
        break;
      case "yacht":
        full = {
          ...base,
          type: "yacht",
          pricePerHour,
          length: yachtLength,
          maxGuests: yachtMaxGuests,
          captainIncluded,
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

          {/* Photos */}
          <Section title="Photos">
            <PhotoUpload photos={photos} onChange={setPhotos} readOnly={isExternalSource} />
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
                  <DropdownField
                    label="Brand"
                    value={brand}
                    onChange={setBrand}
                    options={[...CAR_BRANDS]}
                    readOnly={isExternalSource}
                    placeholder="Select brand"
                  />
                  <Field label="Model" value={modelName} onChange={setModelName} readOnly={isExternalSource} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <DropdownField
                    label="Body Type"
                    value={bodyStyle}
                    onChange={setBodyStyle}
                    options={[...BODY_TYPES]}
                    readOnly={isExternalSource}
                    placeholder="Select body type"
                  />
                  <Field label="Seats" value={String(seats)} onChange={(v) => setSeats(Number(v) || 1)} type="number" readOnly={isExternalSource} />
                  <DropdownField
                    label="Transmission"
                    value={transmission}
                    onChange={(v) => setTransmission(v as "Automatic" | "Manual")}
                    options={[...TRANSMISSIONS]}
                    readOnly={isExternalSource}
                    placeholder="Select"
                  />
                </div>
              </Section>
              <Section title="Pricing">
                <Field label="Price per day ($)" value={String(pricePerDay)} onChange={(v) => setPricePerDay(Number(v) || 0)} type="number" readOnly={isExternalSource} />
              </Section>
              <Section title="Specifications">
                <Field label="Power" value={power} onChange={setPower} readOnly={isExternalSource} placeholder="e.g., 640 HP" />
              </Section>
              <Section title="Location">
                <DropdownField
                  label="City"
                  value={location}
                  onChange={setLocation}
                  options={[...CITIES]}
                  readOnly={isExternalSource}
                  placeholder="Select city"
                />
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
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
                  <div>
                    <Label className="text-sm font-medium">Captain included</Label>
                    <p className="text-xs text-muted-foreground">Includes a professional captain</p>
                  </div>
                  {isExternalSource ? (
                    <p className="text-sm font-medium text-foreground">{captainIncluded ? "Yes" : "No"}</p>
                  ) : (
                    <Switch
                      checked={captainIncluded}
                      onCheckedChange={setCaptainIncluded}
                    />
                  )}
                </div>
              </Section>
              <Section title="Location">
                <DropdownField
                  label="City"
                  value={location}
                  onChange={setLocation}
                  options={[...CITIES]}
                  readOnly={isExternalSource}
                  placeholder="Select city"
                />
              </Section>
              <Section title="Amenities">
                <Field label="Amenities (comma-separated)" value={amenitiesText} onChange={setAmenitiesText} readOnly={isExternalSource} placeholder="Jacuzzi, Water Toys, Full Bar..." />
              </Section>
            </>
          )}

          {/* Status & Featured — always at the bottom */}
          <Section title="Visibility">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
                <div>
                  <Label className="text-sm font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground">Listing is visible to customers</p>
                </div>
                <Switch
                  checked={status === "active"}
                  onCheckedChange={(checked) => setStatus(checked ? "active" : "hidden")}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
                <div>
                  <Label className="text-sm font-medium">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show in featured listings section</p>
                </div>
                <Switch
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </div>
          </Section>
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

function DropdownField({
  label,
  value,
  onChange,
  options,
  readOnly,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  readOnly?: boolean;
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
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1 border-border bg-secondary">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
