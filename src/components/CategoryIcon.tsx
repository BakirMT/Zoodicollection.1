import React from 'react';
import {
  Shirt,
  Footprints,
  Watch,
  Headphones,
  Home,
  Sparkles,
  Tag,
  Gift,
  ShoppingBag,
  Gem,
  Compass,
  Flame,
  Heart,
  Feather,
  Coffee,
  Camera,
  Smartphone,
  Award,
  Music,
  Layers,
  Boxes,
  Package,
  Folder,
} from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-4 h-4' }) => {
  const norm = (iconName || '').trim().toLowerCase();

  switch (norm) {
    case 'shirt':
    case 'fashion':
    case 'apparel':
    case 'clothes':
      return <Shirt className={className} />;
    case 'footprints':
    case 'shoes':
    case 'footwear':
    case 'sneakers':
      return <Footprints className={className} />;
    case 'watch':
    case 'accessories':
    case 'jewelry':
    case 'timepiece':
      return <Watch className={className} />;
    case 'headphones':
    case 'electronics':
    case 'audio':
      return <Headphones className={className} />;
    case 'home':
    case 'living':
    case 'homedecor':
      return <Home className={className} />;
    case 'sparkles':
    case 'luxury':
      return <Sparkles className={className} />;
    case 'tag':
      return <Tag className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'shoppingbag':
    case 'bag':
    case 'shopping-bag':
      return <ShoppingBag className={className} />;
    case 'gem':
    case 'diamond':
      return <Gem className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'flame':
    case 'hot':
    case 'trending':
      return <Flame className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'feather':
      return <Feather className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'camera':
      return <Camera className={className} />;
    case 'smartphone':
    case 'phone':
      return <Smartphone className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'music':
      return <Music className={className} />;
    case 'boxes':
      return <Boxes className={className} />;
    case 'package':
      return <Package className={className} />;
    case 'layers':
      return <Layers className={className} />;
    default:
      return <Folder className={className} />;
  }
};
