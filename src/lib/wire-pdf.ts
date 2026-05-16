"use client";

// Client-only PDF builders for an approved wire slip and a rejection
// receipt. Both lazy-load jspdf so the bundle isn't paid on the page that
// just lists wires.

export type WirePdfInput = {
  referenceNumber: string;
  amount: number;
  fee: number;
  currency: string; // ISO 4217 code of the source account
  wireDate: number; // epoch ms
  scheduledAt: number; // epoch ms — when user submitted
  reviewedAt: number | null; // epoch ms — when admin acted
  reviewerName: string | null;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
  // Sender
  fromAccountName: string;
  fromAccountNumber: string; // full — masked in PDF
  fromBankName: string; // Paxnova Trust Bank
  fromRoutingNumber: string;
  // Recipient
  recipientName: string;
  recipientNickname: string | null;
  recipientBank: string;
  recipientBankRouting: string;
  recipientBankCountry: string;
  recipientBankAddress: string | null;
  recipientAccountNumber: string;
  recipientAddress: string | null;
  // Messages
  messageToBank: string | null;
  messageToRecipient: string | null;
  memo: string | null;
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
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function maskAcct(full: string): string {
  return full.length >= 4 ? `•••• ${full.slice(-4)}` : full;
}

export async function buildWireSlipPdf(input: WirePdfInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  const isApproved = input.status === "approved";

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Paxnova Trust Bank", margin, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("Member FDIC · Routing 026013577", margin, 76);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(isApproved ? 0 : 200);
  doc.text(
    isApproved
      ? "Outgoing Wire Transfer · Approved"
      : "Outgoing Wire Transfer · Declined",
    pageWidth - margin,
    60,
    { align: "right" }
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(
    `Reference ${input.referenceNumber}`,
    pageWidth - margin,
    76,
    { align: "right" }
  );

  doc.setDrawColor(220);
  doc.line(margin, 92, pageWidth - margin, 92);

  // Status banner
  const bannerY = 108;
  if (isApproved) {
    doc.setFillColor(232, 248, 240);
    doc.roundedRect(margin, bannerY, pageWidth - margin * 2, 36, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 120, 60);
    doc.text(
      "APPROVED — released to the wire network",
      margin + 14,
      bannerY + 23
    );
  } else {
    doc.setFillColor(254, 232, 232);
    doc.roundedRect(margin, bannerY, pageWidth - margin * 2, 36, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(190, 30, 30);
    doc.text(
      "REJECTED — wire not sent",
      margin + 14,
      bannerY + 23
    );
  }

  // Two-column summary
  let y = bannerY + 64;
  doc.setTextColor(0);

  function section(title: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(title.toUpperCase(), margin, y);
    y += 16;
    doc.setDrawColor(230);
    doc.line(margin, y - 6, pageWidth - margin, y - 6);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  }

  function kv(label: string, value: string, bold?: boolean) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(label, margin, y);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(0);
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 18;
  }

  section("Sender");
  kv("Account holder", input.fromAccountName);
  kv("Account number", maskAcct(input.fromAccountNumber));
  kv("Bank", input.fromBankName);
  kv("Routing (ABA)", input.fromRoutingNumber);

  y += 8;
  section("Beneficiary");
  kv(
    "Name",
    input.recipientNickname
      ? `${input.recipientName} (${input.recipientNickname})`
      : input.recipientName
  );
  kv("Account number", maskAcct(input.recipientAccountNumber));
  kv("Bank", input.recipientBank);
  kv("Bank routing / SWIFT", input.recipientBankRouting);
  kv("Bank country", input.recipientBankCountry);
  if (input.recipientBankAddress)
    kv("Bank address", input.recipientBankAddress);
  if (input.recipientAddress)
    kv("Recipient address", input.recipientAddress);

  y += 8;
  section("Amount");
  kv("Wire amount", fmt(input.amount, input.currency));
  kv("Outgoing wire fee", fmt(input.fee, input.currency));
  kv("Total debited", fmt(input.amount + input.fee, input.currency), true);

  if (
    input.messageToBank ||
    input.messageToRecipient ||
    input.memo
  ) {
    y += 8;
    section("Messages");
    if (input.messageToBank)
      kv("To recipient bank", input.messageToBank);
    if (input.messageToRecipient)
      kv("To recipient", input.messageToRecipient);
    if (input.memo) kv("Memo (sender)", input.memo);
  }

  y += 8;
  section("Lifecycle");
  kv("Submitted", fmtDate(input.scheduledAt));
  kv("Wire date", fmtDate(input.wireDate));
  if (input.reviewedAt) {
    kv(
      isApproved ? "Approved" : "Rejected",
      `${fmtDate(input.reviewedAt)}${
        input.reviewerName ? ` by ${input.reviewerName}` : ""
      }`
    );
  }

  if (!isApproved && input.rejectionReason) {
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(190, 30, 30);
    doc.text("Reason for decline", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(
      input.rejectionReason,
      pageWidth - margin * 2
    );
    doc.text(lines, margin, y);
    y += lines.length * 14;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 36;
  doc.setDrawColor(230);
  doc.line(margin, footerY - 14, pageWidth - margin, footerY - 14);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    isApproved
      ? "This wire slip confirms the bank's authorization. Settlement may take up to 5 business days."
      : "This receipt confirms that the wire was not sent. No funds left your account.",
    margin,
    footerY
  );
  doc.text(
    "Paxnova Trust Bank · Member FDIC",
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  return doc.output("blob");
}

export function downloadWirePdf(input: WirePdfInput): Promise<void> {
  return buildWireSlipPdf(input).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeRef = input.referenceNumber.replace(/[^A-Za-z0-9_-]/g, "_");
    a.download = `paxnovatrust-wire-${input.status}-${safeRef}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}
