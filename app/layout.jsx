"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {/* <Navbar /> */}
          {children}
          {/* <Footer /> */}
        </SessionProvider>
      </body>
    </html>
  );
}
