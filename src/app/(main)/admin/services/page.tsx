
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { services as initialServices, type Service } from "@/lib/services-data";
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

export default function AdminServicesPage() {
    const { toast } = useToast();
    const [services, setServices] = useState<Service[]>(initialServices);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateService = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingService) return;
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const updatedService: Service = {
            ...editingService,
            title: formData.get('title') as string,
            category: formData.get('category') as string,
            price: formData.get('price') as string,
            description: formData.get('description') as string,
        };

        // Simulate API call
        setTimeout(() => {
            setServices(services.map(s => s.slug === updatedService.slug ? updatedService : s));
            toast({ title: "Service Updated!", description: `The "${updatedService.title}" service has been updated.` });
            setEditingService(null);
            setIsSubmitting(false);
        }, 500);
    };

    return (
        <>
            <div className="pt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Manage Academic Services</CardTitle>
                        <CardDescription>View, add, or edit the academic services offered to students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map(service => (
                                    <TableRow key={service.slug}>
                                        <TableCell className="font-medium">{service.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{service.category}</Badge>
                                        </TableCell>
                                        <TableCell>{service.price}</TableCell>
                                        <TableCell className="text-right">
                                            <Dialog onOpenChange={(open) => !open && setEditingService(null)}>
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
                                                            <DropdownMenuItem onSelect={() => setEditingService(service)}>
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
                        <Button variant="outline" onClick={() => toast({ title: "Add Service feature coming soon!" })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Service
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Service</DialogTitle>
                        <DialogDescription>Make changes to the academic service. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    {editingService && (
                        <form onSubmit={handleUpdateService} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Service Title</Label>
                                <Input id="title" name="title" defaultValue={editingService.title} disabled={isSubmitting} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" defaultValue={editingService.category} disabled={isSubmitting} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" name="price" defaultValue={editingService.price} disabled={isSubmitting} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" defaultValue={editingService.description} disabled={isSubmitting} required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingService(null)} disabled={isSubmitting}>Cancel</Button>
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
