"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SearchableSelectProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export function SearchableSelect({
  name,
  defaultValue,
  required,
  placeholder = "Select option",
  options,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Select name={name} defaultValue={defaultValue} required={required}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <div className="sticky top-0 bg-background p-2 border-b z-10">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full"
          />
        </div>
        {filteredOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
