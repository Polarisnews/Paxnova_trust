"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  approveApplicationAction,
  rejectApplicationAction,
} from "@/app/actions/admin";

export function ApplicationActions({ applicationId }: { applicationId: number }) {
  const [pending, start] = useTransition();

  const approve = () =>
    start(async () => {
      const res = await approveApplicationAction(applicationId);
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });

  const reject = () =>
    start(async () => {
      const res = await rejectApplicationAction(applicationId);
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      <button
        onClick={approve}
        disabled={pending}
        className="inline-flex h-7 items-center rounded-full bg-success/15 px-3 font-semibold text-success hover:bg-success/25 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : "Approve"}
      </button>
      <button
        onClick={reject}
        disabled={pending}
        className="inline-flex h-7 items-center rounded-full bg-danger/15 px-3 font-semibold text-danger hover:bg-danger/25 disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}
