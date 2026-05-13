import { db } from "./index";
import {
  accounts,
  applications,
  billPayments,
  cards,
  payees,
  transactions,
  users,
} from "./schema";
import { generateAccountNumber, generateReferenceNumber, hashPassword } from "../lib/password";

async function seed() {
  console.log("⌁ Seeding Nova Trust database…");

  // Clear tables (order matters for FK constraints)
  db.delete(billPayments).run();
  db.delete(transactions).run();
  db.delete(cards).run();
  db.delete(payees).run();
  db.delete(applications).run();
  db.delete(accounts).run();
  db.delete(users).run();

  const adminPwHash = await hashPassword("Admin123!");
  const demoPwHash = await hashPassword("Demo123!");

  // --- USERS -------------------------------------------------------
  const [admin] = db
    .insert(users)
    .values({
      email: "admin@nova.test",
      passwordHash: adminPwHash,
      firstName: "Avery",
      lastName: "Sterling",
      phone: "+1 (212) 555-0100",
      role: "admin",
    })
    .returning()
    .all();

  const [demo] = db
    .insert(users)
    .values({
      email: "demo@nova.test",
      passwordHash: demoPwHash,
      firstName: "Jordan",
      lastName: "Hayes",
      phone: "+1 (212) 555-0188",
      role: "user",
    })
    .returning()
    .all();

  // --- ACCOUNTS ----------------------------------------------------
  const [checking] = db
    .insert(accounts)
    .values({
      userId: demo.id,
      type: "checking",
      name: "Apex Checking",
      accountNumber: generateAccountNumber(),
      balance: 8432.1,
      apy: 0.5,
    })
    .returning()
    .all();

  const [savings] = db
    .insert(accounts)
    .values({
      userId: demo.id,
      type: "savings",
      name: "Reserve High-Yield Savings",
      accountNumber: generateAccountNumber(),
      balance: 24910.55,
      apy: 4.85,
    })
    .returning()
    .all();

  const [credit] = db
    .insert(accounts)
    .values({
      userId: demo.id,
      type: "credit",
      name: "Signature Rewards",
      accountNumber: generateAccountNumber(),
      balance: -1204.33,
      creditLimit: 15000,
    })
    .returning()
    .all();

  // --- TRANSACTIONS ------------------------------------------------
  const txSeed: Array<{
    accountId: number;
    type: "debit" | "credit";
    amount: number;
    description: string;
    category?: string;
    counterparty?: string;
    daysAgo: number;
  }> = [
    { accountId: checking.id, type: "credit", amount: 4250.0, description: "Direct deposit — Helio Labs", category: "Income", counterparty: "Helio Labs Inc", daysAgo: 1 },
    { accountId: checking.id, type: "debit", amount: 32.5, description: "Blue Bottle Coffee", category: "Food & drink", counterparty: "Blue Bottle", daysAgo: 1 },
    { accountId: checking.id, type: "debit", amount: 128.4, description: "Whole Foods Market", category: "Groceries", counterparty: "Whole Foods", daysAgo: 2 },
    { accountId: checking.id, type: "debit", amount: 1850.0, description: "Rent — March", category: "Housing", counterparty: "Lakeview Holdings", daysAgo: 3 },
    { accountId: checking.id, type: "debit", amount: 14.99, description: "Spotify Premium", category: "Subscriptions", counterparty: "Spotify", daysAgo: 4 },
    { accountId: checking.id, type: "credit", amount: 250.0, description: "Zelle from Riley K.", category: "Transfer", counterparty: "Riley K.", daysAgo: 5 },
    { accountId: checking.id, type: "debit", amount: 62.0, description: "Lyft ride", category: "Transportation", counterparty: "Lyft", daysAgo: 6 },
    { accountId: checking.id, type: "debit", amount: 220.5, description: "Con Edison — electricity", category: "Utilities", counterparty: "Con Edison", daysAgo: 7 },
    { accountId: savings.id, type: "credit", amount: 500.0, description: "Recurring transfer from Checking", category: "Transfer", counterparty: "Apex Checking", daysAgo: 1 },
    { accountId: savings.id, type: "credit", amount: 101.45, description: "Interest paid", category: "Interest", counterparty: "Nova Trust", daysAgo: 15 },
    { accountId: savings.id, type: "credit", amount: 500.0, description: "Recurring transfer from Checking", category: "Transfer", counterparty: "Apex Checking", daysAgo: 31 },
    { accountId: credit.id, type: "debit", amount: 89.0, description: "Amazon.com", category: "Shopping", counterparty: "Amazon", daysAgo: 2 },
    { accountId: credit.id, type: "debit", amount: 320.45, description: "Delta Air Lines", category: "Travel", counterparty: "Delta", daysAgo: 4 },
    { accountId: credit.id, type: "debit", amount: 142.0, description: "REI — Outdoor gear", category: "Shopping", counterparty: "REI", daysAgo: 6 },
    { accountId: credit.id, type: "credit", amount: 500.0, description: "Payment from Checking", category: "Payment", counterparty: "Apex Checking", daysAgo: 9 },
  ];

  for (const t of txSeed) {
    const acct = [checking, savings, credit].find((a) => a.id === t.accountId)!;
    const createdAt = new Date(Date.now() - t.daysAgo * 24 * 60 * 60 * 1000);
    db.insert(transactions)
      .values({
        accountId: t.accountId,
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.category,
        counterparty: t.counterparty,
        balanceAfter: acct.balance,
        createdAt,
      })
      .run();
  }

  // --- PAYEES ------------------------------------------------------
  const [conEd] = db
    .insert(payees)
    .values({
      userId: demo.id,
      name: "Con Edison",
      nickname: "Electricity",
      accountNumber: "880-44-12039",
      category: "Utilities",
    })
    .returning()
    .all();

  db.insert(payees)
    .values({
      userId: demo.id,
      name: "Verizon",
      nickname: "Phone & Internet",
      accountNumber: "VZ-50231-A",
      category: "Utilities",
    })
    .run();

  // --- BILL PAYMENT ------------------------------------------------
  db.insert(billPayments)
    .values({
      userId: demo.id,
      payeeId: conEd.id,
      fromAccountId: checking.id,
      amount: 220.5,
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "scheduled",
      memo: "April bill",
    })
    .run();

  // --- CARDS -------------------------------------------------------
  db.insert(cards)
    .values({
      accountId: checking.id,
      userId: demo.id,
      brand: "visa",
      cardType: "debit",
      lastFour: "4421",
      cardHolder: "JORDAN HAYES",
      expiryMonth: 8,
      expiryYear: 2029,
      spendLimit: 5000,
    })
    .run();

  db.insert(cards)
    .values({
      accountId: credit.id,
      userId: demo.id,
      brand: "mastercard",
      cardType: "credit",
      lastFour: "8132",
      cardHolder: "JORDAN HAYES",
      expiryMonth: 3,
      expiryYear: 2030,
      spendLimit: 15000,
    })
    .run();

  // --- SAMPLE APPLICATION (pending) -------------------------------
  db.insert(applications)
    .values({
      userId: null,
      product: "checking",
      status: "pending",
      applicantName: "Morgan Ito",
      applicantEmail: "morgan.ito@example.com",
      applicantPhone: "+1 (415) 555-0144",
      fundingAmount: 500,
      fundingSource: "external-bank",
      referenceNumber: generateReferenceNumber(),
    })
    .run();

  console.log("✓ Seeded.");
  console.log("  Admin login : admin@nova.test / Admin123!");
  console.log("  User login  : demo@nova.test  / Demo123!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
