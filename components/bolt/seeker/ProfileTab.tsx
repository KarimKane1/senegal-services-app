import React, { useState } from 'react';
import { Users, ThumbsUp, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConnections } from '../../../hooks/connections';
import { useRecommendations } from '../../../hooks/recommendations';
import { useI18n } from '../../../context/I18nContext';
import { supabaseBrowser } from '../../../lib/supabase/client';

export default function ProfileTab() {
  const { user } = useAuth();
  const { data: network } = useConnections(user?.id);
  const { data: recs } = useRecommendations(user?.id);
  const { t, lang, setLang } = useI18n();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    language: lang || 'en'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  // Update local user when user changes
  React.useEffect(() => {
    setLocalUser(user);
    setEditForm({
      name: user?.name || '',
      language: lang || 'en'
    });
  }, [user, lang]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
          <div>
            <h2 className="text-xl font-bold mb-1">{t('profile.myProfile') || 'My Profile'}</h2>
            <p className="opacity-90">{t('profile.subtitle') || 'Your trust network profile'}</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mr-6 bg-indigo-100 text-indigo-600">
                {(user as any)?.photo_url?.startsWith('emoji:') ? (
                  <span className="text-2xl">{(user as any).photo_url.replace('emoji:','')}</span>
                ) : (user as any)?.photo_url ? (
                  <img src={(user as any).photo_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0) || 'A'}</span>
                )}
              </div>
                                 <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-1">{localUser?.name || user?.name || 'Aminata Diop'}</h3>
                     <p className="text-gray-600">{localUser?.phone || user?.phone || '+221 70 123 4567'}</p>
                     <p className="text-gray-600">{localUser?.city || user?.city || 'Dakar, Senegal'} · {lang === 'fr' ? 'Français' : lang === 'wo' ? 'Wolof' : 'English'}</p>
                   </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('profile.edit') || 'Edit'}
            </button>
          </div>

          {/* Network Stats */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.yourNetwork') || 'Your Network'}</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-xl p-6">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600 mb-1">{(network as any)?.items?.length ?? 0}</div>
                  <div className="text-gray-600 font-medium">{t('profile.connections') || 'Connections'}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-50 rounded-xl p-6">
                  <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600 mb-1">{(recs as any)?.items?.length ?? 0}</div>
                  <div className="text-gray-600 font-medium">{t('profile.recommendations') || 'Recommendations'}</div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t('profile.editProfile') || 'Edit Profile'}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  // Update language
                  setLang(editForm.language);
                  
                  // Get the current session token
                  const { data: { session } } = await supabaseBrowser.auth.getSession();
                  const token = session?.access_token;
                  
                  console.log('Session data:', { session: !!session, token: !!token });
                  
                  if (!token) {
                    alert('You must be logged in to update your profile');
                    return;
                  }

                  // Update user's name via API
                  console.log('Making API call with token:', token ? 'Present' : 'Missing');
                  const response = await fetch('/api/users', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      name: editForm.name
                    })
                  });

                  console.log('API response:', { status: response.status, ok: response.ok });

                  if (response.ok) {
                    // Success - update local user state and Supabase session metadata
                    setLocalUser(prev => prev ? { ...prev, name: editForm.name } : null);
                    
                    // Update Supabase session metadata so it persists after reload
                    const { error: updateError } = await supabaseBrowser.auth.updateUser({
                      data: { 
                        name: editForm.name,
                        language: editForm.language
                      }
                    });
                    
                    if (updateError) {
                      console.error('Failed to update session metadata:', updateError);
                    }
                    
                    setShowEditModal(false);
                    alert('Profile updated successfully!');
                    // Don't reload the page, just close the modal
                  } else {
                    const error = await response.json();
                    console.error('API error:', error);
                    alert(`Error updating profile: ${error.error || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error('Error updating profile:', error);
                  alert('Error updating profile. Please try again.');
                } finally {
                  setIsSaving(false);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('auth.fullName') || 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder={t('auth.fullNamePh') || 'Enter your full name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('auth.language') || 'Language'}
                    </label>
                    <select
                      value={editForm.language}
                      onChange={(e) => setEditForm({...editForm, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    >
                      <option value="en" className="text-gray-900">English</option>
                      <option value="fr" className="text-gray-900">Français</option>
                      <option value="wo" className="text-gray-900">Wolof</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}