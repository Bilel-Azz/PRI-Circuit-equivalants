import type { Metadata } from "next";
import { inter, jetbrainsMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Circuit Synthesis AI - Presentation",
  description: "AI-powered circuit synthesis from impedance curves",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[#0a0a0f] text-[#f0f0f5] overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
