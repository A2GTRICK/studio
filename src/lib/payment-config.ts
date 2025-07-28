/**
 * @fileoverview This file centralizes the configuration for payment details.
 * It is a server-only file to ensure that sensitive information like the
 * UPI ID is not exposed to the client-side.
 */

interface PaymentConfig {
  upiId: string;
  adminEmail: string;
  qrCodePath: string;
}

export const paymentConfig: PaymentConfig = {
  upiId: "sharmaarvind28897-2@okaxis",
  adminEmail: "a2gtrickacademy@gmail.com",
  qrCodePath: "https://i.postimg.cc/52vDpQYZ/aa6d830b-56c0-46be-a89a-71ed7ac0642d.jpg",
};
