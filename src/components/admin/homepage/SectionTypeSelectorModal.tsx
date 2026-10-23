import React, { useState, useMemo } from 'react';
import { HomepageSectionType } from '../../../types';
import { ALL_SECTION_TEMPLATES, SectionTypeMeta } from '../../../data/homepageSectionTemplates';
import {
  X,
  Search,
  Sliders,
  Image,
  Layout,
  Columns,
  Grid,
  Zap,
  Clock,
  Sparkles,
  Star,
  TrendingUp,
  Flame,
  PackagePlus,
  Heart,
  MoveHorizontal,
  LayoutGrid,
  Layers,
  Compass,
  FolderTree,
  Award,
  Video,
  Code,
  Plus,
} from 'lucide-react';

interface SectionTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: HomepageSectionType) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sliders: <Sliders className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  Layout: <Layout className="w-5 h-5" />,
  Columns: <Columns className="w-5 h-5" />,
  Grid: <Grid className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  PackagePlus: <PackagePlus className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  MoveHorizontal: <MoveHorizontal className="w-5 h-5" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  FolderTree: <FolderTree className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
};

export const SectionTypeSelectorModal: React.FC<SectionTypeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Banners & Media', 'Promotions & Deals', 'Product Showcases', 'Categories & Brands', 'Custom'];

  const filteredTemplates = useMemo(() => {
    return ALL_SECTION_TEMPLATES.filter((tpl) => {
      const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        tpl.title.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.category.toLowerCase().includes(query) ||
        tpl.type.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E6EAF0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#F0F4F8] flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#192E4D]">Add New Homepage Section</h2>
            <p className="text-xs text-[#697586]">
              Select from 21 professional section templates to customize your customer store experience.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="px-5 py-3 border-b border-[#F0F4F8] bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description or keyword (e.g. Flash, Carousel, Video, Slider)..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#192E4D] placeholder-slate-400 focus:bg-white focus:border-[#08A9A2] focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#192E4D] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Section Template Grid */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">No matching section templates found</p>
              <p className="text-xs text-slate-400">Try searching with a different keyword or reset filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#08A9A2]/10 text-[#08A9A2] font-bold text-xs hover:bg-[#08A9A2]/20"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.type}
                  onClick={() => onSelect(tpl.type)}
                  className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#08A9A2] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left space-y-3 relative overflow-hidden"
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#08A9A2]/5 via-transparent to-transparent pointer-events-none rounded-bl-full" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#192E4D] group-hover:bg-[#08A9A2] group-hover:text-white flex items-center justify-center transition-colors">
                        {ICON_MAP[tpl.iconName] || <Layout className="w-5 h-5" />}
                      </div>

                      {tpl.badge && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                          {tpl.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#08A9A2]">
                        {tpl.category}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-[#192E4D] group-hover:text-[#08A9A2] transition-colors">
                        {tpl.title}
                      </h3>
                      <p className="text-[11px] text-[#697586] mt-1 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">{tpl.type}</span>
                    <span className="text-xs font-bold text-[#08A9A2] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Add Section</span>
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#F0F4F8] bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredTemplates.length}</strong> of 21 supported section types
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
