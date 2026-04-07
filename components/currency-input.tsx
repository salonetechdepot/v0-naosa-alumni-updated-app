"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  isOldLeoneFormat,
  convertToNewLeone,
  formatCurrency,
} from "@/lib/currency";

interface CurrencyInputProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  onValueChange?: (value: number) => void;
}

export function CurrencyInput({
  id,
  name,
  label,
  required = false,
  placeholder = "Enter amount",
  onValueChange,
}: CurrencyInputProps) {
  const [rawValue, setRawValue] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [standardizedValue, setStandardizedValue] = useState<number | null>(
    null,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRawValue(value);

    const numValue = parseFloat(value);

    if (!isNaN(numValue)) {
      // Check if it's in Old Leone format
      if (isOldLeoneFormat(numValue)) {
        const converted = convertToNewLeone(numValue);
        setWarning(
          `⚠️ Amount seems to be in Old Leone. Converted to ${converted} New Leone (SLE)`,
        );
        setStandardizedValue(converted);
        if (onValueChange) onValueChange(converted);
      } else {
        setWarning("");
        setStandardizedValue(numValue);
        if (onValueChange) onValueChange(numValue);
      }
    } else {
      setWarning("");
      setStandardizedValue(null);
      if (onValueChange) onValueChange(0);
    }
  };

  // Store the standardized value in a hidden input
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && "*"}{" "}
        <span className="text-xs text-muted-foreground">(New Leone - SLE)</span>
      </Label>
      <Input
        id={id}
        name={name}
        type="number"
        required={required}
        placeholder={placeholder}
        value={rawValue}
        onChange={handleChange}
        min="0"
        step="1"
        className={warning ? "border-yellow-500" : ""}
      />
      {warning && (
        <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
          {warning}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Enter amount in New Leone (SLE). Example: 50 SLE (not 50,000)
      </p>
    </div>
  );
}
