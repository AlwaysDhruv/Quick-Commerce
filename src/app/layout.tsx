import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-provider';
import { CartProvider } from '@/lib/cart-provider';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'SwiftShopper',
  description: 'A modern e-commerce platform for buyers and sellers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
