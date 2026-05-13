"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminFreezeCardAction } from "@/app/actions/admin";

export function CardAdminActions({
  cardId,
  frozen,
}: {
  cardId: number;
  frozen: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => {
          const res = await adminFreezeCardAction(cardId);
          if (res.ok && res.message) toast.success(res.message);
          else if (res.message) toast.error(res.message);
        })
      }
      disabled={pending}
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium disabled:opacity-60 ${
        frozen
          ? "bg-success/15 text-success hover:bg-success/25"
          : "bg-violet-500/15 text-violet-500 hover:bg-violet-500/25"
      }`}
    >
      {pending ? <Loader2 className="size-3 animate-spin" /> : frozen ? "Unfreeze" : "Freeze"}
    </button>
  );
}
