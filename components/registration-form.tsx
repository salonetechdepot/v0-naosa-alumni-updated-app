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
import { toast } from "sonner";

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
const MIN_REGISTRATION_AMOUNT = 20; // Minimum registration amount in SLE

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

  // Check if exit date is in the future
  if (exit > today) {
    return {
      valid: false,
      message:
        "Exit date cannot be in the future. The student must have already left the school.",
    };
  }

  // Check if exit date is at least 3 months old (90 days)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo.setHours(0, 0, 0, 0);

  if (exit > threeMonthsAgo) {
    return {
      valid: false,
      message:
        "Exit date must be at least 3 months old. The student should have left school at least 3 months ago.",
    };
  }

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
  const [amountError, setAmountError] = useState("");

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

  // Admission number validation states
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [isCheckingAdmission, setIsCheckingAdmission] = useState(false);
  const [admissionError, setAdmissionError] = useState("");
  const [admissionValid, setAdmissionValid] = useState(false);
  const [debouncedAdmissionNumber, setDebouncedAdmissionNumber] = useState("");

  // Get current year for validation
  const currentYear = new Date().getFullYear();

  // Debounce email validation
  const [debouncedEmail, setDebouncedEmail] = useState(email);

  // Add debounce for admission number
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAdmissionNumber(admissionNumber);
    }, 500);
    return () => clearTimeout(timer);
  }, [admissionNumber]);

  // Add admission number validation function
  const validateAdmissionNumber = useCallback(async (admissionNum: string) => {
    if (!admissionNum) {
      setAdmissionError("");
      setAdmissionValid(true);
      return true;
    }

    setIsCheckingAdmission(true);
    try {
      const response = await fetch(
        `/api/check-admission?number=${encodeURIComponent(admissionNum)}`,
      );
      const result = await response.json();

      if (!response.ok || result.exists) {
        setAdmissionError("This admission number is already registered");
        setAdmissionValid(false);
        return false;
      }

      setAdmissionError("");
      setAdmissionValid(true);
      return true;
    } catch (error) {
      console.error("Admission number check error:", error);
      setAdmissionError("");
      setAdmissionValid(true);
      return true;
    } finally {
      setIsCheckingAdmission(false);
    }
  }, []);

  // Trigger validation when debounced admission number changes
  useEffect(() => {
    if (debouncedAdmissionNumber) {
      validateAdmissionNumber(debouncedAdmissionNumber);
    } else {
      setAdmissionError("");
      setAdmissionValid(true);
    }
  }, [debouncedAdmissionNumber, validateAdmissionNumber]);

  // Add handler for admission number change
  const handleAdmissionNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setAdmissionNumber(value);
    if (!value) {
      setAdmissionError("");
      setAdmissionValid(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleAmountChange = (value: number) => {
    setRegistrationAmount(value);
    // Validate amount
    if (value > 0 && value < MIN_REGISTRATION_AMOUNT) {
      setAmountError(
        `Registration amount must be at least ${MIN_REGISTRATION_AMOUNT} SLE`,
      );
    } else {
      setAmountError("");
    }
  };

  // Dynamic email validation using API
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

    // Validate amount
    if (registrationAmount < MIN_REGISTRATION_AMOUNT) {
      setError(
        `Registration amount must be at least ${MIN_REGISTRATION_AMOUNT} SLE`,
      );
      setIsSubmitting(false);
      return;
    }

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

    // Validate admission number (if provided)
    if (admissionNumber) {
      const isAdmissionValid = await validateAdmissionNumber(admissionNumber);
      if (!isAdmissionValid) {
        setError("This admission number is already registered");
        setIsSubmitting(false);
        return;
      }
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
    const shareMessage = `NAOSA Registration Submitted!\nReference: ${systemRef}\nStatus: Pending Approval\n\nYou will receive an email once approved.`;

    const shareOnWhatsApp = () => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      window.open(whatsappUrl, "_blank");
    };

    const shareOnSMS = () => {
      const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
      window.open(smsUrl, "_blank");
    };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareMessage);
        toast.success("Reference copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy");
      }
    };

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

        <div className="rounded-lg bg-muted p-4 border border-border w-full">
          <p className="text-sm text-muted-foreground">
            Your System Reference:
          </p>
          <p className="text-lg font-mono font-semibold text-primary break-all">
            {systemRef}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Please save this reference number for future inquiries.
        </p>

        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <Button
            onClick={shareOnWhatsApp}
            size="sm"
            variant="outline"
            className="gap-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.164-.572c.859.434 1.828.665 2.814.665.003 0 0 0 0 0 3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.768-5.765-5.768zm3.034 8.354c-.129.36-.837.754-1.145.785-.295.03-.589.046-.883.046-.254 0-.577-.058-.908-.174-.46-.162-1.106-.461-1.832-.99-.884-.645-1.577-1.504-1.997-2.281-.225-.417-.344-.776-.38-1.073-.036-.297.041-.586.21-.818.18-.247.43-.391.675-.463.191-.056.384-.063.52-.063.114 0 .194.008.272.19.058.136.165.374.265.577.109.226.233.483.312.641.087.174.126.343.033.532-.099.209-.238.39-.332.5-.085.105-.164.189-.253.292-.087.105-.173.206-.082.368.092.164.24.352.463.618.276.332.639.607 1.042.8.259.124.463.192.607.234.056.017.104.026.148.035.091.015.184.02.276.013.277-.02.476-.187.583-.335.106-.149.218-.389.267-.61.045-.204.038-.361-.022-.49-.043-.094-.097-.146-.151-.188-.044-.035-.082-.06-.105-.074-.02-.012-.038-.02-.047-.023-.014-.004-.028-.007-.042-.01-.019-.005-.039-.01-.061-.018-.082-.029-.159-.053-.209-.075-.056-.024-.117-.051-.18-.084-.126-.065-.197-.098-.265-.166-.075-.076-.1-.146-.059-.24.044-.102.113-.183.181-.262.071-.083.141-.165.186-.249.06-.115.066-.247-.001-.359-.091-.154-.195-.29-.297-.419-.129-.166-.273-.307-.432-.421-.2-.143-.456-.241-.72-.288-.212-.038-.435-.033-.642.014-.218.049-.415.14-.596.25-.165.1-.307.217-.422.345-.149.165-.246.309-.288.432-.034.101-.049.202-.045.302.004.099.023.194.055.283.031.088.074.171.126.248.053.078.111.15.174.218.087.094.184.181.284.262.195.16.372.347.514.56.184.278.308.576.362.881.035.2.035.397.001.589-.026.144-.068.28-.124.407z" />
            </svg>
            WhatsApp
          </Button>

          <Button
            onClick={shareOnSMS}
            size="sm"
            variant="outline"
            className="gap-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            SMS
          </Button>

          <Button
            onClick={copyToClipboard}
            size="sm"
            variant="outline"
            className="gap-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            Copy
          </Button>
        </div>

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
      <div className="space-y-2">
        <Label htmlFor="admissionNumber">
          Admission Number
          <span className="text-xs text-muted-foreground ml-1">
            (Optional - must be unique if provided)
          </span>
        </Label>
        <div className="relative">
          <Input
            id="admissionNumber"
            name="admissionNumber"
            placeholder="e.g., 5432"
            value={admissionNumber}
            onChange={handleAdmissionNumberChange}
            className={`pr-10 ${admissionError ? "border-destructive" : admissionValid && admissionNumber ? "border-green-500" : ""}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isCheckingAdmission ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : admissionValid && admissionNumber ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : admissionError ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : null}
          </div>
        </div>
        {admissionError && (
          <p className="text-xs text-destructive mt-1">{admissionError}</p>
        )}
        {admissionValid && admissionNumber && !admissionError && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Admission number available
          </p>
        )}
      </div>

      {/* Date Fields with Validation */}
      <div className="space-y-2">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 mb-2">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Alumni registration requires that the
            student's entry year is prior to {currentYear} and the exit date
            must be at least 3 months ago.
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
            max={(() => {
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              return threeMonthsAgo.toISOString().split("T")[0];
            })()}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 3 months ago
          </p>
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
          <div className="space-y-2">
            <CurrencyInput
              id="registrationAmount"
              name="registrationAmount"
              label="Registration Amount"
              required={true}
              placeholder="Enter amount in New Leone (SLE)"
              onValueChange={handleAmountChange}
            />
            {amountError && (
              <p className="text-xs text-destructive">{amountError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum amount: {MIN_REGISTRATION_AMOUNT} SLE
            </p>
          </div>
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
        disabled={
          isSubmitting || isCheckingEmail || !!dateError || !!amountError
        }
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
