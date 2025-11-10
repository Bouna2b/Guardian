import '../styles/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Guardian',
  description: 'Protect your digital identity',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
