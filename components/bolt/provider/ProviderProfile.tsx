import React, { useEffect, useState } from 'react';
import { MapPin, Users, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabaseBrowser } from '../../../lib/supabase/client';
import { useI18n } from '../../../context/I18nContext';

export default function ProviderProfile() {
  const { user } = useAuth();
  const { t, lang: currentLang, setLang: setAppLang } = useI18n();
  const [profile, setProfile] = useState<{ name: string; service_type: string; city: string; recs: number } | null>(null);
  const [claimedInfo, setClaimedInfo] = useState<{ claimed: boolean; recommendationCount: number } | null>(null);
  const [lang, setLang] = useState<string>(user?.language || 'en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user?.phone) return;
      try {
        // Ask backend to locate the provider by phone and return recommendation count
        const res = await fetch('/api/providers/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, phone_e164: user.phone })
        });
        const data = await res.json();
        if (data) setClaimedInfo({ claimed: !!data.claimed, recommendationCount: data.recommendationCount || 0 });
        if (data && data.provider_id) {
          // Fetch provider detail for display
          const det = await fetch(`/api/providers/${data.provider_id}`);
          const detJson = await det.json();
          setProfile({
            name: detJson?.name || user.name,
            service_type: detJson?.service_type || '',
            city: detJson?.city || user.city,
            recs: data.recommendationCount || 0,
          });
        }
      } catch {}
    };
    run();
  }, [user?.id, user?.phone]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center">
        <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mr-4">
          {user?.name?.charAt(0) || 'J'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'Provider'}</h2>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{profile?.city || user?.city || 'Dakar, Senegal'}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end text-gray-600 mb-2">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-2xl font-bold text-indigo-600">{profile?.recs ?? 0}</span>
          </div>
          <p className="text-sm text-gray-600">{t('provider.recommendations')}</p>
        </div>
      </div>
      {claimedInfo && claimedInfo.recommendationCount > 0 && (
        <div className="bg-green-50 border border-green-200 text-green-900 rounded-lg p-3 mt-4">
          {t('provider.welcome')} {claimedInfo.recommendationCount} {t('provider.welcomeMessage')}
        </div>
      )}

      {/* Language setting */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex items-center mb-3">
          <Settings className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{t('profile.settings') || 'Profile Settings'}</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.language') || 'Language'}</label>
            <div className="inline-flex rounded-full bg-gray-100 p-1" role="radiogroup" aria-label="Language">
              {[
                { id: 'en', label: 'English' },
                { id: 'fr', label: 'Français' },
                { id: 'wo', label: 'Wolof' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={lang === opt.id}
                  onClick={() => setLang(opt.id)}
                  className={`${lang === opt.id ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700'} px-4 py-1.5 text-sm rounded-full mx-0.5 border ${lang === opt.id ? 'border-indigo-600' : 'border-transparent'} font-medium`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('profile.languageHelp') || 'This changes the language across your account.'}</p>
          </div>
          <div>
            {(lang !== currentLang) && (
              <button
                disabled={saving}
                onClick={async ()=>{
                  if (!user?.id) return;
                  setSaving(true);
                  try {
                    await supabaseBrowser.auth.updateUser({ data: { language: lang } });
                    await supabaseBrowser.from('users').update({ language: lang }).eq('id', user.id);
                    setAppLang(lang);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? t('provider.saving') : (t('common.save') || 'Save changes')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}