"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { setUserRoleAction, setUserStatusAction } from "@/app/actions/admin";
import { EditCredentialsDialog } from "./EditCredentialsDialog";

export function UserActions({
  userId,
  role,
  status,
  username,
  fullName,
}: {
  userId: number;
  role: "user" | "admin";
  status: "active" | "suspended";
  username: string | null;
  fullName: string;
}) {
  const [pending, start] = useTransition();
  const [credsOpen, setCredsOpen] = useState(false);

  const flipRole = () =>
    start(async () => {
      const res = await setUserRoleAction(userId, role === "admin" ? "user" : "admin");
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });

  const flipStatus = () =>
    start(async () => {
      const res = await setUserStatusAction(
        userId,
        status === "active" ? "suspended" : "active"
      );
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      <button
        type="button"
        onClick={() => setCredsOpen(true)}
        disabled={pending}
        className="inline-flex h-7 items-center gap-1 rounded-full bg-muted px-3 font-medium hover:bg-muted/70 disabled:opacity-60"
        title="Reset username or password"
      >
        <KeyRound className="size-3" />
        Reset login
      </button>
      <button
        onClick={flipRole}
        disabled={pending}
        className="inline-flex h-7 items-center rounded-full bg-muted px-3 font-medium hover:bg-muted/70 disabled:opacity-60"
      >
        {role === "admin" ? "Demote" : "Promote"}
      </button>
      <button
        onClick={flipStatus}
        disabled={pending}
        className={`inline-flex h-7 items-center rounded-full px-3 font-medium disabled:opacity-60 ${
          status === "active"
            ? "bg-danger/15 text-danger hover:bg-danger/25"
            : "bg-success/15 text-success hover:bg-success/25"
        }`}
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : status === "active" ? "Suspend" : "Reactivate"}
      </button>

      <EditCredentialsDialog
        open={credsOpen}
        onClose={() => setCredsOpen(false)}
        userId={userId}
        currentUsername={username}
        userName={fullName}
      />
    </div>
  );
}
