import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  // Legal name (CIP §326 USA PATRIOT Act)
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  suffix: text("suffix"),

  // Contact
  phone: text("phone"),
  phoneType: text("phone_type", { enum: ["mobile", "home", "work"] }),

  // CIP §326: DOB + Taxpayer ID
  dateOfBirth: text("date_of_birth"), // ISO YYYY-MM-DD
  ssnLast4: text("ssn_last4"), // last 4 digits, surfaced in admin
  ssnHash: text("ssn_hash"), // bcrypt of full SSN, never returned to client

  // Citizenship & tax status (FATCA / W-9 / W-8BEN)
  citizenshipStatus: text("citizenship_status", {
    enum: ["us-citizen", "permanent-resident", "non-resident-alien"],
  }),
  countryOfCitizenship: text("country_of_citizenship"), // ISO-2
  countryOfBirth: text("country_of_birth"), // ISO-2

  // Residential address (CIP §326 — must be a street address, not P.O. box)
  streetAddress: text("street_address"),
  addressLine2: text("address_line2"),
  city: text("city"),
  stateRegion: text("state_region"), // US state code or province
  postalCode: text("postal_code"),
  country: text("country").default("US"), // ISO-2
  yearsAtAddress: integer("years_at_address"),
  housingStatus: text("housing_status", {
    enum: ["own", "rent", "live-with-family", "other"],
  }),
  monthlyHousingPayment: real("monthly_housing_payment"),

  // Government-issued ID (CIP verification — documentary method)
  idType: text("id_type", {
    enum: ["drivers-license", "state-id", "passport", "permanent-resident-card", "military-id"],
  }),
  idNumber: text("id_number"),
  idIssuingState: text("id_issuing_state"), // for DL / state ID
  idIssuingCountry: text("id_issuing_country"), // for passport
  idIssueDate: text("id_issue_date"), // ISO YYYY-MM-DD
  idExpirationDate: text("id_expiration_date"), // ISO YYYY-MM-DD

  // Employment & financial profile (BSA / AML / Reg Z)
  employmentStatus: text("employment_status", {
    enum: ["employed", "self-employed", "retired", "student", "unemployed", "homemaker"],
  }),
  occupation: text("occupation"),
  employerName: text("employer_name"),
  employerYears: integer("employer_years"),
  annualIncome: text("annual_income"), // bracket string e.g. "75k-100k"
  sourceOfFunds: text("source_of_funds"), // employment / business / inheritance / etc
  intendedUseOfAccount: text("intended_use"),
  expectedMonthlyDeposits: text("expected_monthly_deposits"), // bracket
  maritalStatus: text("marital_status", {
    enum: ["single", "married", "divorced", "widowed", "domestic-partner", "separated"],
  }),
  numDependents: integer("num_dependents"),

  // Risk / regulatory
  isPep: integer("is_pep", { mode: "boolean" }).default(false), // politically exposed person
  isInsider: integer("is_insider", { mode: "boolean" }).default(false), // related to financial industry insider

  // Consent receipts (E-SIGN Act + Patriot Act notice)
  agreedTermsAt: integer("agreed_terms_at", { mode: "timestamp" }),
  agreedEsignAt: integer("agreed_esign_at", { mode: "timestamp" }),
  agreedPatriotNoticeAt: integer("agreed_patriot_at", { mode: "timestamp" }),
  certifiedW9At: integer("certified_w9_at", { mode: "timestamp" }),

  // KYC status — for admin to track verification state
  kycStatus: text("kyc_status", {
    enum: ["pending", "verified", "review", "rejected"],
  })
    .notNull()
    .default("pending"),

  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),

  // Brute-force protection — tracked in the DB so it survives process restarts.
  // Cleared on a successful login.
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  lastFailedLoginAt: integer("last_failed_login_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Append-only audit log of security-relevant actions: sign-in success/failure,
 * lockout, password reset, admin actions, card reveal, etc.
 *
 * Intentionally separate from application logs — never reads from this table
 * are part of a user-facing flow, so it can grow without affecting UX.
 */
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // e.g. "login.success", "login.fail", "login.lockout", "card.reveal", "admin.approve_application"
  outcome: text("outcome", { enum: ["success", "failure", "blocked"] })
    .notNull()
    .default("success"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  // Arbitrary structured context as JSON. Don't store secrets here.
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["checking", "savings", "credit", "business"] }).notNull(),
  name: text("name").notNull(),
  accountNumber: text("account_number").notNull().unique(),
  routingNumber: text("routing_number").notNull().default("026013577"),
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  creditLimit: real("credit_limit"),
  apy: real("apy"),
  status: text("status", {
    enum: ["active", "pending", "frozen", "closed", "code", "custom"],
  })
    .notNull()
    .default("active"),
  // Compliance-gate codes (admin-controlled). Both are nullable until admin
  // generates them via the "Code" status panel.
  tcvCode: text("tcv_code"),
  amlCode: text("aml_code"),
  tcvCodeGeneratedAt: integer("tcv_code_generated_at", { mode: "timestamp" }),
  amlCodeGeneratedAt: integer("aml_code_generated_at", { mode: "timestamp" }),
  // Single custom interrupt message shown when status == "custom".
  customMessage: text("custom_message"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["debit", "credit"] }).notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  counterparty: text("counterparty"),
  counterpartyBank: text("counterparty_bank"),
  counterpartyAccountNumber: text("counterparty_account_number"),
  remark: text("remark"),
  // Links a ledger entry to its originating transfer / scheduled wire.
  referenceNumber: text("reference_number"),
  balanceAfter: real("balance_after").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const payees = sqliteTable("payees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nickname: text("nickname"),
  accountNumber: text("account_number").notNull(),
  category: text("category"),
  // Enhanced fields for real-world payee/recipient management
  payeeType: text("payee_type", {
    enum: ["person", "business", "utility", "external-bank"],
  }).default("business"),
  bankName: text("bank_name"),
  routingNumber: text("routing_number"),
  accountType: text("account_type", {
    enum: ["checking", "savings"],
  }),
  email: text("email"),
  phone: text("phone"),
  preferredMethod: text("preferred_method", {
    enum: ["zelle", "ach", "wire"],
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const transfers = sqliteTable("transfers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  referenceNumber: text("reference_number").notNull().unique(),
  fromAccountId: integer("from_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  toType: text("to_type", { enum: ["own", "payee"] }).notNull(),
  toAccountId: integer("to_account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  toPayeeId: integer("to_payee_id").references(() => payees.id, {
    onDelete: "set null",
  }),
  transferMethod: text("transfer_method", {
    enum: ["internal", "zelle", "ach", "wire"],
  }).notNull(),
  amount: real("amount").notNull(),
  fee: real("fee").notNull().default(0),
  memo: text("memo"),
  status: text("status", {
    enum: [
      "processing",
      "completed",
      "failed",
      "pending_tcv",
      "pending_aml",
      "interrupted_custom",
      "rejected_frozen",
    ],
  })
    .notNull()
    .default("processing"),
  interruptMessage: text("interrupt_message"),
  tcvVerifiedAt: integer("tcv_verified_at", { mode: "timestamp" }),
  amlVerifiedAt: integer("aml_verified_at", { mode: "timestamp" }),
  fromAccountName: text("from_account_name").notNull(),
  fromAccountLast4: text("from_account_last4").notNull(),
  toAccountName: text("to_account_name").notNull(),
  toAccountLast4: text("to_account_last4").notNull(),
  toBankName: text("to_bank_name"),
  toRoutingNumber: text("to_routing_number"),
  initiatedAt: integer("initiated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  estimatedSettlement: integer("estimated_settlement", { mode: "timestamp" })
    .notNull(),
});

export const billPayments = sqliteTable("bill_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  payeeId: integer("payee_id")
    .notNull()
    .references(() => payees.id, { onDelete: "cascade" }),
  fromAccountId: integer("from_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  scheduledDate: integer("scheduled_date", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["scheduled", "paid", "cancelled", "failed"] })
    .notNull()
    .default("scheduled"),
  memo: text("memo"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  brand: text("brand", { enum: ["visa", "mastercard", "amex"] }).notNull(),
  cardType: text("card_type", { enum: ["debit", "credit"] }).notNull(),
  // network is the canonical successor to brand; brand kept for back-compat
  // with seeded rows.
  network: text("network", { enum: ["visa", "mastercard", "amex"] })
    .notNull()
    .default("visa"),
  tier: text("tier", { enum: ["core", "plus", "black"] })
    .notNull()
    .default("core"),
  apr: real("apr"),
  annualFee: real("annual_fee").notNull().default(0),
  theme: text("theme", { enum: ["obsidian", "aurora", "sand", "crimson"] })
    .notNull()
    .default("obsidian"),
  lastFour: text("last_four").notNull(),
  cardHolder: text("card_holder").notNull(),
  expiryMonth: integer("expiry_month").notNull(),
  expiryYear: integer("expiry_year").notNull(),
  frozen: integer("frozen", { mode: "boolean" }).notNull().default(false),
  spendLimit: real("spend_limit"),
  dailyLimit: real("daily_limit"),
  txnLimit: real("txn_limit"),
  // Billing address snapshotted at issuance.
  billingStreet: text("billing_street"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZip: text("billing_zip"),
  billingCountry: text("billing_country"),
  // Hashes + write-once plaintext for the reveal flow. The plaintext columns
  // are gated by the owner/admin-only revealCardDetailsAction.
  panHash: text("pan_hash"),
  cvvHash: text("cvv_hash"),
  pinHash: text("pin_hash"),
  panPlain: text("pan_plain"),
  cvvPlain: text("cvv_plain"),
  status: text("status", { enum: ["pending", "active", "frozen", "closed"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const cardApplications = sqliteTable("card_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productKey: text("product_key").notNull(), // e.g. "mastercard-plus"
  requestedLimit: real("requested_limit").notNull(),
  dailyLimit: real("daily_limit").notNull(),
  txnLimit: real("txn_limit").notNull(),
  cardHolder: text("card_holder").notNull(),
  billingStreet: text("billing_street"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZip: text("billing_zip"),
  billingCountry: text("billing_country"),
  employmentStatus: text("employment_status"),
  employerName: text("employer_name"),
  annualIncome: text("annual_income"),
  pinHash: text("pin_hash").notNull(),
  theme: text("theme", { enum: ["obsidian", "aurora", "sand", "crimson"] })
    .notNull()
    .default("obsidian"),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  reviewedBy: integer("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  rejectionReason: text("rejection_reason"),
  referenceNumber: text("reference_number").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  product: text("product").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  applicantName: text("applicant_name").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  applicantPhone: text("applicant_phone"),
  fundingAmount: real("funding_amount"),
  fundingSource: text("funding_source"),
  notes: text("notes"),
  referenceNumber: text("reference_number").notNull().unique(),
  data: text("data"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Ownership — exactly one of (userId, applicationId) is set.
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  applicationId: integer("application_id").references(
    () => applications.id,
    { onDelete: "cascade" }
  ),
  // What this file is — e.g. "selfie", "id-front", "id-back",
  // "proof-of-address", "pay-stub", "w2", "tax-return", "bank-statement",
  // "ein-letter", "articles-of-org", "operating-agreement", etc.
  kind: text("kind").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  storagePath: text("storage_path").notNull(), // path under ./uploads
  uploadedAt: integer("uploaded_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const recipientGroups = sqliteTable("recipient_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const wireRecipients = sqliteTable("wire_recipients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  bankCountry: text("bank_country").notNull(),
  bankRoutingNumber: text("bank_routing_number").notNull(),
  bankName: text("bank_name").notNull(),
  bankAddress: text("bank_address"),
  bankCity: text("bank_city"),
  bankState: text("bank_state"),
  bankZip: text("bank_zip"),

  recipientName: text("recipient_name").notNull(),
  recipientNickname: text("recipient_nickname"),
  recipientCountry: text("recipient_country"),
  recipientAddress1: text("recipient_address1"),
  recipientAddress2: text("recipient_address2"),
  recipientCity: text("recipient_city"),
  recipientState: text("recipient_state"),
  recipientZip: text("recipient_zip"),

  accountNumber: text("account_number").notNull(),
  messageToBank: text("message_to_bank"),
  groupId: integer("group_id").references(() => recipientGroups.id, {
    onDelete: "set null",
  }),
  status: text("status", { enum: ["active", "archived"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const scheduledWires = sqliteTable("scheduled_wires", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => wireRecipients.id, { onDelete: "cascade" }),
  fromAccountId: integer("from_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  fee: real("fee").notNull().default(25),
  isRepeating: integer("is_repeating", { mode: "boolean" })
    .notNull()
    .default(false),
  repeatFrequency: text("repeat_frequency", {
    enum: ["weekly", "biweekly", "monthly"],
  }),
  repeatUntil: integer("repeat_until", { mode: "timestamp" }),
  wireDate: integer("wire_date", { mode: "timestamp" }).notNull(),
  messageToBank: text("message_to_bank"),
  messageToRecipient: text("message_to_recipient"),
  memo: text("memo"),
  status: text("status", {
    enum: [
      "scheduled",
      "processing",
      "completed",
      "cancelled",
      "failed",
      "pending_tcv",
      "pending_aml",
      "interrupted_custom",
      "rejected_frozen",
      "approved",
      "rejected",
    ],
  })
    .notNull()
    .default("scheduled"),
  interruptMessage: text("interrupt_message"),
  tcvVerifiedAt: integer("tcv_verified_at", { mode: "timestamp" }),
  amlVerifiedAt: integer("aml_verified_at", { mode: "timestamp" }),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  reviewedBy: integer("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  rejectionReason: text("rejection_reason"),
  referenceNumber: text("reference_number").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  processedAt: integer("processed_at", { mode: "timestamp" }),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  code: text("code").notNull(),
  channel: text("channel", { enum: ["email", "sms"] }).notNull(),
  purpose: text("purpose", { enum: ["password", "username"] }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  consumedAt: integer("consumed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Payee = typeof payees.$inferSelect;
export type BillPayment = typeof billPayments.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;
export type RecipientGroup = typeof recipientGroups.$inferSelect;
export type NewRecipientGroup = typeof recipientGroups.$inferInsert;
export type WireRecipient = typeof wireRecipients.$inferSelect;
export type NewWireRecipient = typeof wireRecipients.$inferInsert;
export type ScheduledWire = typeof scheduledWires.$inferSelect;
export type NewScheduledWire = typeof scheduledWires.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type CardApplication = typeof cardApplications.$inferSelect;
export type NewCardApplication = typeof cardApplications.$inferInsert;
export type NewCard = typeof cards.$inferInsert;
