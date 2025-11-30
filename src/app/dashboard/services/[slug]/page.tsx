
import { notFound } from 'next/navigation';
import { getServiceBySlug, createServiceMailto, createSampleRequestMailto } from '@/lib/services-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  const { icon: Icon, title, description, audience, price, features, slug } = service;
  const mailtoLink = createServiceMailto(service);
  const sampleMailtoLink = createSampleRequestMailto(service);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
       <div className="mb-6">
        <Link href="/dashboard/services" className="text-sm text-primary hover:underline">
          &larr; Back to all services
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-primary/10 text-primary p-3 rounded-lg flex-shrink-0">
                    <Icon className="w-8 h-8" />
                </div>
                <div>
                    <CardTitle className="font-headline text-3xl tracking-tight">{title}</CardTitle>
                    <CardDescription className="text-lg mt-1">{description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-headline text-xl font-semibold mb-4 border-b pb-2">Key Features</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold">{price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audience</span>
                <span className="font-semibold">{audience}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold">{service.category}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md text-center p-6 bg-secondary/30 border-dashed">
            <h3 className="font-headline text-lg font-semibold mb-2">Ready to Get Started?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click below to send us an inquiry. We'll get back to you with a quote and next steps.
            </p>
            <div className="flex flex-col gap-3">
                <Button asChild size="lg">
                    <a href={mailtoLink}>
                    <Mail className="mr-2 h-5 w-5" />
                    Get a Quote
                    </a>
                </Button>
                <Button asChild variant="outline">
                    <a href={sampleMailtoLink}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Sample Work
                    </a>
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
