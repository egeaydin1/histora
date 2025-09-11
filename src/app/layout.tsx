import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Histora - AI Historical Figures Chat Platform",
  description: "Tarihi figürlerle gerçekçi sohbetler yapın. Atatürk, Mevlana, Konfüçyüs ve daha fazlasıyla konuşun.",
  keywords: ["AI", "Historical Figures", "Chat", "Education", "Turkey", "History"],
  authors: [{ name: "Histora Team" }],
  openGraph: {
    title: "Histora - AI Historical Figures Chat",
    description: "Tarihi figürlerle gerçekçi sohbetler yapın",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased bg-gray-50`} suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-full">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}