import { desc, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { applications, documents } from "@/db/schema";
import { ApplicationRow } from "./ApplicationRow";

export default async function AdminApplications() {
  const list = db
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt))
    .all();

  const appIds = list.map((a) => a.id);
  const userIds = list
    .map((a) => a.userId)
    .filter((u): u is number => typeof u === "number");

  const appDocs =
    appIds.length > 0
      ? db
          .select()
          .from(documents)
          .where(inArray(documents.applicationId, appIds))
          .all()
      : [];
  const userDocs =
    userIds.length > 0
      ? db
          .select()
          .from(documents)
          .where(inArray(documents.userId, userIds))
          .all()
      : db.select().from(documents).where(isNotNull(documents.userId)).all().slice(0, 0);

  const docsByApp = new Map<number, typeof appDocs>();
  for (const d of appDocs) {
    if (d.applicationId == null) continue;
    if (!docsByApp.has(d.applicationId)) docsByApp.set(d.applicationId, []);
    docsByApp.get(d.applicationId)!.push(d);
  }
  const docsByUser = new Map<number, typeof userDocs>();
  for (const d of userDocs) {
    if (d.userId == null) continue;
    if (!docsByUser.has(d.userId)) docsByUser.set(d.userId, []);
    docsByUser.get(d.userId)!.push(d);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Click any reference number to expand the customer&apos;s full intake
          (CIP, employment, product details, beneficial owners, and uploaded
          documents). Approving opens the requested account funded with the
          applicant&apos;s opening deposit.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Reference</th>
              <th className="px-4 py-3 text-left font-semibold">Applicant</th>
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-right font-semibold">Funding</th>
              <th className="px-4 py-3 text-left font-semibold">Docs</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No applications in the queue.
                </td>
              </tr>
            )}
            {list.map((a) => {
              const appDocList = docsByApp.get(a.id) ?? [];
              const userDocList = a.userId
                ? docsByUser.get(a.userId) ?? []
                : [];
              return (
                <ApplicationRow
                  key={a.id}
                  app={a}
                  appDocs={appDocList.map((d) => ({
                    id: d.id,
                    kind: d.kind,
                    originalName: d.originalName,
                    mimeType: d.mimeType,
                    size: d.size,
                  }))}
                  userDocs={userDocList.map((d) => ({
                    id: d.id,
                    kind: d.kind,
                    originalName: d.originalName,
                    mimeType: d.mimeType,
                    size: d.size,
                  }))}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
