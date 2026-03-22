import React from 'react';
import '../styles/globals.css';
import AuthProvider from '../components/AuthProvider';
import ThemeProviderWrapper from '../components/ThemeProviderWrapper';

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProviderWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProviderWrapper>
        <footer className="py-3 text-center text-xs text-gray-300 border-t border-gray-100 bg-white">
          <span>© 2026 Drekt &nbsp;·&nbsp; </span>
          <a href="/admin" className="hover:text-gray-400 transition-colors">Admin</a>
        </footer>
      </body>
    </html>
  );
}
