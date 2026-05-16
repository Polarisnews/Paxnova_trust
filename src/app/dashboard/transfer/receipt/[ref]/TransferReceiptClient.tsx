"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileImage,
  Printer,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

type Transfer = {
  referenceNumber: string;
  amount: number;
  fee: number;
  method: string;
  status: string;
  memo: string | null;
  fromAccountName: string;
  fromAccountLast4: string;
  toAccountName: string;
  toAccountLast4: string;
  toBankName: string | null;
  toRoutingNumber: string | null;
  currency: string;
  initiatedAt: number;
  completedAt: number | null;
  estimatedSettlement: number;
};

const METHOD_LABEL: Record<string, string> = {
  internal: "Internal transfer",
  zelle: "Zelle",
  ach: "ACH transfer",
  wire: "Wire transfer (Fedwire)",
};

export function TransferReceiptClient({ transfer }: { transfer: Transfer }) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  function handlePrint() {
    window.print();
  }

  async function handleJpeg() {
    if (!receiptRef.current) return;
    setBusy(true);
    try {
      const blob = await receiptToJpegBlob(receiptRef.current);
      downloadBlob(blob, `paxnovatrust-receipt-${transfer.referenceNumber}.jpg`);
      toast.success("Receipt saved as JPEG.");
    } catch (err) {
      console.error(err);
      toast.error(
        "Couldn't export to JPEG — try Print → Save as PDF instead."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Paxnova Trust Receipt ${transfer.referenceNumber}`,
          text: `Transfer of ${fmtMoney(transfer.amount, transfer.currency)} — Reference ${transfer.referenceNumber}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Receipt link copied to clipboard.");
      }
    } catch {
      /* user cancelled */
    }
  }

  const initiated = new Date(transfer.initiatedAt);
  const completed = transfer.completedAt
    ? new Date(transfer.completedAt)
    : null;
  const settle = new Date(transfer.estimatedSettlement);
  const total = transfer.amount + transfer.fee;

  return (
    <>
      {/* Action bar — hidden when printing */}
      <div className="no-print flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-border bg-card p-3">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-muted"
        >
          <Share2 className="size-3.5" /> Share
        </button>
        <button
          type="button"
          onClick={handleJpeg}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-muted disabled:opacity-60"
        >
          <FileImage className="size-3.5" />
          {busy ? "Exporting…" : "Save as JPEG"}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet-500 px-4 text-xs font-semibold text-white hover:bg-violet-600"
        >
          <Printer className="size-3.5" /> Print / Save as PDF
        </button>
      </div>

      <div ref={receiptRef} className="receipt-print">
        <ReceiptCard
          transfer={transfer}
          initiated={initiated}
          completed={completed}
          settle={settle}
          total={total}
        />
      </div>

      <p className="no-print text-center text-[11px] text-muted-foreground">
        Tip: in the Print dialog, choose <strong>"Save as PDF"</strong> as your
        destination to keep a PDF copy.
      </p>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .receipt-print { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
// Receipt body — uses inline styles for absolute consistency between
// on-screen render, print preview, and JPEG export. (Tailwind classes
// don't survive the SVG-foreignObject conversion.)
// ---------------------------------------------------------------------------

function ReceiptCard({
  transfer,
  initiated,
  completed,
  settle,
  total,
}: {
  transfer: Transfer;
  initiated: Date;
  completed: Date | null;
  settle: Date;
  total: number;
}) {
  return (
    <div
      style={{
        width: 720,
        maxWidth: "100%",
        margin: "0 auto",
        background: "white",
        color: "#0F172A",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: 40,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 20,
          borderBottom: "2px solid #0F172A",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: -0.5,
            }}
          >
            N
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: -0.3,
                lineHeight: 1.1,
              }}
            >
              Paxnova Trust Bank
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#64748B",
                marginTop: 2,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              Member FDIC · Routing 026013577
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#64748B",
            }}
          >
            Transfer receipt
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              marginTop: 2,
              fontWeight: 600,
            }}
          >
            {transfer.referenceNumber}
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#10B981",
            color: "white",
          }}
        >
          <CheckCircle2 size={16} />
        </span>
        <div>
          <div style={{ fontSize: 11, color: "#64748B", letterSpacing: 0.5 }}>
            STATUS
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {transfer.status === "completed"
              ? "Transfer completed"
              : transfer.status === "processing"
              ? "Processing"
              : "Failed"}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div
        style={{
          marginTop: 28,
          padding: 24,
          background: "#F8FAFC",
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#64748B",
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          Amount sent
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: -1,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {fmtMoney(transfer.amount, transfer.currency)}
        </div>
        {transfer.fee > 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>
            + {fmtMoney(transfer.fee, transfer.currency)} wire fee · Total debited{" "}
            <strong style={{ color: "#0F172A" }}>{fmtMoney(total, transfer.currency)}</strong>
          </div>
        )}
      </div>

      {/* Parties */}
      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <Card title="From">
          <Line label="Account" value={transfer.fromAccountName} />
          <Line
            label="Number"
            mono
            value={`••••${transfer.fromAccountLast4}`}
          />
          <Line label="Institution" value="Paxnova Trust Bank" />
        </Card>
        <Card title="To">
          <Line label="Recipient" value={transfer.toAccountName} />
          <Line label="Number" mono value={`••••${transfer.toAccountLast4}`} />
          {transfer.toBankName && (
            <Line label="Institution" value={transfer.toBankName} />
          )}
          {transfer.toRoutingNumber && (
            <Line
              label="Routing"
              mono
              value={transfer.toRoutingNumber}
            />
          )}
        </Card>
      </div>

      {/* Details */}
      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          border: "1px solid #E2E8F0",
        }}
      >
        <Line label="Method" value={METHOD_LABEL[transfer.method] ?? transfer.method} />
        <Line label="Initiated" value={fmtDateTime(initiated)} />
        {completed && (
          <Line label="Completed" value={fmtDateTime(completed)} />
        )}
        <Line
          label="Estimated settlement"
          value={
            transfer.method === "internal" || transfer.method === "zelle"
              ? fmtDateTime(settle)
              : fmtDateOnly(settle)
          }
        />
        {transfer.memo && <Line label="Memo" value={transfer.memo} />}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 16,
          borderTop: "1px dashed #CBD5E1",
          fontSize: 10,
          color: "#64748B",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        Paxnova Trust Bank · 1 World Trade Center, New York, NY 10007 · Equal
        Housing Lender · Member FDIC · This receipt is your record of the
        transaction. Retain for your files. Funds availability subject to our
        deposit agreement.
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
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid #E2E8F0",
        background: "white",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#64748B",
          letterSpacing: 1.4,
          textTransform: "uppercase",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Line({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "5px 0",
        fontSize: 13,
        gap: 12,
      }}
    >
      <span style={{ color: "#64748B", fontSize: 11 }}>{label}</span>
      <span
        style={{
          textAlign: "right",
          fontFamily: mono
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : "inherit",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ---------- Formatting helpers --------------------------------------------

function fmtMoney(n: number, code: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDateTime(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

function fmtDateOnly(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

// ---------- JPEG export ---------------------------------------------------
// Uses SVG <foreignObject> to render the DOM into an image without any deps.
// Works for inline-styled content (which is why the receipt body uses
// inline styles only).

async function receiptToJpegBlob(node: HTMLElement): Promise<Blob> {
  const rect = node.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(node.scrollHeight);
  const scale = 2; // hi-DPI

  // Serialize the node to XHTML.
  const clone = node.cloneNode(true) as HTMLElement;
  // Strip any <style> tags inside that would confuse the SVG.
  clone.querySelectorAll("style").forEach((el) => el.remove());

  const xhtml = new XMLSerializer().serializeToString(clone);

  // Wrap in a fully-namespaced SVG.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;">${xhtml}</div>
      </foreignObject>
    </svg>
  `.trim();

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    // White background so the JPEG isn't transparent-ish black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        0.95
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
