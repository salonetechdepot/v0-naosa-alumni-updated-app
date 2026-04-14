"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Users,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Hash,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

type RegistrationStatus = "pending" | "approved" | "rejected";

interface Member {
  id: string;
  firstName: string;
  middleName: string | null;
  surname: string;
  gender: string;
  currentAddress: string;
  admissionNumber: string | null;
  dateOfEntry: string;
  dateOfExit: string;
  email: string | null;
  phone: string;
  registrationAmount: number;
  transactionReference: string;
  systemReference: string;
  status: RegistrationStatus;
  createdAt: string;
  userId: string | null;
}

export default function AdminRegistrationsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/members");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load members");
      }

      setMembers(result.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleStatusChange = async (id: string, status: RegistrationStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update status");
      }

      toast.success(`Registration ${status} successfully`);
      await fetchMembers();
      setDetailsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pendingMembers = members.filter((m) => m.status === "pending");
  const approvedMembers = members.filter((m) => m.status === "approved");
  const rejectedMembers = members.filter((m) => m.status === "rejected");

  const MemberTable = ({ members: memberList }: { members: Member[] }) => {
    if (memberList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No registrations in this category
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Admission No.</TableHead>
              <TableHead>Member ID</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>System Ref</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberList.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.firstName}{" "}
                  {member.middleName ? member.middleName + " " : ""}
                  {member.surname}
                </TableCell>
                <TableCell>
                  {member.admissionNumber ? (
                    <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                      {member.admissionNumber}
                    </code>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {member.userId ? (
                    <code
                      className="rounded bg-muted px-2 py-1 text-xs font-mono"
                      title={member.userId}
                    >
                      {member.userId.slice(-8)}
                    </code>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell className="font-medium">
                  {member.registrationAmount.toLocaleString()} SLE
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                    {member.systemReference.slice(-12)}
                  </code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(member.createdAt)}
                </TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedMember(member);
                        setDetailsOpen(true);
                      }}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {member.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleStatusChange(member.id, "approved")
                          }
                          disabled={isUpdating}
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleStatusChange(member.id, "rejected")
                          }
                          disabled={isUpdating}
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
          <p className="text-muted-foreground">Loading registrations...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
        <p className="text-muted-foreground">
          Manage alumni registration requests
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registration Management</CardTitle>
          <CardDescription>
            Review and process alumni registration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingMembers.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved ({approvedMembers.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected ({rejectedMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <MemberTable members={pendingMembers} />
            </TabsContent>

            <TabsContent value="approved">
              <MemberTable members={approvedMembers} />
            </TabsContent>

            <TabsContent value="rejected">
              <MemberTable members={rejectedMembers} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Registration Details
            </DialogTitle>
            <DialogDescription>
              Full details for this registration request
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              {/* Header with Name and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedMember.firstName}{" "}
                    {selectedMember.middleName
                      ? selectedMember.middleName + " "
                      : ""}
                    {selectedMember.surname}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    Ref: {selectedMember.systemReference}
                  </p>
                </div>
                {getStatusBadge(selectedMember.status)}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Admission Number
                      </p>
                      <p className="font-medium font-mono">
                        {selectedMember.admissionNumber || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Member ID (User Link)
                      </p>
                      <p className="font-medium font-mono text-sm">
                        {selectedMember.userId ? (
                          <span title={selectedMember.userId}>
                            {selectedMember.userId.slice(-12)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">
                        {selectedMember.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Current Address
                      </p>
                      <p className="font-medium">
                        {selectedMember.currentAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Date of Entry
                      </p>
                      <p className="font-medium">
                        {formatDate(selectedMember.dateOfEntry)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Date of Exit
                      </p>
                      <p className="font-medium">
                        {formatDate(selectedMember.dateOfExit)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium break-all">
                        {selectedMember.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedMember.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Registration Amount
                      </p>
                      <p className="font-medium">
                        {selectedMember.registrationAmount.toLocaleString()} SLE
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Transaction Reference
                      </p>
                      <p className="font-medium font-mono text-sm break-all">
                        {selectedMember.transactionReference}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Registration Date
                      </p>
                      <p className="font-medium">
                        {new Date(selectedMember.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Pending Registrations */}
              {selectedMember.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t mt-2">
                  <Button
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      handleStatusChange(selectedMember.id, "approved")
                    }
                    disabled={isUpdating}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isUpdating ? "Processing..." : "Approve Registration"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() =>
                      handleStatusChange(selectedMember.id, "rejected")
                    }
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4" />
                    {isUpdating ? "Processing..." : "Reject Registration"}
                  </Button>
                </div>
              )}

              {/* Info for Approved/Rejected */}
              {selectedMember.status !== "pending" && (
                <div className="rounded-lg bg-muted p-3 text-center text-sm">
                  <p className="text-muted-foreground">
                    This registration has been{" "}
                    <span className="font-semibold capitalize">
                      {selectedMember.status}
                    </span>
                    .
                    {selectedMember.status === "approved" &&
                      selectedMember.userId && (
                        <span className="block mt-1 text-xs">
                          A user account has been linked to this member.
                        </span>
                      )}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 'use client'

// import { useEffect, useState, useCallback } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { Skeleton } from '@/components/ui/skeleton'
// import { CheckCircle, XCircle, Eye, Clock, Users } from 'lucide-react'

// type RegistrationStatus = 'pending' | 'approved' | 'rejected'

// interface Member {
//   id: string
//   firstName: string
//   middleName: string | null
//   surname: string
//   gender: string
//   currentAddress: string
//   admissionNumber: string | null
//   dateOfEntry: string
//   dateOfExit: string
//   email: string | null
//   phone: string
//   registrationAmount: number
//   transactionReference: string
//   systemReference: string
//   status: RegistrationStatus
//   createdAt: string
// }

// export default function AdminRegistrationsPage() {
//   const [members, setMembers] = useState<Member[]>([])
//   const [selectedMember, setSelectedMember] = useState<Member | null>(null)
//   const [detailsOpen, setDetailsOpen] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [error, setError] = useState('')

//   const fetchMembers = useCallback(async () => {
//     try {
//       const response = await fetch('/api/members')
//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to load members')
//       }

//       setMembers(result.members)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load members')
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     fetchMembers()
//   }, [fetchMembers])

//   const handleStatusChange = async (id: string, status: RegistrationStatus) => {
//     setIsUpdating(true)
//     try {
//       const response = await fetch(`/api/members/${id}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to update status')
//       }

//       // Refresh members list
//       await fetchMembers()
//       setDetailsOpen(false)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to update status')
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   const getStatusBadge = (status: RegistrationStatus) => {
//     switch (status) {
//       case 'pending':
//         return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
//       case 'approved':
//         return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
//       case 'rejected':
//         return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>
//     }
//   }

//   const pendingMembers = members.filter(m => m.status === 'pending')
//   const approvedMembers = members.filter(m => m.status === 'approved')
//   const rejectedMembers = members.filter(m => m.status === 'rejected')

//   const MemberTable = ({ members: memberList }: { members: Member[] }) => {
//     if (memberList.length === 0) {
//       return (
//         <div className="flex flex-col items-center justify-center py-12 text-center">
//           <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
//             <Users className="h-8 w-8 text-muted-foreground" />
//           </div>
//           <p className="text-muted-foreground">No registrations in this category</p>
//         </div>
//       )
//     }

//     return (
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Phone</TableHead>
//               <TableHead>Amount</TableHead>
//               <TableHead>System Ref</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {memberList.map((member) => (
//               <TableRow key={member.id}>
//                 <TableCell className="font-medium">
//                   {member.firstName} {member.surname}
//                 </TableCell>
//                 <TableCell>{member.phone}</TableCell>
//                 <TableCell>{member.registrationAmount.toLocaleString()} SLE</TableCell>
//                 <TableCell>
//                   <code className="rounded bg-muted px-2 py-1 text-xs">
//                     {member.systemReference}
//                   </code>
//                 </TableCell>
//                 <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
//                 <TableCell>{getStatusBadge(member.status)}</TableCell>
//                 <TableCell>
//                   <div className="flex items-center gap-1">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => {
//                         setSelectedMember(member)
//                         setDetailsOpen(true)
//                       }}
//                     >
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                     {member.status === 'pending' && (
//                       <>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-green-600 hover:text-green-700 hover:bg-green-50"
//                           onClick={() => handleStatusChange(member.id, 'approved')}
//                           disabled={isUpdating}
//                         >
//                           <CheckCircle className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                           onClick={() => handleStatusChange(member.id, 'rejected')}
//                           disabled={isUpdating}
//                         >
//                           <XCircle className="h-4 w-4" />
//                         </Button>
//                       </>
//                     )}
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     )
//   }

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
//           <p className="text-muted-foreground">Loading registrations...</p>
//         </div>
//         <Card>
//           <CardContent className="p-6">
//             <div className="space-y-4">
//               {[...Array(5)].map((_, i) => (
//                 <Skeleton key={i} className="h-12 w-full" />
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
//         <p className="text-muted-foreground">
//           Manage alumni registration requests
//         </p>
//       </div>

//       {error && (
//         <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle>Registration Management</CardTitle>
//           <CardDescription>
//             Review and process alumni registration requests
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Tabs defaultValue="pending">
//             <TabsList className="mb-4">
//               <TabsTrigger value="pending" className="gap-2">
//                 <Clock className="h-4 w-4" />
//                 Pending ({pendingMembers.length})
//               </TabsTrigger>
//               <TabsTrigger value="approved" className="gap-2">
//                 <CheckCircle className="h-4 w-4" />
//                 Approved ({approvedMembers.length})
//               </TabsTrigger>
//               <TabsTrigger value="rejected" className="gap-2">
//                 <XCircle className="h-4 w-4" />
//                 Rejected ({rejectedMembers.length})
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="pending">
//               <MemberTable members={pendingMembers} />
//             </TabsContent>

//             <TabsContent value="approved">
//               <MemberTable members={approvedMembers} />
//             </TabsContent>

//             <TabsContent value="rejected">
//               <MemberTable members={rejectedMembers} />
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>

//       {/* Member Details Dialog */}
//       <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Registration Details</DialogTitle>
//             <DialogDescription>
//               Full details for this registration request
//             </DialogDescription>
//           </DialogHeader>
//           {selectedMember && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-lg font-semibold text-foreground">
//                     {selectedMember.firstName} {selectedMember.middleName} {selectedMember.surname}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     System Ref: {selectedMember.systemReference}
//                   </p>
//                 </div>
//                 {getStatusBadge(selectedMember.status)}
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-xs text-muted-foreground">Gender</p>
//                     <p className="font-medium capitalize">{selectedMember.gender}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Current Address</p>
//                     <p className="font-medium">{selectedMember.currentAddress}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Admission Number</p>
//                     <p className="font-medium">{selectedMember.admissionNumber || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Date of Entry</p>
//                     <p className="font-medium">{new Date(selectedMember.dateOfEntry).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Date of Exit</p>
//                     <p className="font-medium">{new Date(selectedMember.dateOfExit).toLocaleDateString()}</p>
//                   </div>
//                 </div>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-xs text-muted-foreground">Email</p>
//                     <p className="font-medium">{selectedMember.email || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Phone</p>
//                     <p className="font-medium">{selectedMember.phone}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Registration Amount</p>
//                     <p className="font-medium">{selectedMember.registrationAmount.toLocaleString()} SLE</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Transaction Reference</p>
//                     <p className="font-medium">{selectedMember.transactionReference}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Registration Date</p>
//                     <p className="font-medium">{new Date(selectedMember.createdAt).toLocaleString()}</p>
//                   </div>
//                 </div>
//               </div>

//               {selectedMember.status === 'pending' && (
//                 <div className="flex gap-2 pt-4 border-t">
//                   <Button
//                     className="flex-1 gap-2"
//                     onClick={() => handleStatusChange(selectedMember.id, 'approved')}
//                     disabled={isUpdating}
//                   >
//                     <CheckCircle className="h-4 w-4" />
//                     {isUpdating ? 'Updating...' : 'Approve'}
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     className="flex-1 gap-2"
//                     onClick={() => handleStatusChange(selectedMember.id, 'rejected')}
//                     disabled={isUpdating}
//                   >
//                     <XCircle className="h-4 w-4" />
//                     {isUpdating ? 'Updating...' : 'Reject'}
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }
