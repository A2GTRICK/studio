import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, BookCopy, ScrollText, User, PenTool, Presentation } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: FileText,
    title: "Internship Reports",
    description: "Professionally crafted internship reports that meet academic standards.",
    target: "B.Pharm & D.Pharm Students",
    link: "/services/internship-reports"
  },
  {
    icon: BookCopy,
    title: "Dissertation Support",
    description: "End-to-end support for your M.Pharm dissertation, from topic selection to final submission.",
    target: "M.Pharm Students",
    link: "/services/dissertation-support"
  },
  {
    icon: ScrollText,
    title: "Synopsis Writing",
    description: "Concise and compelling synopsis writing for your research proposals.",
    target: "PG & PhD Aspirants",
    link: "/services/synopsis-writing"
  },
  {
    icon: User,
    title: "Resume/SOP Crafting",
    description: "Build a powerful resume and statement of purpose to stand out.",
    target: "Graduates & Job Seekers",
    link: "/services/resume-sop"
  },
  {
    icon: PenTool,
    title: "Content Writing",
    description: "High-quality academic content writing for articles, blogs, and more.",
    target: "All Health Science Students",
    link: "/services/content-writing"
  },
  {
    icon: Presentation,
    title: "Presentation Design",
    description: "Visually stunning and informative presentations for your seminars and projects.",
    target: "All Students",
    link: "/services/presentation-design"
  }
];

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Academic Services Hub</h1>
        <p className="text-muted-foreground">Expert academic and project support to guide you through complex tasks.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.title} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <service.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="font-headline">{service.title}</CardTitle>
                  <CardDescription>{service.target}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{service.description}</p>
            </CardContent>
            <CardFooter>
               <Button asChild className="w-full" variant="outline">
                   <Link href={service.link}>Learn More <ArrowRight className="ml-2 h-4 w-4"/></Link>
               </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
