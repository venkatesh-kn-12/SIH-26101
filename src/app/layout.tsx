import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../lib/LanguageContext";

export const metadata: Metadata = {
  title: "StatPath AI — Skill Intelligence & Continuous Learning Platform | MoSPI & SIH Project",
  description:
    "AI-powered continuous learning and competency development platform for officials working in India's Official Statistical System. Connected with iGOT Karmayogi, NSSTA & TPAC.",
  keywords: "StatPath AI, SIH 2026, MoSPI, iGOT Karmayogi, Skill Intelligence, Statistical Competency, Ministry of Statistics",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Kannada:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Official Government of India UX4G Design System CDN */}
        <link href="https://cdn.ux4g.gov.in/UX4G@2.0.8/css/ux4g-min.css" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#003087" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
