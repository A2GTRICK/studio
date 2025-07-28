
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { AiImage } from '@/components/ai-image';
import { useAuth } from "@/hooks/use-auth";
import { createVerificationRequest } from "@/services/payment-verification-service";

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

    const handlePaymentConfirmation = async () => {
        if (!user) {
            toast({
                title: "Not Logged In",
                description: "You must be logged in to make a purchase.",
                variant: "destructive"
            });
            return;
        }

        // Always prepare the email, as this is the primary confirmation method for the user.
        const subject = `Payment Made: ${title}`;
        const body = `
Hello A2G Smart Notes Team,

I have just completed the payment for the item listed below. Please verify and activate my purchase.

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

        // Attempt to log the verification request in the database, but don't let it block the email.
        try {
            await createVerificationRequest({
                uid: user.uid,
                productName: title,
                price: price,
            });
        } catch (error) {
            // Log the error for debugging but don't show a failing toast to the user.
            // The email is the more critical part of the user flow.
            console.error("Payment confirmation database logging failed:", error);
        }

        // Open the user's default email client. This should now always be reached.
        window.location.href = mailtoLink;

        setIsOpen(false);
        toast({
            title: "Check Your Email App",
            description: "Your email app should now be open with a pre-filled message. Please send the email to complete your verification request.",
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
                        I Have Paid, Verify My Purchase
                    </Button>
                    <Button size="lg" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                     <p className="text-center text-xs text-muted-foreground pt-2">
                        Clicking "I Have Paid" will log your request for our team to verify and open your email client to send a confirmation. Your purchase will be activated after manual approval.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
