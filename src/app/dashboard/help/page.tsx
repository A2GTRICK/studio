
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Mail } from "lucide-react";
import Link from "next/link";

const faqs = {
  General: [
    {
      question: "What is phamA2G?",
      answer: "phamA2G is an all-in-one learning platform for pharmacy students, offering AI-powered note generation, MCQ practice sets, academic writing services, and live notifications for exams and jobs."
    },
    {
      question: "Who is this platform for?",
      answer: "Our platform is designed for D.Pharm, B.Pharm, and M.Pharm students, as well as those preparing for competitive exams like GPAT, NIPER, and Drug Inspector tests."
    },
  ],
  "Payments & Access": [
    {
      question: "Is there a free plan?",
      answer: "Yes, we offer a free tier that provides limited daily access to our AI tools so you can try out our core features. For unlimited access, you can upgrade to our Pro plan."
    },
    {
      question: "How do I pay for Academic Services?",
      answer: "Our academic services like report writing and dissertation help are priced on a case-by-case basis. You can request a quote by clicking the 'Get a Quote' button on any service page, which will open a pre-filled email for you to send to our team."
    },
    {
        question: "What payment methods are accepted?",
        answer: "We accept all major payment methods, including UPI, credit/debit cards, and net banking for our Pro plan and academic services. Details will be provided when you request a service or upgrade."
    }
  ],
  "Technical Support": [
    {
      question: "The AI note generator is slow or not working.",
      answer: "The AI generator can sometimes be slow during peak usage. Please wait for a few moments. If the problem persists, try refreshing the page. If it still doesn't work, please contact our support team."
    },
    {
      question: "I found an error in a note or MCQ.",
      answer: "We strive for accuracy, but errors can occasionally occur. We appreciate your help in improving our content. Please take a screenshot and email it to our support team with the details."
    }
  ]
};

export default function HelpFaqPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <section className="text-center">
        <div className="inline-block bg-primary/10 text-primary p-3 rounded-lg mb-4">
            <HelpCircle className="w-10 h-10" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-gray-900">
            Help & Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our platform, services, and technical issues.
        </p>
      </section>

      <section>
        <Accordion type="single" collapsible className="w-full">
            {Object.entries(faqs).map(([category, questions]) => (
                <div key={category} className="mb-6">
                    <h2 className="font-headline text-2xl font-semibold mb-4 border-b pb-2">{category}</h2>
                    <div className="space-y-2">
                        {questions.map((faq, index) => (
                            <AccordionItem value={`${category}-${index}`} key={index} className="border rounded-lg px-4 bg-white">
                                <AccordionTrigger className="text-left font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            ))}
        </Accordion>
      </section>

      <section>
        <Card className="shadow-md text-center bg-secondary/50 border-dashed">
            <CardHeader>
                <div className="mx-auto bg-background p-3 rounded-full w-fit">
                    <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-headline mt-2">Still Need Help?</CardTitle>
                <CardDescription>
                    If you can't find the answer you're looking for, please don't hesitate to reach out to our support team.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>You can email us directly at:</p>
                <Link href="mailto:a2gtrickacademy@gmail.com" className="font-semibold text-lg text-primary hover:underline">
                    a2gtrickacademy@gmail.com
                </Link>
            </CardContent>
        </Card>
      </section>

    </div>
  );
}
