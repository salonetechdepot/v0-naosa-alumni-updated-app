"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  middleName: string | null;
  surname: string;
  gender: string;
  currentAddress: string;
  city: string | null;
  country: string | null;
  admissionNumber: string | null;
  dateOfEntry: string;
  dateOfExit: string;
  email: string | null;
  phone: string;
  registrationAmount: number;
  transactionReference: string;
  systemReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function MembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchApprovedMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/members?status=approved");

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedMembers();
  }, []);

  // Refresh when page becomes visible (after modal closes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchApprovedMembers();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Pagination calculations
  const totalMembers = members.length;
  const totalPages = Math.ceil(totalMembers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalMembers);
  const currentMembers = members.slice(startIndex, endIndex);

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Approved Members
          </CardTitle>
          <CardDescription>List of approved NAOSA members</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading members...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Approved Members
          </CardTitle>
          <CardDescription>List of approved NAOSA members</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={fetchApprovedMembers}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Approved Members
          </CardTitle>
          <CardDescription>List of approved NAOSA members</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No approved members yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to register and get approved!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Approved Members
          <Badge variant="secondary" className="ml-2">
            {totalMembers}
          </Badge>
        </CardTitle>
        <CardDescription>List of approved NAOSA members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Admission Number</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Entry Year</TableHead>
                <TableHead>Exit Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMembers.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell className="text-muted-foreground">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {member.firstName}{" "}
                    {member.middleName ? `${member.middleName} ` : ""}
                    {member.surname}
                  </TableCell>
                  <TableCell className="capitalize">{member.gender}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {member.admissionNumber || "N/A"}
                    </code>
                  </TableCell>
                  <TableCell>{member.city || "N/A"}</TableCell>
                  <TableCell>{member.country || "Sierra Leone"}</TableCell>
                  <TableCell>
                    {new Date(member.dateOfEntry).getFullYear()}
                  </TableCell>
                  <TableCell>
                    {new Date(member.dateOfExit).getFullYear()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {totalMembers} members
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 px-2">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Users,
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
// } from "lucide-react";

// interface Member {
//   id: string;
//   firstName: string;
//   middleName: string | null;
//   surname: string;
//   gender: string;
//   currentAddress: string;
//   city: string | null;
//   country: string | null;
//   admissionNumber: string | null;
//   dateOfEntry: string;
//   dateOfExit: string;
//   email: string | null;
//   phone: string;
//   registrationAmount: number;
//   transactionReference: string;
//   systemReference: string;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
// }

// const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// export function MembersList() {
//   const [members, setMembers] = useState<Member[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const fetchApprovedMembers = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const response = await fetch("/api/members?status=approved");

//       if (!response.ok) {
//         throw new Error("Failed to fetch members");
//       }

//       const data = await response.json();
//       setMembers(data.members || []);
//     } catch (err) {
//       console.error("Error fetching members:", err);
//       setError(err instanceof Error ? err.message : "Failed to load members");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedMembers();
//   }, []);

//   // Refresh when page becomes visible (after modal closes)
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (!document.hidden) {
//         fetchApprovedMembers();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () =>
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);

//   // Pagination calculations
//   const totalMembers = members.length;
//   const totalPages = Math.ceil(totalMembers / pageSize);
//   const startIndex = (currentPage - 1) * pageSize;
//   const endIndex = Math.min(startIndex + pageSize, totalMembers);
//   const currentMembers = members.slice(startIndex, endIndex);

//   const handlePageSizeChange = (newSize: string) => {
//     setPageSize(Number(newSize));
//     setCurrentPage(1);
//   };

//   const goToPage = (page: number) => {
//     setCurrentPage(Math.max(1, Math.min(page, totalPages)));
//   };

//   if (isLoading) {
//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Approved Members
//           </CardTitle>
//           <CardDescription>List of approved NAOSA members</CardDescription>
//         </CardHeader>
//         <CardContent className="flex items-center justify-center py-12">
//           <p className="text-muted-foreground">Loading members...</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Approved Members
//           </CardTitle>
//           <CardDescription>List of approved NAOSA members</CardDescription>
//         </CardHeader>
//         <CardContent className="flex flex-col items-center justify-center py-12 text-center">
//           <p className="text-destructive">Error: {error}</p>
//           <Button
//             variant="outline"
//             className="mt-4"
//             onClick={fetchApprovedMembers}
//           >
//             Try Again
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (members.length === 0) {
//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Approved Members
//           </CardTitle>
//           <CardDescription>List of approved NAOSA members</CardDescription>
//         </CardHeader>
//         <CardContent className="flex flex-col items-center justify-center py-12 text-center">
//           <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
//             <Users className="h-8 w-8 text-muted-foreground" />
//           </div>
//           <p className="text-muted-foreground">No approved members yet.</p>
//           <p className="text-sm text-muted-foreground mt-2">
//             Be the first to register and get approved!
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Users className="h-5 w-5" />
//           Approved Members
//           <Badge variant="secondary" className="ml-2">
//             {totalMembers}
//           </Badge>
//         </CardTitle>
//         <CardDescription>List of approved NAOSA members</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-12">#</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Gender</TableHead>
//                 <TableHead>Location</TableHead>
//                 <TableHead>Entry Year</TableHead>
//                 <TableHead>Exit Year</TableHead>
//                 <TableHead>System Ref</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {currentMembers.map((member, index) => (
//                 <TableRow key={member.id}>
//                   <TableCell className="text-muted-foreground">
//                     {startIndex + index + 1}
//                   </TableCell>
//                   <TableCell className="font-medium">
//                     {member.firstName}{" "}
//                     {member.middleName ? `${member.middleName} ` : ""}
//                     {member.surname}
//                   </TableCell>
//                   <TableCell className="capitalize">{member.gender}</TableCell>
//                   <TableCell>
//                     {member.city
//                       ? `${member.city}, ${member.country || "Sierra Leone"}`
//                       : "N/A"}
//                   </TableCell>
//                   <TableCell>
//                     {new Date(member.dateOfEntry).getFullYear()}
//                   </TableCell>
//                   <TableCell>
//                     {new Date(member.dateOfExit).getFullYear()}
//                   </TableCell>
//                   <TableCell>
//                     <code className="rounded bg-muted px-2 py-1 text-xs">
//                       {member.systemReference}
//                     </code>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Pagination Controls */}
//         <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <span>Show</span>
//             <Select
//               value={pageSize.toString()}
//               onValueChange={handlePageSizeChange}
//             >
//               <SelectTrigger className="h-8 w-[70px]">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {PAGE_SIZE_OPTIONS.map((size) => (
//                   <SelectItem key={size} value={size.toString()}>
//                     {size}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <span>per page</span>
//           </div>

//           <div className="text-sm text-muted-foreground">
//             Showing {startIndex + 1} to {endIndex} of {totalMembers} members
//           </div>

//           <div className="flex items-center gap-1">
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8"
//               onClick={() => goToPage(1)}
//               disabled={currentPage === 1}
//             >
//               <ChevronsLeft className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8"
//               onClick={() => goToPage(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             <div className="flex items-center gap-1 px-2">
//               <span className="text-sm">
//                 Page {currentPage} of {totalPages}
//               </span>
//             </div>

//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8"
//               onClick={() => goToPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8"
//               onClick={() => goToPage(totalPages)}
//               disabled={currentPage === totalPages}
//             >
//               <ChevronsRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// //

// // "use client";

// // import { useEffect, useState } from "react";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { Badge } from "@/components/ui/badge";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   Users,
// //   ChevronLeft,
// //   ChevronRight,
// //   ChevronsLeft,
// //   ChevronsRight,
// // } from "lucide-react";

// // interface Member {
// //   id: string;
// //   firstName: string;
// //   middleName: string | null;
// //   surname: string;
// //   gender: string;
// //   currentAddress: string;
// //   city: string | null;
// //   country: string | null;
// //   admissionNumber: string | null;
// //   dateOfEntry: string;
// //   dateOfExit: string;
// //   email: string | null;
// //   phone: string;
// //   registrationAmount: number;
// //   transactionReference: string;
// //   systemReference: string;
// //   status: string;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// // export function MembersList() {
// //   const [members, setMembers] = useState<Member[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [pageSize, setPageSize] = useState(10);

// //   const fetchApprovedMembers = async () => {
// //     try {
// //       setIsLoading(true);
// //       setError(null);
// //       const response = await fetch("/api/members?status=approved");

// //       if (!response.ok) {
// //         throw new Error("Failed to fetch members");
// //       }

// //       const data = await response.json();
// //       setMembers(data.members || []);
// //     } catch (err) {
// //       console.error("Error fetching members:", err);
// //       setError(err instanceof Error ? err.message : "Failed to load members");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchApprovedMembers();
// //   }, []);

// //   // Refresh when page becomes visible (after modal closes)
// //   useEffect(() => {
// //     const handleVisibilityChange = () => {
// //       if (!document.hidden) {
// //         fetchApprovedMembers();
// //       }
// //     };

// //     document.addEventListener("visibilitychange", handleVisibilityChange);
// //     return () =>
// //       document.removeEventListener("visibilitychange", handleVisibilityChange);
// //   }, []);

// //   // Pagination calculations
// //   const totalMembers = members.length;
// //   const totalPages = Math.ceil(totalMembers / pageSize);
// //   const startIndex = (currentPage - 1) * pageSize;
// //   const endIndex = Math.min(startIndex + pageSize, totalMembers);
// //   const currentMembers = members.slice(startIndex, endIndex);

// //   const handlePageSizeChange = (newSize: string) => {
// //     setPageSize(Number(newSize));
// //     setCurrentPage(1);
// //   };

// //   const goToPage = (page: number) => {
// //     setCurrentPage(Math.max(1, Math.min(page, totalPages)));
// //   };

// //   if (isLoading) {
// //     return (
// //       <Card>
// //         <CardHeader>
// //           <CardTitle className="flex items-center gap-2">
// //             <Users className="h-5 w-5" />
// //             Approved Members
// //           </CardTitle>
// //           <CardDescription>List of approved NAOSA members</CardDescription>
// //         </CardHeader>
// //         <CardContent className="flex items-center justify-center py-12">
// //           <p className="text-muted-foreground">Loading members...</p>
// //         </CardContent>
// //       </Card>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <Card>
// //         <CardHeader>
// //           <CardTitle className="flex items-center gap-2">
// //             <Users className="h-5 w-5" />
// //             Approved Members
// //           </CardTitle>
// //           <CardDescription>List of approved NAOSA members</CardDescription>
// //         </CardHeader>
// //         <CardContent className="flex flex-col items-center justify-center py-12 text-center">
// //           <p className="text-destructive">Error: {error}</p>
// //           <Button
// //             variant="outline"
// //             className="mt-4"
// //             onClick={fetchApprovedMembers}
// //           >
// //             Try Again
// //           </Button>
// //         </CardContent>
// //       </Card>
// //     );
// //   }

// //   if (members.length === 0) {
// //     return (
// //       <Card>
// //         <CardHeader>
// //           <CardTitle className="flex items-center gap-2">
// //             <Users className="h-5 w-5" />
// //             Approved Members
// //           </CardTitle>
// //           <CardDescription>List of approved NAOSA members</CardDescription>
// //         </CardHeader>
// //         <CardContent className="flex flex-col items-center justify-center py-12 text-center">
// //           <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
// //             <Users className="h-8 w-8 text-muted-foreground" />
// //           </div>
// //           <p className="text-muted-foreground">No approved members yet.</p>
// //           <p className="text-sm text-muted-foreground mt-2">
// //             Be the first to register and get approved!
// //           </p>
// //         </CardContent>
// //       </Card>
// //     );
// //   }

// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle className="flex items-center gap-2">
// //           <Users className="h-5 w-5" />
// //           Approved Members
// //           <Badge variant="secondary" className="ml-2">
// //             {totalMembers}
// //           </Badge>
// //         </CardTitle>
// //         <CardDescription>List of approved NAOSA members</CardDescription>
// //       </CardHeader>
// //       <CardContent className="space-y-4">
// //         <div className="overflow-x-auto">
// //           <Table>
// //             <TableHeader>
// //               <TableRow>
// //                 <TableHead className="w-12">#</TableHead>
// //                 <TableHead>Name</TableHead>
// //                 <TableHead>Gender</TableHead>
// //                 <TableHead>Location</TableHead>
// //                 <TableHead>Entry Year</TableHead>
// //                 <TableHead>Exit Year</TableHead>
// //                 <TableHead>System Ref</TableHead>
// //               </TableRow>
// //             </TableHeader>
// //             <TableBody>
// //               {currentMembers.map((member, index) => (
// //                 <TableRow key={member.id}>
// //                   <TableCell className="text-muted-foreground">
// //                     {startIndex + index + 1}
// //                   </TableCell>
// //                   <TableCell className="font-medium">
// //                     {member.firstName}{" "}
// //                     {member.middleName ? `${member.middleName} ` : ""}
// //                     {member.surname}
// //                   </TableCell>
// //                   <TableCell className="capitalize">{member.gender}</TableCell>
// //                   <TableCell>
// //                     {member.city
// //                       ? `${member.city}, ${member.country || "Sierra Leone"}`
// //                       : "N/A"}
// //                   </TableCell>
// //                   <TableCell>
// //                     {new Date(member.dateOfEntry).getFullYear()}
// //                   </TableCell>
// //                   <TableCell>
// //                     {new Date(member.dateOfExit).getFullYear()}
// //                   </TableCell>
// //                   <TableCell>
// //                     <code className="rounded bg-muted px-2 py-1 text-xs">
// //                       {member.systemReference}
// //                     </code>
// //                   </TableCell>
// //                 </TableRow>
// //               ))}
// //             </TableBody>
// //           </Table>
// //         </div>

// //         {/* Pagination Controls */}
// //         <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
// //           <div className="flex items-center gap-2 text-sm text-muted-foreground">
// //             <span>Show</span>
// //             <Select
// //               value={pageSize.toString()}
// //               onValueChange={handlePageSizeChange}
// //             >
// //               <SelectTrigger className="h-8 w-[70px]">
// //                 <SelectValue />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {PAGE_SIZE_OPTIONS.map((size) => (
// //                   <SelectItem key={size} value={size.toString()}>
// //                     {size}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //             <span>per page</span>
// //           </div>

// //           <div className="text-sm text-muted-foreground">
// //             Showing {startIndex + 1} to {endIndex} of {totalMembers} members
// //           </div>

// //           <div className="flex items-center gap-1">
// //             <Button
// //               variant="outline"
// //               size="icon"
// //               className="h-8 w-8"
// //               onClick={() => goToPage(1)}
// //               disabled={currentPage === 1}
// //             >
// //               <ChevronsLeft className="h-4 w-4" />
// //             </Button>
// //             <Button
// //               variant="outline"
// //               size="icon"
// //               className="h-8 w-8"
// //               onClick={() => goToPage(currentPage - 1)}
// //               disabled={currentPage === 1}
// //             >
// //               <ChevronLeft className="h-4 w-4" />
// //             </Button>

// //             <div className="flex items-center gap-1 px-2">
// //               <span className="text-sm">
// //                 Page {currentPage} of {totalPages}
// //               </span>
// //             </div>

// //             <Button
// //               variant="outline"
// //               size="icon"
// //               className="h-8 w-8"
// //               onClick={() => goToPage(currentPage + 1)}
// //               disabled={currentPage === totalPages}
// //             >
// //               <ChevronRight className="h-4 w-4" />
// //             </Button>
// //             <Button
// //               variant="outline"
// //               size="icon"
// //               className="h-8 w-8"
// //               onClick={() => goToPage(totalPages)}
// //               disabled={currentPage === totalPages}
// //             >
// //               <ChevronsRight className="h-4 w-4" />
// //             </Button>
// //           </div>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   );
// // }
