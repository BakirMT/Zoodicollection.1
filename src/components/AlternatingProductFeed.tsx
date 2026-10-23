import React from 'react';
import { Product } from '../types';
import { ProductSpotlightCard } from './ProductSpotlightCard';
import { HorizontalProductCarousel } from './HorizontalProductCarousel';

interface AlternatingProductFeedProps {
  products: Product[];
  spotlightBadgePrefix?: string;
  carouselTitle?: string;
  carouselSubtitle?: string;
}

export const AlternatingProductFeed: React.FC<AlternatingProductFeedProps> = ({
  products,
  spotlightBadgePrefix = 'Featured',
  carouselTitle = 'Trending Horizontal Picks',
  carouselSubtitle = 'Swipe horizontally to view more products',
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs">
        No products available in this collection yet.
      </div>
    );
  }

  // We alternate: 1 Spotlight product, then a chunk of products in a horizontal carousel
  const CAROUSEL_CHUNK_SIZE = 4;
  const elements: React.ReactNode[] = [];

  let idx = 0;
  let spotlightCount = 0;
  let carouselCount = 0;

  while (idx < products.length) {
    // 1. Single Spotlight Product (now compact)
    const spotlightProduct = products[idx];
    spotlightCount += 1;
    elements.push(
      <div key={`spotlight-${spotlightProduct.id}-${idx}`} className="px-4">
        <ProductSpotlightCard
          product={spotlightProduct}
          badgeLabel={`${spotlightBadgePrefix} #${spotlightCount}`}
        />
      </div>
    );
    idx += 1;

    // 2. Next products below that product change to a horizontal product carousel (now smaller cards)
    if (idx < products.length) {
      const carouselProducts = products.slice(idx, idx + CAROUSEL_CHUNK_SIZE);
      carouselCount += 1;
      elements.push(
        <div key={`carousel-${idx}-${carouselCount}`} className="w-full">
          <HorizontalProductCarousel
            products={carouselProducts}
            title={carouselCount === 1 ? carouselTitle : `Collection Strip #${carouselCount}`}
            subtitle={carouselSubtitle}
            badge="Swipe to browse"
          />
        </div>
      );
      idx += carouselProducts.length;
    }
  }

  return <div className="flex flex-col space-y-4 w-full">{elements}</div>;
};
