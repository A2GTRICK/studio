
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Loader2, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  createdAt: any;
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      const paymentsRef = collection(db, "payments");
      const q = query(paymentsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const paymentData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Payment)
      );
      setPayments(paymentData);
      setLoading(false);
    }
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.userId.toLowerCase().includes(search.toLowerCase()) ||
        p.razorpay_payment_id.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === "all" || p.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [payments, search, planFilter]);

  const plans = useMemo(
    () => ["all", ...Array.from(new Set(payments.map((p) => p.plan)))],
    [payments]
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const exportToCSV = () => {
    const headers = [
      "Payment ID",
      "Order ID",
      "User ID",
      "Plan",
      "Amount",
      "Date",
    ];
    const rows = filteredPayments.map((p) => [
      p.razorpay_payment_id,
      p.razorpay_order_id,
      p.userId,
      p.plan,
      p.amount / 100, // Assuming amount is in paise
      formatDate(p.createdAt),
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((rowArray) => {
      let row = rowArray.join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-sm text-muted-foreground">
            View and export all transactions processed via Razorpay.
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/50 rounded-xl border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by User ID or Payment ID..."
            className="w-full sm:w-auto flex-grow pl-9 bg-card text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border p-2 rounded-lg bg-card text-foreground"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          {plans.map((plan) => (
            <option key={plan} value={plan}>
              {plan === "all" ? "All Plans" : plan}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b">
              <tr>
                <th className="p-4 font-semibold">User ID</th>
                <th className="p-4 font-semibold">Payment ID</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-8 text-muted-foreground"
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-b-0">
                    <td className="p-4 font-mono text-xs">{payment.userId}</td>
                    <td className="p-4 font-mono text-xs">
                      {payment.razorpay_payment_id}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                        {payment.plan}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      ₹{payment.amount / 100}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
