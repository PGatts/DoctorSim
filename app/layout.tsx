import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/ui/SessionProvider";

export const metadata: Metadata = {
  title: "DoctorSim - Healthcare Education Game",
  description: "Learn healthcare concepts through an interactive 8-bit game experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
