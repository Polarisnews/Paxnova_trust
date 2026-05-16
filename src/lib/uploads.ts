import "server-only";
import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB per file
export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");

export type UploadScope = "users" | "applications";

export type SavedFile = {
  storagePath: string; // relative to ./uploads, e.g. "users/12/selfie-ab12cd.png"
  originalName: string;
  mimeType: string;
  size: number;
};

/**
 * Persists a File to disk under ./uploads/<scope>/<ownerId>/.
 *
 * Returns the saved path + metadata. Throws on bad mime/size — caller must
 * surface a friendly error to the user.
 */
export async function saveUpload(
  scope: UploadScope,
  ownerId: number,
  kind: string,
  file: File
): Promise<SavedFile> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(
      `Unsupported file type "${file.type}". Use JPG, PNG, WEBP, HEIC, or PDF.`
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `File is too large (${humanSize(file.size)}). Max ${humanSize(MAX_FILE_BYTES)}.`
    );
  }

  const dir = join(UPLOAD_ROOT, scope, String(ownerId));
  await mkdir(dir, { recursive: true });

  const ext = pickExtension(file.name, file.type);
  const safeKind = kind.replace(/[^a-z0-9-_]/gi, "").slice(0, 40) || "file";
  const slug = `${safeKind}-${randomBytes(4).toString("hex")}${ext}`;
  const absolute = join(dir, slug);

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(absolute, bytes);

  return {
    storagePath: join(scope, String(ownerId), slug).replace(/\\/g, "/"),
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

/**
 * Best-effort delete a single uploaded file by storage path. Logs errors but
 * never throws — orphan files on disk are recoverable, but a 500 in admin
 * delete UX is not.
 */
export async function deleteUpload(storagePath: string): Promise<void> {
  try {
    const abs = uploadAbsolutePath(storagePath);
    await unlink(abs);
  } catch (err) {
    console.error(`[uploads] failed to delete ${storagePath}:`, err);
  }
}

/**
 * Best-effort delete every file under ./uploads/<scope>/<ownerId>/.
 * Used when an application or user is fully removed.
 */
export async function deleteUploadsForOwner(
  scope: UploadScope,
  ownerId: number
): Promise<void> {
  try {
    const abs = join(UPLOAD_ROOT, scope, String(ownerId));
    await rm(abs, { recursive: true, force: true });
  } catch (err) {
    console.error(
      `[uploads] failed to delete ${scope}/${ownerId}:`,
      err
    );
  }
}

export function uploadAbsolutePath(storagePath: string): string {
  // Defense in depth: never let a "..\..\system32" slip through.
  const normalized = storagePath.replace(/\\/g, "/");
  if (normalized.includes("..")) {
    throw new Error("Invalid storage path");
  }
  return join(UPLOAD_ROOT, normalized);
}

function pickExtension(filename: string, mime: string): string {
  const fromName = extname(filename).toLowerCase();
  if (fromName) return fromName;
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/heic":
      return ".heic";
    case "image/heif":
      return ".heif";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
