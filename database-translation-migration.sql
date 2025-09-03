-- Migration to add translation support for service categories
-- Run this in your Supabase SQL editor

-- Add translation columns to service_categories table
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS name_fr TEXT,
ADD COLUMN IF NOT EXISTS name_wo TEXT,
ADD COLUMN IF NOT EXISTS description_fr TEXT,
ADD COLUMN IF NOT EXISTS description_wo TEXT;

-- Update existing categories with French and Wolof translations
UPDATE service_categories SET 
  name_fr = CASE 
    WHEN name = 'Plumber' THEN 'Plombier'
    WHEN name = 'Cleaner' THEN 'Nettoyeur/Nettoyeuse'
    WHEN name = 'Nanny' THEN 'Nounou'
    WHEN name = 'Electrician' THEN 'Électricien'
    WHEN name = 'Carpenter' THEN 'Menuisier'
    WHEN name = 'Hair' THEN 'Coiffeur/Coiffeuse'
    WHEN name = 'Henna' THEN 'Henna'
    WHEN name = 'Chef' THEN 'Chef/Cuisinier'
    WHEN name = 'Other' THEN 'Autre'
    ELSE name
  END,
  name_wo = CASE 
    WHEN name = 'Plumber' THEN 'Jëkkër'
    WHEN name = 'Cleaner' THEN 'Setal'
    WHEN name = 'Nanny' THEN 'Jëkkër doom'
    WHEN name = 'Electrician' THEN 'Jëkkër kër'
    WHEN name = 'Carpenter' THEN 'Jëkkër kër'
    WHEN name = 'Hair' THEN 'Jëkkër kaw'
    WHEN name = 'Henna' THEN 'Henna'
    WHEN name = 'Chef' THEN 'Jëkkër lekk'
    WHEN name = 'Other' THEN 'Yeneen'
    ELSE name
  END,
  description_fr = CASE 
    WHEN name = 'Plumber' THEN 'Services de plomberie et réparations'
    WHEN name = 'Cleaner' THEN 'Services de nettoyage et ménage'
    WHEN name = 'Nanny' THEN 'Services de garde d''enfants'
    WHEN name = 'Electrician' THEN 'Services électriques et réparations'
    WHEN name = 'Carpenter' THEN 'Services de menuiserie et travail du bois'
    WHEN name = 'Hair' THEN 'Services de coiffure et beauté'
    WHEN name = 'Henna' THEN 'Services de henna et beauté traditionnelle'
    WHEN name = 'Chef' THEN 'Services de cuisine et culinaires'
    WHEN name = 'Other' THEN 'Autres services divers'
    ELSE description
  END,
  description_wo = CASE 
    WHEN name = 'Plumber' THEN 'Jëf yu jëkkër ak jëf yu setal'
    WHEN name = 'Cleaner' THEN 'Jëf yu setal ak jëf yu kër'
    WHEN name = 'Nanny' THEN 'Jëf yu jëkkër doom'
    WHEN name = 'Electrician' THEN 'Jëf yu kër ak jëf yu setal'
    WHEN name = 'Carpenter' THEN 'Jëf yu kër ak jëf yu setal'
    WHEN name = 'Hair' THEN 'Jëf yu kaw ak jëf yu setal'
    WHEN name = 'Henna' THEN 'Jëf yu henna ak jëf yu setal'
    WHEN name = 'Chef' THEN 'Jëf yu lekk ak jëf yu setal'
    WHEN name = 'Other' THEN 'Yeneen jëf yu setal'
    ELSE description
  END;
