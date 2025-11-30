
'use client';

import { useState } from 'react';
import { services, serviceCategories } from '@/lib/services-data';
import { ServiceCard } from '@/components/service-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GraduationCap } from 'lucide-react';

export default function AcademicServicesPage() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredServices = activeTab === 'All'
    ? services
    : services.filter(s => s.category === activeTab);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Academic Services Hub
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Get expert help for academic writing, projects, internship reports, and more. We provide professional support to help you excel in your pharmacy studies.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="All">All Services</TabsTrigger>
          {serviceCategories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
