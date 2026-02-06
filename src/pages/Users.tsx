import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/lib/mock-data";
import { hasPermission, maskEmail, maskPhone } from "@/lib/permissions";
import { formatDate, formatPrice } from "@/lib/booking-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, UserX, UserCheck, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile } from "@/lib/types";
import { toast } from "sonner";

type SortOption = "a-z" | "z-a" | "newest" | "oldest" | "highest-ltv" | "lowest-ltv" | "most-trips";

export default function UsersPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const showPII = role ? hasPermission(role, "view_pii") : false;
  const canManage = role ? hasPermission(role, "edit_lifetime_value") : false;

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("a-z");
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [deactivateTarget, setDeactivateTarget] = useState<UserProfile | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...users];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sort) {
      case "a-z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "oldest":
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case "highest-ltv":
        result.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
        break;
      case "lowest-ltv":
        result.sort((a, b) => a.lifetimeValue - b.lifetimeValue);
        break;
      case "most-trips":
        result.sort((a, b) => b.totalTrips - a.totalTrips);
        break;
    }

    return result;
  }, [search, sort, users]);

  const handleToggleStatus = (user: UserProfile) => {
    if (user.status === "active") {
      setDeactivateTarget(user);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid ? { ...u, status: "active" as const } : u
        )
      );
      toast.success(`${user.name} has been reactivated`);
    }
  };

  const confirmDeactivate = () => {
    if (!deactivateTarget) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === deactivateTarget.uid ? { ...u, status: "deactivated" as const } : u
      )
    );
    toast.success(`${deactivateTarget.name} has been deactivated`);
    setDeactivateTarget(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer accounts and activity
        </p>
      </div>

      {/* Search + Sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-card pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-[180px] border-border bg-card">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a-z">Name A → Z</SelectItem>
            <SelectItem value="z-a">Name Z → A</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="highest-ltv">Highest LTV</SelectItem>
            <SelectItem value="lowest-ltv">Lowest LTV</SelectItem>
            <SelectItem value="most-trips">Most trips</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Trips</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Last Trip</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Lifetime Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Joined</th>
                {canManage && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((user) => (
                <tr
                  key={user.uid}
                  onClick={() => navigate(`/users/${user.uid}`)}
                  className={`cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-secondary/30 ${
                    user.status === "deactivated" ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {showPII ? user.email : maskEmail(user.email)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {showPII ? user.phone : maskPhone(user.phone)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-foreground">{user.totalTrips}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.lastTripDate ? formatDate(user.lastTripDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {formatPrice(user.lifetimeValue)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant={user.status === "active" ? "default" : "secondary"}
                      className={
                        user.status === "active"
                          ? "bg-status-approved/10 text-status-approved border-status-approved/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {user.status === "active" ? "Active" : "Deactivated"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/users/${user.uid}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.status === "active" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4 text-destructive" />
                                <span className="text-destructive">Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4 text-status-approved" />
                                <span>Reactivate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 9 : 8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivateTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user account. They will no longer be able to make new bookings. This action can be reversed by reactivating the account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
