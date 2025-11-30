
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Service } from '@/lib/services-data';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { icon: Icon, title, description, slug, price, audience } = service;

  return (
    <Card className="flex flex-col h-full shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-primary/20">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
             <Icon className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              <span>For {audience}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/20 p-4">
        <div className="font-bold text-primary text-sm">{price}</div>
        <Button asChild size="sm">
          <Link href={`/dashboard/services/${slug}`}>
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
