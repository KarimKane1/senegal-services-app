// Mock data for development

export interface Connection {
  id: string;
  name: string;
  location: string;
  avatar: string;
  recommendationCount: number;
  recommendations?: ServiceProvider[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  serviceType: string;
  location: string;
  avatar: string;
  phone: string;
  recommendedBy?: string;
  isNetworkRecommendation: boolean;
  qualities: string[];
  watchFor: string[];
}

export interface Recommendation {
  id: string;
  name: string;
  serviceType: string;
  location: string;
  phone: string;
  qualities: string[];
  watchFor: string[];
}

// Consolidated categories aligned with database enum (service_type)
export const serviceCategories = [
  'All',
  'Plumber',
  'Cleaner',
  'Nanny',
  'Electrician',
  'Carpenter',
  'Hair',
  'Henna',
  'Chef',
];

export const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    recommendationCount: 2,
    recommendations: [
      {
        id: 'sp1',
        name: 'John the Plumber',
        serviceType: 'Plumber',
        location: 'Dakar',
        avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 77 111 2222',
        qualities: ['Job quality', 'Timeliness', 'Polite & Respectful'],
        watchFor: ['Expensive']
      },
      {
        id: 'sp2',
        name: 'Tech Repair Pro',
        serviceType: 'Tech Repair',
        location: 'Dakar',
        avatar: 'https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 77 555 6666',
        qualities: ['Job quality', 'Timeliness', 'Reliable & Trustworthy'],
        watchFor: ['Clean & Organized']
      }
    ]
  },
  {
    id: '2',
    name: 'Mike Chen',
    location: 'Thiès',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    recommendationCount: 2,
    recommendations: [
      {
        id: 'sp3',
        name: 'Maria\'s Cleaning',
        serviceType: 'Cleaner',
        location: 'Thiès',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 78 222 3333',
        qualities: ['Job quality', 'Clean & Organized', 'Polite & Respectful'],
        watchFor: []
      },
      {
        id: 'sp4',
        name: 'Quick Fix Electric',
        serviceType: 'Electrician',
        location: 'Rufisque',
        avatar: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 77 333 4444',
        qualities: ['Job quality', 'Professional'],
        watchFor: ['Expensive']
      }
    ]
  },
  {
    id: '3',
    name: 'Aminata Diop',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    recommendationCount: 1,
    recommendations: [
      {
        id: 'sp5',
        name: 'Green Thumb Gardens',
        serviceType: 'Gardener',
        location: 'Dakar',
        avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 76 444 5555',
        qualities: ['Professional', 'Clean & Organized'],
        watchFor: ['Limited availability']
      }
    ]
  }
];

export const mockServiceProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'John the Plumber',
    serviceType: 'Plumber',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 77 111 2222',
    recommendedBy: 'Sarah Johnson',
    isNetworkRecommendation: true,
    qualities: ['Job quality', 'Timeliness', 'Polite & Respectful'],
    watchFor: ['Affordable']
  },
  {
    id: '2',
    name: 'Maria\'s Cleaning',
    serviceType: 'Cleaner',
    location: 'Thiès',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 78 222 3333',
    recommendedBy: 'Mike Chen',
    isNetworkRecommendation: true,
    qualities: ['Job quality', 'Clean & Organized', 'Polite & Respectful'],
    watchFor: []
  },
  {
    id: '3',
    name: 'Tech Repair Pro',
    serviceType: 'Tech Repair',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 77 555 6666',
    recommendedBy: 'Sarah Johnson',
    isNetworkRecommendation: true,
    qualities: ['Job quality', 'Timeliness', 'Reliable & Trustworthy'],
    watchFor: ['Clean & Organized']
  },
  {
    id: '4',
    name: 'Green Thumb Gardens',
    serviceType: 'Gardener',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 76 444 5555',
    isNetworkRecommendation: false,
    qualities: ['Professional', 'Clean & Organized'],
    watchFor: ['Limited availability']
  },
  {
    id: '5',
    name: 'Quick Fix Electric',
    serviceType: 'Electrician',
    location: 'Rufisque',
    avatar: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 77 333 4444',
    isNetworkRecommendation: false,
    qualities: ['Job quality', 'Professional'],
    watchFor: ['Expensive']
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    name: 'Fatima\'s Catering',
    serviceType: 'Cook/Chef',
    location: 'Thiès',
    phone: '+221 78 111 2222',
    qualities: ['Job quality', 'Timeliness', 'Clean & Organized', 'Professional'],
    watchFor: []
  },
  {
    id: '2',
    name: 'Quick Delivery Service',
    serviceType: 'Driver',
    location: 'Dakar',
    phone: '+221 77 222 3333',
    qualities: ['Reliable & Trustworthy', 'Timeliness'],
    watchFor: []
  },
  {
    id: '3',
    name: 'Amadou Kane',
    serviceType: 'Tech Repair',
    location: 'Dakar',
    phone: '+221 76 333 4444',
    qualities: ['Job quality', 'Timeliness', 'Clean & Organized', 'Professional'],
    watchFor: ['Expensive', 'Limited availability']
  }
];