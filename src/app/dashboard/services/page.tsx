'use client';

import { useState } from 'react';
import { services, serviceCategories } from '@/lib/services-data';
import { ServiceCard } from '@/components/service-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  FileCheck2,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/* ======================================================
   ACADEMIC SERVICES – SAAS GRADE PAGE
====================================================== */

export default function AcademicServicesPage() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredServices =
    activeTab === 'All'
      ? services
      : services.filter((s) => s.category === activeTab);

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto">

      {/* ======================================================
         HERO SECTION – CLARITY & TRUST
      ====================================================== */}
      <section className="rounded-2xl border bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-9 w-9 text-primary" />
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight">
            Academic Services Hub
          </h1>
        </div>

        <p className="text-muted-foreground max-w-3xl text-lg">
          Professional academic support for pharmacy students — from
          assignments and project reports to dissertations and internship files.
          Designed to help you submit confidently and on time.
        </p>

        {/* TRUST STRIP */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TrustItem
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Confidential & Safe"
            desc="Your data and work remain private and plagiarism-safe."
          />
          <TrustItem
            icon={<Clock className="h-5 w-5" />}
            title="On-Time Delivery"
            desc="Clear timelines with expert handling."
          />
          <TrustItem
            icon={<FileCheck2 className="h-5 w-5" />}
            title="Pharmacy-Focused"
            desc="Handled by subject-aware academic experts."
          />
        </div>
      </section>

      {/* ======================================================
         HOW IT WORKS – ZERO CONFUSION
      ====================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HowItWorksStep
          step="01"
          title="Choose a Service"
          desc="Select the academic service that matches your requirement."
        />
        <HowItWorksStep
          step="02"
          title="Share Requirements"
          desc="Provide topic, university format, and deadline details."
        />
        <HowItWorksStep
          step="03"
          title="Get Expert Help"
          desc="Receive professionally prepared academic work."
        />
      </section>

      {/* ======================================================
         SERVICES FILTER & LIST
      ====================================================== */}
      <section className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="All">All Services</TabsTrigger>
            {serviceCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      {/* ======================================================
         SOFT CTA – NO FORCE, NO PAYMENT
      ====================================================== */}
      <section className="rounded-2xl border bg-secondary/40 p-6 md:p-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">
          Not sure which service you need?
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          You can connect with us for guidance before choosing any service.
          No obligation — just clarity.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard/help">
              Get Guidance
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <a
              href="https://t.me/a2gtrickacademy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Join Telegram Updates
            </a>
          </Button>
        </div>
      </section>

    </div>
  );
}

/* ======================================================
   SMALL REUSABLE UI BLOCKS
====================================================== */

function TrustItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm border">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function HowItWorksStep({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-primary mb-1">
        Step {step}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}
