"use client";
import React from 'react';
import Header from '../../components/bolt/layout/Header';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../components/context/AuthContext';
import InteractiveOnboarding from '../../components/bolt/onboarding/InteractiveOnboarding';
import { useI18n } from '../../context/I18nContext';

const tabsBase = [
  { id: 'profile', labelKey: 'provider.tabs.profile', href: '/provider/profile' },
  { id: 'recommendations', labelKey: 'provider.tabs.recommendations', href: '/provider/recommendations' },
  { id: 'share', labelKey: 'provider.tabs.share', href: '/provider/share' },
];

export default function ProviderLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isFirstLogin, markOnboardingComplete } = useAuth();
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const { t } = useI18n();
  const tabs = React.useMemo(()=> tabsBase.map(ti => ({ id: ti.id, href: ti.href, label: t(ti.labelKey) })), [t]);
  const active = tabs.find(t => pathname?.startsWith(t.href))?.id || 'profile';
  React.useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.userType !== 'provider') router.replace('/auth');
  }, [user?.userType, loading, router]);
  React.useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    const key = user?.id ? `onboardingShown:provider:${user.id}` : 'onboardingShown:provider';
    const alreadyShown = sessionStorage.getItem(key) === '1';
    if (!alreadyShown && (user?.isFirstLogin || isFirstLogin)) setShowOnboarding(true);
  }, [user?.id, user?.isFirstLogin, isFirstLogin, loading]);
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    markOnboardingComplete?.();
    if (typeof window !== 'undefined') {
      const key = user?.id ? `onboardingShown:provider:${user.id}` : 'onboardingShown:provider';
      sessionStorage.setItem(key, '1');
    }
  };
  if (loading) return <div className="min-h-screen bg-gray-50" />;
  // Remove aggressive cookie-based client redirect
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="provider" />
      <div className="max-w-6xl mx-auto px-2 md:px-4">
        {isFirstLogin && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg p-4 my-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{t('provider.welcomeToJokko')}</p>
                <p className="text-sm">{t('provider.autoRecommendations')}</p>
              </div>
              <button onClick={markOnboardingComplete} className="text-indigo-700 hover:underline text-sm">{t('provider.gotIt')}</button>
            </div>
          </div>
        )}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  active === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="py-4">{children}</div>
      </div>
      {showOnboarding && (
        <InteractiveOnboarding onComplete={handleCloseOnboarding} userType="provider" onTabChange={(tabId)=>{
          const t = tabs.find(t=>t.id===tabId);
          if (t) router.push(t.href);
        }} />
      )}
    </div>
  );
}


