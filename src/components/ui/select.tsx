"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  labels: Map<string, React.ReactNode>;
  registerLabel: (value: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  labels: new Map(),
  registerLabel: () => {},
});

function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const labelsRef = React.useRef(new Map<string, React.ReactNode>());

  const registerLabel = React.useCallback((v: string, label: React.ReactNode) => {
    labelsRef.current.set(v, label);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labels: labelsRef.current, registerLabel }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <svg className="ml-2 h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, labels } = React.useContext(SelectContext);
  const displayLabel = value ? labels.get(value) : null;

  if (!value) {
    return <span className="text-gray-500 truncate">{placeholder}</span>;
  }
  return <span className="truncate">{displayLabel ?? value}</span>;
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg",
        open ? "" : "hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(SelectContext);

  // Register the label for this value
  React.useEffect(() => {
    ctx.registerLabel(value, children);
  }, [value, children, ctx.registerLabel]);

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-gray-100",
        ctx.value === value && "bg-gray-100 font-medium",
        className
      )}
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
