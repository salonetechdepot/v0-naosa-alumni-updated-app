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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Search, Heart, Users, DollarSign } from "lucide-react";

type TransactionType = "registration" | "donation" | "contribution";

interface Transaction {
  id: string;
  memberId: string | null;
  memberName: string;
  phone: string;
  amount: number;
  transactionReference: string;
  systemReference: string;
  type: TransactionType;
  description: string | null;
  createdAt: string;
}

const typeConfig: Record<
  TransactionType,
  { label: string; color: string; icon: typeof CreditCard }
> = {
  registration: {
    label: "Registration",
    color: "bg-blue-100 text-blue-800",
    icon: Users,
  },
  donation: {
    label: "Donation",
    color: "bg-green-100 text-green-800",
    icon: Heart,
  },
  contribution: {
    label: "Contribution",
    color: "bg-amber-100 text-amber-800",
    icon: DollarSign,
  },
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transactions");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load transactions");
        }

        setTransactions(result.transactions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.memberName.toLowerCase().includes(query) ||
      t.phone.toLowerCase().includes(query) ||
      t.transactionReference.toLowerCase().includes(query) ||
      t.systemReference.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query));

    const matchesType = typeFilter === "all" || t.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );

  // Calculate totals by type
  const registrationTotal = transactions
    .filter((t) => t.type === "registration")
    .reduce((sum, t) => sum + t.amount, 0);
  const donationTotal = transactions
    .filter((t) => t.type === "donation")
    .reduce((sum, t) => sum + t.amount, 0);
  const contributionTotal = transactions
    .filter((t) => t.type === "contribution")
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">
          Track all payment transactions including registrations, donations, and
          contributions
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {(
                registrationTotal +
                donationTotal +
                contributionTotal
              ).toLocaleString()}{" "}
              SLE
            </p>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {registrationTotal.toLocaleString()} SLE
            </p>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "registration").length}{" "}
              transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Donations
            </CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {donationTotal.toLocaleString()} SLE
            </p>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "donation").length}{" "}
              transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contributions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {contributionTotal.toLocaleString()} SLE
            </p>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "contribution").length}{" "}
              transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All payment records from registrations, donations, and
                contributions
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="registration">Registrations</SelectItem>
                  <SelectItem value="donation">Donations</SelectItem>
                  <SelectItem value="contribution">Contributions</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== "all"
                  ? "No transactions match your filters"
                  : "No transactions yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                Transactions will appear here when members register or make
                donations
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Transaction Ref</TableHead>
                    <TableHead>System Ref</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .map((transaction) => {
                      const config =
                        typeConfig[transaction.type] || typeConfig.registration;
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge className={config.color} variant="secondary">
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.memberName}
                          </TableCell>
                          <TableCell>{transaction.phone}</TableCell>
                          <TableCell>
                            {transaction.amount.toLocaleString()} SLE
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {transaction.description || "-"}
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-2 py-1 text-xs">
                              {transaction.transactionReference}
                            </code>
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-primary/10 text-primary px-2 py-1 text-xs font-medium">
                              {transaction.systemReference}
                            </code>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction.createdAt,
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Filtered totals */}
          {filteredTransactions.length > 0 && (
            <div className="mt-4 flex justify-end border-t pt-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredTransactions.length} of {transactions.length}{" "}
                  transactions
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Total: {totalAmount.toLocaleString()} SLE
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
