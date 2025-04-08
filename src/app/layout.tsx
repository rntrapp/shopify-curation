import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidePanel from "@/components/sidepanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Assembly Label Re-worn Drop Tracker",
  description: "Track and manage product drops",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons" 
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <div className="flex min-h-screen">
          <SidePanel />
          <main className="flex-1 p-6 transition-all duration-300">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
