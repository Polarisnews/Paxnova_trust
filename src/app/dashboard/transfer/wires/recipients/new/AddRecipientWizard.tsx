"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete } from "@/components/forms/AddressAutocomplete";
import { COUNTRIES, banksForCountry } from "@/lib/swift-data";
import {
  addWireRecipientAction,
  type WireActionState,
} from "@/app/actions/wires";

type Group = { id: number; name: string };
type Step = "form" | "review" | "success";

type Draft = {
  bankCountry: string;
  bankRoutingNumber: string;
  bankName: string;
  bankNameCustom: string; // when user picks "Other"
  bankAddress: string;
  bankCity: string;
  bankState: string;
  bankZip: string;
  recipientName: string;
  recipientNickname: string;
  recipientCountry: string;
  recipientAddress1: string;
  recipientAddress2: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  accountNumber: string;
  verifyAccountNumber: string;
  messageToBank: string;
  groupId: string;
};

const EMPTY: Draft = {
  bankCountry: "US",
  bankRoutingNumber: "",
  bankName: "",
  bankNameCustom: "",
  bankAddress: "",
  bankCity: "",
  bankState: "",
  bankZip: "",
  recipientName: "",
  recipientNickname: "",
  recipientCountry: "US",
  recipientAddress1: "",
  recipientAddress2: "",
  recipientCity: "",
  recipientState: "",
  recipientZip: "",
  accountNumber: "",
  verifyAccountNumber: "",
  messageToBank: "",
  groupId: "",
};

const DRAFT_KEY = "nt:wire-recipient-draft";

