export type ModuleType = 'hero' | 'mission' | 'children' | 'process' | 'testimonials';

export interface ModuleContent {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  items?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  [key: string]: any; // Add index signature to make it compatible with Json type
}

export interface ModuleSettings {
  displayMode?: 'full' | 'compact';
  autoRotate?: boolean;
  itemsToShow?: number;
  [key: string]: any; // Add index signature to make it compatible with Json type
}

export interface HomeModule {
  id: string;
  name: string;
  is_active: boolean;
  order_index: number;
  content: ModuleContent;
  module_type: ModuleType;
  settings: ModuleSettings;
  created_at?: string;
  updated_at?: string;
}