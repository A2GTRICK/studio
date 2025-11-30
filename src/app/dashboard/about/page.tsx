
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Globe, Youtube, Send, Users } from "lucide-react";
import Link from "next/link";
import { SVGProps } from "react";

const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.849 6.069l-1.104 4.053 4.144-1.088z"/>
    </svg>
);

const socialLinks = [
    { name: 'YouTube', href: 'https://www.youtube.com/@A2GTRICKACADEMY', icon: Youtube },
    { name: 'Telegram', href: 'https://t.me/a2gtrickacademy', icon: Send },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029VaA2p8N4Y9l1rC928L3k', icon: WhatsAppIcon },
];

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="text-center pb-8">
        <h1 className="text-4xl lg:text-5xl font-headline font-extrabold tracking-tight">
          About phamA2G
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
          Empowering pharmacy students through smart learning, expert guidance, and a supportive community.
        </p>
      </section>

      <Card>
        <CardContent className="p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-headline font-bold">Our Mission</h2>
                    <h3 className="text-xl font-semibold text-primary mt-2">Making Pharmacy Education Accessible, Smarter, and Future-Ready</h3>
                    <p className="mt-4 text-muted-foreground">
                      phamA2G is a digital learning initiative by Arvind Sharma, founder of A2GTRICK Academy. We believe every pharmacy student deserves access to high-quality, affordable, and easy-to-understand learning resources.
                    </p>
                     <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
                      “We’re not just a notes provider – we’re your academic partner, helping you grow smarter, every day.”
                    </blockquote>
                </div>
                <div className="flex justify-center items-center p-4">
                   <div className="w-48 h-48 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white">
                        <Users className="w-24 h-24" />
                    </div>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 mt-16">
                <div>
                    <h3 className="text-2xl font-headline font-bold mb-4">🚀 What We Do</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Provide professionally curated notes for D.Pharm, B.Pharm, and exam-based learning</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Offer AI-powered tools to simplify complex pharmaceutical concepts</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Deliver exam-focused MCQs, tricks, and quick revision series</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Keep students updated with pharma jobs, government vacancies, and walk-in alerts</span></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-2xl font-headline font-bold mb-4">🌟 Why Choose Us?</h3>
                    <ul className="space-y-3">
                       <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Built for pharmacy students, by a pharmacy educator</span></li>
                       <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Content aligned with BTEUP, PCI, and competitive exam standards</span></li>
                       <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Trusted by thousands of learners on YouTube, Telegram, and WhatsApp</span></li>
                       <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>A blend of technology + education to help you succeed in both academics and career</span></li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="items-center text-center">
            <CardTitle className="font-headline text-2xl">Join Our Community</CardTitle>
            <CardDescription>Connect with fellow pharmacy students and stay updated.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center flex-wrap gap-4">
            {socialLinks.map((link) => (
                <Button key={link.name} variant="outline" asChild>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                        <link.icon className="mr-2 h-4 w-4" />
                        <span className="ml-2">{link.name}</span>
                    </a>
                </Button>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
