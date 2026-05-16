"use client";

import * as React from "react";
import { useState } from "react";
import { CheckCircle2, FileText, Image as ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DocSlot = {
  kind: string;
  label: string;
  hint?: string;
  required: boolean;
};

const MAX_MB = 15;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";

/**
 * A single file slot. One <input type="file"> is rendered exactly once; the
 * empty / preview UI is toggled around it so React never unmounts the input
 * (which would strip the picked file off the DOM before form submission).
 */
export function DocumentSlot({
  slot,
  name,
  error,
  onChange,
}: {
  slot: DocSlot;
  name?: string;
  error?: string;
  onChange?: (kind: string, hasFile: boolean) => void;
}) {
  const fieldName = name ?? `doc:${slot.kind}`;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function handlePick(f: File | null) {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setLocalError(`File is too large. Max ${MAX_MB} MB.`);
      return;
    }
    setLocalError(null);
    setFile(f);
    onChange?.(slot.kind, true);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }

  function clear() {
    setFile(null);
    onChange?.(slot.kind, false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const isImage = file?.type.startsWith("image/");
  const shownError = error || localError;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 transition",
        file
          ? "border-success/40 bg-success/5"
          : shownError
          ? "border-danger/60 bg-danger/5"
          : "border-border"
      )}
    >
      {/* Single source of truth for the file — never unmounts. */}
      <input
        ref={inputRef}
        id={fieldName}
        name={fieldName}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            {file && <CheckCircle2 className="size-3.5 text-success" />}
            {slot.label}
            {slot.required ? (
              <span className="ml-0.5 text-danger">*</span>
            ) : (
              <span className="ml-1.5 inline-flex items-center rounded-full bg-muted px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                Recommended
              </span>
            )}
          </p>
          {slot.hint && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {slot.hint}
            </p>
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground hover:text-danger"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {!file ? (
        <button
          type="button"
          onClick={openPicker}
          className={cn(
            "mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-xs transition",
            shownError
              ? "border-danger/60 bg-danger/5 text-danger"
              : "border-border bg-muted/30 text-muted-foreground hover:border-violet-500/60 hover:bg-violet-500/5 hover:text-violet-600"
          )}
        >
          <Upload className="size-4" />
          Click to upload — JPG, PNG, or PDF (max {MAX_MB} MB)
        </button>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="mt-2 flex w-full items-center gap-3 rounded-lg border border-border bg-muted/30 p-2 text-left transition hover:border-violet-500/60 hover:bg-violet-500/5"
        >
          {isImage && preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={file.name}
              className="size-16 rounded object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded bg-card">
              {isImage ? (
                <ImageIcon className="size-6 text-muted-foreground" />
              ) : (
                <FileText className="size-6 text-muted-foreground" />
              )}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {humanSize(file.size)} · click to replace
            </p>
          </div>
        </button>
      )}

      {shownError && (
        <p className="mt-1.5 text-[11px] text-danger">{shownError}</p>
      )}
    </div>
  );
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Renders a list of DocSlots. Use this inside a form; each slot maps to a
 * unique input name so the server action receives them via FormData.
 */
export function DocumentSlotGrid({
  slots,
  errors,
  onChange,
}: {
  slots: DocSlot[];
  errors?: Record<string, string>;
  onChange?: (kind: string, hasFile: boolean) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map((s) => (
        <DocumentSlot
          key={s.kind}
          slot={s}
          error={errors?.[`doc:${s.kind}`]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
