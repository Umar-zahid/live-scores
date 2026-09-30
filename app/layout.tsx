import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/shared/NavBar';

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
    <html lang="en">
      <body className="bg-slate-950">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
