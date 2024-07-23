import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meeting Rooms",
  description: "simple meeting room booking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en">
    <head></head> {/* Ensure head is explicitly defined */}
    <body className={inter.className}>
      <div> {/* Wrap content inside a div */}
        <Navbar />
        {children}
      </div>
    </body>
  </html>
    
  );
}
