import type { Metadata } from "next";
import CustomCursor from "@/components/ui/CustomCursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "HKS Studio Portfolio",
  description: "Gaming-inspired portfolio built with Next.js, Tailwind CSS, and Framer Motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