export function AddRecipientWizard({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [showAcct, setShowAcct] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  // Persist + restore draft so a refresh doesn't wipe a half-finished form.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (raw) setDraft({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [draft]);

  const banks = useMemo(() => banksForCountry(draft.bankCountry), [draft.bankCountry]);
  const effectiveBankName =
    draft.bankName === "__other__"
      ? draft.bankNameCustom
      : draft.bankName;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[key as string];
        return n;
      });
    }
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    if (!draft.bankCountry) errs.bankCountry = "Pick a country";
    if (!/^[A-Z0-9]{8,11}$/.test(draft.bankRoutingNumber))
      errs.bankRoutingNumber =
        "Enter 8 to 11 characters (letters and numbers only)";
    if (!effectiveBankName.trim()) errs.bankName = "Pick or enter a bank name";
    if (!draft.recipientName.trim()) errs.recipientName = "Required";
    if (!draft.recipientCountry) errs.recipientCountry = "Pick a country";
    if (!/^[A-Za-z0-9]{4,15}$/.test(draft.accountNumber))
      errs.accountNumber = "4–15 characters, letters and numbers only";
    if (draft.accountNumber !== draft.verifyAccountNumber)
      errs.verifyAccountNumber = "Account numbers don't match";
    if (draft.messageToBank.length > 100)
      errs.messageToBank = "100 characters max";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmitFinal() {
    setPending(true);
    const fd = new FormData();
    fd.set("bankCountry", draft.bankCountry);
    fd.set("bankRoutingNumber", draft.bankRoutingNumber);
    fd.set("bankName", effectiveBankName);
    fd.set("bankAddress", draft.bankAddress);
    fd.set("bankCity", draft.bankCity);
    fd.set("bankState", draft.bankState);
    fd.set("bankZip", draft.bankZip);
    fd.set("recipientName", draft.recipientName);
    fd.set("recipientNickname", draft.recipientNickname);
    fd.set("recipientCountry", draft.recipientCountry);
    fd.set("recipientAddress1", draft.recipientAddress1);
    fd.set("recipientAddress2", draft.recipientAddress2);
    fd.set("recipientCity", draft.recipientCity);
    fd.set("recipientState", draft.recipientState);
    fd.set("recipientZip", draft.recipientZip);
    fd.set("accountNumber", draft.accountNumber);
    fd.set("verifyAccountNumber", draft.verifyAccountNumber);
    fd.set("messageToBank", draft.messageToBank);
    if (draft.groupId) fd.set("groupId", draft.groupId);

    const res = (await addWireRecipientAction(
      { ok: false } satisfies WireActionState,
      fd
    )) as WireActionState;
    setPending(false);

    if (!res.ok) {
      toast.error(res.message ?? "Couldn't add recipient.");
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setStep("form");
      return;
    }

    setCreatedId(res.recipientId ?? null);
    try {
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    router.refresh(); // pull the new recipient into the left rail
    setStep("success");
  }

  if (step === "success" && createdId) {
    return (
      <SuccessView
        recipientId={createdId}
        draft={draft}
        bankName={effectiveBankName}
        onAddAnother={() => {
          setDraft(EMPTY);
          setCreatedId(null);
          setStep("form");
        }}
      />
    );
  }

  if (step === "review") {
    return (
      <ReviewView
        draft={draft}
        bankName={effectiveBankName}
        pending={pending}
        onCancel={() => router.push("/dashboard/transfer/wires/recipients")}
        onBack={() => setStep("form")}
        onConfirm={onSubmitFinal}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Protect yourself against wire fraud</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Always call the recipient on a phone number you trust to verify
              their bank details before sending. Wires are typically final and
              cannot be reversed.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validateForm()) setStep("review");
        }}
        className="space-y-6 rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Add wire recipient
        </h2>

        <Section title="Recipient bank">
          <Field label="Bank country" htmlFor="bankCountry" error={errors.bankCountry}>
            <select
              id="bankCountry"
              value={draft.bankCountry}
              onChange={(e) => {
                set("bankCountry", e.target.value);
                set("bankName", ""); // reset bank choice when country changes
                set("bankNameCustom", "");
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              If your recipient&apos;s bank account is outside the U.S., please
              choose the appropriate country so we can help you add an
              international wire recipient.
            </p>
          </Field>

          <Field
            label="Bank routing number (ABA / SWIFT)"
            htmlFor="bankRoutingNumber"
            error={errors.bankRoutingNumber}
          >
            <Input
              id="bankRoutingNumber"
              type="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={11}
              value={draft.bankRoutingNumber}
              onBeforeInput={(e) => {
                const input = e as unknown as React.FormEvent<HTMLInputElement> & {
                  data?: string;
                };
                if (input.data && /[^A-Za-z0-9]/.test(input.data)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                const cleaned = pasted
                  .replace(/[^A-Za-z0-9]/g, "")
                  .toUpperCase()
                  .slice(0, 11);
                e.preventDefault();
                set("bankRoutingNumber", cleaned);
              }}
              onChange={(e) =>
                set(
                  "bankRoutingNumber",
                  e.target.value
                    .replace(/[^A-Za-z0-9]/g, "")
                    .toUpperCase()
                    .slice(0, 11)
                )
              }
              placeholder="8 to 11 characters, letters and numbers"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              U.S. ABA routing numbers are 9 digits. International SWIFT / BIC
              codes are 8 or 11 alphanumeric characters (e.g.{" "}
              <code className="font-mono">CHASUS33</code>).
            </p>
          </Field>

          <Field label="Bank name" htmlFor="bankName" error={errors.bankName}>
            <select
              id="bankName"
              value={draft.bankName}
              onChange={(e) => set("bankName", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Select a bank</option>
              {banks.map((b) => (
                <option
                  key={b.name}
                  value={b.name === "Other (type bank name)" ? "__other__" : b.name}
                >
                  {b.name}
                </option>
              ))}
            </select>
            {draft.bankName === "__other__" && (
              <Input
                className="mt-2"
                value={draft.bankNameCustom}
                onChange={(e) => set("bankNameCustom", e.target.value)}
                placeholder="Type the exact bank name"
              />
            )}
          </Field>

          <Field label="Bank address" htmlFor="bankAddress">
            <AddressAutocomplete
              id="bankAddress"
              value={draft.bankAddress}
              onChange={(v) => set("bankAddress", v)}
              onSelect={(p) => {
                set("bankAddress", p.line1);
                set("bankCity", p.city);
                set("bankState", p.state);
                set("bankZip", p.zip);
                set("bankCountry", p.country);
              }}
              placeholder="Start typing the bank's address"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="City" htmlFor="bankCity">
              <Input
                id="bankCity"
                value={draft.bankCity}
                onChange={(e) => set("bankCity", e.target.value)}
              />
            </Field>
            <Field label="State / region" htmlFor="bankState">
              <Input
                id="bankState"
                maxLength={20}
                value={draft.bankState}
                onChange={(e) => set("bankState", e.target.value)}
              />
            </Field>
            <Field label="ZIP / postal code" htmlFor="bankZip">
              <Input
                id="bankZip"
                value={draft.bankZip}
                onChange={(e) => set("bankZip", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section title="Recipient details">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Recipient name" htmlFor="recipientName" error={errors.recipientName}>
              <Input
                id="recipientName"
                value={draft.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
                placeholder="Name on the recipient's bank account"
              />
            </Field>
            <Field label="Recipient nickname (optional)" htmlFor="recipientNickname">
              <Input
                id="recipientNickname"
                value={draft.recipientNickname}
                onChange={(e) => set("recipientNickname", e.target.value)}
                placeholder="What you'd like to call them"
              />
            </Field>
          </div>

          <Field label="Recipient country" htmlFor="recipientCountry" error={errors.recipientCountry}>
            <select
              id="recipientCountry"
              value={draft.recipientCountry}
              onChange={(e) => set("recipientCountry", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Address line 1" htmlFor="recipientAddress1">
            <AddressAutocomplete
              id="recipientAddress1"
              value={draft.recipientAddress1}
              onChange={(v) => set("recipientAddress1", v)}
              onSelect={(p) => {
                set("recipientAddress1", p.line1);
                set("recipientCity", p.city);
                set("recipientState", p.state);
                set("recipientZip", p.zip);
                set("recipientCountry", p.country);
              }}
              placeholder="Recipient street address"
            />
          </Field>

          <Field label="Address line 2 (optional)" htmlFor="recipientAddress2">
            <Input
              id="recipientAddress2"
              value={draft.recipientAddress2}
              onChange={(e) => set("recipientAddress2", e.target.value)}
              placeholder="Apt, suite, etc."
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="City" htmlFor="recipientCity">
              <Input
                id="recipientCity"
                value={draft.recipientCity}
                onChange={(e) => set("recipientCity", e.target.value)}
              />
            </Field>
            <Field label="State / region" htmlFor="recipientState">
              <Input
                id="recipientState"
                value={draft.recipientState}
                onChange={(e) => set("recipientState", e.target.value)}
              />
            </Field>
            <Field label="ZIP / postal code" htmlFor="recipientZip">
              <Input
                id="recipientZip"
                value={draft.recipientZip}
                onChange={(e) => set("recipientZip", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section title="Account">
          <Field
            label="Recipient account number"
            htmlFor="accountNumber"
            error={errors.accountNumber}
          >
            <div className="relative">
              <Input
                id="accountNumber"
                type={showAcct ? "text" : "password"}
                maxLength={15}
                value={draft.accountNumber}
                onChange={(e) =>
                  set(
                    "accountNumber",
                    e.target.value.replace(/[^A-Za-z0-9]/g, "")
                  )
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowAcct((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showAcct ? "Hide account number" : "Show account number"}
              >
                {showAcct ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Please include letters and/or numbers — up to 15 characters.
            </p>
          </Field>

          <Field
            label="Verify recipient account number"
            htmlFor="verifyAccountNumber"
            error={errors.verifyAccountNumber}
          >
            <div className="relative">
              <Input
                id="verifyAccountNumber"
                type={showVerify ? "text" : "password"}
                maxLength={15}
                value={draft.verifyAccountNumber}
                onChange={(e) =>
                  set(
                    "verifyAccountNumber",
                    e.target.value.replace(/[^A-Za-z0-9]/g, "")
                  )
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowVerify((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showVerify ? "Hide account number" : "Show account number"}
              >
                {showVerify ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <Field label="Message to recipient bank" htmlFor="messageToBank" error={errors.messageToBank}>
            <textarea
              id="messageToBank"
              maxLength={100}
              value={draft.messageToBank}
              onChange={(e) => set("messageToBank", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
              placeholder="A short note for the receiving bank"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              (optional, up to 100 characters · {100 - draft.messageToBank.length} left)
            </p>
          </Field>

          <Field label="Wire recipient group (optional)" htmlFor="groupId">
            <select
              id="groupId"
              value={draft.groupId}
              onChange={(e) => set("groupId", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Ungrouped</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
          <Link
            href="/dashboard/transfer/wires/recipients"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
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

function ReviewView({
  draft,
  bankName,
  pending,
  onCancel,
  onBack,
  onConfirm,
}: {
  draft: Draft;
  bankName: string;
  pending: boolean;
  onCancel: () => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Does everything look OK?
      </h2>

      <Card title="Bank information">
        <Row label="Bank routing number" value={draft.bankRoutingNumber} />
        <Row label="Bank name" value={bankName} />
        <Row label="Bank country" value={countryName(draft.bankCountry)} />
        <Row
          label="Bank address"
          value={[
            draft.bankAddress,
            draft.bankCity,
            draft.bankState,
            draft.bankZip,
          ]
            .filter(Boolean)
            .join(", ")}
        />
        <Row
          label="Recipient account number"
          value={`•••• ${draft.accountNumber.slice(-4)}`}
        />
        <Row
          label="Message to recipient bank"
          value={draft.messageToBank || "None"}
        />
      </Card>

      <Card title="Recipient information">
        <Row
          label="Recipient country"
          value={countryName(draft.recipientCountry)}
        />
        <Row label="Recipient name" value={draft.recipientName} />
        <Row
          label="Recipient nickname"
          value={draft.recipientNickname || "None"}
        />
        <Row label="Address line 1" value={draft.recipientAddress1 || "—"} />
        {draft.recipientAddress2 && (
          <Row label="Address line 2" value={draft.recipientAddress2} />
        )}
        <Row label="City" value={draft.recipientCity || "—"} />
        <Row label="State" value={draft.recipientState || "—"} />
        <Row label="ZIP code" value={draft.recipientZip || "—"} />
        <Row label="Wire recipient group" value={draft.groupId ? "Selected" : "Ungrouped"} />
      </Card>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          If your recipient uses an international bank, please go back and pick
          the correct country so we can flag this as an international wire.
          Otherwise it will be treated as a domestic transfer.
        </p>
        <p className="mt-2">
          Important: if the recipient name and the account number don&apos;t
          match at the receiving bank, the routing number and account number
          take priority. Double-check before you confirm.
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
            Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Adding…
              </>
            ) : (
              "Add recipient"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessView({
  recipientId,
  draft,
  bankName,
  onAddAnother,
}: {
  recipientId: number;
  draft: Draft;
  bankName: string;
  onAddAnother: () => void;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Recipient added
          </h2>
          <p className="text-sm text-muted-foreground">
            {draft.recipientName}
            {draft.recipientNickname && ` (${draft.recipientNickname})`} is now
            on your wire recipients list.
          </p>
        </div>
      </div>

      <Card title="Bank information">
        <Row label="Bank routing number" value={draft.bankRoutingNumber} />
        <Row label="Bank name" value={bankName} />
        <Row label="Bank country" value={countryName(draft.bankCountry)} />
        <Row
          label="Recipient account number"
          value={`•••• ${draft.accountNumber.slice(-4)}`}
        />
      </Card>

      <Card title="Recipient information">
        <Row
          label="Recipient country"
          value={countryName(draft.recipientCountry)}
        />
        <Row label="Recipient name" value={draft.recipientName} />
        <Row
          label="Recipient nickname"
          value={draft.recipientNickname || "None"}
        />
        <Row
          label="Status"
          value={
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
              <CheckCircle2 className="size-3" /> Active
            </span>
          }
        />
      </Card>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onAddAnother}
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          Add another recipient
        </button>
        <Link
          href={`/dashboard/transfer/wires/schedule?to=${recipientId}`}
          className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Schedule a wire
        </Link>
      </div>
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
      <dl className="grid gap-2">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
