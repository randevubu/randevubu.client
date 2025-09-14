import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { QueryProvider } from "../context/QueryProvider";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { LocaleProvider } from "../context/LocaleContext";
import { Toaster } from "react-hot-toast";
import { type Locale } from '../i18n';
import "../styles/globals.css";
import "../styles/mobile-enhancements.css";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RandevuBu",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current locale from next-intl
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${poppins.variable} antialiased`}
        style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider locale={locale as Locale}>
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
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}