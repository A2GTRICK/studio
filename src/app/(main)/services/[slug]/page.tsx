
'use client';

import { services } from '@/lib/services-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Mail, Eye } from 'lucide-react';
import Link from 'next/link';
import { AiImage } from '@/components/ai-image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const service = services.find(s => s.slug === slug);

  if (!service) {
    notFound();
  }

  const mailtoLink = `mailto:a2gtrickacademy@gmail.com?subject=${encodeURIComponent(`Quote Request for: ${service.title}`)}&body=${encodeURIComponent(service.emailBody)}`;
  
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
            <div className="flex-grow">
              <Badge variant="secondary" className="mb-2 self-start">{service.category}</Badge>
              <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0 mt-1">
                      <service.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline text-4xl leading-tight">{service.title}</CardTitle>
              </div>
              <CardDescription className="text-lg mb-6">{service.description}</CardDescription>
            
              <h3 className="font-semibold text-xl mb-4">What you get:</h3>
              <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                          <span>{feature}</span>
                      </li>
                  ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t">
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <p className="font-bold text-lg">Starting from {service.price}</p>
                        <p className="text-sm text-muted-foreground">Final price depends on project complexity.</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       <Button asChild size="lg" variant="outline">
                          <Link href={service.sampleUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" /> View Sample
                          </Link>
                        </Button>
                        <a href={mailtoLink} className={cn(buttonVariants({ size: "lg" }))}>
                           <Mail className="mr-2 h-4 w-4" /> Get a Quote
                        </a>
                    </CardContent>
                </Card>
            </div>

          </div>
          
          <div className="relative h-80 md:h-auto min-h-[450px]">
             <AiImage 
                data-ai-hint={service.dataAiHint}
                alt={service.title}
                fill
                className="object-cover"
              />
          </div>
        </div>
      </Card>
    </div>
  );
}
