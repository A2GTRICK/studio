
'use client';

import { useState } from 'react';
import { services } from '@/lib/services-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Mail, Eye } from 'lucide-react';
import Link from 'next/link';
import { AiImage } from '@/components/ai-image';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ContactForm } from '@/components/contact-form';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const service = services.find(s => s.slug === slug);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!service) {
    notFound();
  }

  return (
    <>
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
                          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="lg">
                                <Mail className="mr-2 h-4 w-4" /> Get a Quote
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Inquiry for: {service.title}</DialogTitle>
                                <DialogDescription>
                                  Please fill out the form below. Our team will get back to you shortly.
                                </DialogDescription>
                              </DialogHeader>
                              <ContactForm
                                serviceTitle={service.title}
                                onSuccess={() => setDialogOpen(false)}
                              />
                            </DialogContent>
                          </Dialog>
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
    </>
  );
}
