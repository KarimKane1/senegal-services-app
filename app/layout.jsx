import "./globals.css";
import React from "react";
import Providers from "./providers";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../components/context/AuthContext";
import { I18nProvider } from "../context/I18nContext";

export const metadata = { title: "Jokko", description: "Provider recommendations" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <LanguageGate>
            <I18nProvider forcedLang={undefined}>
              <Providers>{children}</Providers>
            </I18nProvider>
          </LanguageGate>
        </AuthProvider>
      </body>
    </html>
  );
}

function LanguageGate({ children }) {
  // Client wrapper to set html lang according to user metadata
  if (typeof window === 'undefined') return children;
  // Lazy hook usage in client
  const { user } = useAuth();
  React.useEffect(() => {
    const html = document.documentElement;
    if (html) html.setAttribute('lang', (user?.language || 'en'));
  }, [user?.language]);
  return children;
}
