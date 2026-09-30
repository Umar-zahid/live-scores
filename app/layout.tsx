import type { Metadata } from 'next';
import { Chivo, Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/shared/NavBar';

const chivo = Chivo({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-chivo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LiveScoreHub',
  description: 'Live scores for football, cricket and Formula 1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${chivo.variable} ${inter.variable}`}>
      <body className="bg-surface-lowest text-on-surface font-body min-h-screen">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
