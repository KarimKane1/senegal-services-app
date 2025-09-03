"use client";
import React from 'react';
import BoltAuthPage from '../../components/bolt/pages/AuthPage';
import { I18nProvider } from '../../context/I18nContext';

export default function AuthPage() {
  // Use a separate, page-only i18n scope that does not persist
  return (
    <I18nProvider forcedLang={undefined}>
      <BoltAuthPage />
    </I18nProvider>
  );
}


