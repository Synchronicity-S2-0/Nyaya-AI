import type { Metadata } from "next";
import { Instrument_Serif, Inter, Literata } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nyaya AI - Legal uncertainty, made clear.",
  description:
    "Describe your legal problem or upload a document. Nyaya AI guides you through risks, rights, opportunities and next steps.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-surface-container-lowest text-primary overflow-x-hidden antialiased">
        <Navbar session={session} />
        {children}
      </body>
    </html>
  );
}

