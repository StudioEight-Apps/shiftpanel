import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { UserProfile } from "@/lib/types";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
  }, [open, user]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Valid email is required");
      return;
    }
    onSave({ ...user, name: name.trim(), email: email.trim(), phone: phone.trim() });
    toast.success("Profile updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 border-border bg-secondary"
              placeholder="Full name"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 border-border bg-secondary"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 border-border bg-secondary"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
