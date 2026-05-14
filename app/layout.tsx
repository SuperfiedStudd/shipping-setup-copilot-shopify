import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Shipping Setup Copilot | Shopify APM Take-Home Prototype",
  description:
    "A single-screen Shopify shipping rescue flow prototype that unifies existing shipping capabilities into one visible, guided, resumable setup surface.",
  openGraph: {
    title: "Shipping Setup Copilot | Shopify APM Take-Home Prototype",
    description:
      "A single-screen shipping-specific rescue flow for surfacing hidden blockers, recommending safer defaults, proving rates, and resurfacing setup until the merchant approves final settings.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas antialiased">{children}</body>
    </html>
  );
}
