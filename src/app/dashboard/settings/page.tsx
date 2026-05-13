import type { Metadata } from "next";
import { Bell, Globe, Palette, ShieldCheck } from "lucide-react";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

const sections = [
  {
    icon: ShieldCheck,
    title: "Security & privacy",
    body: "Two-factor authentication, trusted devices, data sharing preferences.",
  },
  {
    icon: Bell,
    title: "Notifications",
    body: "Email, push and SMS preferences for transactions, security and offers.",
  },
  {
    icon: Globe,
    title: "Language & region",
    body: "Display language, currency, date format and time zone.",
  },
  {
    icon: Palette,
    title: "Appearance",
    body: "Toggle light, dark or system theme. Set high-contrast and motion preferences.",
  },
];

export default async function SettingsPage() {
  await requireAuth();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Preferences</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <s.icon className="size-4" />
            </span>
            <h2 className="mt-4 font-display text-base font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
