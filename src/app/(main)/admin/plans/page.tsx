
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

// In a real app, this would be fetched from a database.
const premiumPlans = [
  {
    name: "Weekly",
    price: "INR 99",
    period: "/ week",
    popular: false,
  },
  {
    name: "Monthly",
    price: "INR 299",
    period: "/ month",
    popular: true,
  },
  {
    name: "Yearly",
    price: "INR 1,499",
    period: "/ year",
    popular: false,
  },
];

export default function AdminPlansPage() {
    const { toast } = useToast();

    return (
        <div className="pt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Manage Premium Plans</CardTitle>
                    <CardDescription>View and edit the subscription plans available to users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {premiumPlans.map(plan => (
                                <TableRow key={plan.name}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {plan.name}
                                        {plan.popular && <Badge>Popular</Badge>}
                                    </TableCell>
                                    <TableCell>{plan.price}</TableCell>
                                    <TableCell>{plan.period}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => toast({title: "Edit feature coming soon!"})}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()} onClick={() => toast({title: "Delete feature coming soon!", variant: "destructive"})}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
