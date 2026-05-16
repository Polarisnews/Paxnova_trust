import { readFile, stat } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { uploadAbsolutePath } from "@/lib/uploads";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const docId = Number(id);
  if (!Number.isFinite(docId) || docId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const doc = db.select().from(documents).where(eq(documents.id, docId)).get();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let abs: string;
  try {
    abs = uploadAbsolutePath(doc.storagePath);
  } catch {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 500 });
  }

  try {
    await stat(abs);
  } catch {
    return NextResponse.json(
      { error: "File missing from disk" },
      { status: 410 }
    );
  }

  const bytes = await readFile(abs);
  // Send a Uint8Array to satisfy BodyInit's typing — Buffer is a Uint8Array
  // at runtime but TS sometimes balks.
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(doc.size),
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        doc.originalName
      )}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
