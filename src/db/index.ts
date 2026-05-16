import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

const dbPath = process.env.DB_PATH ?? "./paxnovatrust.db";

const sqlite = globalForDb.sqlite ?? new Database(dbPath);

if (process.env.NODE_ENV !== "production") globalForDb.sqlite = sqlite;

// --- SQLite hardening pragmas ------------------------------------------------
// WAL: concurrent reads while a writer is active. Standard for any app DB.
sqlite.pragma("journal_mode = WAL");
// secure_delete overwrites freed pages with zeros, so deleted PII / card data
// cannot be recovered by reading the raw .db file with a hex editor.
sqlite.pragma("secure_delete = ON");
// NORMAL syncs at COMMIT boundaries (safe with WAL); FULL is overkill.
sqlite.pragma("synchronous = NORMAL");
// Cap the WAL file so it can't grow unbounded if a checkpoint stalls.
sqlite.pragma("journal_size_limit = 67108864"); // 64 MB
// Keep temp tables / sorts in memory only (never spill to a temp file on disk).
sqlite.pragma("temp_store = MEMORY");
// Enforce foreign-key constraints — Drizzle assumes they're on.
sqlite.pragma("foreign_keys = ON");
// Wait up to 5s for another writer to release the lock before erroring.
sqlite.pragma("busy_timeout = 5000");

// Tighten file permissions on the DB and WAL/SHM sidecars on POSIX hosts.
// Windows is a no-op (chmod has no effect on NTFS ACLs).
if (process.platform !== "win32") {
  try {
    const fs = require("node:fs") as typeof import("node:fs");
    for (const suffix of ["", "-wal", "-shm"]) {
      const p = dbPath + suffix;
      if (fs.existsSync(p)) fs.chmodSync(p, 0o600);
    }
  } catch {
    // non-fatal
  }
}

export const db = drizzle(sqlite, { schema, logger: false });
export { schema };
