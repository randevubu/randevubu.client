import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./styles/globals.css";
import { QueryProvider } from "./context/QueryProvider";
import { AuthProvider } from "./context/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "RandevuBu - Salon Randevu Sistemi",
  description: "Berberler, kuaförler ve salon sahipleri için modern randevu rezervasyon platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
        style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
