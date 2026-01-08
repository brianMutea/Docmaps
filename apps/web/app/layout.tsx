import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { ConditionalNavbar } from '@/components/conditional-navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocMaps',
  description: 'Visual maps of developer documentation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConditionalNavbar />
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          toastOptions={{
            className: 'toast-bounce',
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
