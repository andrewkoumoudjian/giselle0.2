import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Giselle - AI-Powered Unbiased Interview System',
  description: 'An automated interview system designed to reduce cultural and racial bias in the hiring process.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
} 