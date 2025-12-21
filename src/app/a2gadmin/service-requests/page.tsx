"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

/* ======================================================
   TYPES
====================================================== */

interface ServiceRequest {
  id: string;
  serviceTitle: string;
  email: string;
  whatsapp?: string;
  status: "new" | "in-progress" | "completed" | "closed";
  createdAt: Timestamp;
}

/* ======================================================
   PAGE
====================================================== */

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "service_requests"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ServiceRequest[];

      setRequests(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function updateStatus(id: string, status: ServiceRequest["status"]) {
    await updateDoc(doc(db, "service_requests", id), {
      status,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading service requests…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Service Requests</h1>
      <p className="text-muted-foreground">
        View and manage academic service inquiries submitted by users.
      </p>

      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No service requests yet.
                </TableCell>
              </TableRow>
            )}

            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">
                  {req.serviceTitle}
                </TableCell>

                <TableCell>{req.email}</TableCell>

                <TableCell>
                  {req.whatsapp || "—"}
                </TableCell>

                <TableCell>
                  <Select
                    value={req.status}
                    onValueChange={(v) =>
                      updateStatus(req.id, v as ServiceRequest["status"])
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {req.createdAt.toDate().toLocaleDateString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
