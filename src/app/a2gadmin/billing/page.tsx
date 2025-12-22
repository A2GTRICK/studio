
"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  PlusCircle,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  order: number;
  name: string;
  price: number;
  durationLabel: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

export default function AdminBillingPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "billing_plans"),
        orderBy("order", "asc")
      );
      const snap = await getDocs(q);
      const planData = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Plan)
      );
      setPlans(planData);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Plans",
        description:
          err.message || "Could not fetch billing plans from the database.",
      });
    } finally {
      setLoading(false);
    }
  }

  function startNewPlan() {
    setEditingPlan({
      id: "new",
      name: "New Plan",
      price: 0,
      order: plans.length + 1,
      durationLabel: "/ month",
      description: "",
      features: ["Feature 1", "Feature 2"],
      isPopular: false,
      isActive: true,
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Billing Plans</h1>
          <p className="text-muted-foreground">
            Add, edit, or reorder your subscription plans.
          </p>
        </div>
        <Button onClick={startNewPlan}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditingPlan(plan)}
              onMove={async (direction) => {
                const otherIndex =
                  direction === "up" ? index - 1 : index + 1;
                if (otherIndex < 0 || otherIndex >= plans.length)
                  return;
                const otherPlan = plans[otherIndex];
                await Promise.all([
                  updateDoc(doc(db, "billing_plans", plan.id), {
                    order: otherPlan.order,
                  }),
                  updateDoc(doc(db, "billing_plans", otherPlan.id), {
                    order: plan.order,
                  }),
                ]);
                loadPlans();
              }}
            />
          ))}
        </div>
      )}

      {editingPlan && (
        <EditPlanDrawer
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={() => {
            setEditingPlan(null);
            loadPlans();
          }}
        />
      )}
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onMove,
}: {
  plan: Plan;
  onEdit: () => void;
  onMove: (direction: "up" | "down") => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          ₹{plan.price} {plan.durationLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="list-disc pl-5 text-sm space-y-1">
          {plan.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </CardContent>
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-1">
            <button
              onClick={() => onMove("up")}
              className="p-1 hover:bg-muted rounded"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMove("down")}
              className="p-1 hover:bg-muted rounded"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
          {plan.isPopular && <Badge>Popular</Badge>}
          <Badge variant={plan.isActive ? "default" : "destructive"}>
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onEdit}>
          Edit Plan
        </Button>
      </CardFooter>
    </Card>
  );
}

function EditPlanDrawer({
  plan,
  onClose,
  onSave,
}: {
  plan: Plan;
  onClose: () => void;
  onSave: () => void;
}) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(plan);

  const isNew = plan.id === "new";

  async function handleSave() {
    setIsSaving(true);
    const dataToSave = {
      ...formData,
      features: formData.features.filter((f) => f.trim()), // Remove empty features
      updatedAt: serverTimestamp(),
    };

    try {
      if (isNew) {
        const { id, ...createData } = dataToSave;
        await addDoc(collection(db, "billing_plans"), {
          ...createData,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "billing_plans", formData.id), dataToSave);
      }
      toast({ title: "Success", description: "Plan saved successfully." });
      onSave();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card p-6 shadow-xl overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isNew ? "Create New Plan" : "Edit Plan"}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="space-y-4">
          <Input
            placeholder="Plan Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
          />
          <Input
            placeholder="Duration Label (e.g., / month)"
            value={formData.durationLabel}
            onChange={(e) =>
              setFormData({ ...formData, durationLabel: e.target.value })
            }
          />
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Label>Features (one per line)</Label>
          <Textarea
            placeholder="Feature 1&#10;Feature 2"
            value={formData.features.join("\n")}
            onChange={(e) =>
              setFormData({ ...formData, features: e.target.value.split("\n") })
            }
            rows={5}
          />
          <div className="flex items-center justify-between">
            <Label>Mark as Popular</Label>
            <Switch
              checked={formData.isPopular}
              onCheckedChange={(c) =>
                setFormData({ ...formData, isPopular: c })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Is Active (Visible to users)</Label>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(c) =>
                setFormData({ ...formData, isActive: c })
              }
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-white">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
