"use client";

// Client-side jspdf builder for a bill-payment receipt. Same lazy-load
// pattern as wire-pdf so the bundle is only paid when the customer
// actually clicks "Download PDF" on the receipt page.

export type BillPdfInput = {
  referenceNumber: string;
  amount: number;
  currency: string; // ISO 4217 of the source account
  status: "scheduled" | "paid" | "failed" | "cancelled";
  memo: string | null;
  scheduledDate: number; // epoch ms
  createdAt: number; // epoch ms
  customerName: string;
  customerEmail: string;
  fromAccountName: string;
  fromAccountNumber: string;
  fromAccountType: string;
  payeeName: string;
  payeeNickname: string | null;
  payeeAccountNumber: string;
  payeeCategory: string | null;
  payeeBank: string | null;
  payeeRoutingNumber: string | null;
};

function fmt(n: number, code: string = "USD"): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtDateTime(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function maskAccount(n: string): string {
  if (!n) return "—";
  return "•••• " + n.slice(-4);
}

// ──────────────────────────────────────────────────────────────────────
// Build the PDF as a Blob the caller can save to disk.
// ──────────────────────────────────────────────────────────────────────

export async function buildBillPaymentPdf(
  input: BillPdfInput,
): Promise<Blob> {
  // Lazy import — jspdf is heavy (~200KB) and we don't want to pay for it
  // on the receipt page until the user actually requests a download.
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  // ── Header band (navy) ──────────────────────────────────────────────
  doc.setFillColor(10, 26, 60); // navy-900
  doc.rect(0, 0, pageWidth, 110, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Paxnova Trust", margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(232, 199, 106); // gold
  doc.text("PAYMENT RECEIPT", pageWidth - margin, 40, { align: "right" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(input.referenceNumber, pageWidth - margin, 58, { align: "right" });

  doc.setFontSize(8);
  // Soft white via lighter gray so it still reads on the navy band.
  doc.setTextColor(200, 200, 210);
  doc.text(
    "Member FDIC · NMLS #2026-NT",
    pageWidth - margin,
    74,
    { align: "right" },
  );

  doc.setTextColor(0, 0, 0);

  // ── Hero amount ─────────────────────────────────────────────────────
  let y = 150;
  const statusLabel = input.status.toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(110, 63, 243);
  doc.text(statusLabel, pageWidth / 2, y, { align: "center" });

  y += 22;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(36);
  doc.text(fmt(input.amount, input.currency), pageWidth / 2, y, {
    align: "center",
  });

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 90);
  const dateLabel =
    input.status === "paid"
      ? `Paid on ${fmtDate(input.scheduledDate)}`
      : input.status === "scheduled"
        ? `Scheduled for ${fmtDate(input.scheduledDate)}`
        : input.status === "failed"
          ? `Failed on ${fmtDate(input.scheduledDate)}`
          : "Cancelled";
  doc.text(dateLabel, pageWidth / 2, y, { align: "center" });

  // ── From / To columns ───────────────────────────────────────────────
  y += 36;
  doc.setDrawColor(220, 220, 230);
  doc.line(margin, y, pageWidth - margin, y);

  y += 22;
  const colWidth = contentWidth / 2;
  const fromX = margin;
  const toX = margin + colWidth + 12;

  // Section labels
  doc.setTextColor(110, 63, 243);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FROM", fromX, y);
  doc.text("TO", toX, y);

  y += 16;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.text(input.customerName || "—", fromX, y);
  doc.text(input.payeeNickname ?? input.payeeName, toX, y);

  if (input.payeeNickname && input.payeeName) {
    y += 12;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    doc.text(input.customerEmail, fromX, y);
    doc.text(input.payeeName, toX, y);
  } else {
    y += 12;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    doc.text(input.customerEmail, fromX, y);
  }

  // Detail rows
  y += 18;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const lineGap = 14;
  const drawRow = (
    label: string,
    valueFrom: string,
    valueTo: string,
    yAt: number,
  ) => {
    doc.setTextColor(120, 120, 130);
    doc.text(label, fromX, yAt);
    doc.text(label, toX, yAt);
    doc.setTextColor(0, 0, 0);
    doc.text(valueFrom, fromX + colWidth - 8, yAt, { align: "right" });
    doc.text(valueTo, toX + colWidth - 8, yAt, { align: "right" });
  };

  drawRow(
    "Account",
    input.fromAccountName || "—",
    input.payeeAccountNumber || "—",
    y,
  );
  y += lineGap;
  drawRow(
    "Number",
    maskAccount(input.fromAccountNumber),
    input.payeeCategory ?? "—",
    y,
  );
  y += lineGap;
  drawRow(
    "Bank",
    "Paxnova Trust Bank, N.A.",
    input.payeeBank ?? "—",
    y,
  );

  if (input.payeeRoutingNumber) {
    y += lineGap;
    drawRow("Routing", "021000021", input.payeeRoutingNumber, y);
  }

  // ── Meta block ──────────────────────────────────────────────────────
  y += 28;
  doc.setDrawColor(220, 220, 230);
  doc.line(margin, y, pageWidth - margin, y);

  y += 22;
  const metaColWidth = contentWidth / 3;
  const drawMeta = (
    label: string,
    value: string,
    x: number,
    yAt: number,
  ) => {
    doc.setTextColor(120, 120, 130);
    doc.setFontSize(7);
    doc.text(label, x, yAt);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(value, x, yAt + 12);
  };
  drawMeta("REFERENCE NUMBER", input.referenceNumber, margin, y);
  drawMeta(
    "SUBMITTED",
    fmtDateTime(input.createdAt),
    margin + metaColWidth,
    y,
  );
  drawMeta(
    input.status === "scheduled" ? "SCHEDULED FOR" : "PAYMENT DATE",
    fmtDate(input.scheduledDate),
    margin + metaColWidth * 2,
    y,
  );

  // ── Memo (optional) ─────────────────────────────────────────────────
  if (input.memo) {
    y += 38;
    doc.setFillColor(244, 245, 251);
    doc.roundedRect(margin, y, contentWidth, 36, 6, 6, "F");
    doc.setTextColor(110, 63, 243);
    doc.setFontSize(7);
    doc.text("MEMO", margin + 12, y + 14);
    doc.setTextColor(40, 40, 50);
    doc.setFontSize(10);
    const memoLines = doc.splitTextToSize(input.memo, contentWidth - 24);
    doc.text(memoLines, margin + 12, y + 28);
    y += 44;
  }

  // ── Footer ──────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor(220, 220, 230);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 130);
  doc.text(
    "Keep this receipt for your records. The reference number above is required for any disputes or inquiries.",
    margin,
    footerY,
    { maxWidth: contentWidth },
  );
  doc.text(
    "Paxnova Trust Bank, N.A. · 1000 N Point St, San Francisco, CA 94109 · 1-800-PAXNOVA-1 · Member FDIC",
    margin,
    footerY + 22,
    { maxWidth: contentWidth },
  );

  return doc.output("blob");
}
