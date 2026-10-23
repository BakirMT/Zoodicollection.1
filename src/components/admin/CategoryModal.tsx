import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MainCategory, SubCategory, SubSubCategory, CategoryDisplayMode } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import {
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  Layers,
  AlertCircle,
  Upload,
  Trash2,
  RefreshCw,
  Palette,
  Eye,
  Type,
  Maximize2,
  Sliders,
} from 'lucide-react';

export type CategoryLevel = 'main' | 'sub' | 'subsub';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLevel?: CategoryLevel;
  initialParentMainId?: string;
  initialParentSubId?: string;
  editingCategory?: {
    type: CategoryLevel;
    item: MainCategory | SubCategory | SubSubCategory;
  } | null;
  onSaveSuccess?: (name: string, levelLabel: string) => void;
}

// Curated high quality presets for luxury/fashion/lifestyle e-commerce
const PRESET_IMAGES = [
  { label: 'High Fashion', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80' },
  { label: "Men's Sartorial", url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80' },
  { label: "Women's Couture", url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Jackets & Outerwear', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Sneakers & Street', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
  { label: 'Dress Shoes & Oxfords', url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80' },
  { label: 'Leather Bags', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luxury Watches', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Audio & Acoustics', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Smart Wearables', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Artisan Candles & Decor', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luxury Linens', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80' },
];

const PRESET_ICONS = [
  'Shirt',
  'Footprints',
  'Watch',
  'Headphones',
  'Home',
  'Sparkles',
  'Tag',
  'Gift',
  'ShoppingBag',
  'Gem',
  'Compass',
  'Flame',
  'Heart',
  'Feather',
  'Coffee',
  'Camera',
  'Smartphone',
  'Award',
];

const COLOR_PRESETS = [
  { bg: '#F0FDF4', text: '#0F766E', label: 'Mint Teal' },
  { bg: '#F0F4F8', text: '#192E4D', label: 'Corporate Navy' },
  { bg: '#FEF3C7', text: '#B45309', label: 'Warm Amber' },
  { bg: '#EFF6FF', text: '#1D4ED8', label: 'Sky Blue' },
  { bg: '#FDF2F8', text: '#BE185D', label: 'Rose Gold' },
  { bg: '#FAF5FF', text: '#6B21A8', label: 'Royal Purple' },
  { bg: '#FFF1F2', text: '#E11D48', label: 'Ruby Red' },
  { bg: '#192E4D', text: '#FFFFFF', label: 'Dark Navy' },
  { bg: '#08A9A2', text: '#FFFFFF', label: 'ZOODI Teal' },
  { bg: '#18181B', text: '#FAFAFA', label: 'Midnight Black' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  initialLevel = 'main',
  initialParentMainId,
  initialParentSubId,
  editingCategory,
  onSaveSuccess,
}) => {
  const { mainCategories, subCategories, saveCategory } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(editingCategory);
  const [level, setLevel] = useState<CategoryLevel>(initialLevel);

  // Form Fields
  const [name, setName] = useState('');
  const [customId, setCustomId] = useState('');
  const [image, setImage] = useState<string | null>(PRESET_IMAGES[0].url);
  const [iconName, setIconName] = useState('Shirt');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Circular Homepage Display Settings
  const [displayMode, setDisplayMode] = useState<CategoryDisplayMode>('image');
  const [backgroundColor, setBackgroundColor] = useState('#F0FDF4');
  const [textColor, setTextColor] = useState('#0F766E');
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [imagePosition, setImagePosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [showOnHomepage, setShowOnHomepage] = useState<boolean>(true);

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Parent Selectors
  const [parentMainId, setParentMainId] = useState<string>(
    initialParentMainId || mainCategories[0]?.id || 'cat_fashion'
  );
  const [parentSubId, setParentSubId] = useState<string>(initialParentSubId || '');

  // Validation error
  const [validationError, setValidationError] = useState<string | null>(null);

  // Populate state on open or change
  useEffect(() => {
    if (!isOpen) return;

    if (editingCategory) {
      setLevel(editingCategory.type);
      setName(editingCategory.item.name || '');
      setCustomId(editingCategory.item.id || '');
      setImage(editingCategory.item.image || null);
      setOrder(editingCategory.item.order || 1);
      setIsActive(editingCategory.item.isActive !== undefined ? editingCategory.item.isActive : true);

      if (editingCategory.type === 'main') {
        const item = editingCategory.item as MainCategory;
        setIconName(item.iconName || 'Shirt');
        setDescription(item.description || '');
        setDisplayMode(item.displayMode || (item.image ? 'image' : 'text'));
        setBackgroundColor(item.backgroundColor || '#F0FDF4');
        setTextColor(item.textColor || '#0F766E');
        setImageFit(item.imageFit || 'cover');
        setImagePosition(item.imagePosition || 'center');
        setShowOnHomepage(item.showOnHomepage !== undefined ? item.showOnHomepage : true);
      } else if (editingCategory.type === 'sub') {
        const item = editingCategory.item as SubCategory;
        setParentMainId(item.mainCategoryId || mainCategories[0]?.id || '');
      } else if (editingCategory.type === 'subsub') {
        const item = editingCategory.item as SubSubCategory;
        setParentMainId(item.mainCategoryId || mainCategories[0]?.id || '');
        setParentSubId(item.subCategoryId || '');
      }
    } else {
      setLevel(initialLevel);
      setName('');
      setCustomId('');
      setImage(PRESET_IMAGES[0].url);
      setIconName('Shirt');
      setDescription('');
      setIsActive(true);
      setDisplayMode('image');
      setBackgroundColor('#F0FDF4');
      setTextColor('#0F766E');
      setImageFit('cover');
      setImagePosition('center');
      setShowOnHomepage(true);

      const mId = initialParentMainId || mainCategories[0]?.id || '';
      setParentMainId(mId);

      const subsForMain = subCategories.filter((s) => s.mainCategoryId === mId);
      const sId = initialParentSubId || (subsForMain[0]?.id ?? '');
      setParentSubId(sId);

      if (initialLevel === 'main') {
        setOrder(mainCategories.length + 1);
      } else if (initialLevel === 'sub') {
        setOrder(subsForMain.length + 1);
      } else {
        setOrder(1);
      }
    }
    setValidationError(null);
    setUploadError(null);
  }, [isOpen, editingCategory, initialLevel, initialParentMainId, initialParentSubId, mainCategories, subCategories]);

  // Keep parentSubId in sync when parentMainId changes
  useEffect(() => {
    if (!isEdit && level === 'subsub') {
      const availableSubs = subCategories.filter((s) => s.mainCategoryId === parentMainId);
      if (availableSubs.length > 0 && !availableSubs.some((s) => s.id === parentSubId)) {
        setParentSubId(availableSubs[0].id);
      }
    }
  }, [parentMainId, level, isEdit, parentSubId, subCategories]);

  if (!isOpen) return null;

  const availableSubCategories = subCategories.filter((s) => s.mainCategoryId === parentMainId);

  // Auto-generate clean slug ID from Name if customId not manually typed
  const generateCleanId = (nameVal: string, lvl: CategoryLevel) => {
    const slug = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const prefix = lvl === 'main' ? 'cat_' : lvl === 'sub' ? 'sub_' : 'subsub_';
    return `${prefix}${slug || 'new'}`;
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && (!customId || customId.startsWith('cat_') || customId.startsWith('sub_') || customId.startsWith('subsub_'))) {
      setCustomId(generateCleanId(val, level));
    }
  };

  // Real Image Upload Handler with format and size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid image format. Supported formats: JPG, JPEG, PNG, and WebP.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image file size exceeds the 5MB limit. Please upload an optimized image.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImage(result);
        setDisplayMode('image');
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setUploadError('Failed to read and process the image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Helper for 2-letter initials
  const getCategoryInitial = (val: string) => {
    const clean = val.trim();
    if (!clean) return 'ZD';
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Category name is required.');
      return;
    }

    const finalId = customId.trim() || generateCleanId(trimmedName, level);

    if (level === 'sub' && !parentMainId) {
      setValidationError('Please select a parent Level 1 Main Category.');
      return;
    }

    if (level === 'subsub' && (!parentMainId || !parentSubId)) {
      setValidationError('Please select both a parent Main Category and parent Subcategory.');
      return;
    }

    let payload: any;
    let levelLabel = '';

    if (level === 'main') {
      levelLabel = 'Level 1: Main Category';
      payload = {
        id: finalId,
        name: trimmedName,
        slug: trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        iconName,
        image: image && image.trim() !== '' ? image.trim() : null,
        displayMode,
        backgroundColor,
        textColor,
        imageFit,
        imagePosition,
        order: Number(order) || 1,
        isActive,
        showOnHomepage,
        description: description.trim() || `${trimmedName} collection`,
      };
    } else if (level === 'sub') {
      levelLabel = 'Level 2: Subcategory';
      payload = {
        id: finalId,
        mainCategoryId: parentMainId,
        name: trimmedName,
        image: image || PRESET_IMAGES[0].url,
        order: Number(order) || 1,
        isActive,
      };
    } else {
      levelLabel = 'Level 3: Sub-Subcategory';
      payload = {
        id: finalId,
        mainCategoryId: parentMainId,
        subCategoryId: parentSubId,
        name: trimmedName,
        image: image || PRESET_IMAGES[0].url,
        order: Number(order) || 1,
        isActive,
      };
    }

    saveCategory(level, payload);

    if (onSaveSuccess) {
      onSaveSuccess(trimmedName, levelLabel);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl border border-[#E6EAF0] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6EAF0] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-teal-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#08A9A2] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#192E4D]">
                {isEdit ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="text-[11px] text-[#697586]">
                Configure circular display settings, real image uploads, and hierarchy placement.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* LEVEL SELECTOR TABS (disabled when editing an existing category) */}
          <div>
            <label className="font-extrabold text-[#192E4D] block mb-1.5 uppercase text-[10px] tracking-wider">
              Category Architecture Level
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F6F8FA] rounded-2xl border border-[#E6EAF0]">
              <button
                type="button"
                disabled={isEdit}
                onClick={() => {
                  setLevel('main');
                  if (!customId || customId.startsWith('sub_') || customId.startsWith('subsub_')) {
                    setCustomId(generateCleanId(name, 'main'));
                  }
                }}
                className={`py-2 px-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                  level === 'main'
                    ? 'bg-[#08A9A2] text-white shadow-xs'
                    : 'text-[#697586] hover:text-[#192E4D]'
                } ${isEdit ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                <div className="text-[11px]">Level 1</div>
                <div className="text-[10px] opacity-90 truncate">Main Category</div>
              </button>

              <button
                type="button"
                disabled={isEdit}
                onClick={() => {
                  setLevel('sub');
                  if (!customId || customId.startsWith('cat_') || customId.startsWith('subsub_')) {
                    setCustomId(generateCleanId(name, 'sub'));
                  }
                }}
                className={`py-2 px-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                  level === 'sub'
                    ? 'bg-[#FFB000] text-[#192E4D] shadow-xs'
                    : 'text-[#697586] hover:text-[#192E4D]'
                } ${isEdit ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                <div className="text-[11px]">Level 2</div>
                <div className="text-[10px] opacity-90 truncate">Subcategory</div>
              </button>

              <button
                type="button"
                disabled={isEdit}
                onClick={() => {
                  setLevel('subsub');
                  if (!customId || customId.startsWith('cat_') || customId.startsWith('sub_')) {
                    setCustomId(generateCleanId(name, 'subsub'));
                  }
                }}
                className={`py-2 px-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                  level === 'subsub'
                    ? 'bg-[#F20D58] text-white shadow-xs'
                    : 'text-[#697586] hover:text-[#192E4D]'
                } ${isEdit ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                <div className="text-[11px]">Level 3</div>
                <div className="text-[10px] opacity-90 truncate">Sub-Subcategory</div>
              </button>
            </div>
          </div>

          {/* HIERARCHY PARENT SELECTION */}
          {level !== 'main' && (
            <div className="p-3.5 rounded-2xl bg-[#F0F4F8] border border-[#E6EAF0] space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#192E4D]">
                <Sparkles className="w-3.5 h-3.5 text-[#08A9A2]" />
                <span>Parent Placement in Hierarchy</span>
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">
                  Parent Main Category (Level 1) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={parentMainId}
                  onChange={(e) => setParentMainId(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D5DCE5] rounded-xl bg-white text-xs font-bold text-[#192E4D] focus:outline-hidden focus:border-[#08A9A2]"
                >
                  {mainCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              {level === 'subsub' && (
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Parent Subcategory (Level 2) <span className="text-rose-500">*</span>
                  </label>
                  {availableSubCategories.length === 0 ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                      No subcategories exist for this Main Category yet. Please create a Level 2 Subcategory first.
                    </div>
                  ) : (
                    <select
                      value={parentSubId}
                      onChange={(e) => setParentSubId(e.target.value)}
                      className="w-full h-10 px-3 border border-[#D5DCE5] rounded-xl bg-white text-xs font-bold text-[#192E4D] focus:outline-hidden focus:border-[#08A9A2]"
                    >
                      {availableSubCategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#192E4D] block mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={
                  level === 'main'
                    ? 'e.g. Luxury Footwear'
                    : level === 'sub'
                    ? "e.g. Men's Footwear"
                    : 'e.g. Leather Oxford Shoes'
                }
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
                required
              />
            </div>

            <div>
              <label className="font-bold text-[#192E4D] block mb-1">
                Unique Slug / Identifier <span className="text-[10px] text-gray-400 font-normal">(Auto-generated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. cat_fashion"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                disabled={isEdit}
                className="w-full h-10 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-mono font-medium focus:outline-hidden focus:border-[#08A9A2] bg-[#FAFBFD]"
              />
            </div>
          </div>

          {/* FLIPKART-STYLE CIRCULAR HOMEPAGE SETTINGS (For Level 1 Main Categories) */}
          {level === 'main' && (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#08A9A2] text-white flex items-center justify-center font-bold text-xs">
                    ●
                  </div>
                  <h3 className="font-extrabold text-[#192E4D] text-xs">
                    Homepage Circular Category Presentation
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#08A9A2] uppercase tracking-wider bg-[#08A9A2]/10 px-2 py-0.5 rounded-full">
                  Flipkart Style
                </span>
              </div>

              {/* 3 DISPLAY MODES SELECTOR */}
              <div>
                <label className="font-bold text-[#192E4D] block mb-1.5">
                  Category Display Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisplayMode('image')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      displayMode === 'image'
                        ? 'border-[#08A9A2] bg-teal-50/50 shadow-xs ring-1 ring-[#08A9A2]'
                        : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#192E4D]">
                      <ImageIcon className="w-3.5 h-3.5 text-[#08A9A2]" />
                      <span>Mode A</span>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Image Circle</p>
                    <p className="text-[9px] text-[#94A3B8]">Photo in circle + name below</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisplayMode('text')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      displayMode === 'text'
                        ? 'border-[#08A9A2] bg-teal-50/50 shadow-xs ring-1 ring-[#08A9A2]'
                        : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#192E4D]">
                      <Type className="w-3.5 h-3.5 text-[#08A9A2]" />
                      <span>Mode B</span>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Text Circle</p>
                    <p className="text-[9px] text-[#94A3B8]">Category name inside circle</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisplayMode('initial')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      displayMode === 'initial'
                        ? 'border-[#08A9A2] bg-teal-50/50 shadow-xs ring-1 ring-[#08A9A2]'
                        : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#192E4D]">
                      <Sparkles className="w-3.5 h-3.5 text-[#08A9A2]" />
                      <span>Mode C</span>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Initial Circle</p>
                    <p className="text-[9px] text-[#94A3B8]">Initial inside + name below</p>
                  </button>
                </div>
              </div>

              {/* LIVE INTERACTIVE CIRCLE PREVIEW */}
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between gap-4">
                <div>
                  <span className="font-extrabold text-[#192E4D] block text-xs">Live Category Preview</span>
                  <span className="text-[10px] text-[#64748B]">
                    How this will appear in the customer circular carousel
                  </span>
                </div>

                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E6EAF0] shadow-sm flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: displayMode !== 'image' || !image ? backgroundColor : undefined,
                    }}
                  >
                    {displayMode === 'image' && image ? (
                      <img
                        src={image}
                        alt="Preview"
                        className={`w-full h-full ${
                          imageFit === 'contain' ? 'object-contain' : 'object-cover'
                        } ${
                          imagePosition === 'top'
                            ? 'object-top'
                            : imagePosition === 'bottom'
                            ? 'object-bottom'
                            : 'object-center'
                        }`}
                      />
                    ) : displayMode === 'text' ? (
                      <div
                        className="w-full h-full p-1.5 flex items-center justify-center text-center"
                        style={{ color: textColor }}
                      >
                        <span className="text-[10px] font-black leading-tight break-words line-clamp-3">
                          {name.trim() || 'Category'}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-black text-xl tracking-tighter"
                        style={{ color: textColor }}
                      >
                        {getCategoryInitial(name)}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[#192E4D] text-center mt-1.5 max-w-[76px] truncate">
                    {name.trim() || 'Category Name'}
                  </span>
                </div>
              </div>

              {/* COLORS CONFIGURATION (For Mode B & Mode C or Circle background) */}
              <div>
                <label className="font-bold text-[#192E4D] block mb-1.5">
                  Circle Color Palette (Background & Text)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSel = backgroundColor === preset.bg && textColor === preset.text;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setBackgroundColor(preset.bg);
                          setTextColor(preset.text);
                        }}
                        className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSel ? 'border-[#08A9A2] ring-2 ring-[#08A9A2]/30 shadow-xs' : 'border-[#E2E8F0]'
                        }`}
                        style={{ backgroundColor: preset.bg, color: preset.text }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: preset.text }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] block mb-1">
                      Custom Background Hex
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-300 p-0 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 h-8 px-2.5 border border-[#E2E8F0] rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] block mb-1">
                      Custom Text Hex
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-300 p-0 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 h-8 px-2.5 border border-[#E2E8F0] rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* IMAGE FIT & POSITIONING CONTROLS */}
              {displayMode === 'image' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] block mb-1">Image Fit</label>
                    <select
                      value={imageFit}
                      onChange={(e) => setImageFit(e.target.value as any)}
                      className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#192E4D] bg-white cursor-pointer"
                    >
                      <option value="cover">Cover (Fill Circle)</option>
                      <option value="contain">Contain (Fit inside Circle)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] block mb-1">Image Alignment</label>
                    <select
                      value={imagePosition}
                      onChange={(e) => setImagePosition(e.target.value as any)}
                      className="w-full h-8 px-2.5 border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#192E4D] bg-white cursor-pointer"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REAL CATEGORY IMAGE UPLOADER & MEDIA MANAGER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#192E4D]">Category Image & Media</label>
              <span className="text-[10px] text-[#08A9A2] font-bold">Real Upload • JPG, PNG, WebP (Max 5MB)</span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 bg-white shadow-2xs flex items-center justify-center shrink-0">
                  {image ? (
                    <img src={image} alt="Upload Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div>
                  <p className="font-bold text-xs text-[#192E4D]">
                    {image ? 'Image Attached' : 'No Image Uploaded'}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {image
                      ? 'Image is stored in database and active on storefront.'
                      : 'You can upload an image or select Text Circle mode.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-9 px-3.5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{image ? 'Replace Image' : 'Upload Image'}</span>
                </button>

                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setDisplayMode('text');
                    }}
                    className="h-9 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Remove image and switch to text circle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            {/* Manual URL Input Option */}
            <div className="pt-1">
              <input
                type="url"
                placeholder="Or paste an image URL (e.g. https://images.unsplash.com/...)"
                value={image || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setImage(val ? val : null);
                  if (val && displayMode !== 'image') setDisplayMode('image');
                }}
                className="w-full h-9 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#08A9A2]"
              />
            </div>

            {/* Curated preset photos shortcut */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {PRESET_IMAGES.map((preset) => {
                const isCurrent = image === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setImage(preset.url);
                      setDisplayMode('image');
                    }}
                    className={`h-7 px-2.5 rounded-lg text-[10px] font-bold shrink-0 border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#08A9A2] text-white border-[#08A9A2]'
                        : 'bg-white border-[#E6EAF0] text-[#697586] hover:bg-gray-50'
                    }`}
                  >
                    <img src={preset.url} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ICON PICKER (For Level 1 Main Categories) */}
          {level === 'main' && (
            <div>
              <label className="font-bold text-[#192E4D] block mb-1.5">
                Category Navigation Icon
              </label>
              <div className="grid grid-cols-6 gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-[#E6EAF0] rounded-xl bg-[#FAFBFD]">
                {PRESET_ICONS.map((ic) => {
                  const isSel = iconName.toLowerCase() === ic.toLowerCase();
                  return (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconName(ic)}
                      className={`h-8 rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#08A9A2] text-white border-[#08A9A2] shadow-xs'
                          : 'bg-white text-[#697586] border-[#E6EAF0] hover:border-[#08A9A2]'
                      }`}
                    >
                      <CategoryIcon iconName={ic} className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-bold truncate max-w-[50px]">{ic}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          {level === 'main' && (
            <div>
              <label className="font-bold text-[#192E4D] block mb-1">Category Description / Bio</label>
              <textarea
                rows={2}
                placeholder="Brief editorial summary shown on category headers and banners..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border border-[#E6EAF0] rounded-xl text-xs focus:outline-hidden focus:border-[#08A9A2]"
              />
            </div>
          )}

          {/* ORDER & HOMEPAGE VISIBILITY & STATUS CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="font-bold text-[#192E4D] block mb-1">Display Sort Order</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="w-full h-10 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
              />
            </div>

            {level === 'main' && (
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Show on Homepage</label>
                <button
                  type="button"
                  onClick={() => setShowOnHomepage(!showOnHomepage)}
                  className={`w-full h-10 px-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                    showOnHomepage
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-300 text-slate-500'
                  }`}
                >
                  <span className="font-bold text-xs">{showOnHomepage ? 'Visible on Home' : 'Hidden from Home'}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                      showOnHomepage ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </button>
              </div>
            )}

            <div>
              <label className="font-bold text-[#192E4D] block mb-1">Category Active Status</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full h-10 px-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                }`}
              >
                <span className="font-bold text-xs">{isActive ? 'Active Storefront' : 'Disabled / Draft'}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                    isActive ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#E6EAF0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-[#E6EAF0] text-[#697586] font-bold hover:bg-gray-50 active:scale-95 transition-all text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold shadow-sm active:scale-95 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
