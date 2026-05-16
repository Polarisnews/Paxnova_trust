import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, CreditCard, Mail } from "lucide-react";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = { title: "Notifications" };

const items = [
  {
    icon: CheckCircle2,
    color: "text-success",
    title: "Direct deposit cleared",
    body: "$4,250.00 from Helio Labs landed in your Apex Checking.",
    age: "1 hour ago",
  },
  {
    icon: AlertCircle,
    color: "text-violet-500",
    title: "Large purchase confirmed",
    body: "Delta Air Lines charged $320.45 to your Signature card.",
    age: "Yesterday",
  },
  {
    icon: CreditCard,
    color: "text-gold-500",
    title: "New statement available",
    body: "Your January Reserve Savings statement is ready to download.",
    age: "3 days ago",
  },
  {
    icon: Mail,
    color: "text-muted-foreground",
    title: "Security advisory",
    body: "Paxnova Trust will never call to ask for your one-time codes.",
    age: "1 week ago",
  },
];

export default async function NotificationsPage() {
  await requireAuth();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Inbox</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Notifications</h1>
      </header>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((n) => (
          <li key={n.title} className="flex items-start gap-4 px-6 py-5">
            <span className={`mt-0.5 ${n.color}`}>
              <n.icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{n.age}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
