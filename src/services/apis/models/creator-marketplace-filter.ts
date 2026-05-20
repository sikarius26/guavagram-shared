import type { CreatorLevelEnum } from './creator-level-enum';

export interface CreatorMarketplaceFilter {
    city?: string;
    expertise?: string[];
    level?: CreatorLevelEnum;
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    languages?: string[];
    sortBy?: 'featured' | 'rating' | 'price' | 'recent';
}
