"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardArt } from "@/components/cards/CardArt";
import type { CardProduct } from "@/lib/card-products";
import type { CardTheme, CardThemeKey } from "@/lib/card-themes";
import { currency } from "@/lib/format";
import {
  applyForCardAction,
  type CardActionState,
} from "@/app/actions/cards";

type Defaults = {
  cardHolder: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  employmentStatus: string;
  employerName: string;
  annualIncome: string;
};

type Step = "product" | "customize" | "secure";

const EMPLOYMENT_OPTIONS = [
  { v: "employed", l: "Employed" },
  { v: "self-employed", l: "Self-employed" },
  { v: "retired", l: "Retired" },
  { v: "student", l: "Student" },
  { v: "unemployed", l: "Unemployed" },
  { v: "homemaker", l: "Homemaker" },
];

const INCOME_OPTIONS = [
  { v: "under-25k", l: "Under $25,000" },
  { v: "25k-50k", l: "$25,000 – $50,000" },
  { v: "50k-75k", l: "$50,000 – $75,000" },
  { v: "75k-100k", l: "$75,000 – $100,000" },
  { v: "100k-150k", l: "$100,000 – $150,000" },
  { v: "150k-250k", l: "$150,000 – $250,000" },
  { v: "250k-500k", l: "$250,000 – $500,000" },
  { v: "500k-plus", l: "$500,000+" },
];

