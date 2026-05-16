"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectField,
  TextField,
  FieldShell,
} from "@/components/forms/FormField";
import { DocumentSlotGrid } from "@/components/forms/DocumentUpload";
import { SIGNUP_DOCS } from "@/lib/doc-specs";
import {
  WizardNav,
  WizardProgress,
  WizardStepHeader,
  type WizardStep,
} from "@/components/forms/WizardShell";
import {
  ANNUAL_INCOME,
  CITIZENSHIP,
  EMPLOYMENT_STATUS,
  formatPhone,
  formatSsn,
  HOUSING_STATUS,
  ID_TYPES,
  INTENDED_USE,
  PHONE_TYPES,
  SOURCE_OF_FUNDS,
  US_STATES,
  digitsOnly,
  isAdult,
} from "@/lib/kyc";
import { signupAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { ok: false };

const STEPS: WizardStep[] = [
  {
    id: "identity",
    title: "About you",
    subtitle:
      "Federal law (USA PATRIOT Act §326) requires us to collect this information to open any account.",
  },
  {
    id: "contact",
    title: "Contact & address",
    subtitle:
      "Your residential address — no P.O. boxes. We may use this to verify your identity.",
  },
  {
    id: "verify",
    title: "ID & financial profile",
    subtitle:
      "We use this for identity verification and to comply with anti-money-laundering rules.",
  },
  {
    id: "documents",
    title: "Upload your documents",
    subtitle:
      "We need to see your face and your ID. Files are encrypted and only visible to Paxnova Trust compliance.",
  },
  {
    id: "credentials",
    title: "Login & agreements",
    subtitle: "Set up your password and review the required disclosures.",
  },
];

// Fields validated on each step before letting the user advance.
const STEP_FIELDS: Record<number, string[]> = {
  0: [
    "firstName",
    "lastName",
    "dateOfBirth",
    "ssn",
    "citizenshipStatus",
  ],
  1: [
    "email",
    "phone",
    "phoneType",
    "streetAddress",
    "city",
    "stateRegion",
    "postalCode",
    "yearsAtAddress",
    "housingStatus",
  ],
  2: [
    "idType",
    "idNumber",
    "idExpirationDate",
    "employmentStatus",
    "annualIncome",
    "sourceOfFunds",
    "intendedUseOfAccount",
  ],
  3: [], // documents step — validated against `docs` state, not `values`
  4: ["username", "password", "agreeTerms", "agreeEsign", "agreePatriot", "certifyW9"],
};

type Values = Record<string, string>;

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signupAction, initial);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
    citizenshipStatus: "us-citizen",
    phoneType: "mobile",
  });
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);

  const errors = { ...state.fieldErrors, ...clientErrors };
  const pw = values.password ?? "";
  const strength = useMemo(() => scorePw(pw), [pw]);

  function setValue(name: string, v: string) {
    setValues((p) => ({ ...p, [name]: v }));
    if (clientErrors[name]) {
      setClientErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};
    const fields = STEP_FIELDS[step] ?? [];
    for (const f of fields) {
      const v = (values[f] ?? "").trim();
      if (!v) errs[f] = "Required";
    }
    if (step === 0) {
      const dob = values.dateOfBirth ?? "";
      if (dob && !isAdult(dob)) errs.dateOfBirth = "You must be at least 18";
      const ssn = digitsOnly(values.ssn);
      if (ssn && ssn.length !== 9) errs.ssn = "SSN must be 9 digits";
    }
    if (step === 1) {
      const phone = digitsOnly(values.phone);
      if (phone && phone.replace(/^1/, "").length !== 10)
        errs.phone = "Enter a valid 10-digit U.S. phone";
      const zip = (values.postalCode ?? "").trim();
      if (zip && !/^\d{5}(-?\d{4})?$/.test(zip))
        errs.postalCode = "Enter a valid ZIP code";
      const email = (values.email ?? "").trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errs.email = "Enter a valid email";
    }
    if (step === 2) {
      const exp = values.idExpirationDate ?? "";
      if (exp && new Date(exp) <= new Date())
        errs.idExpirationDate = "ID has expired";
      if (
        (values.idType === "drivers-license" || values.idType === "state-id") &&
        !values.idIssuingState
      ) {
        errs.idIssuingState = "Select the issuing state";
      }
      if (values.idType === "passport" && !values.idIssuingCountry) {
        errs.idIssuingCountry = "Enter the issuing country";
      }
      if (
        (values.employmentStatus === "employed" ||
          values.employmentStatus === "self-employed") &&
        !values.occupation
      ) {
        errs.occupation = "Required";
      }
    }
    if (step === 3) {
      for (const slot of SIGNUP_DOCS) {
        if (slot.required && !docs[slot.kind]) {
          errs[`doc:${slot.kind}`] = "Required";
        }
      }
    }
    if (step === 4) {
      const u = (values.username ?? "").trim().toLowerCase();
      if (u.length < 3) errs.username = "At least 3 characters";
      else if (u.length > 24) errs.username = "24 characters or less";
      else if (!/^[a-z0-9._-]+$/.test(u))
        errs.username = "Letters, numbers, dot, dash, underscore only";
      const p = values.password ?? "";
      if (p.length < 8) errs.password = "At least 8 characters";
      else if (!/[A-Z]/.test(p)) errs.password = "Include an uppercase letter";
      else if (!/[0-9]/.test(p)) errs.password = "Include a number";
      for (const k of ["agreeTerms", "agreeEsign", "agreePatriot", "certifyW9"]) {
        if (values[k] !== "on") errs[k] = "Required";
      }
    }
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep()) {
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    if (!validateStep()) e.preventDefault();
  }

  const isLast = step === STEPS.length - 1;
  const hasClientErrors = Object.keys(clientErrors).length > 0;

  return (
    <div className="space-y-6">
      <WizardProgress steps={STEPS} current={step} />

      <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
        <WizardStepHeader step={STEPS[step]} index={step} total={STEPS.length} />

        {/* All fields are always in the DOM so the wizard preserves values
            and submits everything at once on the final step. Inactive steps
            are visually hidden, not unmounted. */}

        <StepIdentity
          hidden={step !== 0}
          values={values}
          setValue={setValue}
          errors={errors}
        />
        <StepContact
          hidden={step !== 1}
          values={values}
          setValue={setValue}
          errors={errors}
        />
        <StepVerify
          hidden={step !== 2}
          values={values}
          setValue={setValue}
          errors={errors}
        />
        <StepDocuments
          hidden={step !== 3}
          errors={errors}
          onChange={(kind, has) =>
            setDocs((p) => ({ ...p, [kind]: has }))
          }
        />
        <StepCredentials
          hidden={step !== 4}
          values={values}
          setValue={setValue}
          errors={errors}
          showPw={showPw}
          setShowPw={setShowPw}
          strength={strength}
        />

        {hasClientErrors && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            Please fill in the highlighted fields on this step before continuing.
          </p>
        )}
        {state.message && !state.fieldErrors && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.message}
          </p>
        )}

        <WizardNav
          canBack={step > 0}
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onNext={handleNext}
          isLast={isLast}
          pending={pending}
          submitLabel={
            pending ? "Creating account…" : "Open my Apex Checking account"
          }
        />
        {pending && isLast && (
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Submitting to Paxnova Trust…
          </p>
        )}
      </form>
    </div>
  );
}

