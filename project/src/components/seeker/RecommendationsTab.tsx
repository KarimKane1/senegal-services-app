import React, { useState } from 'react';
import { Plus, Search, Edit, Share, Trash2 } from 'lucide-react';
import AddRecommendationModal from './AddRecommendationModal';
import RecommendationDetailModal from './RecommendationDetailModal';
import EditRecommendationModal from './EditRecommendationModal';
import GuestPromptModal from '../common/GuestPromptModal';
import { mockRecommendations } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function RecommendationsTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [editingRecommendation, setEditingRecommendation] = useState<any>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const { isGuest, logout } = useAuth();

  const handleSaveEdit = (updatedRecommendation: any) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === updatedRecommendation.id ? updatedRecommendation : rec)
    );
  };

  const handleAddRecommendation = () => {
    if (isGuest) {
      setShowGuestPrompt(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleGuestAction = () => {
    if (isGuest) {
      setShowGuestPrompt(true);
      return;
    }
  };

  return (
    <div>
      <div className="mb-4 md:mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">My Recommendations</h2>
        <p className="text-sm md:text-base text-gray-600 px-2 md:px-0">Manage and share your trusted service providers</p>
      </div>

      {/* Add New Recommendation */}
      <div className="bg-green-50 rounded-xl md:rounded-2xl p-3 md:p-8 text-center mb-4 md:mb-8 mx-2 md:mx-0">
        <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Add New Recommendation</h3>
        <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 px-2 md:px-0">Know a great service provider? Share them with your network</p>
        <button
          onClick={handleAddRecommendation}
          className="add-recommendation-btn px-3 md:px-6 py-2 md:py-3 rounded-lg transition-colors font-medium text-sm bg-green-600 text-white hover:bg-green-700"
        >
          Add Recommendation
        </button>
      </div>

      {/* Your Recommendations */}
      <div className="mb-4 md:mb-6 px-2 md:px-0">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          Your Recommendations ({isGuest ? '***' : mockRecommendations.length})
        </h3>
      </div>

      <div className="space-y-2 md:space-y-4 px-2 md:px-0">
        {(isGuest ? recommendations.slice(0, 1) : recommendations).map((recommendation) => (
          <div 
            key={recommendation.id} 
            className={`bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-3 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${
              isGuest ? 'opacity-75' : ''
            }`}
            onClick={() => {
              if (isGuest) {
                handleGuestAction();
              } else {
                setSelectedRecommendation(recommendation);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-sm md:text-lg font-semibold text-gray-900 mr-2">
                    {isGuest ? recommendation.name.replace(/\w/g, '*') : recommendation.name}
                  </h4>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                    {recommendation.serviceType}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 text-xs md:text-sm mb-2 md:mb-3">
                  <span>{recommendation.location}</span>
                </div>

                {/* What You Liked */}
                {recommendation.qualities.length > 0 && (
                  <div className="mb-1 md:mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">What You Liked</p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {recommendation.qualities.map((quality) => (
                        <span key={quality} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                          {isGuest ? '***' : quality}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Things to Watch For */}
                {recommendation.watchFor.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Things to Watch For</p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {recommendation.watchFor.map((item) => (
                        <span key={item} className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                          {isGuest ? '***' : item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2 ml-2 md:ml-6" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => {
                    if (isGuest) {
                      handleGuestAction();
                    } else {
                      setEditingRecommendation(recommendation);
                    }
                  }}
                  className="p-1 rounded-md md:rounded-lg transition-colors text-xs text-indigo-600 hover:bg-indigo-50"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => {
                    if (isGuest) {
                      handleGuestAction();
                    }
                  }}
                  className="p-1 rounded-md md:rounded-lg transition-colors text-xs text-green-600 hover:bg-green-50"
                >
                  Contact
                </button>
                <button 
                  onClick={() => {
                    if (isGuest) {
                      handleGuestAction();
                    }
                  }}
                  className="p-1 rounded-md md:rounded-lg transition-colors text-xs text-blue-600 hover:bg-blue-50"
                >
                  Share
                </button>
                <button 
                  onClick={() => {
                    if (isGuest) {
                      handleGuestAction();
                    }
                  }}
                  className="p-1 rounded-md md:rounded-lg transition-colors text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isGuest && (
        <div className="bg-indigo-50 rounded-xl p-4 text-center mt-6 mx-2 md:mx-0">
          <p className="text-indigo-800 font-medium mb-2">Want to see all your recommendations?</p>
          <button
            onClick={logout}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            Create Account
          </button>
        </div>
      )}

      {showAddModal && (
        <AddRecommendationModal onClose={() => setShowAddModal(false)} />
      )}

      {selectedRecommendation && (
        <RecommendationDetailModal 
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          onEdit={() => {
            setEditingRecommendation(selectedRecommendation);
            setSelectedRecommendation(null);
          }}
        />
      )}

      {editingRecommendation && (
        <EditRecommendationModal 
          recommendation={editingRecommendation}
          onClose={() => setEditingRecommendation(null)}
          onSave={handleSaveEdit}
        />
      )}

      {showGuestPrompt && (
        <GuestPromptModal onClose={() => setShowGuestPrompt(false)} />
      )}
    </div>
  );
}