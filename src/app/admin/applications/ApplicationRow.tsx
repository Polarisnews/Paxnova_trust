"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Download, FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import { currency, formatDate } from "@/lib/format";
import { humanizeDocKind } from "@/lib/doc-specs";
import { ApplicationActions } from "./ApplicationActions";
import { ApplicationManageActions } from "./ApplicationManageActions";

type AppRow = {
  id: number;
  referenceNumber: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string | null;
  product: string;
  status: string;
  fundingAmount: number | null;
  createdAt: Date;
  data: string | null;
  userId: number | null;
  notes: string | null;
};

type DocSummary = {
  id: number;
  kind: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export function ApplicationRow({
  app,
  appDocs,
  userDocs,
}: {
  app: AppRow;
  appDocs: DocSummary[];
  userDocs: DocSummary[];
}) {
  const [open, setOpen] = useState(false);

  let parsed: Record<string, unknown> | null = null;
  if (app.data) {
    try {
      parsed = JSON.parse(app.data);
    } catch {
      parsed = null;
    }
  }

  const docCount = appDocs.length + userDocs.length;

  return (
    <>
      <tr>
        <td className="px-4 py-3 font-mono text-xs">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded hover:text-violet-500"
            aria-expanded={open}
          >
            {open ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            {app.referenceNumber}
          </button>
        </td>
        <td className="px-4 py-3">
          <p className="font-medium">{app.applicantName}</p>
          <p className="text-xs text-muted-foreground">{app.applicantEmail}</p>
        </td>
        <td className="px-4 py-3 capitalize">{app.product.replace("-", " ")}</td>
        <td className="px-4 py-3 text-right font-mono">
          {app.fundingAmount ? currency(app.fundingAmount) : "—"}
        </td>
        <td className="px-4 py-3">
          {docCount === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
              None
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
              <Paperclip className="size-3" /> {docCount}
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              app.status === "pending"
                ? "bg-gold-500/15 text-gold-700 dark:text-gold-300"
                : app.status === "approved"
                ? "bg-success/15 text-success"
                : "bg-danger/15 text-danger"
            }`}
          >
            {app.status}
          </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {formatDate(app.createdAt)}
        </td>
        <td className="px-4 py-3 text-right">
          {app.status === "pending" && (
            <ApplicationActions applicationId={app.id} />
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-muted/30">
          <td colSpan={8} className="px-4 py-4">
            <div className="space-y-4">
              {parsed ? (
                <ApplicationDetails
                  data={parsed}
                  phone={app.applicantPhone}
                  appDocs={appDocs}
                  userDocs={userDocs}
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  No detailed intake data on file (legacy application).
                </p>
              )}
              <ApplicationManageActions
                app={{
                  id: app.id,
                  referenceNumber: app.referenceNumber,
                  applicantName: app.applicantName,
                  applicantEmail: app.applicantEmail,
                  applicantPhone: app.applicantPhone,
                  product: app.product,
                  fundingAmount: app.fundingAmount,
                  notes: app.notes,
                  userId: app.userId,
                }}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ApplicationDetails({
  data,
  phone,
  appDocs,
  userDocs,
}: {
  data: Record<string, unknown>;
  phone: string | null;
  appDocs: DocSummary[];
  userDocs: DocSummary[];
}) {
  const kyc = (data.kyc ?? {}) as Record<string, unknown>;
  const product = (data.product ?? {}) as Record<string, unknown>;
  const consent = (data.consent ?? {}) as Record<string, unknown>;
  const owners = (product.beneficialOwners ?? []) as Array<
    Record<string, unknown>
  >;

  return (
    <div className="space-y-5 text-xs">
      <Section title="Customer identification (CIP)">
        <Grid>
          <Cell label="Legal name">
            {[kyc.firstName, kyc.middleName, kyc.lastName, kyc.suffix]
              .filter(Boolean)
              .join(" ") || "—"}
          </Cell>
          <Cell label="Date of birth">{(kyc.dateOfBirth as string) || "—"}</Cell>
          <Cell label="SSN (last 4)">
            <span className="font-mono">
              ••• – •• – {(kyc.ssnLast4 as string) || "????"}
            </span>
          </Cell>
          <Cell label="Citizenship">
            {(kyc.citizenshipStatus as string) || "—"}
          </Cell>
          <Cell label="Country of citizenship">
            {(kyc.countryOfCitizenship as string) || "US"}
          </Cell>
          <Cell label="Phone">{phone || (kyc.phone as string) || "—"}</Cell>
          <Cell label="Email">{(kyc.email as string) || "—"}</Cell>
        </Grid>
      </Section>

      <Section title="Address">
        <Grid>
          <Cell label="Street">{(kyc.streetAddress as string) || "—"}</Cell>
          <Cell label="Apt / Suite">{(kyc.addressLine2 as string) || "—"}</Cell>
          <Cell label="City">{(kyc.city as string) || "—"}</Cell>
          <Cell label="State">{(kyc.stateRegion as string) || "—"}</Cell>
          <Cell label="ZIP">{(kyc.postalCode as string) || "—"}</Cell>
        </Grid>
      </Section>

      <Section title="Employment & income">
        <Grid>
          <Cell label="Status">
            {(kyc.employmentStatus as string) || "—"}
          </Cell>
          <Cell label="Occupation">{(kyc.occupation as string) || "—"}</Cell>
          <Cell label="Employer">{(kyc.employerName as string) || "—"}</Cell>
          <Cell label="Annual income">
            {(kyc.annualIncome as string) || "—"}
          </Cell>
          <Cell label="Source of funds">
            {(kyc.sourceOfFunds as string) || "—"}
          </Cell>
        </Grid>
      </Section>

      {Object.keys(product).length > 0 && (
        <Section title="Product intake">
          <Grid>
            {Object.entries(product).map(([k, v]) => {
              if (k === "beneficialOwners") return null;
              return (
                <Cell key={k} label={humanize(k)}>
                  {renderValue(v)}
                </Cell>
              );
            })}
          </Grid>
        </Section>
      )}

      {owners.length > 0 && (
        <Section title="Beneficial owners (FinCEN CDD)">
          <div className="space-y-2">
            {owners.map((o, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="text-xs font-semibold">
                  Owner {i + 1} — {(o.name as string) || "—"}{" "}
                  {o.title ? `(${o.title})` : ""} —{" "}
                  {(o.ownershipPct as number) ?? "?"}%
                </p>
                <Grid>
                  <Cell label="DOB">{(o.dateOfBirth as string) || "—"}</Cell>
                  <Cell label="SSN (last 4)">
                    <span className="font-mono">
                      ••• – •• –{" "}
                      {((o.ssn as string) || "").slice(-4) || "????"}
                    </span>
                  </Cell>
                  <Cell label="Address">{(o.address as string) || "—"}</Cell>
                </Grid>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(appDocs.length > 0 || userDocs.length > 0) && (
        <Section title="Uploaded documents">
          {appDocs.length > 0 && (
            <DocsBlock heading="Submitted with this application" docs={appDocs} />
          )}
          {userDocs.length > 0 && (
            <DocsBlock
              heading="On file from this customer's signup KYC"
              docs={userDocs}
            />
          )}
        </Section>
      )}

      {appDocs.length === 0 && userDocs.length === 0 && (
        <Section title="Uploaded documents">
          <p className="text-xs text-muted-foreground">
            No documents on file for this applicant.
          </p>
        </Section>
      )}

      {Object.keys(consent).length > 0 && (
        <Section title="Consent receipts">
          <Grid>
            {Object.entries(consent).map(([k, v]) => (
              <Cell key={k} label={humanize(k)}>
                {typeof v === "string" ? formatTimestamp(v) : renderValue(v)}
              </Cell>
            ))}
          </Grid>
        </Section>
      )}
    </div>
  );
}

function DocsBlock({
  heading,
  docs,
}: {
  heading: string;
  docs: DocSummary[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {heading}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <DocCard key={d.id} doc={d} />
        ))}
      </div>
    </div>
  );
}

function DocCard({ doc }: { doc: DocSummary }) {
  const href = `/api/admin/documents/${doc.id}`;
  const isImage = doc.mimeType.startsWith("image/");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-2 transition hover:border-violet-500/60 hover:bg-violet-500/5"
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={href}
          alt={doc.originalName}
          className="size-12 rounded object-cover"
        />
      ) : (
        <span className="flex size-12 items-center justify-center rounded bg-muted">
          {isImage ? (
            <ImageIcon className="size-5 text-muted-foreground" />
          ) : (
            <FileText className="size-5 text-muted-foreground" />
          )}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">
          {humanizeDocKind(doc.kind)}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {doc.originalName} · {humanSize(doc.size)}
        </p>
      </div>
      <Download className="size-4 text-muted-foreground transition group-hover:text-violet-500" />
    </a>
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
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 md:grid-cols-3 xl:grid-cols-4">
      {children}
    </dl>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate text-xs">{children}</dd>
    </div>
  );
}

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/Ssn/g, "SSN")
    .replace(/Ein/g, "EIN")
    .replace(/Dob/g, "DOB")
    .replace(/Url/g, "URL");
}

function renderValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return v.toLocaleString();
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
