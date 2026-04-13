"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  ArrowLeft,
  Shield,
  Menu,
  X,
} from "lucide-react";

const adminNavLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/admin/users", label: "Admin Users", icon: Shield },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (pathname === "/admin/login") {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/auth");
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setIsSuperAdmin(data.isSuperAdmin || false);
        } else {
          setIsAuthenticated(false);
          router.push("/admin/login");
        }
      } catch {
        setIsAuthenticated(false);
        router.push("/admin/login");
      }
    }

    checkAuth();
  }, [pathname, router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // Ignore errors during logout
    }
    router.push("/admin/login");
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredNavLinks = isSuperAdmin
    ? adminNavLinks
    : adminNavLinks.filter((link) => link.href !== "/admin/users");

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Back to Site</span>
            </Link>
            <div className="hidden h-6 w-px bg-border md:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                N
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">
                NAOSA Admin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hidden sm:inline-block">
                Super Admin
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-border bg-card md:block">
          <nav className="flex flex-col gap-1 p-4">
            {filteredNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 transform bg-card transition-transform duration-300 ease-in-out md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                N
              </div>
              <span className="font-semibold text-foreground">NAOSA Admin</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {filteredNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-border">
              {isSuperAdmin && (
                <div className="mb-3 px-3 py-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Super Admin
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-3 px-3"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import {
//   LayoutDashboard,
//   Users,
//   CreditCard,
//   LogOut,
//   ArrowLeft,
//   ShieldPlus,
//   Shield,
// } from "lucide-react";

// const adminNavLinks = [
//   { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/admin/registrations", label: "Registrations", icon: Users },
//   { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
//   { href: "/admin/users", label: "Admin Users", icon: Shield },
// ];

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);

//   useEffect(() => {
//     async function checkAuth() {
//       // Skip auth check for login page
//       if (pathname === "/admin/login") {
//         setIsAuthenticated(false);
//         return;
//       }

//       try {
//         const response = await fetch("/api/admin/auth");
//         if (response.ok) {
//           const data = await response.json();
//           setIsAuthenticated(true);
//           setIsSuperAdmin(data.isSuperAdmin || false);
//         } else {
//           setIsAuthenticated(false);
//           router.push("/admin/login");
//         }
//       } catch {
//         setIsAuthenticated(false);
//         router.push("/admin/login");
//       }
//     }

//     checkAuth();
//   }, [pathname, router]);

//   const handleLogout = async () => {
//     try {
//       await fetch("/api/admin/auth", { method: "DELETE" });
//     } catch {
//       // Ignore errors during logout
//     }
//     router.push("/admin/login");
//   };

//   // Show nothing while checking auth
//   if (isAuthenticated === null) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-muted-foreground">Loading...</p>
//       </div>
//     );
//   }

//   // Show login page without admin layout
//   if (pathname === "/admin/login") {
//     return <>{children}</>;
//   }

//   // Not authenticated, redirecting
//   if (!isAuthenticated) {
//     return null;
//   }

//   // Filter nav links based on role (only super admin can see users management)
//   const filteredNavLinks = isSuperAdmin
//     ? adminNavLinks
//     : adminNavLinks.filter((link) => link.href !== "/admin/users");

//   return (
//     <div className="flex min-h-screen flex-col bg-muted/30">
//       {/* Admin Header */}
//       <header className="sticky top-0 z-50 border-b border-border bg-card">
//         <div className="flex h-16 items-center justify-between px-4 md:px-6">
//           <div className="flex items-center gap-4">
//             <Link
//               href="/"
//               className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span className="hidden sm:inline text-sm">Back to Site</span>
//             </Link>
//             <div className="h-6 w-px bg-border" />
//             <div className="flex items-center gap-2">
//               <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
//                 N
//               </div>
//               <span className="font-semibold text-foreground">NAOSA Admin</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {isSuperAdmin && (
//               <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
//                 Super Admin
//               </span>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={handleLogout}
//               className="gap-2"
//             >
//               <LogOut className="h-4 w-4" />
//               <span className="hidden sm:inline">Logout</span>
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="flex flex-1">
//         {/* Sidebar */}
//         <aside className="hidden w-64 border-r border-border bg-card md:block">
//           <nav className="flex flex-col gap-1 p-4">
//             {filteredNavLinks.map((link) => {
//               const Icon = link.icon;
//               const isActive = pathname === link.href;
//               return (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={cn(
//                     "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
//                     isActive
//                       ? "bg-primary text-primary-foreground"
//                       : "text-muted-foreground hover:bg-muted hover:text-foreground",
//                   )}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {link.label}
//                 </Link>
//               );
//             })}
//           </nav>
//         </aside>

//         {/* Mobile Navigation */}
//         <div className="border-b border-border bg-card p-2 md:hidden">
//           <nav className="flex gap-1 overflow-x-auto">
//             {filteredNavLinks.map((link) => {
//               const Icon = link.icon;
//               const isActive = pathname === link.href;
//               return (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={cn(
//                     "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
//                     isActive
//                       ? "bg-primary text-primary-foreground"
//                       : "text-muted-foreground hover:bg-muted hover:text-foreground",
//                   )}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {link.label}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Main Content */}
//         <main className="flex-1 overflow-auto">
//           <div className="p-4 md:p-6">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }
