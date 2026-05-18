"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FieldShell,
  SelectField,
  TextField,
} from "@/components/forms/FormField";
import { DocumentSlotGrid } from "@/components/forms/DocumentUpload";
import { docsForProduct } from "@/lib/doc-specs";
import {
  WizardNav,
  WizardProgress,
  WizardStepHeader,
  type WizardStep,
} from "@/components/forms/WizardShell";
import {
  ANNUAL_INCOME,
  BUSINESS_ENTITY_TYPES,
  BUSINESS_INDUSTRIES,
  CITIZENSHIP,
  digitsOnly,
  EMPLOYMENT_STATUS,
  EXPECTED_MONTHLY_DEPOSITS,
  formatEin,
  formatPhone,
  formatSsn,
  FUNDING_SOURCES,
  HOUSING_STATUS,
  INTENDED_USE,
  isAdult,
  MORTGAGE_LOAN_PURPOSE,
  MORTGAGE_PROPERTY_TYPE,
  MORTGAGE_PROPERTY_USE,
  SOURCE_OF_FUNDS,
  US_STATES,
} from "@/lib/kyc";
import { applyAction, type ApplyState } from "@/app/actions/apply";

const initial: ApplyState = { ok: false };

const PRODUCTS = [
  { value: "checking", label: "Apex Checking" },
  { value: "savings", label: "Reserve High-Yield Savings" },
  { value: "cd", label: "Certificate of Deposit (CD)" },
  { value: "credit-card", label: "Signature Rewards Card" },
  { value: "mortgage", label: "Mortgage Pre-approval" },
  { value: "heloc", label: "Home Equity Line of Credit (HELOC)" },
  { value: "auto-refi", label: "Auto refinance" },
  { value: "brokerage", label: "Self-directed investing" },
  { value: "ira", label: "Retirement (IRA)" },
  { value: "business", label: "Business Operating Account" },
] as const;

type Values = Record<string, string>;
type BeneficialOwner = {
  name: string;
  dateOfBirth: string;
  ssn: string;
  ownershipPct: string;
  address: string;
  title: string;
};

const emptyBO: BeneficialOwner = {
  name: "",
  dateOfBirth: "",
  ssn: "",
  ownershipPct: "",
  address: "",
  title: "",
};

