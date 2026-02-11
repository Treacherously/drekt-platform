import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'B2B Supply Chain Dashboard',
  description: 'Professional supply chain management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