// ---------------- Step 1: identity --------------------------------------

function StepIdentity({
  hidden,
  values,
  setValue,
  errors,
}: {
  hidden: boolean;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className={hidden ? "hidden" : "space-y-4"}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
        <TextField
          id="firstName"
          label="First name"
          required
          autoComplete="given-name"
          value={values.firstName ?? ""}
          onChange={(e) => setValue("firstName", e.target.value)}
          error={errors.firstName}
          wrapperClassName="sm:col-span-5"
        />
        <TextField
          id="middleName"
          label="Middle"
          autoComplete="additional-name"
          value={values.middleName ?? ""}
          onChange={(e) => setValue("middleName", e.target.value)}
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          id="lastName"
          label="Last name"
          required
          autoComplete="family-name"
          value={values.lastName ?? ""}
          onChange={(e) => setValue("lastName", e.target.value)}
          error={errors.lastName}
          wrapperClassName="sm:col-span-4"
        />
        <TextField
          id="suffix"
          label="Suffix"
          autoComplete="honorific-suffix"
          placeholder="Jr."
          value={values.suffix ?? ""}
          onChange={(e) => setValue("suffix", e.target.value)}
          wrapperClassName="sm:col-span-1"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="dateOfBirth"
          label="Date of birth"
          type="date"
          required
          autoComplete="bday"
          value={values.dateOfBirth ?? ""}
          onChange={(e) => setValue("dateOfBirth", e.target.value)}
          error={errors.dateOfBirth}
          hint="You must be 18 or older."
        />
        <TextField
          id="ssn"
          label="Social Security Number"
          required
          inputMode="numeric"
          autoComplete="off"
          placeholder="123-45-6789"
          value={values.ssn ?? ""}
          onChange={(e) => setValue("ssn", formatSsn(e.target.value))}
          error={errors.ssn}
          hint="Encrypted. We store only the last 4 digits."
        />
      </div>

      <SelectField
        id="citizenshipStatus"
        label="Citizenship status"
        required
        options={CITIZENSHIP}
        value={values.citizenshipStatus ?? ""}
        onChange={(e) => setValue("citizenshipStatus", e.target.value)}
        error={errors.citizenshipStatus}
      />
      {values.citizenshipStatus === "non-resident-alien" && (
        <TextField
          id="countryOfCitizenship"
          label="Country of citizenship"
          required
          placeholder="ISO-2 (e.g. NG, MX, GB)"
          maxLength={2}
          value={values.countryOfCitizenship ?? ""}
          onChange={(e) =>
            setValue("countryOfCitizenship", e.target.value.toUpperCase())
          }
          error={errors.countryOfCitizenship}
        />
      )}
    </div>
  );
}

