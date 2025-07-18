
'use client';

import { services } from '@/lib/services-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const service = services.find(s => s.slug === slug);

  if (!service) {
    notFound();
  }
  
  const email = "a2gtrickacademy@gmail.com";
  const mailToLink = `mailto:${email}?subject=Quote%20Request%20for%20${encodeURIComponent(service.title)}`;

  return (
    <div className="max-w-5xl mx-auto">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/services">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Services
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-8 flex flex-col">
            <CardHeader className="p-0 mb-6">
                <Badge variant="secondary" className="mb-2 self-start">{service.category}</Badge>
                <div className="flex items-start gap-4 mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0 mt-1">
                        <service.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-4xl">{service.title}</CardTitle>
                </div>
                <CardDescription className="text-lg">{service.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="p-0 flex-grow">
                <h3 className="font-semibold text-xl mb-4">What&apos;s Included:</h3>
                <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <div className="mt-8 pt-6 border-t">
                <Card className="bg-secondary/50">
                    <CardContent className="p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                       <div className="mb-4 sm:mb-0 text-center sm:text-left">
                         <p className="font-bold text-lg">Starting from {service.price}</p>
                         <p className="text-sm text-muted-foreground">Final price depends on project complexity.</p>
                       </div>
                        <Button asChild className="w-full sm:w-auto flex-shrink-0">
                          <a href={mailToLink}><Mail className="mr-2 h-4 w-4" /> Get a Quote</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>

          </div>
          
          <div className="h-64 md:h-auto min-h-[400px]">
             <Image 
                src={service.imageUrl}
                alt={service.title}
                width={600}
                height={800}
                className="object-cover w-full h-full"
                data-ai-hint={service.dataAiHint}
              />
          </div>
        </div>
      </Card>
    </div>
  );
}
