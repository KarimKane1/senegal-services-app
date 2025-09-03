import React, { useEffect, useState } from 'react';
import { MessageCircle, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';

export default function RecommendationsList() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Resolve provider id by phone via claim endpoint, then fetch recommenders
        const res = await fetch('/api/providers/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user?.id, phone_e164: user?.phone })
        });
        const claim = await res.json();
        if (claim?.provider_id) {
          const recRes = await fetch(`/api/providers/${claim.provider_id}/recommenders`);
          const recJson = await recRes.json();
          setItems(recJson.items || []);
        } else {
          setItems([]);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, user?.phone]);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('provider.peopleRecommend')}</h3>
        <p className="text-gray-600">{t('provider.seeWhoTrusts')}</p>
      </div>

      {loading && <div className="text-gray-500">{t('provider.loading')}</div>}
      {!loading && items.length === 0 && <div className="text-gray-500">{t('provider.noRecommendations')}</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-4">
        {items.map((recommender) => (
          <div key={recommender.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-4 bg-indigo-100 flex items-center justify-center text-indigo-700 text-lg">
                  {recommender.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{recommender.name}</h4>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {recommender.location}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(recommender.dateAdded).toLocaleDateString()}
              </div>
            </div>

            {/* Qualities */}
            {recommender.qualities.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('provider.whatTheyLiked')}</p>
                <div className="flex flex-wrap gap-2">
                  {recommender.qualities.map((quality) => (
                    <span key={quality} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                      {quality}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Things to Watch For */}
            {recommender.watchFor.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('provider.thingsToWatch')}</p>
                <div className="flex flex-wrap gap-2">
                  {recommender.watchFor.map((item) => (
                    <span key={item} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}