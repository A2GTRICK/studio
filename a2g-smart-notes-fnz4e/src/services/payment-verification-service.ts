'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { AiImage } from '@/components/ai-image';
import { useAuth } from "@/hooks/use-auth";

// --- PAYMENT DETAILS: EDIT HERE ---
const UPI_ID = "a2gtrickacademy@upi";
const ADMIN_EMAIL = "a2gtrickacademy@gmail.com";
// ------------------------------------

interface PaymentDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    price: string;
}

export function PaymentDialog({ isOpen, setIsOpen, title, price }: PaymentDialogProps) {
    const { toast } = useToast();
    const { user } = useAuth();

    const handleCopyUpiId = () => {
        navigator.clipboard.writeText(UPI_ID);
        toast({
            title: "Copied!",
            description: "UPI ID copied to clipboard.",
        });
    };

    const handlePaymentConfirmation = () => {
        if (!user) {
            toast({
                title: "Not Logged In",
                description: "You must be logged in to make a purchase.",
                variant: "destructive"
            });
            return;
        }

        const subject = `Payment Verification Request: ${title}`;
        const body = `
Hello A2G Smart Notes Team,

I have completed the payment for the following item. Please verify and activate my purchase.

---
Item: ${title}
Price: ${price}
---
My User ID: ${user.uid}
My Email: ${user.email}
My Name: ${user.displayName || 'N/A'}
---

Thank you,
${user.displayName || 'A2G Smart Notes User'}
        `;

        const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open the user's default email client
        window.location.href = mailtoLink;

        setIsOpen(false);
        toast({ 
            title: "Check Your Email App", 
            description: "Your email app has been opened with a pre-filled message. Please send the email to complete your verification request.",
            duration: 8000,
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                        <Image src="/assets/a2g-logo.svg" alt="A2G Smart Notes Logo" width={32} height={32} />
                    </div>
                    <DialogTitle className="text-center font-headline text-2xl">Complete Your Payment</DialogTitle>
                    <DialogDescription className="text-center text-base">
                        You are purchasing <strong>{title}</strong> for <strong>{price}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-center text-muted-foreground text-sm">Scan the QR code below with any UPI app or copy the UPI ID.</p>
                    <div className="flex justify-center">
                        <AiImage data-ai-hint="upi qr code payment" alt="UPI QR Code" width={250} height={250} />
                    </div>
                    <Card>
                        <CardContent className="p-3 flex items-center justify-between">
                            <p className="text-sm font-mono text-muted-foreground">{UPI_ID}</p>
                            <Button variant="ghost" size="icon" onClick={handleCopyUpiId}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter className="flex-col gap-2">
                    <Button size="lg" onClick={handlePaymentConfirmation}>
                        I Have Paid
                    </Button>
                    <Button size="lg" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                     <p className="text-center text-xs text-muted-foreground pt-2">
                        Clicking "I Have Paid" will open your email client to send a verification email to our team. Your purchase will be activated after manual confirmation.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}