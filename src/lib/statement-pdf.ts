"use client";

// Client-only PDF builder. Loaded lazily inside the click handler so the
// jspdf bundle never lands in the initial server-rendered statements page.

import type { jsPDF as JsPdfType } from "jspdf";

export type StatementTxn = {
  createdAt: number; // epoch ms
  type: "debit" | "credit";
  amount: number;
  description: string;
  balanceAfter: number;
};

export type StatementInput = {
  accountName: string;
  accountNumber: string; // full — will be masked in the PDF
  accountType: string;
  accountCurrency: string; // ISO 4217 code
  routingNumber: string;
  period: { year: number; month: number }; // 1-indexed month
  openingBalance: number;
  closingBalance: number;
  transactions: StatementTxn[]; // already filtered to the period, oldest-first
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fmt(n: number, code: string = "USD"): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskAcct(full: string): string {
  return full.length >= 4 ? `•••• ${full.slice(-4)}` : full;
}

export async function buildStatementPdf(input: StatementInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc: JsPdfType = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  // Header — Paxnova Trust mark + statement title.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Paxnova Trust Bank", margin, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("Member FDIC", margin, 76);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text("Monthly Statement", pageWidth - margin, 60, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(
    `${MONTH_NAMES[input.period.month - 1]} ${input.period.year}`,
    pageWidth - margin,
    76,
    { align: "right" }
  );

  // Account block
  doc.setDrawColor(220);
  doc.line(margin, 92, pageWidth - margin, 92);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(input.accountName, margin, 116);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(
    `${input.accountType.charAt(0).toUpperCase()}${input.accountType.slice(1)} · ${maskAcct(input.accountNumber)} · Routing ${input.routingNumber}`,
    margin,
    132
  );

  // Summary cells
  const totalCredits = input.transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalDebits = input.transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);

  const summary = [
    { label: "Opening balance", value: input.openingBalance },
    { label: "Total credits", value: totalCredits },
    { label: "Total debits", value: -totalDebits },
    { label: "Closing balance", value: input.closingBalance, bold: true },
  ];

  const cellW = (pageWidth - margin * 2) / 4;
  let y = 160;
  summary.forEach((s, i) => {
    const x = margin + cellW * i;
    doc.setDrawColor(230);
    doc.setFillColor(248);
    doc.roundedRect(x, y, cellW - 8, 60, 6, 6, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(s.label.toUpperCase(), x + 12, y + 18);
    doc.setFont("helvetica", s.bold ? "bold" : "normal");
    doc.setFontSize(s.bold ? 12 : 11);
    doc.setTextColor(0);
    doc.text(fmt(s.value, input.accountCurrency), x + 12, y + 42);
  });

  // Transactions table
  const startY = y + 80;
  autoTable(doc, {
    startY,
    margin: { left: margin, right: margin },
    head: [["Date", "Description", "Debit", "Credit", "Balance"]],
    body: input.transactions.map((t) => {
      const date = new Date(t.createdAt);
      return [
        `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        t.description,
        t.type === "debit" ? fmt(t.amount, input.accountCurrency) : "",
        t.type === "credit" ? fmt(t.amount, input.accountCurrency) : "",
        fmt(t.balanceAfter, input.accountCurrency),
      ];
    }),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: {
      fillColor: [30, 27, 75], // navy
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 60 },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    alternateRowStyles: { fillColor: [248, 248, 250] },
    didDrawPage: () => {
      const total = doc.getNumberOfPages();
      const current = doc.getCurrentPageInfo().pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140);
      doc.text(
        `Page ${current} of ${total}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 24,
        { align: "right" }
      );
      doc.text(
        "Statements are for informational purposes. Contact Paxnova Trust within 60 days to dispute a transaction.",
        margin,
        doc.internal.pageSize.getHeight() - 24
      );
    },
  });

  return doc.output("blob");
}

export function downloadStatementPdf(input: StatementInput) {
  return buildStatementPdf(input).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = input.accountName.replace(/\s+/g, "-");
    a.download = `paxnovatrust-${safeName}-${input.period.year}-${String(
      input.period.month
    ).padStart(2, "0")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}
