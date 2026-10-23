import React, { useState, useEffect } from 'react';
import { HomepageSection, Product, MainCategory, HomepageSlide, HomepageImage, DealProductConfig } from '../../../types';
import { PRESET_MEDIA_LIBRARY } from '../../../data/homepageSectionTemplates';
import {
  X,
  Save,
  Trash2,
  Eye,
  Sliders,
  Image as ImageIcon,
  ShoppingBag,
  Zap,
  Clock,
  Plus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Video,
  Code,
  Tag,
} from 'lucide-react';

interface SectionConfigDrawerProps {
  isOpen: boolean;
  section: HomepageSection | null;
  allProducts: Product[];
  categories: MainCategory[];
  onClose: () => void;
  onSave: (updatedSection: HomepageSection) => Promise<any> | void;
  onDelete?: (sectionId: string) => void;
  onPreview?: (section: HomepageSection) => void;
}

export const SectionConfigDrawer: React.FC<SectionConfigDrawerProps> = ({
  isOpen,
  section,
  allProducts,
  categories,
  onClose,
  onSave,
  onDelete,
  onPreview,
}) => {
  if (!isOpen || !section) return null;

  // Active editor tab: 'content' | 'media' | 'products' | 'deals'
  const isDealType = section.type === 'flash_sale' || section.type === 'limited_time_offers';
  const hasProducts =
    section.type.includes('product') ||
    section.type === 'best_sellers' ||
    section.type === 'trending' ||
    section.type === 'new_arrivals' ||
    section.type === 'featured_collections' ||
    section.type === 'for_you' ||
    section.type === 'custom_collection' ||
    isDealType;

  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'products' | 'deals'>(
    isDealType ? 'deals' : 'content'
  );

  // Form State
  const [formData, setFormData] = useState<HomepageSection>({ ...section });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Product search in product picker
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Sync state whenever section prop changes
  useEffect(() => {
    if (section) {
      setFormData({ ...section });
      setValidationError(null);
      setSaveSuccess(false);
      if (section.type === 'flash_sale') {
        setActiveTab('deals');
      }
    }
  }, [section]);

  // Handle Input Changes
  const updateField = <K extends keyof HomepageSection>(key: K, value: HomepageSection[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Duration Presets Helper for Flash Deals
  const applyDurationPreset = (minutes: number) => {
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setFormData((prev) => ({
      ...prev,
      durationMode: 'immediate',
      flashSaleStartTime: startTime,
      flashSaleEndTime: endTime,
      durationMinutes: minutes,
      isUnlimitedDuration: false,
      showCountdown: true,
      status: 'active',
    }));
  };

  const applyUnlimitedDuration = () => {
    setFormData((prev) => ({
      ...prev,
      durationMode: 'unlimited',
      isUnlimitedDuration: true,
      showCountdown: false,
      flashSaleEndTime: undefined,
      status: 'active',
    }));
  };

  // Validate and Save
  const handleSaveSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    // Validation Rules
    if (!formData.title.trim()) {
      setValidationError('Section title is required.');
      setActiveTab('content');
      return;
    }

    if (formData.type === 'flash_sale' && !formData.isUnlimitedDuration) {
      if (formData.flashSaleStartTime && formData.flashSaleEndTime) {
        if (new Date(formData.flashSaleEndTime) <= new Date(formData.flashSaleStartTime)) {
          setValidationError('Flash Deal End Time must be later than the Start Time.');
          setActiveTab('deals');
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      setIsSaving(false);
      setValidationError('Failed to persist section to database. Please retry.');
    }
  };

  // Slides management for image_slider
  const handleAddSlide = () => {
    const newSlide: HomepageSlide = {
      id: `slide_${Date.now()}`,
      image: PRESET_MEDIA_LIBRARY[0].url,
      heading: 'New Collection Slide',
      subheading: 'Highlight season arrivals and runway drops',
      buttonText: 'Shop Now',
      buttonLink: 'tab:categories',
      badge: 'FEATURED',
    };
    const updatedSlides = [...(formData.slides || []), newSlide];
    updateField('slides', updatedSlides);
  };

  const handleUpdateSlide = (index: number, updated: Partial<HomepageSlide>) => {
    const current = [...(formData.slides || [])];
    if (current[index]) {
      current[index] = { ...current[index], ...updated };
      updateField('slides', current);
    }
  };

  const handleDeleteSlide = (index: number) => {
    const current = [...(formData.slides || [])];
    current.splice(index, 1);
    updateField('slides', current);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const current = [...(formData.slides || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    updateField('slides', current);
  };

  // Product Selection Handlers
  const handleToggleProduct = (productId: string) => {
    const current = formData.productIds || [];
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
    updateField('productIds', updated);

    // If deal, sync dealProducts list
    if (isDealType) {
      const prod = allProducts.find((p) => p.id === productId);
      const currentDeals = formData.dealProducts || [];
      if (exists) {
        updateField(
          'dealProducts',
          currentDeals.filter((d) => d.productId !== productId)
        );
      } else if (prod) {
        const discountPrice = Math.round(prod.price * 0.85); // 15% off by default
        updateField('dealProducts', [
          ...currentDeals,
          { productId, dealPrice: discountPrice, dealStock: 10, customerLimit: 2 },
        ]);
      }
    }
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const current = [...(formData.productIds || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    updateField('productIds', current);
  };

  // Filtered available products for picker
  const filteredAvailableProducts = allProducts.filter((p) => {
    const matchesCategory =
      productCategoryFilter === 'all' || p.mainCategoryId === productCategoryFilter;
    const q = productSearch.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-[#E6EAF0] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#F0F4F8] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-[#08A9A2]/10 text-[#08A9A2] text-[10px] font-mono font-bold uppercase">
              {formData.type}
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#192E4D] truncate max-w-[280px] sm:max-w-[340px]">
                {formData.title || 'Edit Section'}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">ID: {formData.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onPreview && (
              <button
                type="button"
                onClick={() => onPreview(formData)}
                className="h-8 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#192E4D] font-bold text-xs flex items-center gap-1 cursor-pointer"
                title="Preview this section"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveSubmit}
              disabled={isSaving}
              className={`h-8 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#08A9A2] hover:bg-[#079690] text-white active:scale-95'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Warning Notice */}
        {validationError && (
          <div className="px-5 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center px-5 border-b border-[#F0F4F8] bg-white gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'content'
                ? 'border-[#08A9A2] text-[#08A9A2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Content & Layout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'media'
                ? 'border-[#08A9A2] text-[#08A9A2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Images & Media</span>
          </button>

          {hasProducts && (
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'products'
                  ? 'border-[#08A9A2] text-[#08A9A2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Products ({formData.productIds?.length || 0})</span>
            </button>
          )}

          {isDealType && (
            <button
              type="button"
              onClick={() => setActiveTab('deals')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'deals'
                  ? 'border-[#F20D58] text-[#F20D58]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Flash Deals & Timer</span>
            </button>
          )}
        </div>

        {/* Tab Body (Scrollable Form Fields) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* ================= TAB 1: CONTENT & LAYOUT ================= */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#192E4D] mb-1">
                  Section Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Best Selling Icons"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-[#192E4D] focus:border-[#08A9A2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#192E4D] mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="e.g. Our community’s most-loved essentials"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#192E4D] focus:border-[#08A9A2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#192E4D] mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Optional explanatory copy or editorial text..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-[#192E4D] focus:border-[#08A9A2] focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">Badge / Tag Label</label>
                  <input
                    type="text"
                    value={formData.badge || ''}
                    onChange={(e) => updateField('badge', e.target.value)}
                    placeholder="e.g. EXCLUSIVE DROP"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#192E4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonLabel || ''}
                    onChange={(e) => updateField('buttonLabel', e.target.value)}
                    placeholder="e.g. Shop Now"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#192E4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#192E4D] mb-1">Button Link Destination</label>
                <input
                  type="text"
                  value={formData.buttonLink || ''}
                  onChange={(e) => updateField('buttonLink', e.target.value)}
                  placeholder="e.g. prod_jacket_01, tab:categories, coupon:FLAT100"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono text-[#192E4D]"
                />
              </div>

              {/* Styling: Background color presets */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-[#192E4D] mb-1.5">
                  Section Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.bgColor || '#FFFFFF'}
                    onChange={(e) => updateField('bgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={formData.bgColor || '#FFFFFF'}
                    onChange={(e) => updateField('bgColor', e.target.value)}
                    className="w-28 h-8 px-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                  <div className="flex items-center gap-1">
                    {['#FFFFFF', '#192E4D', '#08A9A2', '#F6F8FA', '#F20D58', '#FFB000'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => updateField('bgColor', hex)}
                        className="w-6 h-6 rounded-md border border-black/10 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Visibility and Status */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-[#192E4D]">Active on Homepage</p>
                    <p className="text-[10px] text-slate-500">Show to customers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                    className="w-4 h-4 accent-[#08A9A2] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">Lifecycle Status</label>
                  <select
                    value={formData.status || (formData.isActive ? 'active' : 'paused')}
                    onChange={(e) => updateField('status', e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#192E4D]"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="scheduled">Scheduled (Future)</option>
                    <option value="paused">Paused (Hidden)</option>
                    <option value="expired">Expired</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: IMAGES & MEDIA ================= */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* If Slider, Slides Manager */}
              {formData.type === 'image_slider' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#192E4D]">Hero Slides List</h3>
                      <p className="text-[10px] text-slate-500">Manage order, headings, and images</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="px-2.5 py-1 rounded-lg bg-[#08A9A2] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#079690] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slide</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(formData.slides || []).map((slide, idx) => (
                      <div
                        key={slide.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#192E4D]">Slide #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSlide(idx, 'up')}
                              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === (formData.slides?.length || 0) - 1}
                              onClick={() => handleMoveSlide(idx, 'down')}
                              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(idx)}
                              className="p-1 rounded bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <img
                            src={slide.image}
                            alt={slide.heading}
                            className="w-16 h-12 object-cover rounded-lg shrink-0 border"
                          />
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={slide.heading}
                              onChange={(e) => handleUpdateSlide(idx, { heading: e.target.value })}
                              placeholder="Slide Heading"
                              className="w-full h-7 px-2 rounded border border-slate-200 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={slide.subheading}
                              onChange={(e) => handleUpdateSlide(idx, { subheading: e.target.value })}
                              placeholder="Slide Subheading"
                              className="w-full h-7 px-2 rounded border border-slate-200 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={slide.image}
                            onChange={(e) => handleUpdateSlide(idx, { image: e.target.value })}
                            placeholder="Image URL"
                            className="h-7 px-2 rounded border border-slate-200 text-[11px] font-mono"
                          />
                          <input
                            type="text"
                            value={slide.buttonText || ''}
                            onChange={(e) => handleUpdateSlide(idx, { buttonText: e.target.value })}
                            placeholder="Button Label"
                            className="h-7 px-2 rounded border border-slate-200 text-[11px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standalone Banner Image Field */}
              {formData.type !== 'image_slider' && formData.type !== 'custom_html' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#192E4D] mb-1">
                      Banner / Feature Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.bannerImage || ''}
                      onChange={(e) => updateField('bannerImage', e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono text-[#192E4D]"
                    />
                  </div>

                  {formData.bannerImage && (
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={formData.bannerImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Preset Library Quick Picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                      Or Select from ZOODI Preset Media Library:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PRESET_MEDIA_LIBRARY.map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => updateField('bannerImage', med.url)}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-[#08A9A2] transition-all cursor-pointer"
                        >
                          <img
                            src={med.url}
                            alt={med.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-bold truncate p-0.5 text-center">
                            {med.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position for single_image_text */}
                  {formData.type === 'single_image_text' && (
                    <div>
                      <label className="block text-xs font-bold text-[#192E4D] mb-1">
                        Image Alignment
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateField('imagePosition', 'left')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            formData.imagePosition === 'left' || !formData.imagePosition
                              ? 'bg-[#192E4D] text-white border-[#192E4D]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          Image on Left
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('imagePosition', 'right')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            formData.imagePosition === 'right'
                              ? 'bg-[#192E4D] text-white border-[#192E4D]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          Image on Right
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video Section */}
              {formData.type === 'promotional_video' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#192E4D]">
                    <Video className="w-4 h-4 text-[#08A9A2]" />
                    <span>Promotional Video Settings</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#192E4D] mb-1">Video Stream URL</label>
                    <input
                      type="text"
                      value={formData.videoUrl || ''}
                      onChange={(e) => updateField('videoUrl', e.target.value)}
                      placeholder="https://...mp4"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Custom HTML Code Editor */}
              {formData.type === 'custom_html' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#192E4D]">
                    <Code className="w-4 h-4 text-[#08A9A2]" />
                    <span>Safe HTML / Rich Text Editor</span>
                  </div>
                  <textarea
                    rows={8}
                    value={formData.htmlContent || ''}
                    onChange={(e) => updateField('htmlContent', e.target.value)}
                    className="w-full p-3 font-mono text-xs text-[#192E4D] bg-slate-900 text-emerald-400 rounded-xl border border-slate-300 focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: PRODUCTS & CATALOG ================= */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Product Selection Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">Selection Mode</label>
                  <select
                    value={formData.productSelectionMode || 'manual'}
                    onChange={(e) => updateField('productSelectionMode', e.target.value as any)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#192E4D]"
                  >
                    <option value="manual">Manual Product Selection</option>
                    <option value="best_sellers">Auto: Best Sellers</option>
                    <option value="trending">Auto: Trending</option>
                    <option value="new_arrivals">Auto: New Arrivals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">Display Mode</label>
                  <select
                    value={formData.displayMode || 'alternating'}
                    onChange={(e) => updateField('displayMode', e.target.value as any)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#192E4D]"
                  >
                    <option value="alternating">Spotlight + Horizontal Carousel</option>
                    <option value="carousel">Horizontal Product Carousel</option>
                    <option value="grid">Responsive Grid</option>
                  </select>
                </div>
              </div>

              {/* Selected Products Strip with Reorder Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#192E4D]">
                    Selected Products ({formData.productIds?.length || 0})
                  </h4>
                  <span className="text-[10px] text-slate-400">Reorder with Up / Down arrows</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {(!formData.productIds || formData.productIds.length === 0) && (
                    <p className="text-center py-4 text-xs text-slate-400">
                      No products selected yet. Select products from the catalogue below.
                    </p>
                  )}

                  {formData.productIds?.map((prodId, idx) => {
                    const prod = allProducts.find((p) => p.id === prodId);
                    if (!prod) return null;
                    return (
                      <div
                        key={prodId}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold w-4">
                            #{idx + 1}
                          </span>
                          <img
                            src={prod.variants[0]?.images[0]}
                            alt={prod.name}
                            className="w-8 h-8 rounded-md object-cover bg-slate-100"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#192E4D] truncate max-w-[200px]">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-slate-500">₹{prod.price}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveProduct(idx, 'up')}
                            className="p-1 rounded bg-slate-100 disabled:opacity-30 hover:bg-slate-200"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (formData.productIds?.length || 0) - 1}
                            onClick={() => handleMoveProduct(idx, 'down')}
                            className="p-1 rounded bg-slate-100 disabled:opacity-30 hover:bg-slate-200"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleProduct(prodId)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Catalog Picker */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#192E4D]">Add from Catalog</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search catalogue..."
                      className="h-7 px-2 rounded-lg border border-slate-200 text-xs"
                    />
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="h-7 px-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2">
                  {filteredAvailableProducts.map((prod) => {
                    const isSelected = formData.productIds?.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#08A9A2]/10 border-[#08A9A2]'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={prod.variants[0]?.images[0]}
                            alt={prod.name}
                            className="w-7 h-7 rounded object-cover"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#192E4D] truncate">{prod.name}</p>
                            <p className="text-[10px] text-slate-500">₹{prod.price}</p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-[#08A9A2] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSelected ? '✓ Added' : '+ Add'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: FLASH DEALS & TIMER ================= */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-[#F20D58] text-white">
                      <Zap className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#192E4D]">Flash Deals Engine</h4>
                      <p className="text-[10px] text-slate-500">Precision scheduling & deal pricing</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-700">
                    Store Timezone: IST (UTC+5:30)
                  </span>
                </div>

                {/* Duration Presets Bar */}
                <div>
                  <label className="block text-[11px] font-bold text-[#192E4D] mb-1.5">
                    Quick Duration Presets:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '15 Mins', min: 15 },
                      { label: '1 Hour', min: 60 },
                      { label: '3 Hours', min: 180 },
                      { label: '6 Hours', min: 360 },
                      { label: '12 Hours', min: 720 },
                      { label: '24 Hours', min: 1440 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyDurationPreset(preset.min)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-rose-100 text-slate-700 border border-rose-200 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={applyUnlimitedDuration}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        formData.isUnlimitedDuration
                          ? 'bg-[#192E4D] text-white border-[#192E4D]'
                          : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      ♾️ Unlimited Duration
                    </button>
                  </div>
                </div>

                {/* Exact Date & Time Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-rose-200/60">
                  <div>
                    <label className="block text-xs font-bold text-[#192E4D] mb-1">
                      Start Date & Time (IST)
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        formData.flashSaleStartTime
                          ? formData.flashSaleStartTime.slice(0, 16)
                          : new Date().toISOString().slice(0, 16)
                      }
                      onChange={(e) => updateField('flashSaleStartTime', new Date(e.target.value).toISOString())}
                      className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#192E4D] mb-1">
                      End Date & Time (IST)
                    </label>
                    <input
                      type="datetime-local"
                      disabled={formData.isUnlimitedDuration}
                      value={
                        formData.flashSaleEndTime
                          ? formData.flashSaleEndTime.slice(0, 16)
                          : ''
                      }
                      onChange={(e) => updateField('flashSaleEndTime', new Date(e.target.value).toISOString())}
                      className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Countdown display toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Show Countdown Clock on Homepage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.showCountdown && !formData.isUnlimitedDuration)}
                    disabled={formData.isUnlimitedDuration}
                    onChange={(e) => updateField('showCountdown', e.target.checked)}
                    className="w-4 h-4 accent-[#F20D58] cursor-pointer"
                  />
                </div>
              </div>

              {/* Deal Pricing & Stock Safety Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#192E4D]">
                    Deal Pricing & Inventory Safety
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Promotional prices validated against original cost
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-2.5">Product</th>
                        <th className="p-2.5">Original</th>
                        <th className="p-2.5">Deal Price (₹)</th>
                        <th className="p-2.5">Discount</th>
                        <th className="p-2.5">Deal Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.productIds?.map((prodId) => {
                        const prod = allProducts.find((p) => p.id === prodId);
                        if (!prod) return null;
                        const deal = formData.dealProducts?.find((d) => d.productId === prodId);
                        const currentDealPrice = deal?.dealPrice || Math.round(prod.price * 0.85);
                        const discount = Math.round(((prod.price - currentDealPrice) / prod.price) * 100);

                        return (
                          <tr key={prodId} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-[#192E4D] truncate max-w-[140px]">
                              {prod.name}
                            </td>
                            <td className="p-2.5 text-slate-500 line-through">₹{prod.price}</td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min={1}
                                max={prod.price}
                                value={currentDealPrice}
                                onChange={(e) => {
                                  const val = Math.max(1, Math.min(prod.price, Number(e.target.value)));
                                  const updated = (formData.dealProducts || []).map((d) =>
                                    d.productId === prodId ? { ...d, dealPrice: val } : d
                                  );
                                  if (!updated.some((d) => d.productId === prodId)) {
                                    updated.push({ productId: prodId, dealPrice: val, dealStock: 10 });
                                  }
                                  updateField('dealProducts', updated);
                                }}
                                className="w-20 h-7 px-2 rounded border border-slate-200 font-bold text-xs"
                              />
                            </td>
                            <td className="p-2.5 font-bold text-emerald-600">
                              {discount > 0 ? `${discount}% OFF` : '0%'}
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min={1}
                                value={deal?.dealStock || 10}
                                onChange={(e) => {
                                  const val = Math.max(1, Number(e.target.value));
                                  const updated = (formData.dealProducts || []).map((d) =>
                                    d.productId === prodId ? { ...d, dealStock: val } : d
                                  );
                                  updateField('dealProducts', updated);
                                }}
                                className="w-16 h-7 px-2 rounded border border-slate-200 text-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-5 py-3 border-t border-[#F0F4F8] bg-slate-50/80 flex items-center justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete section "${formData.title}"?`)) {
                    onDelete(formData.id);
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Section</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveSubmit}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving to DB...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
