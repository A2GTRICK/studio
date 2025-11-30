
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Users, Youtube, Send, Info } from "lucide-react";
import Link from "next/link";

const features = [
    "AI-Powered Note Generation",
    "Smart MCQ Practice Sets",
    "Professional Academic Services",
    "Live Notifications for Exams & Jobs"
];

const values = [
    { title: "Student-First", description: "Our platform is built with the singular goal of making a student's life easier and more productive." },
    { title: "Accessibility", description: "We believe every student deserves access to high-quality learning tools, regardless of their background." },
    { title: "Innovation", description: "We constantly leverage the latest in AI and technology to create cutting-edge learning solutions." },
];

export default function AboutUsPage() {
    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
            
            <section className="text-center">
                <div className="inline-block bg-primary/10 text-primary p-3 rounded-lg mb-4">
                    <Info className="w-10 h-10" />
                </div>
                <h1 className="font-headline text-4xl font-bold tracking-tight text-gray-900">
                    Empowering Pharmacy Students Through Smart Learning
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    A2G Smart Notes was born from a simple idea: to make high-quality, exam-focused learning accessible and affordable for every pharmacy student in India.
                </p>
            </section>

            <section>
                <Card className="shadow-lg border-primary/20 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8">
                            <CardHeader className="p-0">
                                <CardTitle className="font-headline text-2xl">Meet the Founder</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-4">
                                <p className="font-semibold text-primary text-lg">Arvind Sharma</p>
                                <p className="text-muted-foreground mt-2">
                                    As the founder of A2GTRICK Academy and A2G Smart Notes, my journey began with a passion for teaching and a desire to solve the real-world problems faced by pharmacy students. I saw students struggling with scattered materials, expensive coaching, and a lack of personalized guidance.
                                </p>
                                <p className="mt-3 text-muted-foreground">
                                    This platform is the culmination of that vision—a one-stop solution that combines expert knowledge with the power of AI to help you learn smarter, not just harder.
                                </p>
                            </CardContent>
                        </div>
                        <div className="bg-secondary/30 p-8 flex items-center justify-center">
                            {/* Placeholder for an image */}
                            <div className="w-40 h-40 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white">
                                <Users className="w-20 h-20" />
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">What We Do</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Why Choose Us?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {values.map(v => (
                           <div key={v.title}>
                               <p className="font-semibold">{v.title}</p>
                               <p className="text-sm text-muted-foreground">{v.description}</p>
                           </div>
                       ))}
                    </CardContent>
                </Card>
            </section>

            <section className="text-center bg-secondary/50 p-8 rounded-lg">
                <h2 className="font-headline text-2xl font-bold">Join Our Community</h2>
                <p className="mt-2 text-muted-foreground">
                    Connect with thousands of other students, get instant updates, and be part of the A2G family.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <Button asChild className="bg-[#FF0000] hover:bg-[#FF0000]/90">
                        <Link href="https://www.youtube.com/@A2GTRICKACADEMY" target="_blank">
                            <Youtube className="mr-2" /> YouTube
                        </Link>
                    </Button>
                    <Button asChild className="bg-[#0088cc] hover:bg-[#0088cc]/90">
                        <Link href="https://t.me/a2gtrickacademy" target="_blank">
                            <Send className="mr-2" /> Telegram
                        </Link>
                    </Button>
                     <Button asChild className="bg-[#25D366] hover:bg-[#25D366]/90">
                        <Link href="https://whatsapp.com/channel/0029VaA2p8N4Y9l1rC928L3k" target="_blank">
                            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.849 6.069l-1.104 4.053 4.144-1.088z"/></svg>
                            WhatsApp
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
