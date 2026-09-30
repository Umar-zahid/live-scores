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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chivo:wght@700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-lowest text-on-surface font-body min-h-screen">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
