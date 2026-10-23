import { HomepageSection, HomepageSectionType } from '../types';

export interface SectionTypeMeta {
  type: HomepageSectionType;
  title: string;
  category: 'Banners & Media' | 'Product Showcases' | 'Promotions & Deals' | 'Categories & Brands' | 'Custom';
  description: string;
  badge?: string;
  iconName: string;
}

export const ALL_SECTION_TEMPLATES: SectionTypeMeta[] = [
  // 1. Banners & Media
  {
    type: 'image_slider',
    title: 'Hero Banner / Main Slider',
    category: 'Banners & Media',
    description: 'Full-width animated slider with multi-slide imagery, headings, badges, and CTA buttons.',
    iconName: 'Sliders',
  },
  {
    type: 'poster_banner',
    title: 'Promotional Image Banner',
    category: 'Banners & Media',
    description: 'High-impact standalone banner with background image, title, badge, and coupon/action link.',
    iconName: 'Image',
  },
  {
    type: 'single_image_text',
    title: 'Single Image with Text',
    category: 'Banners & Media',
    description: 'Editorial split layout with photography on the left or right and curated story text.',
    iconName: 'Layout',
  },
  {
    type: 'two_image_promo',
    title: 'Two-Image Promotional Layout',
    category: 'Banners & Media',
    description: 'Dual side-by-side promotional cards for seasonal collections, his & hers, or duos.',
    iconName: 'Columns',
  },
  {
    type: 'three_image_grid',
    title: 'Three-Image Grid',
    category: 'Banners & Media',
    description: 'Visual grid with 1 primary feature image and 2 stacked companion category banners.',
    iconName: 'Grid',
  },
  {
    type: 'promotional_video',
    title: 'Promotional Video',
    category: 'Banners & Media',
    description: 'Engaging video player with poster preview, headline, and optional loop/autoplay.',
    iconName: 'Video',
  },

  // 2. Promotions & Deals
  {
    type: 'flash_sale',
    title: 'Flash Deals',
    category: 'Promotions & Deals',
    description: 'High-urgency deal block with live countdown timer, deal pricing, and scheduling modes.',
    badge: 'Urgent',
    iconName: 'Zap',
  },
  {
    type: 'limited_time_offers',
    title: 'Limited-Time Offers',
    category: 'Promotions & Deals',
    description: 'Curated promotional bundle discounts with expiry indicators and promotional badges.',
    iconName: 'Clock',
  },
  {
    type: 'custom_card',
    title: 'Custom Promotional Section',
    category: 'Promotions & Deals',
    description: 'Flexible highlight card with custom background colors, badges, and discount triggers.',
    iconName: 'Sparkles',
  },

  // 3. Product Showcases
  {
    type: 'featured_collections',
    title: 'Featured Products',
    category: 'Product Showcases',
    description: 'Handpicked hero products with alternating spotlight cards and horizontal carousel.',
    iconName: 'Star',
  },
  {
    type: 'best_sellers',
    title: 'Best Sellers',
    category: 'Product Showcases',
    description: 'Store’s top performing products, auto-synced or manually pinned by admin.',
    iconName: 'TrendingUp',
  },
  {
    type: 'trending',
    title: 'Trending Products',
    category: 'Product Showcases',
    description: 'Hot picks currently gaining popularity across shoppers in Kerala.',
    iconName: 'Flame',
  },
  {
    type: 'new_arrivals',
    title: 'New Arrivals',
    category: 'Product Showcases',
    description: 'Fresh drops and newly listed items from catalog updates.',
    iconName: 'PackagePlus',
  },
  {
    type: 'for_you',
    title: 'Recommended for You',
    category: 'Product Showcases',
    description: 'Personalized product suggestions curated for modern lifestyles.',
    iconName: 'Heart',
  },
  {
    type: 'product_carousel',
    title: 'Product Carousel',
    category: 'Product Showcases',
    description: 'Horizontal touch-friendly swiper with smooth scroll snap and arrow controls.',
    iconName: 'MoveHorizontal',
  },
  {
    type: 'product_grid',
    title: 'Product Grid',
    category: 'Product Showcases',
    description: 'Clean responsive grid layout (2 to 5 columns) with sorting and limits.',
    iconName: 'LayoutGrid',
  },
  {
    type: 'custom_collection',
    title: 'Custom Product Collection',
    category: 'Product Showcases',
    description: 'Admin-curated product bundle with custom filter rules or specific product IDs.',
    iconName: 'Layers',
  },

  // 4. Categories & Brands
  {
    type: 'category_carousel',
    title: 'Category Carousel',
    category: 'Categories & Brands',
    description: 'Flipkart-inspired circular category layout with Image, Text, and Initial circle display modes.',
    iconName: 'Compass',
  },
  {
    type: 'main_categories',
    title: 'Shop by Category',
    category: 'Categories & Brands',
    description: 'Modern circular category showcase with lifestyle imagery and direct collection links.',
    iconName: 'FolderTree',
  },
  {
    type: 'brand_showcase',
    title: 'Brand Showcase',
    category: 'Categories & Brands',
    description: 'Curated gallery of featured labels, designers, and authorized brands.',
    iconName: 'Award',
  },

  // 5. Custom
  {
    type: 'custom_html',
    title: 'Custom HTML / Rich Text',
    category: 'Custom',
    description: 'Safe rich text, custom announcements, brand story, or store location notice.',
    iconName: 'Code',
  },
];

