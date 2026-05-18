// One-shot migration: seed the catalog payees + 12 months of history for
// every existing user. Run via:
//   npx tsx src/db/seed-payees.ts
//
// Idempotent — re-running is safe, it only adds payees that are missing.

import { seedAllUsers } from "@/lib/payee-seed";

function main() {
  const start = Date.now();
  const res = seedAllUsers();
  const ms = Date.now() - start;
  console.log(
    `Seed complete in ${ms}ms — users=${res.users}, payeesAdded=${res.payeesAdded}, paymentsAdded=${res.paymentsAdded}`,
  );
}

main();
