
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, BookCopy, ScrollText, User, PenTool, Presentation } from 'lucide-react';
import Link from 'next/link';
import { services } from "@/lib/services-data";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Academic Services Hub</h1>
        <p className="text-muted-foreground">Expert academic and project support to guide you through complex tasks.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.title} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <service.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="font-headline">{service.title}</CardTitle>
                  <CardDescription>{service.target}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{service.description}</p>
            </CardContent>
            <CardFooter>
               <Button asChild className="w-full" variant="outline">
                   <Link href={service.link}>Learn More <ArrowRight className="ml-2 h-4 w-4"/></Link>
               </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
