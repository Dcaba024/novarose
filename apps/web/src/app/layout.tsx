import type { Metadata } from "next";
import { companyConfig } from "@/config/company";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${companyConfig.domain}`),
  title: {
    default: `${companyConfig.name} | ${companyConfig.tagline}`,
    template: `%s | ${companyConfig.name}`
  },
  description:
    "NovaRose AI builds premium AI lead intake, website sales agents, customer support agents, CRM automations, and custom workflow systems for service businesses.",
  applicationName: companyConfig.name,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: `${companyConfig.name} | AI Systems for Lead Capture and Automation`,
    description: companyConfig.tagline,
    url: `https://${companyConfig.domain}`,
    siteName: companyConfig.name,
    images: [
      {
        url: "/images/novarose-operations-command-center.png",
        width: 1792,
        height: 1024,
        alt: "NovaRose AI operations command center"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${companyConfig.name} | AI Systems for Business Growth`,
    description: companyConfig.tagline,
    images: ["/images/novarose-operations-command-center.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