export function CardApplyWizard({
  products,
  themes,
  defaults,
}: {
  products: CardProduct[];
  themes: CardTheme[];
  defaults: Defaults;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("product");
  const [productKey, setProductKey] = useState<string>(products[0].key);
  const [theme, setTheme] = useState<CardThemeKey>("obsidian");
  const [cardHolder, setCardHolder] = useState(defaults.cardHolder);
  const [billingStreet, setBillingStreet] = useState(defaults.billingStreet);
  const [billingCity, setBillingCity] = useState(defaults.billingCity);
  const [billingState, setBillingState] = useState(defaults.billingState);
  const [billingZip, setBillingZip] = useState(defaults.billingZip);
  const [billingCountry, setBillingCountry] = useState(defaults.billingCountry || "US");
  const [employmentStatus, setEmploymentStatus] = useState(defaults.employmentStatus);
  const [employerName, setEmployerName] = useState(defaults.employerName);
  const [annualIncome, setAnnualIncome] = useState(defaults.annualIncome);
  const product = useMemo(
    () => products.find((p) => p.key === productKey) ?? products[0],
    [products, productKey]
  );
  const [requestedLimit, setRequestedLimit] = useState<number>(product.limitMin);
  const [dailyLimit, setDailyLimit] = useState<number>(product.defaultDailyLimit);
  const [txnLimit, setTxnLimit] = useState<number>(product.defaultTxnLimit);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [consents, setConsents] = useState({
    cardholder: false,
    fcba: false,
    esign: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  // When the user switches product, snap limits back into the product's range.
  useEffect(() => {
    setRequestedLimit((cur) =>
      Math.min(Math.max(cur, product.limitMin), product.limitMax) ||
      product.limitMin
    );
    setDailyLimit(product.defaultDailyLimit);
    setTxnLimit(product.defaultTxnLimit);
  }, [product]);

  function next() {
    if (step === "product") {
      setStep("customize");
      return;
    }
    if (step === "customize") {
      // Light client-side validation for required fields.
      const errs: Record<string, string> = {};
      if (cardHolder.trim().length < 2) errs.cardHolder = "Required";
      if (billingStreet.trim().length < 2) errs.billingStreet = "Required";
      if (!billingCity.trim()) errs.billingCity = "Required";
      if (!billingState.trim()) errs.billingState = "Required";
      if (!billingZip.trim()) errs.billingZip = "Required";
      setErrors(errs);
      if (Object.keys(errs).length === 0) setStep("secure");
      return;
    }
  }

  function back() {
    if (step === "secure") setStep("customize");
    else if (step === "customize") setStep("product");
  }

  async function submit() {
    const errs: Record<string, string> = {};
    if (!/^\d{4}$/.test(pin)) errs.pin = "Enter a 4-digit PIN";
    if (pin !== pinConfirm) errs.pinConfirm = "PINs don't match";
    if (!consents.cardholder) errs.cardholder = "Required";
    if (!consents.fcba) errs.fcba = "Required";
    if (!consents.esign) errs.esign = "Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPending(true);
    const fd = new FormData();
    fd.set("productKey", productKey);
    fd.set("requestedLimit", String(requestedLimit));
    fd.set("dailyLimit", String(dailyLimit));
    fd.set("txnLimit", String(txnLimit));
    fd.set("cardHolder", cardHolder);
    fd.set("billingStreet", billingStreet);
    fd.set("billingCity", billingCity);
    fd.set("billingState", billingState);
    fd.set("billingZip", billingZip);
    fd.set("billingCountry", billingCountry);
    fd.set("employmentStatus", employmentStatus);
    fd.set("employerName", employerName);
    fd.set("annualIncome", annualIncome);
    fd.set("pin", pin);
    fd.set("pinConfirm", pinConfirm);
    fd.set("theme", theme);

    const res = (await applyForCardAction(
      { ok: false } satisfies CardActionState,
      fd
    )) as CardActionState;
    setPending(false);

    if (!res.ok || !res.referenceNumber) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      toast.error(res.message ?? "Couldn't submit application.");
      return;
    }
    router.push(`/dashboard/cards/apply/submitted?ref=${encodeURIComponent(res.referenceNumber)}`);
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            New card
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {step === "product"
              ? "Pick a card"
              : step === "customize"
              ? "Make it yours"
              : "Sign and secure"}
          </h1>
        </div>
        <Stepper step={step} />
      </header>

      {step === "product" && (
        <ProductStep
          products={products}
          productKey={productKey}
          theme={theme}
          onPick={setProductKey}
          onNext={next}
        />
      )}

      {step === "customize" && (
        <CustomizeStep
          product={product}
          themes={themes}
          theme={theme}
          setTheme={setTheme}
          cardHolder={cardHolder}
          setCardHolder={setCardHolder}
          billingStreet={billingStreet}
          setBillingStreet={setBillingStreet}
          billingCity={billingCity}
          setBillingCity={setBillingCity}
          billingState={billingState}
          setBillingState={setBillingState}
          billingZip={billingZip}
          setBillingZip={setBillingZip}
          billingCountry={billingCountry}
          setBillingCountry={setBillingCountry}
          requestedLimit={requestedLimit}
          setRequestedLimit={setRequestedLimit}
          dailyLimit={dailyLimit}
          setDailyLimit={setDailyLimit}
          txnLimit={txnLimit}
          setTxnLimit={setTxnLimit}
          employmentStatus={employmentStatus}
          setEmploymentStatus={setEmploymentStatus}
          employerName={employerName}
          setEmployerName={setEmployerName}
          annualIncome={annualIncome}
          setAnnualIncome={setAnnualIncome}
          errors={errors}
          onBack={back}
          onNext={next}
        />
      )}

      {step === "secure" && (
        <SecureStep
          product={product}
          theme={theme}
          cardHolder={cardHolder}
          pin={pin}
          setPin={setPin}
          pinConfirm={pinConfirm}
          setPinConfirm={setPinConfirm}
          showPin={showPin}
          setShowPin={setShowPin}
          consents={consents}
          setConsents={setConsents}
          errors={errors}
          pending={pending}
          onBack={back}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 1 — pick product
// ────────────────────────────────────────────────────────────────────────

function ProductStep({
  products,
  productKey,
  theme,
  onPick,
  onNext,
}: {
  products: CardProduct[];
  productKey: string;
  theme: CardThemeKey;
  onPick: (key: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {products.map((p) => {
          const selected = p.key === productKey;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onPick(p.key)}
              className={
                "group flex flex-col items-start gap-4 rounded-2xl border bg-card p-5 text-left transition " +
                (selected
                  ? "border-violet-500 shadow-elev"
                  : "border-border hover:-translate-y-0.5 hover:shadow-soft")
              }
            >
              <CardArt
                network={p.network}
                theme={theme}
                cardHolder="YOUR NAME"
                lastFour="0000"
                expiryMonth={1}
                expiryYear={new Date().getFullYear() + 4}
                size="md"
              />
              <div>
                <p className="font-display text-lg font-semibold tracking-tight">
                  {p.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.tagline}
                </p>
              </div>
              <dl className="grid w-full gap-1.5 text-xs">
                <Spec label="Annual fee" value={currency(p.annualFee)} />
                <Spec label="APR" value={`${p.apr}%`} />
                <Spec
                  label="Limit range"
                  value={`${currency(p.limitMin)} – ${currency(p.limitMax)}`}
                />
              </dl>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3 shrink-0 text-violet-500" />
                    {perk}
                  </li>
                ))}
              </ul>
              {selected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                  <CheckCircle2 className="size-3" /> Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-7 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Customise this card
        </button>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 2 — customize
// ────────────────────────────────────────────────────────────────────────

function CustomizeStep(props: {
  product: CardProduct;
  themes: CardTheme[];
  theme: CardThemeKey;
  setTheme: (t: CardThemeKey) => void;
  cardHolder: string;
  setCardHolder: (v: string) => void;
  billingStreet: string;
  setBillingStreet: (v: string) => void;
  billingCity: string;
  setBillingCity: (v: string) => void;
  billingState: string;
  setBillingState: (v: string) => void;
  billingZip: string;
  setBillingZip: (v: string) => void;
  billingCountry: string;
  setBillingCountry: (v: string) => void;
  requestedLimit: number;
  setRequestedLimit: (v: number) => void;
  dailyLimit: number;
  setDailyLimit: (v: number) => void;
  txnLimit: number;
  setTxnLimit: (v: number) => void;
  employmentStatus: string;
  setEmploymentStatus: (v: string) => void;
  employerName: string;
  setEmployerName: (v: string) => void;
  annualIncome: string;
  setAnnualIncome: (v: string) => void;
  errors: Record<string, string>;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    product, themes, theme, setTheme,
    cardHolder, setCardHolder,
    billingStreet, setBillingStreet,
    billingCity, setBillingCity,
    billingState, setBillingState,
    billingZip, setBillingZip,
    billingCountry, setBillingCountry,
    requestedLimit, setRequestedLimit,
    dailyLimit, setDailyLimit,
    txnLimit, setTxnLimit,
    employmentStatus, setEmploymentStatus,
    employerName, setEmployerName,
    annualIncome, setAnnualIncome,
    errors, onBack, onNext,
  } = props;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card title="Card art">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {themes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                className={
                  "rounded-xl border p-2 transition " +
                  (theme === t.key
                    ? "border-violet-500 shadow-soft"
                    : "border-border hover:border-violet-500/60")
                }
              >
                <div
                  className="h-16 w-full rounded-lg"
                  style={{ background: t.gradient }}
                />
                <p className="mt-2 text-xs font-medium">{t.label}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Cardholder">
          <Field label="Name on card" htmlFor="cardHolder" error={errors.cardHolder}>
            <Input
              id="cardHolder"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              maxLength={26}
              required
            />
          </Field>
        </Card>

        <Card title="Billing address">
          <Field label="Street" htmlFor="billingStreet" error={errors.billingStreet}>
            <Input
              id="billingStreet"
              value={billingStreet}
              onChange={(e) => setBillingStreet(e.target.value)}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="City" htmlFor="billingCity" error={errors.billingCity}>
              <Input
                id="billingCity"
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
              />
            </Field>
            <Field label="State" htmlFor="billingState" error={errors.billingState}>
              <Input
                id="billingState"
                maxLength={20}
                value={billingState}
                onChange={(e) => setBillingState(e.target.value)}
              />
            </Field>
            <Field label="ZIP" htmlFor="billingZip" error={errors.billingZip}>
              <Input
                id="billingZip"
                value={billingZip}
                onChange={(e) => setBillingZip(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Country (ISO-2)" htmlFor="billingCountry">
            <Input
              id="billingCountry"
              maxLength={2}
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value.toUpperCase())}
            />
          </Field>
        </Card>

        <Card title="Spending limits">
          <Field
            label={`Requested credit limit (${currency(product.limitMin)} – ${currency(product.limitMax)})`}
            htmlFor="requestedLimit"
          >
            <Input
              id="requestedLimit"
              type="number"
              min={product.limitMin}
              max={product.limitMax}
              step={500}
              value={requestedLimit}
              onChange={(e) => setRequestedLimit(Number(e.target.value))}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Daily limit" htmlFor="dailyLimit">
              <Input
                id="dailyLimit"
                type="number"
                min={50}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
              />
            </Field>
            <Field label="Per-transaction limit" htmlFor="txnLimit">
              <Input
                id="txnLimit"
                type="number"
                min={10}
                value={txnLimit}
                onChange={(e) => setTxnLimit(Number(e.target.value))}
              />
            </Field>
          </div>
        </Card>

        <Card title="Employment & income">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Employment status" htmlFor="employmentStatus">
              <select
                id="employmentStatus"
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {EMPLOYMENT_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Annual income" htmlFor="annualIncome">
              <select
                id="annualIncome"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {INCOME_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Employer (optional)" htmlFor="employerName">
            <Input
              id="employerName"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
            />
          </Field>
        </Card>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="size-4" /> Pick another card
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-7 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Sign & secure
          </button>
        </div>
      </div>

      <aside className="space-y-3 self-start">
        <div className="sticky top-20 space-y-3">
          <CardArt
            network={product.network}
            theme={theme}
            cardHolder={cardHolder || "YOUR NAME"}
            lastFour="••••"
            expiryMonth={new Date().getMonth() + 1}
            expiryYear={new Date().getFullYear() + 4}
            size="lg"
          />
          <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            Preview only — the final card number and CVV are generated when the
            application is approved.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Step 3 — sign + PIN
// ────────────────────────────────────────────────────────────────────────

function SecureStep(props: {
  product: CardProduct;
  theme: CardThemeKey;
  cardHolder: string;
  pin: string;
  setPin: (v: string) => void;
  pinConfirm: string;
  setPinConfirm: (v: string) => void;
  showPin: boolean;
  setShowPin: (v: boolean) => void;
  consents: { cardholder: boolean; fcba: boolean; esign: boolean };
  setConsents: (
    fn: (prev: { cardholder: boolean; fcba: boolean; esign: boolean }) => {
      cardholder: boolean;
      fcba: boolean;
      esign: boolean;
    }
  ) => void;
  errors: Record<string, string>;
  pending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { product, theme, cardHolder, pin, setPin, pinConfirm, setPinConfirm, showPin, setShowPin, consents, setConsents, errors, pending, onBack, onSubmit } = props;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card title="Set your PIN">
          <p className="text-xs text-muted-foreground">
            Your 4-digit PIN authorises ATM withdrawals and chip-and-PIN
            purchases. Stored only as a hash.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="PIN" htmlFor="pin" error={errors.pin}>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="font-mono text-center tracking-[0.4em] text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm PIN" htmlFor="pinConfirm" error={errors.pinConfirm}>
              <Input
                id="pinConfirm"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                value={pinConfirm}
                onChange={(e) =>
                  setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="font-mono text-center tracking-[0.4em] text-lg"
              />
            </Field>
          </div>
        </Card>

        <Card title="Disclosures">
          <Consent
            checked={consents.cardholder}
            onChange={(v) => setConsents((p) => ({ ...p, cardholder: v }))}
            error={errors.cardholder}
          >
            I&apos;ve read and agree to the <a className="text-violet-500 underline" href="/about">Cardholder Agreement</a>, including the {product.apr}% APR and {currency(product.annualFee)} annual fee.
          </Consent>
          <Consent
            checked={consents.fcba}
            onChange={(v) => setConsents((p) => ({ ...p, fcba: v }))}
            error={errors.fcba}
          >
            <strong>Fair Credit Billing Act notice:</strong> I acknowledge my rights to dispute billing errors and may request the FCBA disclosure in writing.
          </Consent>
          <Consent
            checked={consents.esign}
            onChange={(v) => setConsents((p) => ({ ...p, esign: v }))}
            error={errors.esign}
          >
            <strong>E-SIGN consent:</strong> I consent to receive my cardholder agreement, periodic statements, and account notices electronically.
          </Consent>
        </Card>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="size-4" /> Customise
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-7 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Lock className="mr-2 size-4" /> Submit application
              </>
            )}
          </button>
        </div>
      </div>

      <aside className="space-y-3 self-start">
        <div className="sticky top-20 space-y-3">
          <CardArt
            network={product.network}
            theme={theme}
            cardHolder={cardHolder || "YOUR NAME"}
            lastFour="••••"
            expiryMonth={new Date().getMonth() + 1}
            expiryYear={new Date().getFullYear() + 4}
            size="lg"
          />
          <p className="rounded-xl bg-violet-500/5 border border-violet-500/30 p-3 text-xs">
            <Sparkles className="-mt-0.5 mr-1 inline size-3.5 text-violet-500" />
            A Paxnova Trust officer will review your application within 1 business
            day. You&apos;ll see the new card here once approved.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Shared bits
// ────────────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: Step }) {
  const order: Step[] = ["product", "customize", "secure"];
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
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
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

function Consent({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-violet-500"
      />
      <span className="text-foreground">
        {children}
        {error && <span className="ml-1 text-xs text-danger">— required</span>}
      </span>
    </label>
  );
}
