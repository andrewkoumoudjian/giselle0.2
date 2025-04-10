import React from 'react';
import EnhancedNavbar from './EnhancedNavbar';
import Footer from './Footer';
import Head from 'next/head';

const TailwindLayout = ({ children, title = 'HR Talent Platform' }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content="HR Talent Platform - Find your next career opportunity" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <EnhancedNavbar />

      <main className="flex-grow bg-gray-50">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default TailwindLayout;