// ---------------- Step 2: contact + address -----------------------------

function StepContact({
  hidden,
  values,
  setValue,
  errors,
}: {
  hidden: boolean;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className={hidden ? "hidden" : "space-y-4"}>
      <TextField
        id="email"
        label="Email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email ?? ""}
        onChange={(e) => setValue("email", e.target.value)}
        error={errors.email}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          required
          autoComplete="tel"
          placeholder="(212) 555-0100"
          value={values.phone ?? ""}
          onChange={(e) => setValue("phone", formatPhone(e.target.value))}
          error={errors.phone}
          wrapperClassName="sm:col-span-2"
        />
        <SelectField
          id="phoneType"
          label="Type"
          required
          options={PHONE_TYPES}
          value={values.phoneType ?? "mobile"}
          onChange={(e) => setValue("phoneType", e.target.value)}
          error={errors.phoneType}
        />
      </div>

      <TextField
        id="streetAddress"
        label="Street address"
        required
        autoComplete="address-line1"
        placeholder="123 Main Street"
        value={values.streetAddress ?? ""}
        onChange={(e) => setValue("streetAddress", e.target.value)}
        error={errors.streetAddress}
        hint="No P.O. boxes — federal law requires a physical address."
      />
      <TextField
        id="addressLine2"
        label="Apt / Suite / Unit (optional)"
        autoComplete="address-line2"
        value={values.addressLine2 ?? ""}
        onChange={(e) => setValue("addressLine2", e.target.value)}
      />

      <div className="grid gap-3 sm:grid-cols-6">
        <TextField
          id="city"
          label="City"
          required
          autoComplete="address-level2"
          value={values.city ?? ""}
          onChange={(e) => setValue("city", e.target.value)}
          error={errors.city}
          wrapperClassName="sm:col-span-3"
        />
        <SelectField
          id="stateRegion"
          label="State"
          required
          options={US_STATES}
          value={values.stateRegion ?? ""}
          onChange={(e) => setValue("stateRegion", e.target.value)}
          error={errors.stateRegion}
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          id="postalCode"
          label="ZIP"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={10}
          value={values.postalCode ?? ""}
          onChange={(e) => setValue("postalCode", e.target.value)}
          error={errors.postalCode}
          wrapperClassName="sm:col-span-1"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id="housingStatus"
          label="Housing status"
          required
          options={HOUSING_STATUS}
          value={values.housingStatus ?? ""}
          onChange={(e) => setValue("housingStatus", e.target.value)}
          error={errors.housingStatus}
        />
        <TextField
          id="yearsAtAddress"
          label="Years at this address"
          required
          type="number"
          min={0}
          max={99}
          value={values.yearsAtAddress ?? ""}
          onChange={(e) => setValue("yearsAtAddress", e.target.value)}
          error={errors.yearsAtAddress}
        />
      </div>
    </div>
  );
}

// ---------------- Step 3: ID + financial profile ------------------------

