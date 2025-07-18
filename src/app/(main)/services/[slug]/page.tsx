
'use client';

import { services } from '@/lib/services-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="max-w-4xl mx-auto">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/services">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Services
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="order-2 md:order-1 p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <service.icon className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-3xl">{service.title}</CardTitle>
            </div>
            <p className="text-muted-foreground mb-6 text-lg">{service.description}</p>
            
            <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-xl">What&apos;s Included:</h3>
                <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-auto pt-6">
                <Card className="bg-secondary/50">
                    <CardContent className="p-4 md:flex md:items-center md:justify-between">
                       <div className="mb-4 md:mb-0">
                         <p className="font-bold text-lg">Starting from {service.price}</p>
                         <p className="text-sm text-muted-foreground">Pricing varies based on complexity.</p>
                       </div>
                        <Button asChild className="w-full md:w-auto flex-shrink-0">
                          <a href={mailToLink}>Get a Quote</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>

          </div>
          
          <div className="order-1 md:order-2 h-64 md:h-auto">
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
