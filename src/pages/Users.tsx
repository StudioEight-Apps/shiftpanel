import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/lib/mock-data";
import { hasPermission, maskEmail, maskPhone } from "@/lib/permissions";
import { formatDate, formatPrice } from "@/lib/booking-utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function UsersPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const showPII = role ? hasPermission(role, "view_pii") : false;
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search) return mockUsers;
    const q = search.toLowerCase();
    return mockUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer accounts and activity
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-card pl-9"
          />
        </div>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.uid}
                  onClick={() => navigate(`/users/${user.uid}`)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-secondary/30"
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
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