function StepVerify({
  hidden,
  values,
  setValue,
  errors,
}: {
  hidden: boolean;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  const idType = values.idType;
  const showState = idType === "drivers-license" || idType === "state-id";
  const showCountry = idType === "passport";
  const employed =
    values.employmentStatus === "employed" ||
    values.employmentStatus === "self-employed";

  return (
    <div className={hidden ? "hidden" : "space-y-5"}>
      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Government-issued ID
        </legend>
        <SelectField
          id="idType"
          label="ID type"
          required
          options={ID_TYPES}
          value={values.idType ?? ""}
          onChange={(e) => setValue("idType", e.target.value)}
          error={errors.idType}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="idNumber"
            label="ID number"
            required
            value={values.idNumber ?? ""}
            onChange={(e) => setValue("idNumber", e.target.value)}
            error={errors.idNumber}
          />
          <TextField
            id="idExpirationDate"
            label="Expiration date"
            type="date"
            required
            value={values.idExpirationDate ?? ""}
            onChange={(e) => setValue("idExpirationDate", e.target.value)}
            error={errors.idExpirationDate}
          />
        </div>
        {showState && (
          <SelectField
            id="idIssuingState"
            label="Issuing state"
            required
            options={US_STATES}
            value={values.idIssuingState ?? ""}
            onChange={(e) => setValue("idIssuingState", e.target.value)}
            error={errors.idIssuingState}
          />
        )}
        {showCountry && (
          <TextField
            id="idIssuingCountry"
            label="Issuing country"
            required
            placeholder="ISO-2 (e.g. US, GB)"
            maxLength={2}
            value={values.idIssuingCountry ?? ""}
            onChange={(e) =>
              setValue("idIssuingCountry", e.target.value.toUpperCase())
            }
            error={errors.idIssuingCountry}
          />
        )}
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Employment & income
        </legend>
        <SelectField
          id="employmentStatus"
          label="Employment status"
          required
          options={EMPLOYMENT_STATUS}
          value={values.employmentStatus ?? ""}
          onChange={(e) => setValue("employmentStatus", e.target.value)}
          error={errors.employmentStatus}
        />
        {employed && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="occupation"
              label="Occupation"
              required
              value={values.occupation ?? ""}
              onChange={(e) => setValue("occupation", e.target.value)}
              error={errors.occupation}
            />
            <TextField
              id="employerName"
              label="Employer"
              value={values.employerName ?? ""}
              onChange={(e) => setValue("employerName", e.target.value)}
              error={errors.employerName}
            />
          </div>
        )}
        <SelectField
          id="annualIncome"
          label="Annual income (before tax)"
          required
          options={ANNUAL_INCOME}
          value={values.annualIncome ?? ""}
          onChange={(e) => setValue("annualIncome", e.target.value)}
          error={errors.annualIncome}
        />
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Anti-money-laundering profile
        </legend>
        <SelectField
          id="sourceOfFunds"
          label="Primary source of funds"
          required
          options={SOURCE_OF_FUNDS}
          value={values.sourceOfFunds ?? ""}
          onChange={(e) => setValue("sourceOfFunds", e.target.value)}
          error={errors.sourceOfFunds}
        />
        <SelectField
          id="intendedUseOfAccount"
          label="Intended use of this account"
          required
          options={INTENDED_USE}
          value={values.intendedUseOfAccount ?? ""}
          onChange={(e) => setValue("intendedUseOfAccount", e.target.value)}
          error={errors.intendedUseOfAccount}
        />
        <FieldShell id="isPep" label="Politically exposed person">
          <label className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <input
              id="isPep"
              name="isPep"
              type="checkbox"
              className="mt-0.5 size-4 accent-violet-500"
              checked={values.isPep === "on"}
              onChange={(e) => setValue("isPep", e.target.checked ? "on" : "")}
            />
            <span className="text-xs text-muted-foreground">
              I am, or am a close family member or associate of, a senior
              political figure (head of state, judge, military officer, etc.).
              Banks are required to ask.
            </span>
          </label>
        </FieldShell>
      </fieldset>
    </div>
  );
}

// ---------------- Step 4: document uploads ------------------------------

