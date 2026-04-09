"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import { CurrencyInput } from "./currency-input";
import { formatCurrency } from "@/lib/currency";
import { SearchableSelect } from "@/components/searchable-select";
import { countries } from "@/lib/countries";

interface RegistrationFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export function RegistrationForm({
  onSuccess,
  isModal = false,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [systemRef, setSystemRef] = useState("");
  const [error, setError] = useState("");
  const [registrationAmount, setRegistrationAmount] = useState(0);

  const handleAmountChange = (value: number) => {
    setRegistrationAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const memberData = {
      firstName: formData.get("firstName") as string,
      middleName: formData.get("middleName") as string,
      surname: formData.get("surname") as string,
      gender: formData.get("gender") as "male" | "female",
      currentAddress: formData.get("currentAddress") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      admissionNumber: formData.get("admissionNumber") as string,
      dateOfEntry: formData.get("dateOfEntry") as string,
      dateOfExit: formData.get("dateOfExit") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      // Use the standardized amount from state
      registrationAmount: registrationAmount,
      transactionReference: formData.get("transactionReference") as string,
    };

    // Validate amount
    if (registrationAmount <= 0) {
      setError("Please enter a valid registration amount");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      setSystemRef(result.member.systemReference);
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    onSuccess?.();
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          Registration Submitted!
        </h3>
        <p className="text-muted-foreground">
          Your registration is pending approval. You will receive an email
          confirmation and another notification once your registration has been
          reviewed.
        </p>
        <div className="rounded-lg bg-muted p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            Your System Reference:
          </p>
          <p className="text-lg font-mono font-semibold text-primary">
            {systemRef}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Please save this reference number for future inquiries.
        </p>
        <Button onClick={handleCloseSuccess} variant="outline">
          Register Another Member
        </Button>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            name="middleName"
            placeholder="Enter middle name"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="surname">Surname/Last Name *</Label>
          <Input
            id="surname"
            name="surname"
            required
            placeholder="Enter surname"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+232-XX-XXXXXX"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label htmlFor="gender">Gender *</Label>
        <Select name="gender" required>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Address */}
      <div className="space-y-2">
        <Label htmlFor="currentAddress">Current Address *</Label>
        <Input
          id="currentAddress"
          name="currentAddress"
          required
          placeholder="Enter your street address"
        />
      </div>

      {/* City and Country */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input id="city" name="city" required placeholder="Enter your city" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <SearchableSelect
            name="country"
            defaultValue="Sierra Leone"
            required
            placeholder="Select country"
            options={countries.map((c) => ({ value: c.name, label: c.name }))}
          />
        </div>
      </div>

      {/* School Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admissionNumber">Admission Number</Label>
          <Input
            id="admissionNumber"
            name="admissionNumber"
            placeholder="e.g., 5432"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateOfEntry">Date of Entry *</Label>
          <Input id="dateOfEntry" name="dateOfEntry" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfExit">Date of Exit *</Label>
          <Input id="dateOfExit" name="dateOfExit" type="date" required />
        </div>
      </div>

      {/* Payment Info */}
      <div className="rounded-lg bg-secondary/50 p-4 space-y-4">
        <h4 className="font-medium text-foreground">Payment Information</h4>
        <p className="text-sm text-muted-foreground">
          Please make payment to:{" "}
          <span className="font-medium">+232-76-792218</span> and enter the
          transaction details below.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <CurrencyInput
            id="registrationAmount"
            name="registrationAmount"
            label="Registration Amount"
            required={true}
            placeholder="Enter amount in New Leone (SLE)"
            onValueChange={handleAmountChange}
          />
          <div className="space-y-2">
            <Label htmlFor="transactionReference">
              Transaction Reference *
            </Label>
            <Input
              id="transactionReference"
              name="transactionReference"
              required
              placeholder="Enter payment reference"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Registration"}
      </Button>
    </form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {formContent}
    </div>
  );
}
