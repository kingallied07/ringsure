import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ringsure.co.uk"),
  title: "Ringsure | AI Receptionist for UK Home Service Businesses",
  description:
    "Never miss another job while you're on the tools. Ringsure answers every call 24/7, qualifies the enquiry and sends you the lead. Free 7–14 day pilot for UK trades and home services.",
  keywords: [
    "AI receptionist UK",
    "answer service for trades",
    "missed call recovery",
    "virtual receptionist plumbers",
    "AI phone answering UK",
  ],
  authors: [{ name: "Ringsure" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://ringsure.co.uk",
    siteName: "Ringsure",
    title: "Ringsure | Never miss another job while you're on the tools",
    description:
      "The AI receptionist for UK home service businesses. Answers every call 24/7, captures job details and sends you the lead.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ringsure | Never miss another job while you're on the tools",
    description:
      "Every call answered 24/7, every lead captured. Free 7–14 day pilot for UK home service businesses.",
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Ringsure",
  serviceType: "AI receptionist and call answering for home service businesses",
  provider: {
    "@type": "Organization",
    name: "Ringsure",
    url: "https://ringsure.co.uk",
  },
  areaServed: "GB",
  description:
    "Ringsure answers every call 24/7 for UK home service businesses, qualifies the enquiry, collects job details and sends the owner a lead summary by SMS or email.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
