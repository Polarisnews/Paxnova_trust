import { db } from "./index";
import {
  accounts,
  applications,
  billPayments,
  cards,
  passwordResetTokens,
  payees,
  recipientGroups,
  scheduledWires,
  transactions,
  users,
  wireRecipients,
} from "./schema";
import { generateAccountNumber, generateReferenceNumber, hashPassword } from "../lib/password";

async function seed() {
  console.log("⌁ Seeding Paxnova Trust database…");

  // Clear tables (order matters for FK constraints)
  db.delete(passwordResetTokens).run();
  db.delete(scheduledWires).run();
  db.delete(wireRecipients).run();
  db.delete(recipientGroups).run();
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
      username: "admin",
      email: "admin@paxnovatrust.test",
      passwordHash: adminPwHash,
      firstName: "Avery",
      lastName: "Sterling",
      phone: "+1 (212) 555-0100",
      role: "admin",
    })
    .returning()
    .all();

  const demoSsnHash = await hashPassword("123456789");
  const [demo] = db
    .insert(users)
    .values({
      username: "demo",
      email: "demo@paxnovatrust.test",
      passwordHash: demoPwHash,
      firstName: "Jordan",
      middleName: "Riley",
      lastName: "Hayes",
      phone: "(212) 555-0188",
      phoneType: "mobile",
      dateOfBirth: "1991-04-12",
      ssnLast4: "6789",
      ssnHash: demoSsnHash,
      citizenshipStatus: "us-citizen",
      countryOfCitizenship: "US",
      streetAddress: "55 Hudson Yards",
      addressLine2: "Apt 18C",
      city: "New York",
      stateRegion: "NY",
      postalCode: "10001",
      country: "US",
      yearsAtAddress: 3,
      housingStatus: "rent",
      monthlyHousingPayment: 3200,
      idType: "drivers-license",
      idNumber: "D88-1234-5678-9012",
      idIssuingState: "NY",
      idExpirationDate: "2030-04-12",
      employmentStatus: "employed",
      occupation: "Product designer",
      employerName: "Helio Labs Inc",
      annualIncome: "100k-150k",
      sourceOfFunds: "employment",
      intendedUseOfAccount: "daily-banking",
      maritalStatus: "single",
      kycStatus: "verified",
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
    { accountId: savings.id, type: "credit", amount: 101.45, description: "Interest paid", category: "Interest", counterparty: "Paxnova Trust", daysAgo: 15 },
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

  // --- SAMPLE APPLICATIONS ----------------------------------------
  const sampleKyc = {
    firstName: "Morgan",
    middleName: "",
    lastName: "Ito",
    suffix: "",
    dateOfBirth: "1988-09-21",
    ssnLast4: "4321",
    citizenshipStatus: "us-citizen",
    countryOfCitizenship: "US",
    email: "morgan.ito@example.com",
    phone: "(415) 555-0144",
    streetAddress: "1700 Market Street",
    addressLine2: "Suite 1404",
    city: "San Francisco",
    stateRegion: "CA",
    postalCode: "94103",
    employmentStatus: "employed",
    occupation: "Software engineer",
    employerName: "Helio Labs Inc",
    annualIncome: "150k-250k",
    sourceOfFunds: "employment",
  };
  const nowIso = new Date().toISOString();

  db.insert(applications)
    .values({
      userId: null,
      product: "checking",
      status: "pending",
      applicantName: "Morgan Ito",
      applicantEmail: "morgan.ito@example.com",
      applicantPhone: "(415) 555-0144",
      fundingAmount: 500,
      fundingSource: "external-bank",
      referenceNumber: generateReferenceNumber(),
      data: JSON.stringify({
        kyc: sampleKyc,
        product: {
          fundingAmount: 500,
          fundingSource: "external-bank",
          intendedUseOfAccount: "daily-banking",
          expectedMonthlyDeposits: "10k-25k",
        },
        consent: {
          termsAt: nowIso,
          esignAt: nowIso,
          patriotAt: nowIso,
          creditPullAt: nowIso,
        },
      }),
    })
    .run();

  db.insert(applications)
    .values({
      userId: null,
      product: "business",
      status: "pending",
      applicantName: "Casey Ortega",
      applicantEmail: "casey@brightline.co",
      applicantPhone: "(206) 555-0177",
      fundingAmount: 5000,
      fundingSource: "external-bank",
      referenceNumber: generateReferenceNumber(),
      data: JSON.stringify({
        kyc: {
          ...sampleKyc,
          firstName: "Casey",
          lastName: "Ortega",
          dateOfBirth: "1985-03-08",
          email: "casey@brightline.co",
          phone: "(206) 555-0177",
          city: "Seattle",
          stateRegion: "WA",
          postalCode: "98101",
          streetAddress: "1201 3rd Ave",
        },
        product: {
          legalName: "Brightline Studio LLC",
          dba: "Brightline",
          ein: "453892017",
          entityType: "llc-multi",
          stateOfFormation: "WA",
          dateOfFormation: "2021-07-15",
          industry: "tech",
          naicsCode: "541511",
          annualRevenue: "250k-500k",
          numEmployees: 8,
          businessAddress: "1201 3rd Ave, Floor 8",
          businessCity: "Seattle",
          businessState: "WA",
          businessZip: "98101",
          businessPhone: "(206) 555-0177",
          businessWebsite: "https://brightline.co",
          controlPersonName: "Casey Ortega",
          controlPersonTitle: "Managing Member",
          controlPersonDob: "1985-03-08",
          controlPersonSsn: "•••••4321",
          beneficialOwners: [
            {
              name: "Casey Ortega",
              dateOfBirth: "1985-03-08",
              ssn: "•••••4321",
              ownershipPct: 55,
              address: "1201 3rd Ave #1404, Seattle, WA 98101",
              title: "Managing Member",
            },
            {
              name: "Priya Shah",
              dateOfBirth: "1987-11-02",
              ssn: "•••••9988",
              ownershipPct: 45,
              address: "500 Yale Ave N #210, Seattle, WA 98109",
              title: "Member",
            },
          ],
        },
        consent: {
          termsAt: nowIso,
          esignAt: nowIso,
          patriotAt: nowIso,
          creditPullAt: nowIso,
        },
      }),
    })
    .run();

  console.log("✓ Seeded.");
  console.log("  Admin login : admin / Admin123!");
  console.log("  User login  : demo  / Demo123!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
