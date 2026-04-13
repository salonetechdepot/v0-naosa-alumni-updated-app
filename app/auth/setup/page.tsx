"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Mail, User, Briefcase } from "lucide-react";
import { toast } from "sonner";

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    async function verifyToken() {
      try {
        const response = await fetch(`/api/auth/setup?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValidToken(true);
          setUserInfo(data.user);
        } else {
          setIsValidToken(false);
        }
      } catch {
        setIsValidToken(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to set up account");
      }

      toast.success("Account set up successfully! Please log in.");
      router.push("/admin/login");
    } catch (error) {
      console.error("Error setting up account:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to set up account",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired. Please contact an
              administrator for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Set Up Your Account
          </CardTitle>
          <CardDescription>
            Complete your account setup to access the NAOSA portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userInfo && (
            <div className="mb-6 rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-sm mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {userInfo.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{userInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground capitalize">
                  Role: {userInfo.role?.replace("_", " ")}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SetupForm />
    </Suspense>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2, Shield, Mail, User, Briefcase } from "lucide-react";
// import { toast } from "sonner";

// export default function AdminSetupPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
//   const [userInfo, setUserInfo] = useState<{
//     name: string;
//     email: string;
//     role: string;
//   } | null>(null);

//   useEffect(() => {
//     if (!token) {
//       setIsValidToken(false);
//       return;
//     }

//     async function verifyToken() {
//       try {
//         const response = await fetch(`/api/admin/auth/setup?token=${token}`);
//         const data = await response.json();

//         if (response.ok && data.valid) {
//           setIsValidToken(true);
//           setUserInfo(data.user);
//         } else {
//           setIsValidToken(false);
//         }
//       } catch {
//         setIsValidToken(false);
//       }
//     }
//     verifyToken();
//   }, [token]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (password.length < 8) {
//       toast.error("Password must be at least 8 characters");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/admin/auth/setup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token, password }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "Failed to set up account");
//       }

//       toast.success("Account set up successfully! Please log in.");
//       router.push("/admin/login");
//     } catch (error) {
//       console.error("Error setting up account:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to set up account",
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isValidToken === null) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   if (!isValidToken) {
//     return (
//       <div className="flex min-h-screen items-center justify-center p-4">
//         <Card className="max-w-md w-full">
//           <CardHeader>
//             <CardTitle>Invalid Invitation</CardTitle>
//             <CardDescription>
//               This invitation link is invalid or has expired. Please contact an
//               administrator for a new invitation.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button onClick={() => router.push("/")} className="w-full">
//               Go to Home
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center p-4">
//       <Card className="max-w-md w-full">
//         <CardHeader className="text-center">
//           <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
//             <Shield className="h-6 w-6 text-primary" />
//           </div>
//           <CardTitle>Set Up Your Admin Account</CardTitle>
//           <CardDescription>
//             Create a password to access the NAOSA Admin Portal
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {userInfo && (
//             <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
//               <p className="font-medium">{userInfo.name}</p>
//               <p className="text-muted-foreground">{userInfo.email}</p>
//               <p className="text-xs text-muted-foreground mt-1 capitalize">
//                 Role: {userInfo.role?.replace("_", " ")}
//               </p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 minLength={8}
//               />
//               <p className="text-xs text-muted-foreground">
//                 Must be at least 8 characters
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Confirm Password</Label>
//               <Input
//                 id="confirmPassword"
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 required
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Setting up...
//                 </>
//               ) : (
//                 "Complete Setup"
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
