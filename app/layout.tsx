import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Indraprastha Engineering College | Top Engineering College in Delhi NCR",
  description:
    "Indraprastha Engineering College is a leading engineering college in Delhi NCR offering B.Tech programs, quality education, modern infrastructure, industry-focused learning, and excellent placement opportunities. Build your future with IPEC.",
  keywords: [
    "Indraprastha Engineering College",
    "IPEC Ghaziabad",
    "best engineering college in Delhi NCR",
    "top engineering college in Ghaziabad",
    "engineering colleges in Delhi NCR",
    "B.Tech college in Ghaziabad",
    "best B.Tech college in Ghaziabad",
    "engineering college near Delhi",
    "top engineering college in Uttar Pradesh",
    "engineering college with placement",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
