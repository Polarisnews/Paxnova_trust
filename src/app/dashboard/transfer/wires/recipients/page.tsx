import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, UserPlus } from "lucide-react";

export const metadata: Metadata = { title: "Manage recipients" };

export default function RecipientsHome() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Stay alert to wire fraud</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Before you wire money, confirm the payment details directly with
              the person or business using a phone number you already trust —
              not a number from an email. Never share verification codes,
              passwords, or PINs with anyone.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <UserPlus className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Pick an option from the left to manage your wire recipients, or get
          started by adding a new one.
        </p>
        <Link
          href="/dashboard/transfer/wires/recipients/new"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Add a recipient
        </Link>
      </div>
    </div>
  );
}
