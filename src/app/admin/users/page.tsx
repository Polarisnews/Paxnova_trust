import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { UserActions } from "./UserActions";

export default async function AdminUsers() {
  const list = db.select().from(users).orderBy(desc(users.createdAt)).all();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Promote, demote, or suspend customer accounts. All actions are logged.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {u.firstName} {u.lastName}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      u.role === "admin"
                        ? "bg-gold-500/15 text-gold-700 dark:text-gold-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      u.status === "active"
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserActions
                    userId={u.id}
                    role={u.role}
                    status={u.status}
                    username={u.username}
                    fullName={`${u.firstName} ${u.lastName}`.trim()}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
