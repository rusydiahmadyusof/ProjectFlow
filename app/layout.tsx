import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ProjectFlow - Manage Projects Efficiently',
  description: 'The all-in-one project management platform that helps teams collaborate, track progress, and deliver results faster.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-display bg-background-light dark:bg-background-dark text-[#0e121b] dark:text-white`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
