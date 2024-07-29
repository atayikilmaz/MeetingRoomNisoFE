import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import { AuthProvider } from "../contexts/AuthContext";
import Footer from '@/components/footer';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meeting Rooms",
  description: "simple meeting room booking system",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="gray-700">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />

        </AuthProvider>
      </body>
    </html>
    
  )
}


