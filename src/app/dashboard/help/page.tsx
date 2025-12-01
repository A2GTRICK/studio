'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Mail } from 'lucide-react';
import Link from "next/link";

const faqData = {
    "General Questions": [
        {
            question: "What is pharmA2G?",
            answer: "pharmA2G is a digital learning platform for pharmacy students, providing high-quality notes, AI-powered study tools, exam preparation materials, and academic support services."
        },
        {
            question: "Who is behind pharmA2G?",
            answer: "The platform is an initiative by Arvind Sharma, the founder of A2GTRICK Academy, and is designed to make pharmacy education more accessible and effective through technology."
        }
    ],
    "Payments & Access": [
        {
            question: "How do I purchase a premium plan or a single note?",
            answer: "You can upgrade to a premium plan from the 'Billing' page. To buy a single note, click the 'Unlock' button on any premium note in the library and choose the 'Buy Just This Note' option. Both options will open a payment dialog with instructions."
        },
        {
            question: "I have made the payment but still don't have access. What should I do?",
            answer: "After making a payment, you MUST click the 'I Have Paid, Verify My Request' button. This notifies the admin to approve your purchase. Access is granted manually and may take a short while. If it takes more than a few hours, please contact support."
        },
        {
            question: "What payment methods are accepted?",
            answer: "We currently accept payments via UPI. You can either scan the QR code or use the provided UPI ID in the payment dialog."
        }
    ],
    "Technical Support": [
        {
            question: "The site is not loading correctly or I see an error.",
            answer: "Please try clearing your browser's cache and cookies or try a different browser. If the problem persists, please contact our support team with a screenshot of the error."
        },
        {
            question: "I forgot my password. How can I reset it?",
            answer: "On the login page, enter your email address and then click the 'Forgot Password?' link. You will receive an email with instructions to reset your password."
        }
    ]
};

export default function HelpPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="text-center">
                <h1 className="text-4xl font-headline font-bold">Help & FAQ</h1>
                <p className="mt-2 text-lg text-muted-foreground">Find answers to common questions about our platform and services.</p>
            </div>
            
            {Object.entries(faqData).map(([category, faqs]) => (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle>{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${category}-${index}`}>
                                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
             ))}

            <Card>
                <CardHeader className="text-center">
                    <HelpCircle className="mx-auto h-10 w-10 text-primary mb-2" />
                    <CardTitle className="font-headline text-2xl">Still Need Help?</CardTitle>
                    <CardDescription>If you can't find the answer you're looking for, please don't hesitate to reach out.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                     <Button asChild>
                        <a href="mailto:a2gtrickacademy@gmail.com">
                            <Mail className="mr-2 h-4 w-4" /> Contact Support
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
