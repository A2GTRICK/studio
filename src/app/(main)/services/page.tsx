
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { services } from "@/lib/services-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";

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

export default function ServicesPage() {
    const categories = useMemo(() => {
        const cats = new Set(services.map(s => s.category));
        return ['All', ...Array.from(cats)];
    }, []);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-headline font-bold">Academic Services Hub</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">Expert academic and project support to guide you through complex tasks and ensure your success.</p>
            </div>

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
