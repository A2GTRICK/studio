
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Copy } from "lucide-react";
import { AiImage } from '@/components/ai-image';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

// --- PAYMENT DETAILS: EDIT HERE ---
const UPI_ID = "a2gtrickacademy@upi";
// ------------------------------------

interface PaymentDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    price: string;
    onPaymentSuccess?: () => void;
}

export function PaymentDialog({ isOpen, setIsOpen, title, price, onPaymentSuccess }: PaymentDialogProps) {
    const { toast } = useToast();

    const handleCopyUpiId = () => {
        navigator.clipboard.writeText(UPI_ID);
        toast({
            title: "Copied!",
            description: "UPI ID copied to clipboard.",
        });
    };

    const handlePaymentConfirmation = () => {
        setIsOpen(false);
        toast({ 
            title: "Payment Submitted!", 
            description: "We will verify your payment and activate your purchase shortly." 
        });
        if (onPaymentSuccess) {
            onPaymentSuccess();
        }
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
                        <AiImage data-ai-id="payment-qr-code" data-ai-hint="upi qr code" alt="UPI QR Code" width={250} height={250} />
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
                <div className="flex flex-col gap-2">
                    <Button size="lg" onClick={handlePaymentConfirmation}>
                        I Have Paid
                    </Button>
                    <Button size="lg" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