function StepDocuments({
  hidden,
  errors,
  onChange,
}: {
  hidden: boolean;
  errors: Record<string, string>;
  onChange: (kind: string, hasFile: boolean) => void;
}) {
  return (
    <div className={hidden ? "hidden" : "space-y-3"}>
      <p className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs text-foreground">
        Why we need this: federal law requires us to verify your identity with
        a government-issued ID before opening an account. Upload clear, fully
        in-frame photos.
      </p>
      <DocumentSlotGrid
        slots={SIGNUP_DOCS}
        errors={errors}
        onChange={onChange}
      />
    </div>
  );
}

// ---------------- Step 5: credentials + agreements ----------------------

function StepCredentials({
  hidden,
  values,
  setValue,
  errors,
  showPw,
  setShowPw,
  strength,
}: {
  hidden: boolean;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
  showPw: boolean;
  setShowPw: (b: boolean | ((v: boolean) => boolean)) => void;
  strength: { score: number; label: string; color: string };
}) {
  return (
    <div className={hidden ? "hidden" : "space-y-4"}>
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-xs font-medium">
          Username<span className="ml-0.5 text-danger">*</span>
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          value={values.username ?? ""}
          onChange={(e) =>
            setValue("username", e.target.value.toLowerCase().replace(/\s+/g, ""))
          }
          placeholder="3–24 chars · letters, numbers, dot, dash, underscore"
          aria-invalid={Boolean(errors.username)}
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          You&apos;ll use this to sign in. We&apos;ll keep your email on file for recovery and notifications.
        </p>
        {errors.username && (
          <p className="text-xs text-danger">{errors.username}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-medium">
          Password<span className="ml-0.5 text-danger">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={values.password ?? ""}
            onChange={(e) => setValue("password", e.target.value)}
            placeholder="At least 8 characters · 1 uppercase · 1 number"
            aria-invalid={Boolean(errors.password)}
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="flex h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full transition-all"
            style={{
              width: `${(strength.score / 4) * 100}%`,
              background: strength.color,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Strength: {strength.label}
        </p>
        {errors.password && (
          <p className="text-xs text-danger">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Required disclosures
        </p>
        <ConsentBox
          id="agreeTerms"
          checked={values.agreeTerms === "on"}
          onChange={(c) => setValue("agreeTerms", c ? "on" : "")}
          error={errors.agreeTerms}
        >
          I agree to the{" "}
          <a className="text-violet-500 underline" href="/about" target="_blank">
            Terms of Service
          </a>
          ,{" "}
          <a className="text-violet-500 underline" href="/about" target="_blank">
            Deposit Account Agreement
          </a>
          , and{" "}
          <a className="text-violet-500 underline" href="/about" target="_blank">
            Privacy Notice
          </a>
          .
        </ConsentBox>
        <ConsentBox
          id="agreeEsign"
          checked={values.agreeEsign === "on"}
          onChange={(c) => setValue("agreeEsign", c ? "on" : "")}
          error={errors.agreeEsign}
        >
          <strong>E-SIGN consent:</strong> I consent to receive disclosures,
          notices, and tax documents (including 1099-INT) electronically.
        </ConsentBox>
        <ConsentBox
          id="agreePatriot"
          checked={values.agreePatriot === "on"}
          onChange={(c) => setValue("agreePatriot", c ? "on" : "")}
          error={errors.agreePatriot}
        >
          <strong>USA PATRIOT Act notice:</strong> To help fight terrorism and
          money laundering, federal law requires us to obtain, verify, and
          record information that identifies each person opening an account.
        </ConsentBox>
        <ConsentBox
          id="certifyW9"
          checked={values.certifyW9 === "on"}
          onChange={(c) => setValue("certifyW9", c ? "on" : "")}
          error={errors.certifyW9}
        >
          <strong>W-9 certification:</strong> Under penalty of perjury, I
          certify that the SSN provided is correct, I am not subject to backup
          withholding, and I am a U.S. person for tax purposes (or, if a
          non-resident, I will provide a W-8BEN).
        </ConsentBox>
      </div>
    </div>
  );
}

function ConsentBox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (b: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs text-foreground"
      >
        <input
          id={id}
          name={id}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-violet-500"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{children}</span>
      </label>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function scorePw(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const labels = ["Weak", "Fair", "Decent", "Strong", "Excellent"];
  const colors = ["#E11D48", "#F97316", "#F59E0B", "#10B981", "#0E9F6E"];
  return { score, label: labels[score], color: colors[score] };
}
