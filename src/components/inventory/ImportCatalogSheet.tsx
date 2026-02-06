import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Search, Check } from "lucide-react";
import { formatPrice } from "@/lib/booking-utils";
import { toast } from "sonner";

export interface CatalogVilla {
  id: string;
  name: string;
  provider: "Guesty" | "Hostaway";
  location: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  photo: string;
}

const PROVIDER_OPTIONS = ["All Providers", "Guesty", "Hostaway"] as const;
const MARKET_OPTIONS = ["All Markets", "Miami", "Mykonos", "Amalfi Coast", "Bali", "Dubai", "Aspen", "Tulum", "Lake Como"] as const;

interface ImportCatalogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogVillas: CatalogVilla[];
  importedIds: Set<string>;
  onImport: (villa: CatalogVilla) => void;
}

export function ImportCatalogSheet({
  open,
  onOpenChange,
  catalogVillas,
  importedIds,
  onImport,
}: ImportCatalogSheetProps) {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<string>("All Providers");
  const [market, setMarket] = useState<string>("All Markets");

  const filtered = useMemo(() => {
    let items = catalogVillas;

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q)
      );
    }

    if (provider !== "All Providers") {
      items = items.filter((v) => v.provider === provider);
    }

    if (market !== "All Markets") {
      items = items.filter((v) =>
        v.location.toLowerCase().includes(market.toLowerCase())
      );
    }

    return items;
  }, [catalogVillas, search, provider, market]);

  const handleImport = (villa: CatalogVilla) => {
    onImport(villa);
    toast.success(`${villa.name} added to inventory`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[60vw] overflow-y-auto p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <SheetTitle className="text-xl font-bold text-foreground">
            Import Villas
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Browse available properties from connected PMS providers
          </SheetDescription>
        </SheetHeader>

        {/* Filter bar */}
        <div className="px-6 py-4 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-border bg-background"
            />
          </div>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-full sm:w-[160px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger className="w-full sm:w-[170px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARKET_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No matching properties found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((villa) => {
                const isImported = importedIds.has(villa.id);
                return (
                  <div
                    key={villa.id}
                    className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
                  >
                    {/* Thumbnail */}
                    <AspectRatio ratio={16 / 9}>
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          No photo
                        </span>
                      </div>
                    </AspectRatio>

                    {/* Card body */}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                          {villa.name}
                        </h3>
                        <Badge variant="pms" className="shrink-0 text-[10px]">
                          {villa.provider}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {villa.location}
                      </p>

                      <p className="text-sm font-medium text-foreground">
                        {formatPrice(villa.pricePerNight)}
                        <span className="text-xs font-normal text-muted-foreground">
                          /night
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {villa.bedrooms} bed · {villa.bathrooms} bath ·{" "}
                        {villa.maxGuests} guests
                      </p>

                      <div className="mt-auto pt-3">
                        {isImported ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full pointer-events-none opacity-60"
                            disabled
                          >
                            <Check className="h-3.5 w-3.5" />
                            Imported
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleImport(villa)}
                          >
                            Import
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
