"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function StatusContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{
    status: string;
    name: string;
    systemReference: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ref) {
      setError("No reference provided");
      setIsLoading(false);
      toast.error("Invalid registration link");
      return;
    }

    async function checkStatus() {
      try {
        const response = await fetch(`/api/registration-status?ref=${ref}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to check status");
        }

        setStatus(result);

        // Show toast with status
        if (result.status === "approved") {
          toast.success(`✅ Registration Approved! Welcome ${result.name}!`);
        } else if (result.status === "rejected") {
          toast.error(`❌ Registration Status: Rejected`);
        } else {
          toast.info(`⏳ Registration Status: Pending Review`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check status");
        toast.error("Could not find registration. Please contact support.");
      } finally {
        setIsLoading(false);
      }
    }

    checkStatus();
  }, [ref]);

  const getStatusIcon = () => {
    if (!status) return null;
    switch (status.status) {
      case "approved":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "rejected":
        return <XCircle className="h-12 w-12 text-red-500" />;
      case "pending":
        return <Clock className="h-12 w-12 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (!status) return null;
    switch (status.status) {
      case "approved":
        return "Your registration has been approved! Welcome to NAOSA.";
      case "rejected":
        return "Your registration was not approved. Please contact support for more information.";
      case "pending":
        return "Your registration is pending review. You will receive an email once approved.";
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-xl font-semibold mb-2">Registration Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        {getStatusIcon()}
        <h1 className="text-2xl font-bold mt-4 mb-2">
          Registration{" "}
          {status?.status === "approved"
            ? "Approved!"
            : status?.status === "rejected"
              ? "Status Update"
              : "Pending Review"}
        </h1>
        <p className="text-muted-foreground mb-4">{getStatusMessage()}</p>
        <div className="rounded-lg bg-secondary/50 p-4 text-left">
          <p className="text-sm mb-2">
            <strong>Name:</strong> {status?.name}
          </p>
          <p className="text-sm">
            <strong>Reference:</strong> {status?.systemReference}
          </p>
        </div>
        <button
          onClick={() => window.close()}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StatusContent />
    </Suspense>
  );
}
