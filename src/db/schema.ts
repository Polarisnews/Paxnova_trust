import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
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
  creditLimit: real("credit_limit"),
  apy: real("apy"),
  status: text("status", { enum: ["active", "pending", "frozen", "closed"] })
    .notNull()
    .default("active"),
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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
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
  lastFour: text("last_four").notNull(),
  cardHolder: text("card_holder").notNull(),
  expiryMonth: integer("expiry_month").notNull(),
  expiryYear: integer("expiry_year").notNull(),
  frozen: integer("frozen", { mode: "boolean" }).notNull().default(false),
  spendLimit: real("spend_limit"),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Payee = typeof payees.$inferSelect;
export type BillPayment = typeof billPayments.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Application = typeof applications.$inferSelect;
