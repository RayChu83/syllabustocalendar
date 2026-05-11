"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);

  if (!context) {
    throw new Error("Select components must be used within Select");
  }

  return context;
}

function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange }}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useSelectContext();

  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        aria-expanded={open}
        className={cn(
          "bg-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 h-auto w-full justify-between rounded-sm border px-4 py-2 font-normal shadow-none outline-offset-2",
          className,
        )}
      >
        {children}
        <ChevronDown className="size-4 text-neutral-400" />
      </Button>
    </PopoverTrigger>
  );
}

function SelectValue({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  const { value } = useSelectContext();

  return (
    <span className={cn(!value && "text-neutral-300", className)}>
      {value || placeholder}
    </span>
  );
}

function SelectContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PopoverContent
      className={cn("w-[var(--radix-popover-trigger-width)] p-1", className)}
      align="start"
      onOpenAutoFocus={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </PopoverContent>
  );
}

function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm text-neutral-600 transition-colors hover:bg-neutral-100",
        isSelected && "bg-neutral-100 text-neutral-900",
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      <span>{children}</span>
      <Check
        className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")}
      />
    </button>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
