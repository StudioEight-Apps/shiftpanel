import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/types";

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
  onUpdateDates: (blockedDates: string[]) => void;
}

export function CalendarModal({
  open,
  onOpenChange,
  listing,
  onUpdateDates,
}: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const isReadOnly = listing.sourceType === "api";
  const isPMS = listing.sourceType === "pms";

  const blockedSet = useMemo(() => new Set(listing.blockedDates), [listing.blockedDates]);
  const syncedSet = useMemo(
    () => new Set(listing.syncedBlockedDates ?? []),
    [listing.syncedBlockedDates]
  );

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = getDay(startOfMonth(currentMonth));

  const formatDateStr = (date: Date) => format(date, "yyyy-MM-dd");

  const toggleDate = (date: Date) => {
    if (isReadOnly) return;
    const dateStr = formatDateStr(date);
    const isPast =
      isBefore(startOfDay(date), startOfDay(new Date())) && !isToday(date);
    if (isPast) return;
    if (isPMS && syncedSet.has(dateStr)) return;

    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const handleBlock = () => {
    const newBlocked = [
      ...new Set([...listing.blockedDates, ...selectedDates]),
    ];
    onUpdateDates(newBlocked);
    setSelectedDates(new Set());
  };

  const handleUnblock = () => {
    const newBlocked = listing.blockedDates.filter(
      (d) => !selectedDates.has(d)
    );
    onUpdateDates(newBlocked);
    setSelectedDates(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Availability — {listing.name}</DialogTitle>
        </DialogHeader>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((p) => subMonths(p, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((p) => addMonths(p, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = formatDateStr(day);
            const isBlocked = blockedSet.has(dateStr);
            const isSynced = syncedSet.has(dateStr);
            const isSelected = selectedDates.has(dateStr);
            const isPast =
              isBefore(startOfDay(day), startOfDay(new Date())) &&
              !isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => toggleDate(day)}
                disabled={isPast || isReadOnly || (isPMS && isSynced)}
                className={cn(
                  "relative h-9 w-full rounded text-xs font-medium transition-colors",
                  isPast && "cursor-not-allowed opacity-30",
                  !isPast &&
                    !isBlocked &&
                    !isSynced &&
                    !isSelected &&
                    "hover:bg-secondary",
                  isBlocked &&
                    !isSynced &&
                    "bg-status-declined/20 text-status-declined",
                  isSynced && "bg-status-declined/10 text-status-declined",
                  isSelected &&
                    "bg-primary/20 text-primary ring-1 ring-primary",
                  isToday(day) && "font-bold underline"
                )}
              >
                {format(day, "d")}
                {isSynced && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded"
                    style={{
                      background:
                        "repeating-linear-gradient(45deg, transparent, transparent 2px, hsl(var(--status-declined) / 0.12) 2px, hsl(var(--status-declined) / 0.12) 4px)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-status-declined/20" />
            <span>Blocked</span>
          </div>
          {isPMS && (
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, transparent, transparent 1px, hsl(var(--status-declined) / 0.25) 1px, hsl(var(--status-declined) / 0.25) 2px)",
                }}
              />
              <span>Synced</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-primary/20 ring-1 ring-primary" />
            <span>Selected</span>
          </div>
        </div>

        {/* Actions */}
        {!isReadOnly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleBlock}
              disabled={selectedDates.size === 0}
            >
              Block Selected
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleUnblock}
              disabled={selectedDates.size === 0}
            >
              Unblock Selected
            </Button>
          </div>
        )}

        {isReadOnly && (
          <p className="text-center text-xs text-muted-foreground">
            Calendar is read-only for API-sourced listings
          </p>
        )}

        {isPMS && listing.lastSynced && (
          <p className="text-center text-xs text-muted-foreground">
            Last synced: {format(listing.lastSynced, "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
