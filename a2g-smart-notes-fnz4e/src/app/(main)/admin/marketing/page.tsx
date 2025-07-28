
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, MoreHorizontal, FileText, Upload, PlusCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMarketing, type MarketingMaterial } from '@/context/marketing-context';

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: Date;
}

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
                resolve(event.target.result);
            } else {
                reject(new Error("Failed to read file."));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};

export default function AdminMarketingPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loadingSubscribers, setLoadingSubscribers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { materials, loading: loadingMaterials, addMaterial, deleteMaterial } = useMarketing();
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string; file: FileList }>();

    useEffect(() => {
        const subscribersCollection = collection(db, 'newsletter_subscriptions');
        const q = query(subscribersCollection, orderBy('subscribedAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subscribersList = snapshot.docs.map(doc => {
                const data = doc.data();
                const timestamp = data.subscribedAt as Timestamp;
                return { 
                    id: doc.id, 
                    email: data.email,
                    subscribedAt: timestamp ? timestamp.toDate() : new Date()
                } as Subscriber;
            });
            setSubscribers(subscribersList);
            setLoadingSubscribers(false);
        }, (error) => {
            console.error("Error fetching subscribers:", error);
            toast({ title: "Error", description: "Could not fetch subscribers.", variant: "destructive" });
            setLoadingSubscribers(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    const handleDeleteSubscriber = async (subscriberId: string) => {
        try {
            await deleteDoc(doc(db, 'newsletter_subscriptions', subscriberId));
            toast({ title: "Subscriber Deleted", description: "The email has been removed from the list.", variant: "destructive" });
        } catch (error) {
            console.error("Error deleting subscriber:", error);
            toast({ title: "Error", description: "Could not delete subscriber.", variant: "destructive" });
        }
    };

    const handleAddMaterial = async (data: { title: string; file: FileList }) => {
        setIsSubmitting(true);
        const file = data.file[0];
        if (!file) {
            toast({ title: "File Required", description: "Please select a file to upload.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            const content = await readFileAsDataURL(file);
            await addMaterial({
                title: data.title,
                fileName: file.name,
                content: content,
            });
            toast({ title: "Success!", description: "New marketing material has been added." });
            reset();
        } catch (error: any) {
            toast({ title: "Error Uploading", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteMaterial = async (materialId: string) => {
        try {
            await deleteMaterial(materialId);
            toast({ title: "Material Deleted", variant: "destructive" });
        } catch(error: any) {
            toast({ title: "Error Deleting", description: error.message, variant: "destructive" });
        }
    }


    return (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <Card>
                    <form onSubmit={handleSubmit(handleAddMaterial)}>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><PlusCircle /> Add Lead Magnet</CardTitle>
                            <CardDescription>Upload a new file to be used as a lead magnet for subscribers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">File Title</Label>
                                <Input id="title" {...register("title", { required: "Title is required" })} placeholder="e.g., Top 20 Questions PDF" disabled={isSubmitting} />
                                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fileUpload">File</Label>
                                <div className="relative">
                                    <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="fileUpload" type="file" {...register("file", { required: "File is required" })} className="pl-10" disabled={isSubmitting}/>
                                </div>
                                {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                {isSubmitting ? "Uploading..." : "Add Material"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Manage Lead Magnets</CardTitle>
                        <CardDescription>
                           Manage files available to subscribers. The most recently added file is sent by default.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {loadingMaterials ? (
                           <div className="flex items-center justify-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                       ) : materials.length > 0 ? (
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Title</TableHead>
                                       <TableHead>Filename</TableHead>
                                       <TableHead>Actions</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {materials.map((material) => (
                                       <TableRow key={material.id}>
                                           <TableCell className="font-medium">{material.title}</TableCell>
                                           <TableCell>{material.fileName}</TableCell>
                                           <TableCell className="text-right">
                                               <Button variant="ghost" size="icon" asChild>
                                                   <a href={material.content} download={material.fileName} target="_blank" rel="noopener noreferrer">
                                                       <ExternalLink className="h-4 w-4" />
                                                   </a>
                                               </Button>
                                               <AlertDialog>
                                                   <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                           <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                   </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the material "{material.title}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteMaterial(material.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Yes, delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                       ) : (
                           <p className="text-center text-muted-foreground py-10">No lead magnets uploaded yet.</p>
                       )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Newsletter Subscribers</CardTitle>
                        <CardDescription>
                          A list of all users who have subscribed. A total of {subscribers.length} {subscribers.length === 1 ? 'user has' : 'users have'} subscribed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingSubscribers ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Loading subscribers...</p>
                            </div>
                        ) : subscribers.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Subscription Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscribers.map(subscriber => (
                                        <TableRow key={subscriber.id}>
                                            <TableCell className="font-medium">{subscriber.email}</TableCell>
                                            <TableCell>{subscriber.subscribedAt ? format(subscriber.subscribedAt, "PPP p") : 'Just now'}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the subscriber "{subscriber.email}". This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteSubscriber(subscriber.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Yes, delete subscriber
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No subscribers yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
