import type { Metadata } from "next";
import { Mail, Phone, ShieldCheck, User } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Account</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-violet-500 font-display text-lg font-semibold text-white">
            {user.firstName[0]}
            {user.lastName[0]}
          </span>
          <div>
            <p className="font-display text-xl font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border">
          <Row icon={Mail} label="Email" value={user.email} />
          <Row icon={Phone} label="Phone" value={user.phone ?? "Not on file"} />
          <Row icon={User} label="Role" value={user.role === "admin" ? "Administrator" : "Personal account"} />
          <Row icon={ShieldCheck} label="Status" value={user.status === "active" ? "Active" : "Suspended"} />
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Security</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your password, multi-factor authentication, and recovery options.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <SecurityItem title="Password" status="Strong · last changed 12 days ago" />
          <SecurityItem title="MFA" status="Authenticator app enrolled" />
          <SecurityItem title="Passkeys" status="Not enrolled" cta="Add a passkey" />
          <SecurityItem title="Recovery email" status="Set on file" />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SecurityItem({
  title,
  status,
  cta,
}: {
  title: string;
  status: string;
  cta?: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{status}</p>
      {cta && (
        <button className="mt-2 text-xs font-medium text-violet-500 hover:text-violet-600">
          {cta} →
        </button>
      )}
    </div>
  );
}