// Preset Media Gallery for instant 1-click image selection in Image Manager
export interface MediaLibraryItem {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const PRESET_MEDIA_LIBRARY: MediaLibraryItem[] = [
  {
    id: 'media_fashion_01',
    name: 'Festive Runway Silks',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'media_fashion_02',
    name: 'Modern Streetwear Editorial',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'media_shoes_01',
    name: 'Aeroknit Performance Footwear',
    category: 'Footwear',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'media_shoes_02',
    name: 'Leather Oxford Craft',
    category: 'Footwear',
    url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'media_accessories_01',
    name: 'Signature Leather Backpack',
    category: 'Accessories',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'media_accessories_02',
    name: 'Luxury Chronograph Watch',
    category: 'Accessories',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'media_electronics_01',
    name: 'Studio Wireless Acoustics',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'media_home_01',
    name: 'Artisan Home Decor',
    category: 'Home & Living',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'media_banner_sale',
    name: 'Festive Season Celebration Banner',
    category: 'Banners',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'media_banner_women',
    name: 'Autumn Chic Women Collection',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
  },
];

// Generates an initial clean template configuration for any of the 21 section types
export function createDefaultSectionConfig(type: HomepageSectionType, order: number): HomepageSection {
  const baseId = `sec_${type}_${Date.now()}`;
  const now = new Date().toISOString();

  switch (type) {
    case 'image_slider':
      return {
        id: baseId,
        title: 'Featured Drops',
        subtitle: 'Limited-edition signature silhouettes',
        type: 'image_slider',
        order,
        isActive: true,
        status: 'active',
        sliderAutoplay: true,
        sliderInterval: 5,
        slides: [
          {
            id: `slide_${Date.now()}_1`,
            image: PRESET_MEDIA_LIBRARY[0].url,
            heading: 'Summer Festive Collection 2026',
            subheading: 'Bold colors, premium silks & modern silhouettes',
            buttonText: 'Shop New In',
            buttonLink: 'prod_jacket_01',
            badge: 'NEW DROP',
          },
          {
            id: `slide_${Date.now()}_2`,
            image: PRESET_MEDIA_LIBRARY[1].url,
            heading: 'Signature Apparel Showcase',
            subheading: 'High-density fabrics with precision craftsmanship',
            buttonText: 'Explore Collection',
            buttonLink: 'prod_jacket_01',
            badge: 'POPULAR',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

    case 'poster_banner':
      return {
        id: baseId,
        title: 'Exclusive Festive Offer',
        subtitle: 'Apply coupon code FLAT100 for instant ₹100 discount storewide',
        type: 'poster_banner',
        order,
        isActive: true,
        status: 'active',
        bgColor: '#192E4D',
        textColor: '#FFFFFF',
        bannerImage: PRESET_MEDIA_LIBRARY[8].url,
        buttonLabel: 'Claim Flat ₹100 Off',
        buttonLink: 'coupon:FLAT100',
        badge: 'LIMITED OFFER',
        overlayOpacity: 30,
        createdAt: now,
        updatedAt: now,
      };

    case 'single_image_text':
      return {
        id: baseId,
        title: 'Crafted for Modern Endurance',
        subtitle: 'The Story Behind ZOODI Heritage',
        description:
          'Every garment is meticulously engineered in Kerala with ethical fabrication, reinforced seams, and breathable micro-weaves made for Indian climates.',
        type: 'single_image_text',
        order,
        isActive: true,
        status: 'active',
        bannerImage: PRESET_MEDIA_LIBRARY[1].url,
        imagePosition: 'left',
        buttonLabel: 'Explore Brand Story',
        buttonLink: 'prod_jacket_01',
        badge: 'ZOODI ETHOS',
        createdAt: now,
        updatedAt: now,
      };

    case 'two_image_promo':
      return {
        id: baseId,
        title: 'Curated Duos',
        subtitle: 'Shop the season’s contrasting palettes',
        type: 'two_image_promo',
        order,
        isActive: true,
        status: 'active',
        images: [
          {
            id: 'img_1',
            url: PRESET_MEDIA_LIBRARY[0].url,
            title: "Men's Luxury Outerwear",
            subtitle: 'Starting from ₹2,499',
            link: 'prod_jacket_01',
            buttonText: 'Shop Men',
            badge: 'NEW',
          },
          {
            id: 'img_2',
            url: PRESET_MEDIA_LIBRARY[9].url,
            title: "Women's Runway Collection",
            subtitle: 'Pure georgette & silks',
            link: 'prod_dress_03',
            buttonText: 'Shop Women',
            badge: 'TRENDING',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

    case 'three_image_grid':
      return {
        id: baseId,
        title: 'Trending Lookbook',
        subtitle: 'Explore by curated outfit pairings',
        type: 'three_image_grid',
        order,
        isActive: true,
        status: 'active',
        images: [
          {
            id: 'img_1',
            url: PRESET_MEDIA_LIBRARY[1].url,
            title: 'Urban Bomber Series',
            subtitle: 'Signature matte silhouette',
            link: 'prod_jacket_01',
            badge: 'FEATURED',
          },
          {
            id: 'img_2',
            url: PRESET_MEDIA_LIBRARY[2].url,
            title: 'Aeroknit Kicks',
            subtitle: 'Ultra rebound sole',
            link: 'prod_sneaker_02',
            badge: 'BEST SELLER',
          },
          {
            id: 'img_3',
            url: PRESET_MEDIA_LIBRARY[4].url,
            title: 'Full-Grain Leather',
            subtitle: 'Hand-burnished hide',
            link: 'prod_bag_04',
            badge: 'PREMIUM',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

    case 'flash_sale': {
      // 24 hours from now
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      return {
        id: baseId,
        title: '⚡ Flash Deals: 24h Countdown',
        subtitle: 'Exclusive promotional prices on runway silhouettes',
        type: 'flash_sale',
        order,
        isActive: true,
        status: 'active',
        durationMode: 'scheduled',
        flashSaleStartTime: now,
        flashSaleEndTime: endTime,
        showCountdown: true,
        isUnlimitedDuration: false,
        productIds: ['prod_jacket_01', 'prod_sneaker_02', 'prod_dress_03'],
        dealProducts: [
          { productId: 'prod_jacket_01', dealPrice: 2299, dealStock: 15, customerLimit: 2 },
          { productId: 'prod_sneaker_02', dealPrice: 1799, dealStock: 20, customerLimit: 2 },
          { productId: 'prod_dress_03', dealPrice: 2699, dealStock: 12, customerLimit: 1 },
        ],
        createdAt: now,
        updatedAt: now,
      };
    }

    case 'limited_time_offers':
      return {
        id: baseId,
        title: 'Limited-Time Weekend Specials',
        subtitle: 'Price drops valid while stocks last',
        type: 'limited_time_offers',
        order,
        isActive: true,
        status: 'active',
        badge: 'SPECIAL OFFER',
        isUnlimitedDuration: true,
        showCountdown: false,
        productIds: ['prod_bag_04', 'prod_headphone_05', 'prod_sneaker_02'],
        displayMode: 'carousel',
        createdAt: now,
        updatedAt: now,
      };

    case 'best_sellers':
      return {
        id: baseId,
        title: 'Best Selling Icons',
        subtitle: 'Our community’s most-loved essentials across Kerala',
        type: 'best_sellers',
        order,
        isActive: true,
        status: 'active',
        productSelectionMode: 'best_sellers',
        productIds: ['prod_jacket_01', 'prod_bag_04', 'prod_sneaker_02'],
        displayMode: 'alternating',
        createdAt: now,
        updatedAt: now,
      };

    case 'trending':
      return {
        id: baseId,
        title: 'Trending This Week',
        subtitle: 'Hot items receiving high community ratings',
        type: 'trending',
        order,
        isActive: true,
        status: 'active',
        productSelectionMode: 'trending',
        productIds: ['prod_sneaker_02', 'prod_headphone_05', 'prod_dress_03'],
        displayMode: 'carousel',
        createdAt: now,
        updatedAt: now,
      };

    case 'new_arrivals':
      return {
        id: baseId,
        title: 'Fresh New Arrivals',
        subtitle: 'Just added to the ZOODI catalogue',
        type: 'new_arrivals',
        order,
        isActive: true,
        status: 'active',
        productSelectionMode: 'new_arrivals',
        productIds: ['prod_jacket_01', 'prod_headphone_05'],
        displayMode: 'alternating',
        createdAt: now,
        updatedAt: now,
      };

    case 'featured_collections':
      return {
        id: baseId,
        title: 'Featured Collection',
        subtitle: 'Hand-selected by our senior merchandising team',
        type: 'featured_collections',
        order,
        isActive: true,
        status: 'active',
        productIds: ['prod_jacket_01', 'prod_dress_03', 'prod_bag_04'],
        displayMode: 'alternating',
        createdAt: now,
        updatedAt: now,
      };

    case 'for_you':
      return {
        id: baseId,
        title: 'Recommended For You',
        subtitle: 'Tailored styles based on your browsing taste',
        type: 'for_you',
        order,
        isActive: true,
        status: 'active',
        productIds: ['prod_headphone_05', 'prod_dress_03', 'prod_jacket_01'],
        displayMode: 'carousel',
        createdAt: now,
        updatedAt: now,
      };

    case 'product_carousel':
      return {
        id: baseId,
        title: 'Rapid Pick Carousel',
        subtitle: 'Swipe horizontally to browse popular items',
        type: 'product_carousel',
        order,
        isActive: true,
        status: 'active',
        productIds: ['prod_jacket_01', 'prod_sneaker_02', 'prod_dress_03', 'prod_bag_04', 'prod_headphone_05'],
        displayMode: 'carousel',
        badge: 'SWIPE TO EXPLORE',
        createdAt: now,
        updatedAt: now,
      };

    case 'product_grid':
      return {
        id: baseId,
        title: 'Catalog Grid Showcase',
        subtitle: 'Comprehensive product view with filter options',
        type: 'product_grid',
        order,
        isActive: true,
        status: 'active',
        columns: 4,
        productLimit: 8,
        productSelectionMode: 'manual',
        productIds: ['prod_jacket_01', 'prod_sneaker_02', 'prod_dress_03', 'prod_bag_04', 'prod_headphone_05'],
        createdAt: now,
        updatedAt: now,
      };

    case 'category_carousel':
      return {
        id: baseId,
        title: 'Quick Category Carousel',
        subtitle: 'Tap a category to jump straight into collections',
        type: 'category_carousel',
        order,
        isActive: true,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

    case 'main_categories':
      return {
        id: baseId,
        title: 'Explore Collections by Category',
        subtitle: 'Curated apparel, footwear, accessories & home living',
        type: 'main_categories',
        order,
        isActive: true,
        status: 'active',
        columns: 3,
        createdAt: now,
        updatedAt: now,
      };

    case 'brand_showcase':
      return {
        id: baseId,
        title: 'Official Brands & Partners',
        subtitle: 'Authentic 100% genuine guaranteed labels',
        type: 'brand_showcase',
        order,
        isActive: true,
        status: 'active',
        images: [
          { id: 'b_1', url: '', title: 'ZOODI Collection', subtitle: 'Signature Luxury' },
          { id: 'b_2', url: '', title: 'ZOODI Motion', subtitle: 'Athletic Footwear' },
          { id: 'b_3', url: '', title: 'Aura Kerala', subtitle: 'Handwoven Silks' },
          { id: 'b_4', url: '', title: 'Titan Audio', subtitle: 'Acoustic Sound' },
        ],
        createdAt: now,
        updatedAt: now,
      };

    case 'promotional_video':
      return {
        id: baseId,
        title: 'Behind the Seams: The 2026 Collection',
        subtitle: 'Watch how our all-weather bomber jackets are tailored',
        type: 'promotional_video',
        order,
        isActive: true,
        status: 'active',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoPoster: PRESET_MEDIA_LIBRARY[1].url,
        videoAutoplay: false,
        buttonLabel: 'Shop Featured Pieces',
        buttonLink: 'prod_jacket_01',
        badge: 'EXCLUSIVE FOOTAGE',
        createdAt: now,
        updatedAt: now,
      };

    case 'custom_html':
      return {
        id: baseId,
        title: 'Welcome to ZOODI Kerala Storefront',
        subtitle: 'Express delivery from Mannarkkad, Palakkad to across India',
        type: 'custom_html',
        order,
        isActive: true,
        status: 'active',
        htmlContent: `<div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#192E4D]">
  <h4 class="font-extrabold text-sm mb-1 text-amber-900">✨ Festival Delivery Notice</h4>
  <p class="text-xs text-amber-800">Same-day dispatch available for all orders placed before 3:00 PM IST across Palakkad, Malappuram & Ernakulam hubs. Free shipping on prepaid Google Pay orders over ₹999.</p>
</div>`,
        createdAt: now,
        updatedAt: now,
      };

    case 'custom_collection':
      return {
        id: baseId,
        title: 'Curator’s Choice',
        subtitle: 'Special seasonal edit chosen by head stylists',
        type: 'custom_collection',
        order,
        isActive: true,
        status: 'active',
        productIds: ['prod_jacket_01', 'prod_sneaker_02', 'prod_headphone_05'],
        displayMode: 'alternating',
        createdAt: now,
        updatedAt: now,
      };

    case 'custom_card':
    default:
      return {
        id: baseId,
        title: 'Special VIP Member Drop',
        subtitle: 'Join our Kerala privilege program for private invites',
        type: 'custom_card',
        order,
        isActive: true,
        status: 'active',
        bgColor: '#08A9A2',
        textColor: '#FFFFFF',
        buttonLabel: 'Learn More',
        buttonLink: 'tab:account',
        badge: 'VIP PERK',
        createdAt: now,
        updatedAt: now,
      };
  }
}
