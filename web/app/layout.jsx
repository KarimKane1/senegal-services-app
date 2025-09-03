import './globals.css';
import React from 'react';
import Providers from './providers';

export const metadata = {
  title: 'Jokko',
  description: 'Provider recommendations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


