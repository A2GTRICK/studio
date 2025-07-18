
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Loader2, Expand } from 'lucide-react';
import Link from 'next/link';
import { services } from "@/lib/services-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateServiceOutline } from "@/ai/flows/generate-service-outline";
import { marked } from "marked";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


const ServiceCard = ({ service }: { service: typeof services[0] }) => (
    <Card className="flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <service.icon className="h-8 w-8" />
                </div>
                <div>
                    <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.target}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-muted-foreground">{service.description}</p>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href={service.link}>Learn More <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
        </CardFooter>
    </Card>
);

const outlineFormSchema = z.object({
    academicLevel: z.string().min(1, "Please select an academic level"),
    serviceType: z.string().min(3, "Please specify a service type (e.g., Report, Dissertation)"),
    topic: z.string().min(5, "Please provide a specific topic"),
});

type OutlineFormValues = z.infer<typeof outlineFormSchema>;


export default function ServicesPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = new Set(services.map(s => s.category));
        return ['All', ...Array.from(cats)];
    }, []);

    const form = useForm<OutlineFormValues>({
        resolver: zodResolver(outlineFormSchema),
        defaultValues: { academicLevel: "", serviceType: "", topic: "" },
    });
    
    async function onGenerateOutline(data: OutlineFormValues) {
        setIsLoading(true);
        setAiResult(null);
        try {
            const result = await generateServiceOutline(data);
            setAiResult(result.outline);
        } catch (error: any) {
            console.error("Error generating service outline:", error);
            const errorMessage = error.message.includes('503')
                ? 'The AI model is currently overloaded. Please try again in a few moments.'
                : 'Sorry, an error occurred while generating the outline. Please try again.';
            setAiResult(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }
    
    const renderAiResult = (content: string | null) => {
        if (!content) return null;
        const htmlContent = marked.parse(content);
        return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-headline font-bold">Academic Services Hub</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">Expert academic and project support to guide you through complex tasks and ensure your success.</p>
            </div>
            
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-primary"><BrainCircuit /> AI Service Assistant</CardTitle>
                    <CardDescription>Not sure where to start? Describe your task and our AI will generate a preliminary outline to guide you.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                       <div>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onGenerateOutline)} className="space-y-4">
                                    <FormField control={form.control} name="academicLevel" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Academic Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select your academic level" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="D.Pharm">D.Pharm</SelectItem>
                                                    <SelectItem value="B.Pharm">B.Pharm</SelectItem>
                                                    <SelectItem value="M.Pharm">M.Pharm</SelectItem>
                                                    <SelectItem value="PhD">PhD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="serviceType" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Service Type</FormLabel>
                                            <FormControl><Input placeholder="e.g., Internship Report, Dissertation" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="topic" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Topic</FormLabel>
                                            <FormControl><Input placeholder="e.g., Analysis of Paracetamol Tablets" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isLoading} className="w-full">
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Generate Outline
                                    </Button>
                                </form>
                            </Form>
                       </div>
                       <div className="bg-background p-4 rounded-lg border min-h-[300px] relative">
                           <ScrollArea className="h-72 w-full pr-4">
                             {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="mt-4 text-muted-foreground">AI is drafting your outline...</p>
                                </div>
                             )}
                             {!isLoading && !aiResult && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="text-muted-foreground">Your generated outline will appear here.</p>
                                </div>
                             )}
                             {aiResult && renderAiResult(aiResult)}
                           </ScrollArea>
                            {aiResult && !isLoading && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                                            <Expand className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl h-[80vh]">
                                        <DialogHeader>
                                            <DialogTitle>Generated Service Outline</DialogTitle>
                                            <DialogDescription>
                                                Here is the full AI-generated outline for your topic.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="h-full pr-6">
                                            {renderAiResult(aiResult)}
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            )}
                       </div>
                   </div>
                </CardContent>
                {aiResult && !isLoading && (
                    <CardFooter className="flex-col items-start gap-4 bg-primary/10 p-4 rounded-b-lg mt-4">
                        <h3 className="font-headline text-lg font-semibold text-primary">Need an expert to handle the rest?</h3>
                        <p className="text-primary/80 -mt-2">This outline is a great start. Our professional services can provide the detailed work, research, and writing to ensure your success. Check out our related services:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
                            {services.slice(0,3).map(service => (
                                <Button asChild key={service.slug} variant="secondary">
                                    <Link href={service.link}>
                                        <service.icon className="mr-2 h-4 w-4"/> {service.title}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </CardFooter>
                )}
            </Card>

            <Tabs defaultValue="All" className="w-full">
                <div className="flex justify-center">
                    <TabsList>
                        {categories.map(category => (
                            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {categories.map(category => (
                    <TabsContent key={category} value={category}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {(category === "All" ? services : services.filter(s => s.category === category)).map(service => (
                                <ServiceCard key={service.slug} service={service} />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
