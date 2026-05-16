"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

type TextFieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  wrapperClassName?: string;
};

export function TextField({
  id,
  label,
  error,
  hint,
  required,
  wrapperClassName,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <Input
        id={id}
        name={inputProps.name ?? id}
        required={required}
        aria-invalid={Boolean(error)}
        className="h-10"
        {...inputProps}
      />
    </FieldShell>
  );
}

type SelectFieldProps = {
  id: string;
  name?: string;
  label: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
  error?: string;
  hint?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  wrapperClassName?: string;
};

export function SelectField({
  id,
  name,
  label,
  options,
  required,
  error,
  hint,
  defaultValue,
  value,
  onChange,
  placeholder = "Select…",
  wrapperClassName,
}: SelectFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <select
        id={id}
        name={name ?? id}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
