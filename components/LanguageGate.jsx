"use client";
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function LanguageGate({ children }) {
  // Client wrapper to set html lang according to user metadata
  const { user } = useAuth();
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      if (html) html.setAttribute('lang', (user?.language || 'en'));
    }
  }, [user?.language]);
  return children;
}
