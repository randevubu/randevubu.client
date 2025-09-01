import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../src/styles/globals.css";
import "../src/styles/mobile-enhancements.css";
import { QueryProvider } from "../src/context/QueryProvider";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
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
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--theme-card)',
                    color: 'var(--theme-cardForeground)',
                    border: '1px solid var(--theme-border)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: 'var(--theme-success)',
                      secondary: 'var(--theme-background)',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: 'var(--theme-error)',
                      secondary: 'var(--theme-background)',
                    },
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
