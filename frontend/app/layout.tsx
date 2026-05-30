import type { Metadata } from "next";
import { Instrument_Serif, Urbanist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-serif",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nyaya AI - Premium Legal Assistant",
  description: "Legal uncertainty, made clear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${urbanist.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
