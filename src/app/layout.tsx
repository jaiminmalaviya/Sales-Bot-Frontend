import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Common/header";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/Common/sidebar";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: { icon: ["/favicon.ico"] },
  title: "Sales Bot - Ice Breaker Generator",
  description: "Empower your lead generation efforts with AI-generated ice breaker messages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
            <Header />
            <div className="flex min-h-[calc(100vh-80px)] w-full overflow-hidden justify-center relative">
              {children}
              <Toaster />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
