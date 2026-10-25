import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, themeScript } from "@/lib/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "GramStock Cloud — Inventory Management",
    template: "%s | GramStock Cloud",
  },
  description:
    "One Platform. Every Business. Your Inventory, Your Way. Upload your dataset and get a fully adaptive inventory management system tailored to your business.",
  keywords: ["inventory management", "SaaS", "kirana", "pharmacy", "restaurant", "retail"],
  authors: [{ name: "GramStock" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    siteName: "GramStock Cloud",
    title: "GramStock Cloud — Adaptive Inventory Management",
    description: "Upload your dataset. Get a fully adaptive inventory system tailored to your business.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1117" },
  ],
};

import { BusinessProvider } from "@/lib/business-context";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject theme script before page render to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <BusinessProvider>{children}</BusinessProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
