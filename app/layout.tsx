import type { Metadata } from "next";
import { Roboto } from 'next/font/google'
import "./globals.css";
import Navbar from '@/components/Navbar';
import { AuthProvider } from "../contexts/AuthContext";
import Footer from '@/components/footer';


const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})


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
    <html lang="en" data-theme="dark">
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


