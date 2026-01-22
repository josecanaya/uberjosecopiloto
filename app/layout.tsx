import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Copiloto Uber",
  description: "Registro de eventos y métricas para conductores Uber",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <main className="min-h-screen bg-background pb-20">
          <div className="mx-auto max-w-[420px] px-4 py-4">
            {children}
          </div>
        </main>
        <Navigation />
      </body>
    </html>
  );
}
