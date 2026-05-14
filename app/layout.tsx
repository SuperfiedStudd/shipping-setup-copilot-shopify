import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Shipping Setup Copilot | Shopify APM Take-Home Prototype",
  description:
    "A single-screen Shopify shipping prototype that surfaces setup gaps, suggests safer defaults, and keeps the merchant in control before rates go live.",
  openGraph: {
    title: "Shipping Setup Copilot | Shopify APM Take-Home Prototype",
    description:
      "A single-screen Shopify shipping prototype that brings the next missing setup step into admin and gives merchants a safer starting point.",
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
