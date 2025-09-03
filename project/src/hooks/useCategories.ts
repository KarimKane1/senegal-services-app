import { useState, useEffect } from 'react';

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  name_fr?: string;
  name_wo?: string;
  description_fr?: string;
  description_wo?: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = () => {
    fetchCategories();
  };

  // Get localized category name
  const getLocalizedCategoryName = (category: ServiceCategory) => {
    // For now, just return the English name until translation columns are added
    return category.name;
    
    // Uncomment this when translation columns are added to the database:
    // switch (lang) {
    //   case 'fr':
    //     return category.name_fr || category.name;
    //   case 'wo':
    //     return category.name_wo || category.name;
    //   default:
    //     return category.name;
    // }
  };

  // Get localized category description
  const getLocalizedCategoryDescription = (category: ServiceCategory) => {
    // For now, just return the English description until translation columns are added
    return category.description;
    
    // Uncomment this when translation columns are added to the database:
    // switch (lang) {
    //   case 'fr':
    //     return category.description_fr || category.description;
    //   case 'wo':
    //     return category.description_wo || category.description;
    //   default:
    //     return category.description;
    // }
  };

  return {
    categories,
    loading,
    error,
    refreshCategories,
    getLocalizedCategoryName,
    getLocalizedCategoryDescription,
  };
}
