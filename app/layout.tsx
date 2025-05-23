import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 bg-[#F0F1F5]">{children}</main>
        </div>
      </body>
    </html>
  );
}