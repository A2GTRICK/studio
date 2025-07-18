
'use client';

import { services } from '@/lib/services-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = services.find(s => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/services">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Services
        </Link>
      </Button>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 md:p-8 flex flex-col">
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
                    <CardContent className="p-4">
                        <p className="font-bold text-lg">Starting from {service.price}</p>
                        <p className="text-sm text-muted-foreground mb-4">Pricing varies based on complexity and requirements.</p>
                        <Button className="w-full">Get a Quote</Button>
                    </CardContent>
                </Card>
            </div>

          </div>
          
          <div className="hidden md:block">
             <Image 
                src={service.imageUrl}
                alt={service.title}
                width={600}
                height={800}
                className="object-cover w-full h-full rounded-r-lg"
                data-ai-hint={service.dataAiHint}
              />
          </div>
        </div>
      </Card>
    </div>
  );
}
