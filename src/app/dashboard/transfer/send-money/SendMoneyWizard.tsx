"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  Landmark,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currency, maskAccount } from "@/lib/format";
import { ZELLE_DAILY_LIMIT } from "@/lib/banking-constants";
import { initiateTransferAction } from "@/app/actions/banking";
import {
  addExternalBankAction,
  addZelleContactAction,
} from "@/app/actions/send-money";

// ────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────

type Account = {
  id: number;
  name: string;
  type: string;
  status: string;
  balance: number;
  accountNumber: string;
  currency: string;
};

type ZelleContact = {
  id: number;
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
};

type ExternalBank = {
  id: number;
  name: string;
  nickname: string | null;
  bankName: string | null;
  accountNumber: string;
  accountType: string | null;
};

type DestinationType = "zelle" | "internal" | "external-bank";
type Step = "destination-type" | "recipient" | "amount" | "review";

// ────────────────────────────────────────────────────────────────────────
// Main wizard
// ────────────────────────────────────────────────────────────────────────

export function SendMoneyWizard({
  accounts,
  zelleContacts,
  externalBanks,
}: {
  accounts: Account[];
  zelleContacts: ZelleContact[];
  externalBanks: ExternalBank[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("destination-type");
  const [destinationType, setDestinationType] =
    useState<DestinationType | null>(null);

  // Local copies so newly added recipients show up immediately without a refresh.
  const [zelleList, setZelleList] = useState<ZelleContact[]>(zelleContacts);
  const [bankList, setBankList] = useState<ExternalBank[]>(externalBanks);

  // Selections
  const [pickedZelleId, setPickedZelleId] = useState<number | null>(null);
  const [pickedAccountId, setPickedAccountId] = useState<number | null>(null);
  const [pickedBankId, setPickedBankId] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState<number>(0);

  const [amountText, setAmountText] = useState("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  // Source accounts: cash only, active.
  const sourceAccounts = useMemo(
    () => accounts.filter((a) => a.type !== "credit" && a.status === "active"),
    [accounts]
  );

  const picked = useMemo(() => {
    if (destinationType === "zelle") {
      const c = zelleList.find((x) => x.id === pickedZelleId);
      return c
        ? {
            kind: "zelle" as const,
            label: c.nickname || c.name,
            sub: c.email || c.phone || "Zelle",
            data: c,
          }
        : null;
    }
    if (destinationType === "internal") {
      const a = accounts.find((x) => x.id === pickedAccountId);
      return a
        ? {
            kind: "internal" as const,
            label: a.name,
            sub: `${a.type} · ${maskAccount(a.accountNumber)}`,
            data: a,
          }
        : null;
    }
    if (destinationType === "external-bank") {
      const b = bankList.find((x) => x.id === pickedBankId);
      return b
        ? {
            kind: "external-bank" as const,
            label: b.nickname || b.name,
            sub: `${b.bankName ?? "External bank"} · ${maskAccount(
              b.accountNumber
            )}`,
            data: b,
          }
        : null;
    }
    return null;
  }, [destinationType, pickedZelleId, pickedAccountId, pickedBankId, zelleList, bankList, accounts]);

  // Source options for the amount step: drop the chosen destination if it's
  // one of the user's own accounts.
  const usableSources = useMemo(
    () =>
      destinationType === "internal"
        ? sourceAccounts.filter((a) => a.id !== pickedAccountId)
        : sourceAccounts,
    [destinationType, pickedAccountId, sourceAccounts]
  );

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const amount = Number(amountText) || 0;
  const insufficient = fromAccount ? amount > fromAccount.balance : false;

  // Method-specific copy + fee. All three paths are $0 fee at Paxnova Trust.
  const methodMeta = useMemo(() => {
    switch (destinationType) {
      case "zelle":
        return {
          label: "Zelle",
          fee: 0,
          arrival: "In minutes",
          dailyLimit: ZELLE_DAILY_LIMIT,
          icon: Zap,
          color: "text-violet-500",
        };
      case "internal":
        return {
          label: "Internal transfer",
          fee: 0,
          arrival: "Instant",
          dailyLimit: null as number | null,
          icon: Wallet,
          color: "text-violet-500",
        };
      case "external-bank":
        return {
          label: "ACH transfer",
          fee: 0,
          arrival: "1–2 business days",
          dailyLimit: null as number | null,
          icon: Landmark,
          color: "text-violet-500",
        };
      default:
        return null;
    }
  }, [destinationType]);

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any accounts yet — open one to send money.
        </p>
        <Link
          href="/personal"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Open an account
        </Link>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // Step transitions + validation
  // ──────────────────────────────────────────────────────────────────

  function chooseDestinationType(t: DestinationType) {
    setDestinationType(t);
    setStep("recipient");
  }

  function onRecipientPicked() {
    // Pre-pick a default source account so the amount step is ready.
    if (!fromAccountId) {
      const first =
        destinationType === "internal"
          ? sourceAccounts.find((a) => a.id !== pickedAccountId)?.id
          : sourceAccounts[0]?.id;
      if (first) setFromAccountId(first);
    } else if (
      destinationType === "internal" &&
      fromAccountId === pickedAccountId
    ) {
      const alt = sourceAccounts.find((a) => a.id !== pickedAccountId);
      if (alt) setFromAccountId(alt.id);
    }
    setStep("amount");
  }

  function validateAmount(): boolean {
    const errs: Record<string, string> = {};
    if (!fromAccountId) errs.fromAccountId = "Pick a source account";
    if (!amount || amount <= 0) errs.amount = "Enter an amount";
    const code = fromAccount?.currency || "USD";
    if (
      methodMeta?.dailyLimit != null &&
      amount > methodMeta.dailyLimit
    ) {
      errs.amount = `Daily limit is ${currency(methodMeta.dailyLimit, code)}`;
    }
    if (fromAccount && amount > fromAccount.balance) {
      errs.amount = `Not enough in ${fromAccount.name} — available ${currency(
        fromAccount.balance,
        code
      )}`;
    }
    if (
      destinationType === "internal" &&
      fromAccountId === pickedAccountId
    ) {
      errs.fromAccountId = "From and To must be different accounts";
    }
    if (memo.length > 80) errs.memo = "80 characters max";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    if (!picked) return;
    setPending(true);
    const fd = new FormData();
    fd.set("fromAccountId", String(fromAccountId));
    fd.set("amount", String(amount));
    fd.set("memo", memo);
    if (picked.kind === "internal") {
      fd.set("destinationKind", "own");
      fd.set("toAccountId", String(picked.data.id));
    } else {
      fd.set("destinationKind", "payee");
      fd.set("toPayeeId", String(picked.data.id));
    }
    const res = await initiateTransferAction({ ok: false }, fd);
    setPending(false);
    if (!res.ok || !res.referenceNumber) {
      toast.error(res.message ?? "Couldn't send.");
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setStep("amount");
      return;
    }
    router.push(
      `/dashboard/transfer/processing?ref=${encodeURIComponent(
        res.referenceNumber
      )}`
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────

  const headerTitle =
    step === "destination-type"
      ? "Where's this going?"
      : step === "recipient"
      ? destinationType === "zelle"
        ? "Who are you paying?"
        : destinationType === "internal"
        ? "Which of your accounts?"
        : "Which bank account?"
      : step === "amount"
      ? "How much?"
      : "Does everything look OK?";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
            <Banknote className="size-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Send money
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {headerTitle}
            </h1>
          </div>
        </div>
        <Stepper step={step} />
      </header>

      {step === "destination-type" && (
        <DestinationStep
          onPick={chooseDestinationType}
          counts={{
            zelle: zelleList.length,
            internal: accounts.length,
            externalBank: bankList.length,
          }}
        />
      )}

      {step === "recipient" && destinationType === "zelle" && (
        <ZelleRecipientStep
          contacts={zelleList}
          pickedId={pickedZelleId}
          onPick={(id) => {
            setPickedZelleId(id);
            onRecipientPicked();
          }}
          onAdded={(c) => {
            setZelleList((prev) => [c, ...prev]);
            setPickedZelleId(c.id);
            onRecipientPicked();
            router.refresh();
          }}
          onBack={() => setStep("destination-type")}
        />
      )}

      {step === "recipient" && destinationType === "internal" && (
        <InternalRecipientStep
          accounts={accounts}
          pickedId={pickedAccountId}
          onPick={(id) => {
            setPickedAccountId(id);
            onRecipientPicked();
          }}
          onBack={() => setStep("destination-type")}
        />
      )}

      {step === "recipient" && destinationType === "external-bank" && (
        <ExternalBankRecipientStep
          banks={bankList}
          pickedId={pickedBankId}
          onPick={(id) => {
            setPickedBankId(id);
            onRecipientPicked();
          }}
          onAdded={(b) => {
            setBankList((prev) => [b, ...prev]);
            setPickedBankId(b.id);
            onRecipientPicked();
            router.refresh();
          }}
          onBack={() => setStep("destination-type")}
        />
      )}

      {step === "amount" && picked && methodMeta && (
        <AmountStep
          picked={picked}
          methodMeta={methodMeta}
          sources={usableSources}
          fromAccountId={fromAccountId}
          onChangeFromAccount={setFromAccountId}
          amountText={amountText}
          setAmountText={setAmountText}
          memo={memo}
          setMemo={setMemo}
          errors={errors}
          insufficient={insufficient}
          onBack={() => setStep("recipient")}
          onNext={() => {
            if (validateAmount()) setStep("review");
          }}
        />
      )}

      {step === "review" && picked && fromAccount && methodMeta && (
        <ReviewStep
          picked={picked}
          methodMeta={methodMeta}
          fromAccount={fromAccount}
          amount={amount}
          memo={memo}
          pending={pending}
          onCancel={() => router.push("/dashboard/transfer")}
          onBack={() => setStep("amount")}
          onConfirm={submit}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 1 — destination type
// ────────────────────────────────────────────────────────────────────────

function DestinationStep({
  onPick,
  counts,
}: {
  onPick: (t: DestinationType) => void;
  counts: { zelle: number; internal: number; externalBank: number };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <DestinationCard
        Icon={Zap}
        title="Zelle® contact"
        sub="Pay a person by email or phone"
        meta="Typically arrives in minutes"
        count={`${counts.zelle} saved`}
        onClick={() => onPick("zelle")}
      />
      <DestinationCard
        Icon={Wallet}
        title="Paxnova Trust account"
        sub="Move money between your accounts"
        meta="Instant transfer"
        count={`${counts.internal} accounts`}
        onClick={() => onPick("internal")}
      />
      <DestinationCard
        Icon={Landmark}
        title="External bank"
        sub="Send to your account at another bank"
        meta="ACH · 1–2 business days"
        count={`${counts.externalBank} saved`}
        onClick={() => onPick("external-bank")}
      />
    </div>
  );
}

function DestinationCard({
  Icon,
  title,
  sub,
  meta,
  count,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  meta: string;
  count: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-500/60 hover:shadow-soft"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 transition group-hover:bg-violet-500 group-hover:text-white">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex w-full items-center justify-between text-xs">
        <span className="text-muted-foreground">{meta}</span>
        <span className="font-mono text-muted-foreground">{count}</span>
      </div>
      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-violet-500">
        Continue <ArrowRight className="size-3.5" />
      </span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 2a — Zelle recipient
// ────────────────────────────────────────────────────────────────────────

function ZelleRecipientStep({
  contacts,
  pickedId,
  onPick,
  onAdded,
  onBack,
}: {
  contacts: ZelleContact[];
  pickedId: number | null;
  onPick: (id: number) => void;
  onAdded: (c: ZelleContact) => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"existing" | "new">(
    contacts.length > 0 ? "existing" : "new"
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nickname ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q)
    );
  }, [contacts, search]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <PickerHeader onBack={onBack} />

      <div className="mt-4 mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-xs">
        <TabButton
          active={mode === "existing"}
          onClick={() => setMode("existing")}
          Icon={Users}
          label="My contacts"
        />
        <TabButton
          active={mode === "new"}
          onClick={() => setMode("new")}
          Icon={Plus}
          label="New contact"
        />
      </div>

      {mode === "existing" ? (
        contacts.length === 0 ? (
          <EmptyState
            message="You haven't saved any Zelle contacts yet."
            cta="Add your first contact"
            onCta={() => setMode("new")}
          />
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone"
                className="pl-9"
              />
            </div>
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                No contacts match.
              </p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {filtered.map((c) => {
                  const initials = c.name
                    .split(" ")
                    .map((s) => s[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const active = c.id === pickedId;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => onPick(c.id)}
                        className={
                          "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition " +
                          (active
                            ? "bg-violet-500/5"
                            : "bg-background hover:bg-muted")
                        }
                      >
                        <span className="inline-flex size-9 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white">
                          {initials || "?"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {c.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {c.email || c.phone || "Zelle contact"}
                          </span>
                        </span>
                        {active && (
                          <CheckCircle2 className="size-4 text-violet-500" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )
      ) : (
        <NewZelleContactForm
          onAdded={onAdded}
          onBack={contacts.length > 0 ? () => setMode("existing") : undefined}
        />
      )}
    </div>
  );
}

function NewZelleContactForm({
  onAdded,
  onBack,
}: {
  onAdded: (c: ZelleContact) => void;
  onBack?: () => void;
}) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const fd = new FormData();
    fd.set("name", name);
    fd.set("nickname", nickname);
    fd.set("email", email);
    fd.set("phone", phone);
    const res = await addZelleContactAction(fd);
    setPending(false);
    if (!res.ok || !res.payeeId) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else toast.error(res.message ?? "Couldn't add contact.");
      return;
    }
    onAdded({
      id: res.payeeId,
      name,
      nickname: nickname || null,
      email: email || null,
      phone: phone || null,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Contact name" htmlFor="zc-name" error={errors.name}>
        <Input
          id="zc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          placeholder="Riley Khan"
        />
      </Field>
      <Field label="Nickname (optional)" htmlFor="zc-nickname">
        <Input
          id="zc-nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={60}
          placeholder="Riley"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email" htmlFor="zc-email" error={errors.email}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="zc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              placeholder="riley@example.com"
            />
          </div>
        </Field>
        <Field label="Phone" htmlFor="zc-phone" error={errors.phone}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="zc-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-9"
              placeholder="(555) 555-0100"
            />
          </div>
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        An email or phone is required — the recipient&apos;s Zelle account
        looks them up by either one.
      </p>
      <FormButtons onBack={onBack} pending={pending} submitLabel="Add and continue" />
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 2b — Internal Paxnova Trust account picker
// ────────────────────────────────────────────────────────────────────────

function InternalRecipientStep({
  accounts,
  pickedId,
  onPick,
  onBack,
}: {
  accounts: Account[];
  pickedId: number | null;
  onPick: (id: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <PickerHeader onBack={onBack} />
      <p className="mt-4 text-xs text-muted-foreground">
        Pick the Paxnova Trust account that should receive this transfer.
      </p>
      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
        {accounts.map((a) => {
          const active = a.id === pickedId;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onPick(a.id)}
                className={
                  "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition " +
                  (active
                    ? "bg-violet-500/5"
                    : "bg-background hover:bg-muted")
                }
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                  <Wallet className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{a.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {a.type} · {maskAccount(a.accountNumber)}
                  </span>
                </span>
                <span className="font-mono text-xs">
                  {currency(a.balance, a.currency)}
                </span>
                {active && (
                  <CheckCircle2 className="ml-2 size-4 text-violet-500" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 2c — External bank picker + add new
// ────────────────────────────────────────────────────────────────────────

function ExternalBankRecipientStep({
  banks,
  pickedId,
  onPick,
  onAdded,
  onBack,
}: {
  banks: ExternalBank[];
  pickedId: number | null;
  onPick: (id: number) => void;
  onAdded: (b: ExternalBank) => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"existing" | "new">(
    banks.length > 0 ? "existing" : "new"
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return banks;
    const q = search.toLowerCase();
    return banks.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.nickname ?? "").toLowerCase().includes(q) ||
        (b.bankName ?? "").toLowerCase().includes(q) ||
        b.accountNumber.includes(q)
    );
  }, [banks, search]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <PickerHeader onBack={onBack} />

      <div className="mt-4 mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-xs">
        <TabButton
          active={mode === "existing"}
          onClick={() => setMode("existing")}
          Icon={Building2}
          label="Saved banks"
        />
        <TabButton
          active={mode === "new"}
          onClick={() => setMode("new")}
          Icon={Plus}
          label="New bank"
        />
      </div>

      {mode === "existing" ? (
        banks.length === 0 ? (
          <EmptyState
            message="You haven't linked an external bank yet."
            cta="Link a bank account"
            onCta={() => setMode("new")}
          />
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or bank"
                className="pl-9"
              />
            </div>
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                No banks match.
              </p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {filtered.map((b) => {
                  const active = b.id === pickedId;
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => onPick(b.id)}
                        className={
                          "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition " +
                          (active
                            ? "bg-violet-500/5"
                            : "bg-background hover:bg-muted")
                        }
                      >
                        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                          <Landmark className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {b.nickname || b.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {b.bankName ?? "External bank"} ·{" "}
                            {maskAccount(b.accountNumber)}
                          </span>
                        </span>
                        {active && (
                          <CheckCircle2 className="size-4 text-violet-500" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )
      ) : (
        <NewExternalBankForm
          onAdded={onAdded}
          onBack={banks.length > 0 ? () => setMode("existing") : undefined}
        />
      )}
    </div>
  );
}

function NewExternalBankForm({
  onAdded,
  onBack,
}: {
  onAdded: (b: ExternalBank) => void;
  onBack?: () => void;
}) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const fd = new FormData();
    fd.set("name", name);
    fd.set("nickname", nickname);
    fd.set("bankName", bankName);
    fd.set("routingNumber", routingNumber);
    fd.set("accountNumber", accountNumber);
    fd.set("accountType", accountType);
    const res = await addExternalBankAction(fd);
    setPending(false);
    if (!res.ok || !res.payeeId) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else toast.error(res.message ?? "Couldn't link bank.");
      return;
    }
    onAdded({
      id: res.payeeId,
      name,
      nickname: nickname || null,
      bankName,
      accountNumber,
      accountType,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Account holder name" htmlFor="eb-name" error={errors.name}>
          <Input
            id="eb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            placeholder="Jordan Hayes"
          />
        </Field>
        <Field label="Nickname (optional)" htmlFor="eb-nickname">
          <Input
            id="eb-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={60}
            placeholder="My Chase savings"
          />
        </Field>
      </div>
      <Field label="Bank name" htmlFor="eb-bank" error={errors.bankName}>
        <Input
          id="eb-bank"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          required
          maxLength={120}
          placeholder="Wells Fargo, Chase, Citibank, …"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Routing number (ABA)"
          htmlFor="eb-routing"
          error={errors.routingNumber}
        >
          <Input
            id="eb-routing"
            inputMode="numeric"
            maxLength={9}
            value={routingNumber}
            onChange={(e) =>
              setRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
            }
            placeholder="9-digit ABA"
          />
        </Field>
        <Field
          label="Account number"
          htmlFor="eb-account"
          error={errors.accountNumber}
        >
          <Input
            id="eb-account"
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(
                e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 20)
              )
            }
            maxLength={20}
            placeholder="123456789012"
          />
        </Field>
      </div>
      <Field label="Account type" htmlFor="eb-type">
        <select
          id="eb-type"
          value={accountType}
          onChange={(e) =>
            setAccountType(e.target.value as "checking" | "savings")
          }
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </Field>
      <p className="text-xs text-muted-foreground">
        ACH transfers typically settle in 1–2 business days. Double-check the
        routing and account numbers — ACH cannot be reversed if sent to the
        wrong account.
      </p>
      <FormButtons onBack={onBack} pending={pending} submitLabel="Link and continue" />
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 3 — amount + source
// ────────────────────────────────────────────────────────────────────────

type PickedSummary =
  | { kind: "zelle"; label: string; sub: string; data: ZelleContact }
  | { kind: "internal"; label: string; sub: string; data: Account }
  | { kind: "external-bank"; label: string; sub: string; data: ExternalBank };

type MethodMeta = {
  label: string;
  fee: number;
  arrival: string;
  dailyLimit: number | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

function AmountStep({
  picked,
  methodMeta,
  sources,
  fromAccountId,
  onChangeFromAccount,
  amountText,
  setAmountText,
  memo,
  setMemo,
  errors,
  insufficient,
  onBack,
  onNext,
}: {
  picked: PickedSummary;
  methodMeta: MethodMeta;
  sources: Account[];
  fromAccountId: number;
  onChangeFromAccount: (id: number) => void;
  amountText: string;
  setAmountText: (v: string) => void;
  memo: string;
  setMemo: (v: string) => void;
  errors: Record<string, string>;
  insufficient: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const amount = Number(amountText) || 0;
  const sourceCurrency =
    sources.find((a) => a.id === fromAccountId)?.currency || "USD";
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="space-y-5 rounded-2xl border border-border bg-card p-6"
      >
        <PickedChip picked={picked} onChange={onBack} />

        <Field label="From" htmlFor="fromAccountId" error={errors.fromAccountId}>
          <select
            id="fromAccountId"
            value={fromAccountId}
            onChange={(e) => onChangeFromAccount(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            {sources.length === 0 ? (
              <option value="">No usable source account</option>
            ) : (
              sources.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskAccount(a.accountNumber)} ·{" "}
                  {currency(a.balance, a.currency)}
                </option>
              ))
            )}
          </select>
        </Field>

        <Field label="Amount" htmlFor="amount" error={errors.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              className="pl-7 text-lg"
              placeholder="0.00"
              aria-invalid={Boolean(errors.amount) || insufficient}
            />
          </div>
          {methodMeta.dailyLimit != null && (
            <p className="mt-1 text-xs text-muted-foreground">
              Daily limit is {currency(methodMeta.dailyLimit, sourceCurrency)}.
            </p>
          )}
        </Field>

        <Field label="Memo (optional)" htmlFor="memo" error={errors.memo}>
          <Input
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={80}
            placeholder="What's this for?"
          />
        </Field>

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Next
          </button>
        </div>
      </form>

      <aside className="space-y-3 self-start rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </p>
        <SummaryRow label="Method" value={methodMeta.label} />
        <SummaryRow label="Arrives" value={methodMeta.arrival} />
        <SummaryRow label="Sending" value={currency(amount, sourceCurrency)} />
        <SummaryRow label="Fee" value={currency(methodMeta.fee, sourceCurrency)} />
        <div className="h-px bg-border" />
        <SummaryRow
          label="Total"
          value={currency(amount + methodMeta.fee, sourceCurrency)}
          strong
        />
      </aside>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 4 — review
// ────────────────────────────────────────────────────────────────────────

function ReviewStep({
  picked,
  methodMeta,
  fromAccount,
  amount,
  memo,
  pending,
  onCancel,
  onBack,
  onConfirm,
}: {
  picked: PickedSummary;
  methodMeta: MethodMeta;
  fromAccount: Account;
  amount: number;
  memo: string;
  pending: boolean;
  onCancel: () => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <PickedChip picked={picked} />

      <Card title="Account">
        <Row
          label="From"
          value={`${fromAccount.name} · ${maskAccount(fromAccount.accountNumber)}`}
        />
        <Row label="Method" value={methodMeta.label} />
        <Row label="Arrives" value={methodMeta.arrival} />
      </Card>

      <Card title="Amount">
        <Row label="Sending" value={currency(amount, fromAccount.currency)} />
        <Row label="Fee" value={currency(methodMeta.fee, fromAccount.currency)} />
        <Row
          label="Total"
          value={currency(amount + methodMeta.fee, fromAccount.currency)}
          strong
        />
      </Card>

      {memo && (
        <Card title="Memo">
          <p className="text-sm">{memo}</p>
        </Card>
      )}

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          By clicking <strong>Send</strong> you authorize Paxnova Trust to debit
          the source account and deliver this transfer through the{" "}
          {methodMeta.label} network. Once sent, these transfers cannot be
          reversed.
        </p>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Sending…
              </>
            ) : (
              <>Send {currency(amount, fromAccount.currency)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Shared bits
// ────────────────────────────────────────────────────────────────────────

function PickerHeader({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600"
    >
      <ArrowLeft className="size-3.5" /> Pick a different destination
    </button>
  );
}

function PickedChip({
  picked,
  onChange,
}: {
  picked: PickedSummary;
  onChange?: () => void;
}) {
  const initials = picked.label
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const Icon =
    picked.kind === "zelle"
      ? Zap
      : picked.kind === "internal"
      ? Wallet
      : Landmark;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white">
        {picked.kind === "zelle" ? initials || "?" : <Icon className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {picked.label}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {picked.sub}
        </span>
      </span>
      {onChange && (
        <button
          type="button"
          onClick={onChange}
          className="text-xs font-medium text-violet-500 hover:text-violet-600"
        >
          Change
        </button>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition " +
        (active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function EmptyState({
  message,
  cta,
  onCta,
}: {
  message: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onCta}
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
      >
        <Plus className="mr-1.5 size-4" /> {cta}
      </button>
    </div>
  );
}

function FormButtons({
  onBack,
  pending,
  submitLabel,
}: {
  onBack?: () => void;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="mr-1.5 size-4" /> Back to list
        </button>
      ) : (
        <span />
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const order: Step[] = ["destination-type", "recipient", "amount", "review"];
  const idx = order.indexOf(step);
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {order.map((s, i) => (
        <span
          key={s}
          className={
            "h-1.5 w-6 rounded-full transition " +
            (i <= idx ? "bg-violet-500" : "bg-border")
          }
        />
      ))}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-4 text-sm " +
        (strong ? "font-semibold" : "")
      }
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between text-sm " +
        (strong ? "font-semibold" : "")
      }
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
