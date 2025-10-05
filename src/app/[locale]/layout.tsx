import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import Navigation from "@/components/Navigation";
import SessionProvider from "@/components/SessionProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Code Snippet Platform",
    template: "%s | Code Snippet Platform",
  },
  description:
    "Share and discover code snippets with time complexity analysis. A platform for developers to collaborate and learn.",
  keywords: [
    "code snippets",
    "programming",
    "algorithms",
    "time complexity",
    "developer tools",
  ],
  authors: [{ name: "Code Snippet Platform" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Code Snippet Platform",
    description:
      "Share and discover code snippets with time complexity analysis",
    siteName: "Code Snippet Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Snippet Platform",
    description:
      "Share and discover code snippets with time complexity analysis",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "vi" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Navigation />
            <main className="min-h-screen bg-gray-50">{children}</main>
            <footer className="bg-white border-t mt-12">
              <div className="container mx-auto px-4 py-6 text-center text-gray-600">
                <p>© 2025 Code Snippet Platform. Built with Next.js</p>
              </div>
            </footer>
            <Toaster position="top-right" />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
