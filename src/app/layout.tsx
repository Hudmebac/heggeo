import type { Metadata } from 'next';
import { Geist_Sans } from 'next/font/google'; // Corrected import name
import { Orbitron } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist_Sans({ // Corrected usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'HegGeo',
  description: 'Drop time-limited Geos and share your location.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${orbitron.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
