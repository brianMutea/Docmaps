import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocMaps Editor',
  description: 'Create and edit visual documentation maps',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-neutral-900 antialiased">
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
