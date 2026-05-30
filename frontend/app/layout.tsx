import type { Metadata } from "next";
import { Instrument_Serif, Inter, Literata } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nyaya AI - Premium Legal Assistant",
  description: "Legal uncertainty, made clear.",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body-md text-body-md">
        <Navbar session={session} />
        {children}
      </body>
    </html>
  );
}