export function ApplyForm({
  defaultProduct,
  isLoggedIn,
  prefill,
}: {
  defaultProduct: string;
  isLoggedIn: boolean;
  prefill?: { name: string; email: string; phone: string };
}) {
  const [state, formAction, pending] = useActionState(applyAction, initial);
  const [product, setProduct] = useState(defaultProduct);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
    citizenshipStatus: "us-citizen",
  });
  const [owners, setOwners] = useState<BeneficialOwner[]>([{ ...emptyBO }]);
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...state.fieldErrors, ...clientErrors };

  // Compose the step list based on product + auth state.
  const steps = useMemo<WizardStep[]>(() => {
    const kycSteps: WizardStep[] = isLoggedIn
      ? []
      : [
          {
            id: "identity",
            title: "About you",
            subtitle:
              "We're required by federal law (USA PATRIOT Act §326) to collect this.",
          },
          {
            id: "contact",
            title: "Contact & address",
            subtitle: "Where you live — no P.O. boxes.",
          },
          {
            id: "financial",
            title: "Employment & income",
            subtitle:
              "Used for anti-money-laundering and product underwriting.",
          },
        ];
    const productStep = productStepFor(product);
    return [
      ...kycSteps,
      productStep,
      {
        id: "documents",
        title: "Upload supporting documents",
        subtitle:
          "Drop in clear photos or PDFs. Items marked Required must be uploaded before submission.",
      },
      {
        id: "disclosures",
        title: "Review & submit",
        subtitle:
          "Confirm your information and acknowledge the required disclosures.",
      },
    ];
  }, [product, isLoggedIn]);

  const productDocSlots = useMemo(
    () => docsForProduct(product, values.entityType),
    [product, values.entityType]
  );

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
    const id = steps[step].id;

    if (id === "identity") {
      for (const f of [
        "firstName",
        "lastName",
        "dateOfBirth",
        "ssn",
        "citizenshipStatus",
      ]) {
        if (!(values[f] ?? "").trim()) errs[f] = "Required";
      }
      const dob = values.dateOfBirth ?? "";
      if (dob && !isAdult(dob)) errs.dateOfBirth = "You must be at least 18";
      if (
        (values.ssn ?? "") &&
        digitsOnly(values.ssn).length !== 9
      )
        errs.ssn = "SSN must be 9 digits";
    } else if (id === "contact") {
      for (const f of [
        "email",
        "phone",
        "streetAddress",
        "city",
        "stateRegion",
        "postalCode",
      ]) {
        if (!(values[f] ?? "").trim()) errs[f] = "Required";
      }
      const email = values.email ?? "";
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errs.email = "Enter a valid email";
      const phone = digitsOnly(values.phone);
      if (phone && phone.replace(/^1/, "").length !== 10)
        errs.phone = "Enter a valid 10-digit U.S. phone";
      const zip = values.postalCode ?? "";
      if (zip && !/^\d{5}(-?\d{4})?$/.test(zip))
        errs.postalCode = "Enter a valid ZIP";
    } else if (id === "financial") {
      for (const f of [
        "employmentStatus",
        "annualIncome",
        "sourceOfFunds",
      ]) {
        if (!(values[f] ?? "").trim()) errs[f] = "Required";
      }
      if (
        (values.employmentStatus === "employed" ||
          values.employmentStatus === "self-employed") &&
        !(values.occupation ?? "").trim()
      ) {
        errs.occupation = "Required";
      }
    } else if (id.startsWith("product:")) {
      Object.assign(errs, validateProductStep(product, values, owners));
      if (product === "cd") {
        if (!(values.cdTerm ?? "").trim()) errs.cdTerm = "Pick a term";
        const dep = Number(values.cdDeposit);
        if (!dep || dep < 500)
          errs.cdDeposit = "Minimum opening deposit is $500";
        if (!(values.atMaturity ?? "").trim()) errs.atMaturity = "Pick an option";
      } else if (product === "heloc") {
        for (const f of [
          "propertyAddress",
          "propertyCity",
          "propertyState",
          "propertyZip",
          "estimatedValue",
          "existingMortgageBalance",
          "requestedLineAmount",
        ]) {
          if (!(values[f] ?? "").trim()) errs[f] = "Required";
        }
      } else if (product === "auto-refi") {
        for (const f of [
          "vehicleYear",
          "vehicleMake",
          "vehicleModel",
          "currentLender",
          "currentPayoff",
          "requestedLoanAmount",
        ]) {
          if (!(values[f] ?? "").trim()) errs[f] = "Required";
        }
      } else if (product === "brokerage" || product === "ira") {
        for (const f of [
          "investmentExperience",
          "riskTolerance",
          "investmentTimeHorizon",
          "primaryObjective",
        ]) {
          if (!(values[f] ?? "").trim()) errs[f] = "Required";
        }
        if (product === "ira" && !(values.iraType ?? "").trim()) {
          errs.iraType = "Pick an IRA type";
        }
      }
    } else if (id === "documents") {
      // Documents are optional at signup — admin can request specific docs
      // during KYC review. We still render the upload slots; the user just
      // isn't blocked when they leave them empty.
    } else if (id === "disclosures") {
      for (const k of [
        "agreeTerms",
        "agreeEsign",
        "agreePatriot",
        "authorizeCreditPull",
      ]) {
        if (values[k] !== "on") errs[k] = "Required";
      }
      if (!isLoggedIn) {
        const p = values.password ?? "";
        if (p.length < 8) errs.password = "At least 8 characters";
        else if (!/[A-Z]/.test(p)) errs.password = "Include an uppercase letter";
        else if (!/[0-9]/.test(p)) errs.password = "Include a number";
      }
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep()) {
      setStep((s) => Math.min(steps.length - 1, s + 1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    if (!validateStep()) e.preventDefault();
  }

  const isLast = step === steps.length - 1;
  const currentStep = steps[step];
  const hasClientErrors = Object.keys(clientErrors).length > 0;

  return (
    <div className="space-y-6">
      <WizardProgress steps={steps} current={step} />

      <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
        <WizardStepHeader step={currentStep} index={step} total={steps.length} />

        <SelectField
          id="product"
          label="Product"
          required
          options={PRODUCTS as unknown as { value: string; label: string }[]}
          value={product}
          onChange={(e) => {
            setProduct(e.target.value);
            // Reset to first product-relevant step if we're mid-flow.
            const productStepIndex = isLoggedIn ? 0 : 3;
            if (step > productStepIndex) setStep(productStepIndex);
          }}
          wrapperClassName="max-w-md"
        />

        {!isLoggedIn && (
          <>
            <IdentityStep
              hidden={currentStep.id !== "identity"}
              values={values}
              setValue={setValue}
              errors={errors}
              prefill={prefill}
            />
            <ContactStep
              hidden={currentStep.id !== "contact"}
              values={values}
              setValue={setValue}
              errors={errors}
              prefill={prefill}
            />
            <FinancialStep
              hidden={currentStep.id !== "financial"}
              values={values}
              setValue={setValue}
              errors={errors}
            />
          </>
        )}

        <ProductFields
          hidden={!currentStep.id.startsWith("product:")}
          product={product}
          values={values}
          setValue={setValue}
          errors={errors}
          owners={owners}
          setOwners={setOwners}
        />

        <DocumentsStep
          hidden={currentStep.id !== "documents"}
          slots={productDocSlots}
          errors={errors}
          onChange={(kind, has) =>
            setDocs((p) => ({ ...p, [kind]: has }))
          }
          product={product}
          entityType={values.entityType}
        />

        <DisclosuresStep
          hidden={currentStep.id !== "disclosures"}
          values={values}
          setValue={setValue}
          errors={errors}
          isLoggedIn={isLoggedIn}
          showPw={showPw}
          setShowPw={setShowPw}
        />

        {hasClientErrors && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            Please fill in the highlighted fields on this step before continuing.
          </p>
        )}
        {state.message && (
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
          submitLabel="Submit application"
        />
        {pending && isLast && (
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Submitting…
          </p>
        )}
      </form>
    </div>
  );
}

// ---- Step-derivation helpers --------------------------------------------

function productStepFor(product: string): WizardStep {
  if (product === "mortgage")
    return {
      id: "product:mortgage",
      title: "Property & loan details",
      subtitle:
        "URLA-style intake. We'll pull credit only after you authorize it on the next step.",
    };
  if (product === "heloc")
    return {
      id: "product:heloc",
      title: "Your home & existing mortgage",
      subtitle:
        "We need a current snapshot of your home's value and what you still owe so we can calculate your line.",
    };
  if (product === "business")
    return {
      id: "product:business",
      title: "Business & beneficial owners",
      subtitle:
        "FinCEN CDD requires every individual who owns ≥25% of the entity, plus the person who controls it.",
    };
  if (product === "credit-card")
    return {
      id: "product:credit-card",
      title: "Credit profile & request",
      subtitle:
        "Regulation Z requires us to evaluate your ability to repay before issuing credit.",
    };
  if (product === "cd")
    return {
      id: "product:cd",
      title: "Pick your CD term & deposit",
      subtitle:
        "CDs lock the rate the day you open them. Funds are restricted until maturity.",
    };
  if (product === "auto-refi")
    return {
      id: "product:auto-refi",
      title: "Your vehicle & existing loan",
      subtitle:
        "We need to identify the vehicle and the existing lienholder so we can issue the payoff and retitle.",
    };
  if (product === "brokerage" || product === "ira")
    return {
      id: `product:${product}`,
      title:
        product === "ira"
          ? "Retirement account preferences"
          : "Investment profile",
      subtitle:
        "FINRA Rule 2111 (Suitability) requires us to understand your investment objectives before opening a brokerage account.",
    };
  return {
    id: `product:${product}`,
    title: "Funding your account",
    subtitle: "Optional — you can also fund after opening.",
  };
}

function validateProductStep(
  product: string,
  values: Values,
  owners: BeneficialOwner[]
): Record<string, string> {
  const errs: Record<string, string> = {};
  if (product === "credit-card") {
    for (const f of [
      "requestedCreditLimit",
      "monthlyHousingPayment",
      "housingStatus",
    ]) {
      if (!(values[f] ?? "").trim()) errs[f] = "Required";
    }
  } else if (product === "mortgage") {
    for (const f of [
      "loanPurpose",
      "propertyUse",
      "propertyType",
      "propertyAddress",
      "propertyCity",
      "propertyState",
      "propertyZip",
      "purchasePrice",
      "loanAmount",
      "downPayment",
      "monthlyHousingPayment",
      "totalAssets",
      "totalLiabilities",
    ]) {
      if (!(values[f] ?? "").trim()) errs[f] = "Required";
    }
    if (
      values.hasCoBorrower === "on" &&
      !(values.coBorrowerName ?? "").trim()
    ) {
      errs.coBorrowerName = "Required";
    }
  } else if (product === "business") {
    for (const f of [
      "legalName",
      "ein",
      "entityType",
      "stateOfFormation",
      "dateOfFormation",
      "industry",
      "annualRevenue",
      "numEmployees",
      "businessAddress",
      "businessCity",
      "businessState",
      "businessZip",
      "businessPhone",
      "controlPersonName",
      "controlPersonTitle",
      "controlPersonDob",
      "controlPersonSsn",
    ]) {
      if (!(values[f] ?? "").trim()) errs[f] = "Required";
    }
    if (digitsOnly(values.ein).length !== 9) errs.ein = "EIN must be 9 digits";
    if (digitsOnly(values.controlPersonSsn).length !== 9)
      errs.controlPersonSsn = "SSN must be 9 digits";
    // At least 1 beneficial owner with valid data, OR explicit zero-owner
    // certification for entities like nonprofits / wholly-owned subsidiaries.
    if (owners.length === 0) {
      errs.beneficialOwners =
        "Add at least one beneficial owner with ≥25% ownership.";
    } else {
      owners.forEach((o, idx) => {
        if (!o.name) errs[`bo.${idx}.name`] = "Required";
        if (!o.dateOfBirth) errs[`bo.${idx}.dateOfBirth`] = "Required";
        if (digitsOnly(o.ssn).length !== 9)
          errs[`bo.${idx}.ssn`] = "SSN must be 9 digits";
        if (!o.address) errs[`bo.${idx}.address`] = "Required";
        const pct = Number(o.ownershipPct);
        if (!pct || pct < 25 || pct > 100)
          errs[`bo.${idx}.ownershipPct`] = "Must be 25–100%";
      });
    }
  }
  return errs;
}

// ---- Step components -----------------------------------------------------

function IdentityStep({
  hidden,
  values,
  setValue,
  errors,
  prefill,
}: {
  hidden: boolean;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
  prefill?: { name: string; email: string; phone: string };
}) {
  const [first, ...rest] = (prefill?.name ?? "").split(" ");
  const last = rest.pop() ?? "";
  const middle = rest.join(" ");
  return (
    <div className={hidden ? "hidden" : "space-y-4"}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
        <TextField
          id="firstName"
          label="First name"
          required
          autoComplete="given-name"
          defaultValue={first}
          value={values.firstName ?? first ?? ""}
          onChange={(e) => setValue("firstName", e.target.value)}
          error={errors.firstName}
          wrapperClassName="sm:col-span-5"
        />
        <TextField
          id="middleName"
          label="Middle"
          defaultValue={middle}
          value={values.middleName ?? middle ?? ""}
          onChange={(e) => setValue("middleName", e.target.value)}
          wrapperClassName="sm:col-span-2"
        />
        <TextField
          id="lastName"
          label="Last name"
          required
          autoComplete="family-name"
          defaultValue={last}
          value={values.lastName ?? last ?? ""}
          onChange={(e) => setValue("lastName", e.target.value)}
          error={errors.lastName}
          wrapperClassName="sm:col-span-4"
        />
        <TextField
          id="suffix"
          label="Suffix"
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
        />
        <TextField
          id="ssn"
          label="SSN"
          required
          inputMode="numeric"
          placeholder="123-45-6789"
          autoComplete="off"
          value={values.ssn ?? ""}
          onChange={(e) => setValue("ssn", formatSsn(e.target.value))}
          error={errors.ssn}
          hint="Encrypted in transit. Last 4 only on file."
        />
      </div>

      <SelectField
        id="citizenshipStatus"
        label="Citizenship status"
        required
        options={CITIZENSHIP}
        value={values.citizenshipStatus ?? "us-citizen"}
        onChange={(e) => setValue("citizenshipStatus", e.target.value)}
        error={errors.citizenshipStatus}
      />
      {values.citizenshipStatus === "non-resident-alien" && (
        <TextField
          id="countryOfCitizenship"
          label="Country of citizenship (ISO-2)"
          required
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

function ContactStep({
  hidden,
  values,
  setValue,
  errors,
  prefill,
}: {
  hidden: boolean;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
  prefill?: { name: string; email: string; phone: string };
}) {
  return (
    <div className={hidden ? "hidden" : "space-y-4"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={values.email ?? prefill?.email ?? ""}
          onChange={(e) => setValue("email", e.target.value)}
          error={errors.email}
        />
        <TextField
          id="phone"
          label="Mobile phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="(212) 555-0100"
          value={values.phone ?? prefill?.phone ?? ""}
          onChange={(e) => setValue("phone", formatPhone(e.target.value))}
          error={errors.phone}
        />
      </div>

      <TextField
        id="streetAddress"
        label="Street address"
        required
        autoComplete="address-line1"
        value={values.streetAddress ?? ""}
        onChange={(e) => setValue("streetAddress", e.target.value)}
        error={errors.streetAddress}
        hint="Residential address only — no P.O. boxes."
      />
      <TextField
        id="addressLine2"
        label="Apt / Suite (optional)"
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
          maxLength={10}
          autoComplete="postal-code"
          value={values.postalCode ?? ""}
          onChange={(e) => setValue("postalCode", e.target.value)}
          error={errors.postalCode}
          wrapperClassName="sm:col-span-1"
        />
      </div>
    </div>
  );
}

function FinancialStep({
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
  const employed =
    values.employmentStatus === "employed" ||
    values.employmentStatus === "self-employed";
  return (
    <div className={hidden ? "hidden" : "space-y-4"}>
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
      <SelectField
        id="sourceOfFunds"
        label="Primary source of funds"
        required
        options={SOURCE_OF_FUNDS}
        value={values.sourceOfFunds ?? ""}
        onChange={(e) => setValue("sourceOfFunds", e.target.value)}
        error={errors.sourceOfFunds}
      />
    </div>
  );
}

// ---- Product-specific fields --------------------------------------------

function ProductFields({
  hidden,
  product,
  values,
  setValue,
  errors,
  owners,
  setOwners,
}: {
  hidden: boolean;
  product: string;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
  owners: BeneficialOwner[];
  setOwners: React.Dispatch<React.SetStateAction<BeneficialOwner[]>>;
}) {
  // CSS-hide instead of unmounting. Submit happens on the final Disclosures
  // step; unmounted inputs aren't included in the FormData, which previously
  // made every business field read `undefined` on the action side even when
  // the user filled them in.
  return (
    <div className={hidden ? "hidden" : ""}>
      {product === "credit-card" && (
        <CreditCardFields values={values} setValue={setValue} errors={errors} />
      )}
      {product === "mortgage" && (
        <MortgageFields values={values} setValue={setValue} errors={errors} />
      )}
      {product === "business" && (
        <BusinessFields
          values={values}
          setValue={setValue}
          errors={errors}
          owners={owners}
          setOwners={setOwners}
        />
      )}
      {(product === "checking" || product === "savings") && (
        <FundingFields values={values} setValue={setValue} />
      )}
      {product === "cd" && (
        <CdFields values={values} setValue={setValue} errors={errors} />
      )}
      {product === "heloc" && (
        <HelocFields values={values} setValue={setValue} errors={errors} />
      )}
      {product === "auto-refi" && (
        <AutoRefiFields values={values} setValue={setValue} errors={errors} />
      )}
      {(product === "brokerage" || product === "ira") && (
        <InvestingFields
          product={product}
          values={values}
          setValue={setValue}
          errors={errors}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// CD — fixed-rate deposit account. The unique fields are term, opening
// deposit, and what to do at maturity.
// ──────────────────────────────────────────────────────────────────────

function CdFields({
  values,
  setValue,
  errors,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  const CD_TERMS = [
    { value: "6m", label: "6 months · 4.55% APY" },
    { value: "9m", label: "9 months · 4.80% APY" },
    { value: "12m", label: "12 months · 5.20% APY" },
    { value: "18m", label: "18 months · 5.05% APY" },
    { value: "24m", label: "24 months · 4.85% APY" },
    { value: "60m", label: "60 months · 4.55% APY" },
  ];
  const AT_MATURITY = [
    { value: "renew", label: "Auto-renew at then-current rate" },
    { value: "checking", label: "Move funds + interest to my checking" },
    { value: "savings", label: "Move funds + interest to my savings" },
    { value: "decide", label: "Let me decide at maturity (10-day grace)" },
  ];
  return (
    <div className="space-y-4">
      <SelectField
        id="cdTerm"
        label="CD term"
        required
        options={CD_TERMS}
        value={values.cdTerm ?? ""}
        onChange={(e) => setValue("cdTerm", e.target.value)}
        error={errors.cdTerm}
        hint="Rates locked the day your CD opens."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="cdDeposit"
          label="Opening deposit"
          required
          type="number"
          min={500}
          step={100}
          placeholder="500"
          value={values.cdDeposit ?? ""}
          onChange={(e) => setValue("cdDeposit", e.target.value)}
          error={errors.cdDeposit}
          hint="Minimum $500. Funds locked until maturity."
        />
        <SelectField
          id="fundingSource"
          label="Funding source"
          options={FUNDING_SOURCES}
          value={values.fundingSource ?? ""}
          onChange={(e) => setValue("fundingSource", e.target.value)}
        />
      </div>
      <SelectField
        id="atMaturity"
        label="At maturity"
        required
        options={AT_MATURITY}
        value={values.atMaturity ?? ""}
        onChange={(e) => setValue("atMaturity", e.target.value)}
        error={errors.atMaturity}
      />
      <NotesField values={values} setValue={setValue} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// HELOC — different from a mortgage. Needs current valuation, existing
// lien balance, and the requested line amount. Used to compute CLTV.
// ──────────────────────────────────────────────────────────────────────

function HelocFields({
  values,
  setValue,
  errors,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          The property
        </legend>
        <TextField
          id="propertyAddress"
          label="Property address"
          required
          value={values.propertyAddress ?? ""}
          onChange={(e) => setValue("propertyAddress", e.target.value)}
          error={errors.propertyAddress}
        />
        <div className="grid gap-3 sm:grid-cols-6">
          <TextField
            id="propertyCity"
            label="City"
            required
            value={values.propertyCity ?? ""}
            onChange={(e) => setValue("propertyCity", e.target.value)}
            error={errors.propertyCity}
            wrapperClassName="sm:col-span-3"
          />
          <SelectField
            id="propertyState"
            label="State"
            required
            options={US_STATES}
            value={values.propertyState ?? ""}
            onChange={(e) => setValue("propertyState", e.target.value)}
            error={errors.propertyState}
            wrapperClassName="sm:col-span-2"
          />
          <TextField
            id="propertyZip"
            label="ZIP"
            required
            inputMode="numeric"
            maxLength={10}
            value={values.propertyZip ?? ""}
            onChange={(e) => setValue("propertyZip", e.target.value)}
            error={errors.propertyZip}
            wrapperClassName="sm:col-span-1"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Current equity
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            id="estimatedValue"
            label="Estimated home value"
            required
            type="number"
            min={50000}
            step={5000}
            value={values.estimatedValue ?? ""}
            onChange={(e) => setValue("estimatedValue", e.target.value)}
            error={errors.estimatedValue}
            hint="Recent Zillow or appraisal estimate."
          />
          <TextField
            id="existingMortgageBalance"
            label="Existing mortgage balance"
            required
            type="number"
            min={0}
            step={1000}
            value={values.existingMortgageBalance ?? ""}
            onChange={(e) =>
              setValue("existingMortgageBalance", e.target.value)
            }
            error={errors.existingMortgageBalance}
            hint="From your latest statement."
          />
          <TextField
            id="existingHelocBalance"
            label="Existing HELOC balance (optional)"
            type="number"
            min={0}
            step={1000}
            value={values.existingHelocBalance ?? ""}
            onChange={(e) => setValue("existingHelocBalance", e.target.value)}
          />
        </div>
        <TextField
          id="requestedLineAmount"
          label="Requested line amount"
          required
          type="number"
          min={10000}
          step={1000}
          value={values.requestedLineAmount ?? ""}
          onChange={(e) => setValue("requestedLineAmount", e.target.value)}
          error={errors.requestedLineAmount}
          hint="We'll cap at 85% combined LTV after appraisal."
        />
        <TextField
          id="intendedUseHeloc"
          label="Intended use (optional)"
          placeholder="Home improvement, debt consolidation, tuition…"
          value={values.intendedUseHeloc ?? ""}
          onChange={(e) => setValue("intendedUseHeloc", e.target.value)}
        />
      </fieldset>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Auto refinance — vehicle identification + existing lien data.
// ──────────────────────────────────────────────────────────────────────

function AutoRefiFields({
  values,
  setValue,
  errors,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your vehicle
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            id="vehicleYear"
            label="Year"
            required
            type="number"
            min={2010}
            max={2027}
            value={values.vehicleYear ?? ""}
            onChange={(e) => setValue("vehicleYear", e.target.value)}
            error={errors.vehicleYear}
          />
          <TextField
            id="vehicleMake"
            label="Make"
            required
            placeholder="e.g. Toyota"
            value={values.vehicleMake ?? ""}
            onChange={(e) => setValue("vehicleMake", e.target.value)}
            error={errors.vehicleMake}
          />
          <TextField
            id="vehicleModel"
            label="Model"
            required
            placeholder="e.g. RAV4"
            value={values.vehicleModel ?? ""}
            onChange={(e) => setValue("vehicleModel", e.target.value)}
            error={errors.vehicleModel}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="vehicleVin"
            label="VIN (optional now)"
            maxLength={17}
            placeholder="17-character VIN"
            value={values.vehicleVin ?? ""}
            onChange={(e) =>
              setValue("vehicleVin", e.target.value.toUpperCase())
            }
            hint="Required before funding — pull from your dashboard or registration."
          />
          <TextField
            id="vehicleMileage"
            label="Current mileage"
            type="number"
            min={0}
            value={values.vehicleMileage ?? ""}
            onChange={(e) => setValue("vehicleMileage", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Existing loan
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="currentLender"
            label="Current lender"
            required
            value={values.currentLender ?? ""}
            onChange={(e) => setValue("currentLender", e.target.value)}
            error={errors.currentLender}
          />
          <TextField
            id="currentAccountNumber"
            label="Current loan account number"
            value={values.currentAccountNumber ?? ""}
            onChange={(e) => setValue("currentAccountNumber", e.target.value)}
            hint="We'll handle the payoff and title transfer."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            id="currentPayoff"
            label="Current payoff amount"
            required
            type="number"
            min={7500}
            step={100}
            value={values.currentPayoff ?? ""}
            onChange={(e) => setValue("currentPayoff", e.target.value)}
            error={errors.currentPayoff}
          />
          <TextField
            id="currentRate"
            label="Current APR (%)"
            type="number"
            step={0.01}
            value={values.currentRate ?? ""}
            onChange={(e) => setValue("currentRate", e.target.value)}
          />
          <TextField
            id="requestedLoanAmount"
            label="New loan amount"
            required
            type="number"
            min={7500}
            step={100}
            value={values.requestedLoanAmount ?? ""}
            onChange={(e) => setValue("requestedLoanAmount", e.target.value)}
            error={errors.requestedLoanAmount}
          />
        </div>
      </fieldset>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Investing / Retirement — FINRA suitability profile.
// ──────────────────────────────────────────────────────────────────────

function InvestingFields({
  product,
  values,
  setValue,
  errors,
}: {
  product: string;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  const EXPERIENCE = [
    { value: "none", label: "None — first time investing" },
    { value: "limited", label: "Limited — a handful of trades or funds" },
    { value: "good", label: "Good — managed my own portfolio for years" },
    { value: "extensive", label: "Extensive — including options/derivatives" },
  ];
  const RISK = [
    { value: "conservative", label: "Conservative — preserve capital" },
    { value: "moderate", label: "Moderate — balanced growth & income" },
    { value: "growth", label: "Growth — accept volatility for long-term gain" },
    {
      value: "aggressive",
      label: "Aggressive — concentrate in higher-volatility assets",
    },
  ];
  const HORIZON = [
    { value: "short", label: "< 3 years" },
    { value: "medium", label: "3 – 10 years" },
    { value: "long", label: "10 – 20 years" },
    { value: "very-long", label: "20+ years" },
  ];
  const OBJECTIVE = [
    { value: "income", label: "Current income" },
    { value: "capital-preservation", label: "Capital preservation" },
    { value: "balanced", label: "Balanced growth & income" },
    { value: "growth", label: "Long-term growth" },
    { value: "speculation", label: "Speculation / active trading" },
  ];
  const IRA_TYPES = [
    { value: "traditional", label: "Traditional IRA" },
    { value: "roth", label: "Roth IRA" },
    { value: "rollover", label: "Rollover IRA (from a 401k)" },
    { value: "sep", label: "SEP IRA (self-employed)" },
  ];
  return (
    <div className="space-y-4">
      {product === "ira" && (
        <SelectField
          id="iraType"
          label="IRA type"
          required
          options={IRA_TYPES}
          value={values.iraType ?? ""}
          onChange={(e) => setValue("iraType", e.target.value)}
          error={errors.iraType}
        />
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id="investmentExperience"
          label="Investment experience"
          required
          options={EXPERIENCE}
          value={values.investmentExperience ?? ""}
          onChange={(e) => setValue("investmentExperience", e.target.value)}
          error={errors.investmentExperience}
        />
        <SelectField
          id="riskTolerance"
          label="Risk tolerance"
          required
          options={RISK}
          value={values.riskTolerance ?? ""}
          onChange={(e) => setValue("riskTolerance", e.target.value)}
          error={errors.riskTolerance}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id="investmentTimeHorizon"
          label="Time horizon"
          required
          options={HORIZON}
          value={values.investmentTimeHorizon ?? ""}
          onChange={(e) => setValue("investmentTimeHorizon", e.target.value)}
          error={errors.investmentTimeHorizon}
        />
        <SelectField
          id="primaryObjective"
          label="Primary investment objective"
          required
          options={OBJECTIVE}
          value={values.primaryObjective ?? ""}
          onChange={(e) => setValue("primaryObjective", e.target.value)}
          error={errors.primaryObjective}
        />
      </div>
      {product === "brokerage" && (
        <FieldShell
          id="optionsTradingDesired"
          label="Want to enable options trading?"
        >
          <label className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs">
            <input
              id="optionsTradingDesired"
              name="optionsTradingDesired"
              type="checkbox"
              className="mt-0.5 size-4 accent-violet-500"
              checked={values.optionsTradingDesired === "on"}
              onChange={(e) =>
                setValue(
                  "optionsTradingDesired",
                  e.target.checked ? "on" : "",
                )
              }
            />
            <span>
              Yes — I&apos;d like to apply for Level 1 (covered calls / cash-secured puts).
              I understand options trading involves significant risk and may not
              be appropriate for everyone.
            </span>
          </label>
        </FieldShell>
      )}
      <NotesField values={values} setValue={setValue} />
    </div>
  );
}

function FundingFields({
  values,
  setValue,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <SelectField
        id="intendedUseOfAccount"
        label="Intended use of this account"
        options={INTENDED_USE}
        value={values.intendedUseOfAccount ?? ""}
        onChange={(e) => setValue("intendedUseOfAccount", e.target.value)}
      />
      <SelectField
        id="expectedMonthlyDeposits"
        label="Expected monthly deposits"
        options={EXPECTED_MONTHLY_DEPOSITS}
        value={values.expectedMonthlyDeposits ?? ""}
        onChange={(e) => setValue("expectedMonthlyDeposits", e.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="fundingAmount"
          label="Opening deposit"
          type="number"
          min={0}
          step={50}
          placeholder="0"
          value={values.fundingAmount ?? ""}
          onChange={(e) => setValue("fundingAmount", e.target.value)}
        />
        <SelectField
          id="fundingSource"
          label="Funding source"
          options={FUNDING_SOURCES}
          value={values.fundingSource ?? ""}
          onChange={(e) => setValue("fundingSource", e.target.value)}
        />
      </div>
      <TextField
        id="jointApplicant"
        label="Joint applicant name (optional)"
        value={values.jointApplicant ?? ""}
        onChange={(e) => setValue("jointApplicant", e.target.value)}
      />
      <NotesField values={values} setValue={setValue} />
    </div>
  );
}

function CreditCardFields({
  values,
  setValue,
  errors,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="requestedCreditLimit"
          label="Requested credit limit"
          required
          type="number"
          min={500}
          step={500}
          placeholder="5000"
          value={values.requestedCreditLimit ?? ""}
          onChange={(e) => setValue("requestedCreditLimit", e.target.value)}
          error={errors.requestedCreditLimit}
          hint="Subject to underwriting."
        />
        <SelectField
          id="housingStatus"
          label="Housing status"
          required
          options={HOUSING_STATUS}
          value={values.housingStatus ?? ""}
          onChange={(e) => setValue("housingStatus", e.target.value)}
          error={errors.housingStatus}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="monthlyHousingPayment"
          label="Monthly housing payment (rent or mortgage)"
          required
          type="number"
          min={0}
          step={50}
          value={values.monthlyHousingPayment ?? ""}
          onChange={(e) => setValue("monthlyHousingPayment", e.target.value)}
          error={errors.monthlyHousingPayment}
        />
        <TextField
          id="totalAssets"
          label="Total liquid assets (optional)"
          type="number"
          min={0}
          step={1000}
          value={values.totalAssets ?? ""}
          onChange={(e) => setValue("totalAssets", e.target.value)}
        />
      </div>
      <TextField
        id="authorizedUserName"
        label="Authorized user (optional)"
        value={values.authorizedUserName ?? ""}
        onChange={(e) => setValue("authorizedUserName", e.target.value)}
        hint="Adds a second cardholder under your account."
      />
      <NotesField values={values} setValue={setValue} />
    </div>
  );
}

function MortgageFields({
  values,
  setValue,
  errors,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Loan
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            id="loanPurpose"
            label="Loan purpose"
            required
            options={MORTGAGE_LOAN_PURPOSE}
            value={values.loanPurpose ?? ""}
            onChange={(e) => setValue("loanPurpose", e.target.value)}
            error={errors.loanPurpose}
          />
          <SelectField
            id="propertyUse"
            label="Property use"
            required
            options={MORTGAGE_PROPERTY_USE}
            value={values.propertyUse ?? ""}
            onChange={(e) => setValue("propertyUse", e.target.value)}
            error={errors.propertyUse}
          />
        </div>
        <SelectField
          id="propertyType"
          label="Property type"
          required
          options={MORTGAGE_PROPERTY_TYPE}
          value={values.propertyType ?? ""}
          onChange={(e) => setValue("propertyType", e.target.value)}
          error={errors.propertyType}
        />
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Property
        </legend>
        <TextField
          id="propertyAddress"
          label="Property address"
          required
          value={values.propertyAddress ?? ""}
          onChange={(e) => setValue("propertyAddress", e.target.value)}
          error={errors.propertyAddress}
        />
        <div className="grid gap-3 sm:grid-cols-6">
          <TextField
            id="propertyCity"
            label="City"
            required
            value={values.propertyCity ?? ""}
            onChange={(e) => setValue("propertyCity", e.target.value)}
            error={errors.propertyCity}
            wrapperClassName="sm:col-span-3"
          />
          <SelectField
            id="propertyState"
            label="State"
            required
            options={US_STATES}
            value={values.propertyState ?? ""}
            onChange={(e) => setValue("propertyState", e.target.value)}
            error={errors.propertyState}
            wrapperClassName="sm:col-span-2"
          />
          <TextField
            id="propertyZip"
            label="ZIP"
            required
            inputMode="numeric"
            maxLength={10}
            value={values.propertyZip ?? ""}
            onChange={(e) => setValue("propertyZip", e.target.value)}
            error={errors.propertyZip}
            wrapperClassName="sm:col-span-1"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Finances
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            id="purchasePrice"
            label="Purchase price / appraised value"
            required
            type="number"
            min={10000}
            step={1000}
            value={values.purchasePrice ?? ""}
            onChange={(e) => setValue("purchasePrice", e.target.value)}
            error={errors.purchasePrice}
          />
          <TextField
            id="loanAmount"
            label="Loan amount requested"
            required
            type="number"
            min={10000}
            step={1000}
            value={values.loanAmount ?? ""}
            onChange={(e) => setValue("loanAmount", e.target.value)}
            error={errors.loanAmount}
          />
          <TextField
            id="downPayment"
            label="Down payment"
            required
            type="number"
            min={0}
            step={1000}
            value={values.downPayment ?? ""}
            onChange={(e) => setValue("downPayment", e.target.value)}
            error={errors.downPayment}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            id="monthlyHousingPayment"
            label="Current monthly housing"
            required
            type="number"
            min={0}
            value={values.monthlyHousingPayment ?? ""}
            onChange={(e) => setValue("monthlyHousingPayment", e.target.value)}
            error={errors.monthlyHousingPayment}
          />
          <TextField
            id="totalAssets"
            label="Total assets"
            required
            type="number"
            min={0}
            step={1000}
            value={values.totalAssets ?? ""}
            onChange={(e) => setValue("totalAssets", e.target.value)}
            error={errors.totalAssets}
          />
          <TextField
            id="totalLiabilities"
            label="Total liabilities"
            required
            type="number"
            min={0}
            step={1000}
            value={values.totalLiabilities ?? ""}
            onChange={(e) => setValue("totalLiabilities", e.target.value)}
            error={errors.totalLiabilities}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Co-borrower (optional)
        </legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            id="hasCoBorrower"
            name="hasCoBorrower"
            type="checkbox"
            className="size-4 accent-violet-500"
            checked={values.hasCoBorrower === "on"}
            onChange={(e) =>
              setValue("hasCoBorrower", e.target.checked ? "on" : "")
            }
          />
          Add a co-borrower (spouse, partner, or co-investor)
        </label>
        {values.hasCoBorrower === "on" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="coBorrowerName"
              label="Co-borrower full name"
              required
              value={values.coBorrowerName ?? ""}
              onChange={(e) => setValue("coBorrowerName", e.target.value)}
              error={errors.coBorrowerName}
            />
            <TextField
              id="coBorrowerEmail"
              label="Co-borrower email"
              type="email"
              value={values.coBorrowerEmail ?? ""}
              onChange={(e) => setValue("coBorrowerEmail", e.target.value)}
              error={errors.coBorrowerEmail}
            />
          </div>
        )}
      </fieldset>
    </div>
  );
}

function BusinessFields({
  values,
  setValue,
  errors,
  owners,
  setOwners,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
  owners: BeneficialOwner[];
  setOwners: React.Dispatch<React.SetStateAction<BeneficialOwner[]>>;
}) {
  function updateOwner(idx: number, patch: Partial<BeneficialOwner>) {
    setOwners((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, ...patch } : o))
    );
  }
  function addOwner() {
    if (owners.length >= 4) return;
    setOwners((prev) => [...prev, { ...emptyBO }]);
  }
  function removeOwner(idx: number) {
    setOwners((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-5">
      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Entity
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="legalName"
            label="Legal business name"
            required
            value={values.legalName ?? ""}
            onChange={(e) => setValue("legalName", e.target.value)}
            error={errors.legalName}
          />
          <TextField
            id="dba"
            label="DBA / trade name"
            value={values.dba ?? ""}
            onChange={(e) => setValue("dba", e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            id="ein"
            label="EIN (Tax ID)"
            required
            placeholder="12-3456789"
            value={values.ein ?? ""}
            onChange={(e) => setValue("ein", formatEin(e.target.value))}
            error={errors.ein}
          />
          <SelectField
            id="entityType"
            label="Entity type"
            required
            options={BUSINESS_ENTITY_TYPES}
            value={values.entityType ?? ""}
            onChange={(e) => setValue("entityType", e.target.value)}
            error={errors.entityType}
          />
          <SelectField
            id="stateOfFormation"
            label="State of formation"
            required
            options={US_STATES}
            value={values.stateOfFormation ?? ""}
            onChange={(e) => setValue("stateOfFormation", e.target.value)}
            error={errors.stateOfFormation}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            id="dateOfFormation"
            label="Date of formation"
            type="date"
            required
            value={values.dateOfFormation ?? ""}
            onChange={(e) => setValue("dateOfFormation", e.target.value)}
            error={errors.dateOfFormation}
          />
          <SelectField
            id="industry"
            label="Industry"
            required
            options={BUSINESS_INDUSTRIES}
            value={values.industry ?? ""}
            onChange={(e) => setValue("industry", e.target.value)}
            error={errors.industry}
          />
          <TextField
            id="naicsCode"
            label="NAICS code (optional)"
            maxLength={6}
            value={values.naicsCode ?? ""}
            onChange={(e) => setValue("naicsCode", e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            id="annualRevenue"
            label="Annual revenue"
            required
            options={ANNUAL_INCOME}
            value={values.annualRevenue ?? ""}
            onChange={(e) => setValue("annualRevenue", e.target.value)}
            error={errors.annualRevenue}
          />
          <TextField
            id="numEmployees"
            label="Number of employees"
            required
            type="number"
            min={0}
            value={values.numEmployees ?? ""}
            onChange={(e) => setValue("numEmployees", e.target.value)}
            error={errors.numEmployees}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Business address & contact
        </legend>
        <TextField
          id="businessAddress"
          label="Street address"
          required
          value={values.businessAddress ?? ""}
          onChange={(e) => setValue("businessAddress", e.target.value)}
          error={errors.businessAddress}
        />
        <div className="grid gap-3 sm:grid-cols-6">
          <TextField
            id="businessCity"
            label="City"
            required
            value={values.businessCity ?? ""}
            onChange={(e) => setValue("businessCity", e.target.value)}
            error={errors.businessCity}
            wrapperClassName="sm:col-span-3"
          />
          <SelectField
            id="businessState"
            label="State"
            required
            options={US_STATES}
            value={values.businessState ?? ""}
            onChange={(e) => setValue("businessState", e.target.value)}
            error={errors.businessState}
            wrapperClassName="sm:col-span-2"
          />
          <TextField
            id="businessZip"
            label="ZIP"
            required
            inputMode="numeric"
            maxLength={10}
            value={values.businessZip ?? ""}
            onChange={(e) => setValue("businessZip", e.target.value)}
            error={errors.businessZip}
            wrapperClassName="sm:col-span-1"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="businessPhone"
            label="Business phone"
            type="tel"
            required
            value={values.businessPhone ?? ""}
            onChange={(e) => setValue("businessPhone", formatPhone(e.target.value))}
            error={errors.businessPhone}
          />
          <TextField
            id="businessWebsite"
            label="Website (optional)"
            placeholder="https://"
            value={values.businessWebsite ?? ""}
            onChange={(e) => setValue("businessWebsite", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Control person (FinCEN CDD)
        </legend>
        <p className="text-xs text-muted-foreground">
          One individual with significant managerial authority — typically the
          CEO, CFO, COO, Managing Member, General Partner, President, or
          Treasurer.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="controlPersonName"
            label="Full legal name"
            required
            value={values.controlPersonName ?? ""}
            onChange={(e) => setValue("controlPersonName", e.target.value)}
            error={errors.controlPersonName}
          />
          <TextField
            id="controlPersonTitle"
            label="Title"
            required
            value={values.controlPersonTitle ?? ""}
            onChange={(e) => setValue("controlPersonTitle", e.target.value)}
            error={errors.controlPersonTitle}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="controlPersonDob"
            label="Date of birth"
            type="date"
            required
            value={values.controlPersonDob ?? ""}
            onChange={(e) => setValue("controlPersonDob", e.target.value)}
            error={errors.controlPersonDob}
          />
          <TextField
            id="controlPersonSsn"
            label="SSN"
            required
            placeholder="123-45-6789"
            value={values.controlPersonSsn ?? ""}
            onChange={(e) => setValue("controlPersonSsn", formatSsn(e.target.value))}
            error={errors.controlPersonSsn}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Beneficial owners (≥25% ownership)
        </legend>
        <p className="text-xs text-muted-foreground">
          Under FinCEN's CDD rule, list every individual who directly or
          indirectly owns 25% or more of the entity. Up to 4 owners.
        </p>
        {errors.beneficialOwners && (
          <p className="text-xs text-danger">{errors.beneficialOwners}</p>
        )}

        <div className="space-y-3">
          {owners.map((o, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs font-semibold">Owner {idx + 1}</p>
                {owners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOwner(idx)}
                    className="text-muted-foreground hover:text-danger"
                    aria-label={`Remove owner ${idx + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id={`bo-name-${idx}`}
                  label="Full name"
                  required
                  value={o.name}
                  onChange={(e) => updateOwner(idx, { name: e.target.value })}
                  error={errors[`bo.${idx}.name`]}
                />
                <TextField
                  id={`bo-title-${idx}`}
                  label="Title / role (optional)"
                  value={o.title}
                  onChange={(e) => updateOwner(idx, { title: e.target.value })}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <TextField
                  id={`bo-dob-${idx}`}
                  label="Date of birth"
                  type="date"
                  required
                  value={o.dateOfBirth}
                  onChange={(e) =>
                    updateOwner(idx, { dateOfBirth: e.target.value })
                  }
                  error={errors[`bo.${idx}.dateOfBirth`]}
                />
                <TextField
                  id={`bo-ssn-${idx}`}
                  label="SSN"
                  required
                  placeholder="123-45-6789"
                  value={o.ssn}
                  onChange={(e) =>
                    updateOwner(idx, { ssn: formatSsn(e.target.value) })
                  }
                  error={errors[`bo.${idx}.ssn`]}
                />
                <TextField
                  id={`bo-pct-${idx}`}
                  label="Ownership %"
                  required
                  type="number"
                  min={25}
                  max={100}
                  value={o.ownershipPct}
                  onChange={(e) =>
                    updateOwner(idx, { ownershipPct: e.target.value })
                  }
                  error={errors[`bo.${idx}.ownershipPct`]}
                />
              </div>
              <div className="mt-3">
                <TextField
                  id={`bo-address-${idx}`}
                  label="Residential address"
                  required
                  value={o.address}
                  onChange={(e) =>
                    updateOwner(idx, { address: e.target.value })
                  }
                  error={errors[`bo.${idx}.address`]}
                />
              </div>
            </div>
          ))}
        </div>

        {owners.length < 4 && (
          <button
            type="button"
            onClick={addOwner}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Plus className="size-3.5" /> Add another owner
          </button>
        )}

        {/* Hidden JSON-encoded payload submitted to the action */}
        <input
          type="hidden"
          name="beneficialOwners"
          value={JSON.stringify(owners)}
        />
      </fieldset>
    </div>
  );
}

function NotesField({
  values,
  setValue,
}: {
  values: Values;
  setValue: (n: string, v: string) => void;
}) {
  return (
    <FieldShell id="notes" label="Anything else we should know? (optional)">
      <textarea
        id="notes"
        name="notes"
        rows={3}
        maxLength={500}
        value={values.notes ?? ""}
        onChange={(e) => setValue("notes", e.target.value)}
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </FieldShell>
  );
}

function DocumentsStep({
  hidden,
  slots,
  errors,
  onChange,
  product,
  entityType,
}: {
  hidden: boolean;
  slots: { kind: string; label: string; hint?: string; required: boolean }[];
  errors: Record<string, string>;
  onChange: (kind: string, hasFile: boolean) => void;
  product: string;
  entityType?: string;
}) {
  return (
    <div className={hidden ? "hidden" : "space-y-3"}>
      <p className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs text-foreground">
        Items marked <strong>Required</strong> must be uploaded before
        submission. Items marked <strong>Recommended</strong> speed up review —
        you can also send them after submitting if you don&apos;t have them
        handy. JPG, PNG, and PDF up to 15 MB.
      </p>
      {product === "business" && !entityType && (
        <p className="rounded-md bg-gold-500/10 px-3 py-2 text-xs text-foreground">
          Tip: go back one step and pick your entity type so we can show the
          exact formation documents we need (Articles of Organization vs.
          Incorporation vs. Partnership Agreement, etc.).
        </p>
      )}
      <DocumentSlotGrid slots={slots} errors={errors} onChange={onChange} />
    </div>
  );
}

function DisclosuresStep({
  hidden,
  values,
  setValue,
  errors,
  isLoggedIn,
  showPw,
  setShowPw,
}: {
  hidden: boolean;
  values: Values;
  setValue: (n: string, v: string) => void;
  errors: Record<string, string>;
  isLoggedIn: boolean;
  showPw: boolean;
  setShowPw: (b: boolean | ((v: boolean) => boolean)) => void;
}) {
  return (
    <div className={hidden ? "hidden" : "space-y-4"}>
      {!isLoggedIn && (
        <div className="space-y-2 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Create your login
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              We'll create your Paxnova Trust account so you can sign in and
              track your application status. The account opens after our
              compliance team reviews your documents (usually one business
              day).
            </p>
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
                {showPw ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger">{errors.password}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Required disclosures
      </p>
      <Consent
        id="agreeTerms"
        checked={values.agreeTerms === "on"}
        onChange={(c) => setValue("agreeTerms", c ? "on" : "")}
        error={errors.agreeTerms}
      >
        I have read and accept the{" "}
        <a className="text-violet-500 underline" href="/about" target="_blank">
          Terms of Service
        </a>
        ,{" "}
        <a className="text-violet-500 underline" href="/about" target="_blank">
          Account Agreement
        </a>
        , and{" "}
        <a className="text-violet-500 underline" href="/about" target="_blank">
          Privacy Notice
        </a>
        .
      </Consent>
      <Consent
        id="agreeEsign"
        checked={values.agreeEsign === "on"}
        onChange={(c) => setValue("agreeEsign", c ? "on" : "")}
        error={errors.agreeEsign}
      >
        <strong>E-SIGN consent:</strong> I agree to receive disclosures and
        tax documents (1099-INT, 1098, etc.) electronically.
      </Consent>
      <Consent
        id="agreePatriot"
        checked={values.agreePatriot === "on"}
        onChange={(c) => setValue("agreePatriot", c ? "on" : "")}
        error={errors.agreePatriot}
      >
        <strong>USA PATRIOT Act notice:</strong> I acknowledge that Paxnova Trust
        is required to obtain, verify, and record information that identifies
        each person opening an account.
      </Consent>
      <Consent
        id="authorizeCreditPull"
        checked={values.authorizeCreditPull === "on"}
        onChange={(c) => setValue("authorizeCreditPull", c ? "on" : "")}
        error={errors.authorizeCreditPull}
      >
        <strong>Credit & verification authorization:</strong> I authorize Paxnova
        Trust Bank to verify the information I have provided and (for credit
        products) to obtain a consumer credit report. A soft inquiry won't
        affect my credit score; a hard inquiry, if required, will.
      </Consent>
      </div>
    </div>
  );
}

function Consent({
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
        className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs"
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
