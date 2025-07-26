
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';


interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    popular: boolean;
}

// In a real app, this would be fetched from a database.
const initialPlans: Plan[] = [
  {
    id: "plan_weekly",
    name: "Weekly",
    price: "99",
    period: "/ week",
    popular: false,
  },
  {
    id: "plan_monthly",
    name: "Monthly",
    price: "299",
    period: "/ month",
    popular: true,
  },
  {
    id: "plan_yearly",
    name: "Yearly",
    price: "1499",
    period: "/ year",
    popular: false,
  },
];

export default function AdminPlansPage() {
    const { toast } = useToast();
    const [plans, setPlans] = useState<Plan[]>(initialPlans);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdatePlan = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingPlan) return;
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const updatedPlan: Plan = {
            ...editingPlan,
            name: formData.get('name') as string,
            price: formData.get('price') as string,
            period: formData.get('period') as string,
            popular: formData.get('popular') === 'on',
        };

        // Simulate API call
        setTimeout(() => {
            setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
            toast({ title: "Plan Updated!", description: `The "${updatedPlan.name}" plan has been updated.` });
            setEditingPlan(null);
            setIsSubmitting(false);
        }, 500);
    };

    return (
        <>
            <div className="pt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Manage Premium Plans</CardTitle>
                        <CardDescription>View, add, or edit the subscription plans available to users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan Name</TableHead>
                                    <TableHead>Price (INR)</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map(plan => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {plan.name}
                                            {plan.popular && <Badge>Popular</Badge>}
                                        </TableCell>
                                        <TableCell>{plan.price}</TableCell>
                                        <TableCell>{plan.period}</TableCell>
                                        <TableCell className="text-right">
                                            <Dialog onOpenChange={(open) => !open && setEditingPlan(null)}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={() => setEditingPlan(plan)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast({ title: "Delete feature coming soon!", variant: "destructive" })}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => toast({ title: "Add Plan feature coming soon!" })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Plan
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Plan</DialogTitle>
                        <DialogDescription>Make changes to the subscription plan. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    {editingPlan && (
                        <form onSubmit={handleUpdatePlan} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Plan Name</Label>
                                <Input id="name" name="name" defaultValue={editingPlan.name} disabled={isSubmitting} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (INR)</Label>
                                <Input id="price" name="price" type="number" defaultValue={editingPlan.price} disabled={isSubmitting} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="period">Period</Label>
                                <Input id="period" name="period" defaultValue={editingPlan.period} disabled={isSubmitting} placeholder="/ month" required />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="popular" name="popular" defaultChecked={editingPlan.popular} disabled={isSubmitting} />
                                <Label htmlFor="popular">Mark as Popular</Label>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingPlan(null)} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
