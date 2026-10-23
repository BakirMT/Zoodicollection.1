import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MainCategory, SubCategory, SubSubCategory } from '../../types';
import { CategoryIcon } from '../../components/CategoryIcon';
import { CategoryModal, CategoryLevel } from '../../components/admin/CategoryModal';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Boxes,
  Eye,
  EyeOff,
  GitFork,
  LayoutGrid,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Type,
  Image as ImageIcon,
} from 'lucide-react';

interface CategoryManagementViewProps {
  showNotice: (message?: string, type?: 'success' | 'error') => void;
  onRequestAddForProduct?: (level: CategoryLevel, mainId?: string, subId?: string) => void;
}

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({ showNotice }) => {
  const {
    mainCategories,
    subCategories,
    subSubCategories,
    deleteCategory,
    reorderMainCategories,
    toggleCategoryHomepageVisibility,
    toggleCategoryActiveStatus,
    products,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainFilter, setSelectedMainFilter] = useState<string>('all');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'columns' | 'tree'>('columns');

  // Expanded nodes for Tree view (set of IDs)
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    // Default all main categories to expanded
    const initial: Record<string, boolean> = {};
    mainCategories.forEach((c) => {
      initial[c.id] = true;
    });
    return initial;
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLevel, setModalLevel] = useState<CategoryLevel>('main');
  const [modalParentMainId, setModalParentMainId] = useState<string | undefined>(undefined);
  const [modalParentSubId, setModalParentSubId] = useState<string | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<{
    type: CategoryLevel;
    item: MainCategory | SubCategory | SubSubCategory;
  } | null>(null);

  // Quick Open Modal Helpers
  const handleOpenAddCategory = (level: CategoryLevel, parentMainId?: string, parentSubId?: string) => {
    setEditingCategory(null);
    setModalLevel(level);
    setModalParentMainId(parentMainId || (mainCategories[0]?.id ?? ''));
    setModalParentSubId(parentSubId || '');
    setIsModalOpen(true);
  };

  const handleOpenEditCategory = (type: CategoryLevel, item: MainCategory | SubCategory | SubSubCategory) => {
    setEditingCategory({ type, item });
    setModalLevel(type);
    setIsModalOpen(true);
  };

  const handleDelete = (type: CategoryLevel, id: string, name: string) => {
    const res = deleteCategory(type, id);
    if (res.success) {
      showNotice(`Deleted ${name} (${id}) successfully.`, 'success');
    } else {
      showNotice(res.message || `Cannot delete category: child items or products are bound.`, 'error');
    }
  };

  // Helper: Count products per category
  const getMainProductsCount = (mainId: string) => {
    return products.filter((p) => p.mainCategoryId === mainId).length;
  };

  const getSubProductsCount = (subId: string) => {
    return products.filter((p) => p.subCategoryId === subId).length;
  };

  const getSubSubProductsCount = (subsubId: string) => {
    return products.filter((p) => p.subSubCategoryId === subsubId).length;
  };

  // Move up/down order of main categories
  const handleMoveMain = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mainCategories.length) return;
    const next = [...mainCategories];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    reorderMainCategories(next);
    showNotice(`Moved "${temp.name}" ${direction}`, 'success');
  };

  const getCategoryInitial = (nameVal: string) => {
    const clean = (nameVal || '').trim();
    if (!clean) return 'ZD';
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  };

  // Filtered categories
  const q = searchQuery.trim().toLowerCase();

  const filteredMainCategories = mainCategories.filter((c) => {
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  const filteredSubCategories = subCategories.filter((s) => {
    const matchesParent = selectedMainFilter === 'all' || s.mainCategoryId === selectedMainFilter;
    if (!matchesParent) return false;
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
  });

  const filteredSubSubCategories = subSubCategories.filter((ss) => {
    const matchesMain = selectedMainFilter === 'all' || ss.mainCategoryId === selectedMainFilter;
    const matchesSub = selectedSubFilter === 'all' || ss.subCategoryId === selectedSubFilter;
    if (!matchesMain || !matchesSub) return false;
    if (!q) return true;
    return ss.name.toLowerCase().includes(q) || ss.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* EXECUTIVE HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6EAF0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#08A9A2]/10 text-[#08A9A2]">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-[#192E4D]">3-Level Category Architecture</h1>
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Hierarchy: <strong className="text-[#08A9A2]">Level 1: Main Category</strong> →{' '}
            <strong className="text-[#FFB000]">Level 2: Subcategory</strong> →{' '}
            <strong className="text-[#F20D58]">Level 3: Sub-Subcategory</strong> with live product binding and safeguards.
          </p>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAddCategory('main')}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#08A9A2] to-[#079690] hover:from-[#079690] hover:to-[#067f7a] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Level 1 Main */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Level 1: Main
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#08A9A2]/10 text-[#08A9A2] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {mainCategories.length}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Main Categories
            </div>
          </div>
        </div>

        {/* Card 2: Level 2 Sub */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Level 2: Sub
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFB000]/10 text-[#FFB000] flex items-center justify-center shrink-0">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {subCategories.length}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Subcategories
            </div>
          </div>
        </div>

        {/* Card 3: Level 3 Sub-Sub */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Level 3: Deep
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F20D58]/10 text-[#F20D58] flex items-center justify-center shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {subSubCategories.length}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Sub-Subcategories
            </div>
          </div>
        </div>

        {/* Card 4: Assigned Products */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Catalog Items
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {products.length}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Assigned Products
            </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS: SEARCH, PARENT FILTER, VIEW TOGGLE */}
      <div className="p-3 bg-white rounded-2xl border border-[#E6EAF0] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories across all 3 levels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 bg-[#F6F8FA] border border-[#E6EAF0] rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#08A9A2]"
          />
        </div>

        {/* View Switcher: Columns vs Interactive Tree */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#F6F8FA] border border-[#E6EAF0] rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('columns')}
              className={`h-7 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'columns'
                  ? 'bg-white text-[#192E4D] shadow-xs'
                  : 'text-[#697586] hover:text-[#192E4D]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Columns Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`h-7 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'tree'
                  ? 'bg-white text-[#192E4D] shadow-xs'
                  : 'text-[#697586] hover:text-[#192E4D]'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Architecture Tree</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: COLUMNS BOARD */}
      {viewMode === 'columns' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* COLUMN 1: LEVEL 1 MAIN CATEGORIES */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#08A9A2]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#08A9A2]">
                  Level 1: Main ({filteredMainCategories.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddCategory('main')}
                className="h-7 px-2.5 rounded-lg bg-[#08A9A2]/10 hover:bg-[#08A9A2]/20 text-[#08A9A2] font-bold text-xs flex items-center gap-1 transition-colors active:scale-95"
                title="Add Level 1 Main Category"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Main</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[72vh] overflow-y-auto pr-1">
              {filteredMainCategories.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">No main categories found.</div>
              ) : (
                filteredMainCategories.map((c, idx) => {
                  const subsCount = subCategories.filter((s) => s.mainCategoryId === c.id).length;
                  const prodsCount = getMainProductsCount(c.id);
                  const mode = c.displayMode || (c.image ? 'image' : 'text');
                  const isVisibleOnHome = c.showOnHomepage !== false;

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl border border-[#E6EAF0] hover:border-[#08A9A2]/60 hover:shadow-xs transition-all bg-white group space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Flipkart-inspired Circular Thumbnail */}
                          <div
                            className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-[#E6EAF0] shadow-2xs flex items-center justify-center transition-transform group-hover:scale-105"
                            style={{
                              backgroundColor: mode !== 'image' || !c.image ? (c.backgroundColor || '#F0FDF4') : undefined,
                            }}
                          >
                            {mode === 'image' && c.image ? (
                              <img
                                src={c.image}
                                alt={c.name}
                                className={`w-full h-full ${
                                  c.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                                } ${
                                  c.imagePosition === 'top'
                                    ? 'object-top'
                                    : c.imagePosition === 'bottom'
                                    ? 'object-bottom'
                                    : 'object-center'
                                }`}
                              />
                            ) : mode === 'text' ? (
                              <div
                                className="w-full h-full p-1 flex items-center justify-center text-[7px] font-black text-center break-words line-clamp-2"
                                style={{ color: c.textColor || '#0F766E' }}
                              >
                                {c.name}
                              </div>
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center font-black text-xs"
                                style={{ color: c.textColor || '#0F766E' }}
                              >
                                {getCategoryInitial(c.name)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-[#192E4D] text-xs truncate">{c.name}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  mode === 'image'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : mode === 'text'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {mode === 'image' ? 'Image Circle' : mode === 'text' ? 'Text Circle' : 'Initial Circle'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-[#697586] font-mono block truncate">{c.id}</span>
                              <span className="text-[9px] text-slate-400 font-bold">#{c.order || idx + 1}</span>
                            </div>
                          </div>
                        </div>

                        {/* Top action buttons: Reorder, Edit, Delete */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveMain(idx, 'up')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Move Category Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={idx === filteredMainCategories.length - 1}
                            onClick={() => handleMoveMain(idx, 'down')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Move Category Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory('main', c)}
                            className="p-1.5 rounded-lg text-[#697586] hover:text-[#192E4D] hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                            title="Edit Category Settings"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('main', c.id, c.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {c.description && (
                        <p className="text-[11px] text-[#697586] line-clamp-1 italic">{c.description}</p>
                      )}

                      {/* Homepage Visibility and Active State Toggles */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            toggleCategoryHomepageVisibility(c.id);
                            showNotice(
                              `${c.name} is now ${isVisibleOnHome ? 'hidden from' : 'shown on'} homepage circular carousel.`,
                              'success'
                            );
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                            isVisibleOnHome
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Toggle display in circular homepage carousel"
                        >
                          {isVisibleOnHome ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                          <span>{isVisibleOnHome ? 'On Homepage' : 'Hidden from Home'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            toggleCategoryActiveStatus('main', c.id);
                            showNotice(`${c.name} active status toggled.`, 'success');
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                            c.isActive
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Toggle category active status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-teal-500' : 'bg-rose-500'}`} />
                          <span>{c.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </div>

                      {/* Footer Info & Quick Add Child */}
                      <div className="pt-2 border-t border-[#F0F4F8] flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 text-[#697586]">
                          <span className="font-bold text-[#08A9A2]">{subsCount} Subs</span>
                          <span>•</span>
                          <span>{prodsCount} Prods</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenAddCategory('sub', c.id)}
                          className="text-[11px] font-bold text-[#FFB000] hover:text-amber-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Sub</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: LEVEL 2 SUBCATEGORIES */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB000]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#FFB000]">
                  Level 2: Subcategories ({filteredSubCategories.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddCategory('sub', selectedMainFilter !== 'all' ? selectedMainFilter : undefined)}
                className="h-7 px-2.5 rounded-lg bg-[#FFB000]/10 hover:bg-[#FFB000]/20 text-[#192E4D] font-bold text-xs flex items-center gap-1 transition-colors active:scale-95"
                title="Add Level 2 Subcategory"
              >
                <Plus className="w-3.5 h-3.5 text-[#FFB000]" />
                <span>Add Sub</span>
              </button>
            </div>

            {/* Parent Main Filter Selector */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedMainFilter}
                onChange={(e) => setSelectedMainFilter(e.target.value)}
                className="flex-1 h-8 px-2.5 rounded-lg border border-[#E6EAF0] text-xs font-bold text-[#192E4D] bg-[#FAFBFD] focus:outline-hidden"
              >
                <option value="all">All Main Categories ({mainCategories.length})</option>
                {mainCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5 max-h-[72vh] overflow-y-auto pr-1">
              {filteredSubCategories.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">No subcategories found.</div>
              ) : (
                filteredSubCategories.map((s) => {
                  const parentMain = mainCategories.find((c) => c.id === s.mainCategoryId);
                  const subsubsCount = subSubCategories.filter((ss) => ss.subCategoryId === s.id).length;
                  const prodsCount = getSubProductsCount(s.id);

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-[#E6EAF0] hover:border-[#FFB000]/50 hover:shadow-xs transition-all bg-white group space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E6EAF0]"
                          />
                          <div className="min-w-0">
                            <span className="font-extrabold text-[#192E4D] text-xs truncate block">{s.name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded-md bg-[#08A9A2]/10 text-[#08A9A2] text-[9px] font-bold truncate">
                                {parentMain?.name || s.mainCategoryId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Top action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory('sub', s)}
                            className="p-1.5 rounded-lg text-[#697586] hover:text-[#192E4D] hover:bg-gray-100 active:scale-95 transition-all"
                            title="Edit Subcategory"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('sub', s.id, s.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:scale-95 transition-all"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Footer Info & Quick Add Child */}
                      <div className="pt-2 border-t border-[#F0F4F8] flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 text-[#697586]">
                          <span className="font-bold text-[#F20D58]">{subsubsCount} Sub-Subs</span>
                          <span>•</span>
                          <span>{prodsCount} Prods</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenAddCategory('subsub', s.mainCategoryId, s.id)}
                          className="text-[11px] font-bold text-[#F20D58] hover:text-rose-700 hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Sub-Sub</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 3: LEVEL 3 SUB-SUBCATEGORIES */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F20D58]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#F20D58]">
                  Level 3: Sub-Subcategories ({filteredSubSubCategories.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleOpenAddCategory(
                    'subsub',
                    selectedMainFilter !== 'all' ? selectedMainFilter : undefined,
                    selectedSubFilter !== 'all' ? selectedSubFilter : undefined
                  )
                }
                className="h-7 px-2.5 rounded-lg bg-[#F20D58]/10 hover:bg-[#F20D58]/20 text-[#F20D58] font-bold text-xs flex items-center gap-1 transition-colors active:scale-95"
                title="Add Level 3 Sub-Subcategory"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sub-Sub</span>
              </button>
            </div>

            {/* Parent Sub Filter Selector */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedSubFilter}
                onChange={(e) => setSelectedSubFilter(e.target.value)}
                className="flex-1 h-8 px-2.5 rounded-lg border border-[#E6EAF0] text-xs font-bold text-[#192E4D] bg-[#FAFBFD] focus:outline-hidden"
              >
                <option value="all">All Subcategories ({subCategories.length})</option>
                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5 max-h-[72vh] overflow-y-auto pr-1">
              {filteredSubSubCategories.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">No sub-subcategories found.</div>
              ) : (
                filteredSubSubCategories.map((ss) => {
                  const parentMain = mainCategories.find((c) => c.id === ss.mainCategoryId);
                  const parentSub = subCategories.find((s) => s.id === ss.subCategoryId);
                  const prodsCount = getSubSubProductsCount(ss.id);

                  return (
                    <div
                      key={ss.id}
                      className="p-3 rounded-xl border border-[#E6EAF0] hover:border-[#F20D58]/50 hover:shadow-xs transition-all bg-white group space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={ss.image}
                            alt={ss.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E6EAF0]"
                          />
                          <div className="min-w-0">
                            <span className="font-extrabold text-[#192E4D] text-xs truncate block">{ss.name}</span>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              <span className="px-1.5 py-0.2 rounded-md bg-gray-100 text-[#192E4D] text-[9px] font-bold truncate">
                                {parentMain?.name || ss.mainCategoryId}
                              </span>
                              <ChevronRight className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                              <span className="px-1.5 py-0.2 rounded-md bg-[#FFB000]/10 text-[#FFB000] text-[9px] font-bold truncate">
                                {parentSub?.name || ss.subCategoryId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Top action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory('subsub', ss)}
                            className="p-1.5 rounded-lg text-[#697586] hover:text-[#192E4D] hover:bg-gray-100 active:scale-95 transition-all"
                            title="Edit Sub-Subcategory"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('subsub', ss.id, ss.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:scale-95 transition-all"
                            title="Delete Sub-Subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-[#F0F4F8] flex items-center justify-between text-[11px] text-[#697586]">
                        <span className="font-mono text-[10px] truncate">{ss.id}</span>
                        <span className="font-bold text-[#192E4D]">{prodsCount} Products Assigned</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE HIERARCHY TREE */}
      {viewMode === 'tree' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF0]">
            <div>
              <h2 className="text-sm font-extrabold text-[#192E4D]">Interactive Hierarchy Architecture Tree</h2>
              <p className="text-xs text-[#697586]">
                Expand nodes to view relationships, linked products, and insert child categories anywhere.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const allExpanded: Record<string, boolean> = {};
                  mainCategories.forEach((c) => (allExpanded[c.id] = true));
                  subCategories.forEach((s) => (allExpanded[s.id] = true));
                  setExpandedNodes(allExpanded);
                }}
                className="text-xs font-bold text-[#08A9A2] hover:underline"
              >
                Expand All
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => setExpandedNodes({})}
                className="text-xs font-bold text-[#697586] hover:underline"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMainCategories.map((c) => {
              const isExpanded = expandedNodes[c.id] ?? false;
              const subs = subCategories.filter((s) => s.mainCategoryId === c.id);
              const prodsCount = getMainProductsCount(c.id);

              return (
                <div key={c.id} className="border border-[#E6EAF0] rounded-2xl overflow-hidden bg-white">
                  {/* Main Category Node Row */}
                  <div className="p-3.5 bg-gradient-to-r from-teal-50/40 via-white to-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleNode(c.id)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#E6EAF0] hover:bg-gray-50 flex items-center justify-center text-[#192E4D] transition-transform"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#08A9A2]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {/* Circular Thumbnail */}
                      <div
                        className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#E6EAF0] shadow-2xs flex items-center justify-center"
                        style={{
                          backgroundColor: c.displayMode !== 'image' || !c.image ? (c.backgroundColor || '#F0FDF4') : undefined,
                        }}
                      >
                        {c.displayMode === 'image' && c.image ? (
                          <img src={c.image} alt="" className="w-full h-full object-cover" />
                        ) : c.displayMode === 'text' ? (
                          <span
                            className="text-[7px] font-black text-center p-0.5 line-clamp-2"
                            style={{ color: c.textColor || '#0F766E' }}
                          >
                            {c.name}
                          </span>
                        ) : (
                          <span
                            className="text-[11px] font-black"
                            style={{ color: c.textColor || '#0F766E' }}
                          >
                            {getCategoryInitial(c.name)}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#192E4D] text-sm">{c.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#08A9A2] text-white text-[10px] font-bold">
                            Level 1: Main
                          </span>
                          <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                            {c.displayMode === 'text' ? 'Text' : c.displayMode === 'initial' ? 'Initial' : 'Image'}
                          </span>
                          {c.showOnHomepage === false && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[9px] font-bold">
                              Hidden from Home
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#697586] mt-0.5">
                          <span className="font-mono text-[10px]">{c.id}</span>
                          <span>•</span>
                          <span className="font-bold text-[#08A9A2]">{subs.length} Subcategories</span>
                          <span>•</span>
                          <span>{prodsCount} Products</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAddCategory('sub', c.id)}
                        className="h-8 px-3 rounded-lg bg-[#FFB000]/15 hover:bg-[#FFB000]/25 text-[#192E4D] font-extrabold text-xs flex items-center gap-1 transition-colors active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FFB000]" />
                        <span>Add Sub</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory('main', c)}
                        className="p-2 rounded-lg text-[#697586] hover:text-[#192E4D] hover:bg-gray-100 transition-colors"
                        title="Edit Main Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete('main', c.id, c.name)}
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete Main Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Level 2 Subcategories Branch */}
                  {isExpanded && (
                    <div className="p-3 pl-8 sm:pl-12 bg-[#FAFBFD] border-t border-[#E6EAF0] space-y-2.5">
                      {subs.length === 0 ? (
                        <div className="p-3 text-xs text-gray-400 italic">
                          No subcategories assigned. Click "Add Sub" above to create one.
                        </div>
                      ) : (
                        subs.map((sub) => {
                          const isSubExpanded = expandedNodes[sub.id] ?? true;
                          const subsubs = subSubCategories.filter((ss) => ss.subCategoryId === sub.id);
                          const subProdsCount = getSubProductsCount(sub.id);

                          return (
                            <div
                              key={sub.id}
                              className="border border-[#E6EAF0] rounded-xl overflow-hidden bg-white shadow-2xs"
                            >
                              {/* Subcategory Row */}
                              <div className="p-2.5 bg-gradient-to-r from-amber-50/30 via-white to-white flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleNode(sub.id)}
                                    className="w-6 h-6 rounded-md bg-white border border-[#E6EAF0] hover:bg-gray-50 flex items-center justify-center text-[#192E4D]"
                                  >
                                    {isSubExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-[#FFB000]" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </button>

                                  <img
                                    src={sub.image}
                                    alt=""
                                    className="w-7 h-7 rounded-lg object-cover border border-[#E6EAF0]"
                                  />

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-[#192E4D] text-xs">{sub.name}</span>
                                      <span className="px-1.5 py-0.2 rounded-md bg-[#FFB000] text-[#192E4D] text-[9px] font-bold">
                                        Level 2: Sub
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#697586] block">
                                      {subsubs.length} Sub-Subs • {subProdsCount} Products
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddCategory('subsub', c.id, sub.id)}
                                    className="h-7 px-2.5 rounded-lg bg-[#F20D58]/10 hover:bg-[#F20D58]/20 text-[#F20D58] font-bold text-xs flex items-center gap-1 transition-colors active:scale-95"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Sub-Sub</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCategory('sub', sub)}
                                    className="p-1.5 rounded-lg text-[#697586] hover:text-[#192E4D] hover:bg-gray-100 transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete('sub', sub.id, sub.name)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Level 3 Sub-Subcategories Branch */}
                              {isSubExpanded && (
                                <div className="p-2.5 pl-6 sm:pl-10 bg-[#FAFBFD] border-t border-[#E6EAF0] space-y-1.5">
                                  {subsubs.length === 0 ? (
                                    <div className="p-2 text-[11px] text-gray-400 italic">
                                      No sub-subcategories yet. Click "Add Sub-Sub" above.
                                    </div>
                                  ) : (
                                    subsubs.map((ss) => {
                                      const ssProds = getSubSubProductsCount(ss.id);
                                      return (
                                        <div
                                          key={ss.id}
                                          className="p-2 rounded-lg border border-[#E6EAF0] bg-white flex items-center justify-between gap-2 hover:border-[#F20D58]/40 transition-colors"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#F20D58] shrink-0" />
                                            <img
                                              src={ss.image}
                                              alt=""
                                              className="w-6 h-6 rounded-md object-cover border border-[#E6EAF0] shrink-0"
                                            />
                                            <span className="font-bold text-[#192E4D] text-xs truncate">
                                              {ss.name}
                                            </span>
                                            <span className="px-1.5 py-0.2 rounded-md bg-[#F20D58]/10 text-[#F20D58] text-[9px] font-bold shrink-0">
                                              Level 3
                                            </span>
                                            <span className="text-[10px] text-[#697586] truncate">
                                              ({ssProds} prods)
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditCategory('subsub', ss)}
                                              className="p-1 rounded-md text-[#697586] hover:text-[#192E4D] hover:bg-gray-100"
                                            >
                                              <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDelete('subsub', ss.id, ss.name)}
                                              className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORY ADD & EDIT MODAL */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLevel={modalLevel}
        initialParentMainId={modalParentMainId}
        initialParentSubId={modalParentSubId}
        editingCategory={editingCategory}
        onSaveSuccess={(name, levelLabel) => {
          showNotice(`Successfully saved ${levelLabel}: ${name}`, 'success');
        }}
      />
    </div>
  );
};
