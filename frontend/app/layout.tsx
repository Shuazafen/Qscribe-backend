import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qscribe",
  description: "Qscribe is a platform for student and young adults to build habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
<body className={`${outfit.variable} font-sans antialiased`}>
      <Header/>
  
  
  
  
  {children}</body>
    </html>
  );
}
