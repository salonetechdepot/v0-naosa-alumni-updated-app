"use client";

import { useState, useEffect, useCallback } from "react";
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
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { CurrencyInput } from "./currency-input";
import { SearchableSelect } from "@/components/searchable-select";
import { countries } from "@/lib/countries";

interface RegistrationFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

// Email format validation only (no hardcoded domains)
const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Calculate minimum date difference in days (at least 2 months / 60 days for a term)
const MIN_TERM_DAYS = 60; // Minimum 2 months for a school term
const RECOMMENDED_TERM_DAYS = 90; // Recommended 3 months

const validateDateRange = (
  entryDate: string,
  exitDate: string,
  currentYear: number,
): { valid: boolean; message: string } => {
  if (!entryDate || !exitDate) {
    return { valid: true, message: "" };
  }

  const entry = new Date(entryDate);
  const exit = new Date(exitDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if entry year is the same as current year
  const entryYear = entry.getFullYear();
  if (entryYear === currentYear) {
    return {
      valid: false,
      message: `Entry date cannot be in ${currentYear}. Alumni registration requires that the student's entry year is prior to ${currentYear}.`,
    };
  }

  // Check if exit date is after entry date
  if (exit <= entry) {
    return {
      valid: false,
      message: "Exit date must be after entry date",
    };
  }

  // Check if entry date is not in the future
  if (entry > today) {
    return {
      valid: false,
      message: "Entry date cannot be in the future",
    };
  }

  // Calculate difference in days
  const diffTime = Math.abs(exit.getTime() - entry.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check minimum term duration
  if (diffDays < MIN_TERM_DAYS) {
    return {
      valid: false,
      message: `Student must have completed at least one full school term (minimum ${MIN_TERM_DAYS} days). Current duration: ${diffDays} days.`,
    };
  }

  // Warning for short duration but still valid
  if (diffDays < RECOMMENDED_TERM_DAYS) {
    return {
      valid: true,
      message: `Note: The student attended for ${diffDays} days. Please verify this meets the school's term requirements.`,
    };
  }

  return { valid: true, message: "" };
};

export function RegistrationForm({
  onSuccess,
  isModal = false,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [systemRef, setSystemRef] = useState("");
  const [error, setError] = useState("");
  const [registrationAmount, setRegistrationAmount] = useState(0);

  // Email validation states
  const [email, setEmail] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailValid, setEmailValid] = useState(false);

  // Date validation states
  const [dateOfEntry, setDateOfEntry] = useState("");
  const [dateOfExit, setDateOfExit] = useState("");
  const [dateError, setDateError] = useState("");
  const [dateWarning, setDateWarning] = useState("");

  // Get current year for validation
  const currentYear = new Date().getFullYear();

  // Debounce email validation
  const [debouncedEmail, setDebouncedEmail] = useState(email);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleAmountChange = (value: number) => {
    setRegistrationAmount(value);
  };

  // Dynamic email validation using API (no hardcoded domains)
  const validateEmail = useCallback(async (emailValue: string) => {
    if (!emailValue) {
      setEmailError("");
      setEmailValid(false);
      return false;
    }

    // Check format first
    if (!validateEmailFormat(emailValue)) {
      setEmailError(
        "Please enter a valid email address (e.g., name@domain.com)",
      );
      setEmailValid(false);
      return false;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch("/api/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        setEmailError(
          result.message || "Please use a valid, permanent email address",
        );
        setEmailValid(false);
        return false;
      }

      setEmailError("");
      setEmailValid(true);
      return true;
    } catch (error) {
      console.error("Email validation API error:", error);
      // If API fails, only validate format
      if (validateEmailFormat(emailValue)) {
        setEmailError("");
        setEmailValid(true);
        return true;
      }
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // Trigger validation when debounced email changes
  useEffect(() => {
    if (debouncedEmail) {
      validateEmail(debouncedEmail);
    } else {
      setEmailError("");
      setEmailValid(false);
    }
  }, [debouncedEmail, validateEmail]);

  // Date validation function
  const validateDates = (entry: string, exit: string) => {
    const result = validateDateRange(entry, exit, currentYear);
    setDateError(result.valid ? "" : result.message);
    setDateWarning(result.valid && result.message ? result.message : "");
    return result.valid;
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!newEmail) {
      setEmailError("");
      setEmailValid(false);
    }
  };

  // Handle date changes
  const handleDateOfEntryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEntryDate = e.target.value;
    setDateOfEntry(newEntryDate);
    if (dateOfExit) {
      validateDates(newEntryDate, dateOfExit);
    } else if (newEntryDate) {
      // Validate just entry date against current year
      const entryYear = new Date(newEntryDate).getFullYear();
      if (entryYear === currentYear) {
        setDateError(
          `Entry date cannot be in ${currentYear}. Alumni registration requires that the student's entry year is prior to ${currentYear}.`,
        );
      } else {
        setDateError("");
      }
    }
  };

  const handleDateOfExitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExitDate = e.target.value;
    setDateOfExit(newExitDate);
    if (dateOfEntry) {
      validateDates(dateOfEntry, newExitDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const entryDate = formData.get("dateOfEntry") as string;
    const exitDate = formData.get("dateOfExit") as string;

    // Validate email
    const isEmailValid = await validateEmail(emailValue);
    if (!isEmailValid) {
      setError("Please enter a valid email address with a registered domain");
      setIsSubmitting(false);
      return;
    }

    // Validate dates
    const areDatesValid = validateDates(entryDate, exitDate);
    if (!areDatesValid) {
      setError(
        dateError ||
          "Please ensure entry and exit dates meet the minimum term requirement",
      );
      setIsSubmitting(false);
      return;
    }

    const memberData = {
      firstName: formData.get("firstName") as string,
      middleName: formData.get("middleName") as string,
      surname: formData.get("surname") as string,
      gender: formData.get("gender") as "male" | "female",
      currentAddress: formData.get("currentAddress") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      admissionNumber: formData.get("admissionNumber") as string,
      dateOfEntry: entryDate,
      dateOfExit: exitDate,
      email: emailValue,
      phone: formData.get("phone") as string,
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
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={handleEmailChange}
              className={`pr-10 ${emailError ? "border-destructive" : emailValid ? "border-green-500" : ""}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCheckingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : emailValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : email && emailError ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : null}
            </div>
          </div>
          {emailError && (
            <p className="text-xs text-destructive mt-1">{emailError}</p>
          )}
          {emailValid && (
            <p className="text-xs text-green-600 mt-1">✓ Valid email address</p>
          )}
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

      {/* Date Fields with Validation */}
      <div className="space-y-2">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 mb-2">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Alumni registration requires that the
            student's entry year is prior to {currentYear}. Students who entered
            in {currentYear} are not yet eligible for alumni registration.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateOfEntry">Date of Entry *</Label>
          <Input
            id="dateOfEntry"
            name="dateOfEntry"
            type="date"
            required
            value={dateOfEntry}
            onChange={handleDateOfEntryChange}
            className={dateError ? "border-destructive" : ""}
            max={`${currentYear - 1}-12-31`}
          />
          <p className="text-xs text-muted-foreground">
            Must be before {currentYear}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfExit">Date of Exit *</Label>
          <Input
            id="dateOfExit"
            name="dateOfExit"
            type="date"
            required
            value={dateOfExit}
            onChange={handleDateOfExitChange}
            className={dateError ? "border-destructive" : ""}
          />
        </div>
      </div>

      {/* Date validation messages */}
      {dateError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{dateError}</span>
          </div>
        </div>
      )}
      {dateWarning && !dateError && (
        <div className="rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-600">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{dateWarning}</span>
          </div>
        </div>
      )}

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

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isCheckingEmail || !!dateError}
      >
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

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { CheckCircle } from "lucide-react";
// import { CurrencyInput } from "./currency-input";
// import { formatCurrency } from "@/lib/currency";
// import { SearchableSelect } from "@/components/searchable-select";
// import { countries } from "@/lib/countries";

// interface RegistrationFormProps {
//   onSuccess?: () => void;
//   isModal?: boolean;
// }

// export function RegistrationForm({
//   onSuccess,
//   isModal = false,
// }: RegistrationFormProps) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [systemRef, setSystemRef] = useState("");
//   const [error, setError] = useState("");
//   const [registrationAmount, setRegistrationAmount] = useState(0);

//   const handleAmountChange = (value: number) => {
//     setRegistrationAmount(value);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError("");

//     const formData = new FormData(e.currentTarget);

//     const memberData = {
//       firstName: formData.get("firstName") as string,
//       middleName: formData.get("middleName") as string,
//       surname: formData.get("surname") as string,
//       gender: formData.get("gender") as "male" | "female",
//       currentAddress: formData.get("currentAddress") as string,
//       city: formData.get("city") as string,
//       country: formData.get("country") as string,
//       admissionNumber: formData.get("admissionNumber") as string,
//       dateOfEntry: formData.get("dateOfEntry") as string,
//       dateOfExit: formData.get("dateOfExit") as string,
//       email: formData.get("email") as string,
//       phone: formData.get("phone") as string,
//       // Use the standardized amount from state
//       registrationAmount: registrationAmount,
//       transactionReference: formData.get("transactionReference") as string,
//     };

//     // Validate amount
//     if (registrationAmount <= 0) {
//       setError("Please enter a valid registration amount");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const response = await fetch("/api/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(memberData),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "Registration failed");
//       }

//       setSystemRef(result.member.systemReference);
//       setIsSuccess(true);
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Registration failed. Please try again.",
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCloseSuccess = () => {
//     setIsSuccess(false);
//     onSuccess?.();
//   };

//   if (isSuccess) {
//     return (
//       <div className="flex flex-col items-center gap-4 py-6 text-center">
//         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
//           <CheckCircle className="h-8 w-8" />
//         </div>
//         <h3 className="text-xl font-semibold text-foreground">
//           Registration Submitted!
//         </h3>
//         <p className="text-muted-foreground">
//           Your registration is pending approval. You will receive an email
//           confirmation and another notification once your registration has been
//           reviewed.
//         </p>
//         <div className="rounded-lg bg-muted p-4 border border-border">
//           <p className="text-sm text-muted-foreground">
//             Your System Reference:
//           </p>
//           <p className="text-lg font-mono font-semibold text-primary">
//             {systemRef}
//           </p>
//         </div>
//         <p className="text-sm text-muted-foreground">
//           Please save this reference number for future inquiries.
//         </p>
//         <Button onClick={handleCloseSuccess} variant="outline">
//           Register Another Member
//         </Button>
//       </div>
//     );
//   }

//   const formContent = (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {error && (
//         <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Name Fields */}
//       <div className="grid gap-4 sm:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="firstName">First Name *</Label>
//           <Input
//             id="firstName"
//             name="firstName"
//             required
//             placeholder="Enter first name"
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="middleName">Middle Name</Label>
//           <Input
//             id="middleName"
//             name="middleName"
//             placeholder="Enter middle name"
//           />
//         </div>
//       </div>
//       <div className="grid gap-4 sm:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="surname">Surname/Last Name *</Label>
//           <Input
//             id="surname"
//             name="surname"
//             required
//             placeholder="Enter surname"
//           />
//         </div>
//       </div>

//       {/* Contact Info */}
//       <div className="grid gap-4 sm:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="email">Email Address *</Label>
//           <Input
//             id="email"
//             name="email"
//             type="email"
//             required
//             placeholder="email@example.com"
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="phone">Phone Number *</Label>
//           <Input
//             id="phone"
//             name="phone"
//             type="tel"
//             required
//             placeholder="+232-XX-XXXXXX"
//           />
//         </div>
//       </div>

//       {/* Gender */}
//       <div className="space-y-2">
//         <Label htmlFor="gender">Gender *</Label>
//         <Select name="gender" required>
//           <SelectTrigger>
//             <SelectValue placeholder="Select gender" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="male">Male</SelectItem>
//             <SelectItem value="female">Female</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Current Address */}
//       <div className="space-y-2">
//         <Label htmlFor="currentAddress">Current Address *</Label>
//         <Input
//           id="currentAddress"
//           name="currentAddress"
//           required
//           placeholder="Enter your street address"
//         />
//       </div>

//       {/* City and Country */}
//       <div className="grid gap-4 sm:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="city">City *</Label>
//           <Input id="city" name="city" required placeholder="Enter your city" />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="country">Country *</Label>
//           <SearchableSelect
//             name="country"
//             defaultValue="Sierra Leone"
//             required
//             placeholder="Select country"
//             options={countries.map((c) => ({ value: c.name, label: c.name }))}
//           />
//         </div>
//       </div>

//       {/* School Info */}
//       <div className="grid gap-4 sm:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="admissionNumber">Admission Number</Label>
//           <Input
//             id="admissionNumber"
//             name="admissionNumber"
//             placeholder="e.g., 5432"
//           />
//         </div>
//       </div>
//       <div className="grid gap-4 sm:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="dateOfEntry">Date of Entry *</Label>
//           <Input id="dateOfEntry" name="dateOfEntry" type="date" required />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="dateOfExit">Date of Exit *</Label>
//           <Input id="dateOfExit" name="dateOfExit" type="date" required />
//         </div>
//       </div>

//       {/* Payment Info */}
//       <div className="rounded-lg bg-secondary/50 p-4 space-y-4">
//         <h4 className="font-medium text-foreground">Payment Information</h4>
//         <p className="text-sm text-muted-foreground">
//           Please make payment to:{" "}
//           <span className="font-medium">+232-76-792218</span> and enter the
//           transaction details below.
//         </p>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <CurrencyInput
//             id="registrationAmount"
//             name="registrationAmount"
//             label="Registration Amount"
//             required={true}
//             placeholder="Enter amount in New Leone (SLE)"
//             onValueChange={handleAmountChange}
//           />
//           <div className="space-y-2">
//             <Label htmlFor="transactionReference">
//               Transaction Reference *
//             </Label>
//             <Input
//               id="transactionReference"
//               name="transactionReference"
//               required
//               placeholder="Enter payment reference"
//             />
//           </div>
//         </div>
//       </div>

//       <Button type="submit" className="w-full" disabled={isSubmitting}>
//         {isSubmitting ? "Submitting..." : "Submit Registration"}
//       </Button>
//     </form>
//   );

//   if (isModal) {
//     return formContent;
//   }

//   return (
//     <div className="rounded-lg border border-border bg-card p-6">
//       {formContent}
//     </div>
//   );
// }
