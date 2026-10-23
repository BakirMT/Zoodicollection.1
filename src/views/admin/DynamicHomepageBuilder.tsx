import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HomepageSection, HomepageSectionType } from '../../types';
import { createDefaultSectionConfig, ALL_SECTION_TEMPLATES } from '../../data/homepageSectionTemplates';
import { SectionTypeSelectorModal } from '../../components/admin/homepage/SectionTypeSelectorModal';
import { SectionConfigDrawer } from '../../components/admin/homepage/SectionConfigDrawer';
import { HomepagePreviewModal } from '../../components/admin/homepage/HomepagePreviewModal';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit3,
  Copy,
  Trash2,
  Sparkles,
  Check,
  Save,
  RotateCcw,
  Zap,
  Clock,
  Layers,
  Layout,
  Sliders,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const DynamicHomepageBuilder: React.FC = () => {
  const {
    homepageSections,
    homepageDraft,
    products,
    mainCategories,
    updateHomepageSections,
    saveHomepageDraft,
    publishHomepageDraft,
    discardHomepageDraft,
    resetHomepageToDefault,
    deleteHomepageSection,
    duplicateHomepageSection,
    saveSingleHomepageSection,
  } = useApp();

  // Active working list is homepageDraft if draft exists, else homepageSections
  const activeSections = (homepageDraft || homepageSections).slice().sort((a, b) => a.order - b.order);
  const hasDraftChanges = Boolean(homepageDraft && homepageDraft.length > 0);

  // Modals & Drawers state
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Move Section Up or Down
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const list = [...activeSections];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    const reordered = list.map((s, idx) => ({ ...s, order: idx + 1 }));

    if (hasDraftChanges) {
      await saveHomepageDraft(reordered);
    } else {
      await updateHomepageSections(reordered);
    }
    showStatus(`Reordered section "${temp.title}"`);
  };

  // Toggle Visibility
  const handleToggleActive = async (sectionId: string) => {
    const updated = activeSections.map((s) => (s.id === sectionId ? { ...s, isActive: !s.isActive } : s));
    if (hasDraftChanges) {
      await saveHomepageDraft(updated);
    } else {
      await updateHomepageSections(updated);
    }
    const sec = activeSections.find((s) => s.id === sectionId);
    showStatus(`Section "${sec?.title}" is now ${sec?.isActive ? 'hidden' : 'active'}`);
  };

  // Add Section from Type Selector
  const handleSelectSectionType = async (type: HomepageSectionType) => {
    setIsTypeSelectorOpen(false);
    const newSection = createDefaultSectionConfig(type, activeSections.length + 1);
    const updated = [...activeSections, newSection];
    if (hasDraftChanges) {
      await saveHomepageDraft(updated);
    } else {
      await updateHomepageSections(updated);
    }
    showStatus(`Added "${newSection.title}" to homepage builder`);
    // Automatically open configuration drawer for the newly added section
    setEditingSection(newSection);
  };

  // Duplicate Section
  const handleDuplicate = async (sectionId: string) => {
    await duplicateHomepageSection(sectionId);
    showStatus('Duplicated section successfully');
  };

  // Delete Section with confirmation
  const handleDelete = async (sectionId: string) => {
    const sec = activeSections.find((s) => s.id === sectionId);
    if (confirm(`Are you sure you want to delete section "${sec?.title}"?`)) {
      await deleteHomepageSection(sectionId);
      if (editingSection?.id === sectionId) {
        setEditingSection(null);
      }
      showStatus(`Deleted section "${sec?.title}"`);
    }
  };

  // Save Single Section from Drawer
  const handleSaveSectionConfig = async (updated: HomepageSection): Promise<boolean> => {
    const ok = await saveSingleHomepageSection(updated);
    setEditingSection(null);
    showStatus(`Saved settings for "${updated.title}" in database!`);
    return ok;
  };

  // Publish Draft Changes
  const handlePublish = async () => {
    await publishHomepageDraft();
    showStatus('Published all changes to customer storefront!', 'success');
  };

  // Discard Draft
  const handleDiscard = async () => {
    if (confirm('Discard all unpublished changes and revert to live homepage?')) {
      await discardHomepageDraft();
      showStatus('Reverted to live published homepage', 'info');
    }
  };

  // Reset to Factory Defaults
  const handleReset = async () => {
    if (confirm('Reset homepage layout to factory default configuration? This cannot be undone.')) {
      await resetHomepageToDefault();
      showStatus('Reset homepage to default layout', 'info');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E6EAF0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-[#192E4D]">Dynamic Homepage Builder</h1>
            {hasDraftChanges ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                Unsaved Draft
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Live Synced</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Full drag-and-drop control with 21 section types, image media managers, flash deals timers, and database persistence.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {hasDraftChanges && (
            <>
              <button
                type="button"
                onClick={handleDiscard}
                className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Publish Changes</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Storefront</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTypeSelectorOpen(true)}
            className="h-9 px-4 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Section</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Reset homepage to default layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : statusMessage.type === 'info'
              ? 'bg-sky-50 border-sky-200 text-sky-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {activeSections.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <p className="text-sm font-bold text-slate-700">No sections added to homepage yet</p>
            <p className="text-xs text-slate-400">Click below to add your first homepage section.</p>
            <button
              type="button"
              onClick={() => setIsTypeSelectorOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#08A9A2] text-white font-bold text-xs hover:bg-[#079690] cursor-pointer"
            >
              + Add Section
            </button>
          </div>
        ) : (
          activeSections.map((section, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === activeSections.length - 1;
            const templateMeta = ALL_SECTION_TEMPLATES.find((t) => t.type === section.type);

            return (
              <div
                key={section.id}
                className={`p-4 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
                  section.isActive ? 'border-[#E6EAF0]' : 'border-gray-200 bg-gray-50/60 opacity-65'
                }`}
              >
                {/* Left Info Column */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#F6F8FA] text-[#192E4D] font-mono font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    #{idx + 1}
                  </div>

                  {/* Thumbnail Preview */}
                  {section.bannerImage ? (
                    <img
                      src={section.bannerImage}
                      alt={section.title}
                      className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                  ) : section.slides?.[0]?.image ? (
                    <img
                      src={section.slides[0].image}
                      alt={section.title}
                      className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                      <Layout className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#192E4D] truncate">
                        {section.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#08A9A2]/10 text-[#08A9A2] font-mono text-[10px] font-bold">
                        {section.type}
                      </span>

                      {/* Status / Deal Badge */}
                      {section.type === 'flash_sale' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[9px] font-black uppercase flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          <span>{section.isUnlimitedDuration ? 'Unlimited' : '24h Timer'}</span>
                        </span>
                      )}

                      {!section.isActive && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[9px] font-bold uppercase">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#697586] truncate">
                      {section.subtitle && <span className="truncate">{section.subtitle}</span>}
                      {section.productIds && section.productIds.length > 0 && (
                        <span>· {section.productIds.length} Products</span>
                      )}
                      {section.slides && section.slides.length > 0 && (
                        <span>· {section.slides.length} Slides</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Reorder Up */}
                  <button
                    type="button"
                    aria-label="Move Section Up"
                    disabled={isFirst}
                    onClick={() => handleMoveSection(idx, 'up')}
                    className="p-1.5 rounded-lg bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] disabled:opacity-30 transition-colors cursor-pointer"
                    title="Move section up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    aria-label="Move Section Down"
                    disabled={isLast}
                    onClick={() => handleMoveSection(idx, 'down')}
                    className="p-1.5 rounded-lg bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] disabled:opacity-30 transition-colors cursor-pointer"
                    title="Move section down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(section.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      section.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={section.isActive ? 'Hide section from customers' : 'Show section'}
                  >
                    {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit Settings (Opens Drawer) */}
                  <button
                    type="button"
                    onClick={() => setEditingSection(section)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#08A9A2]/10 hover:bg-[#08A9A2] text-[#08A9A2] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Edit section settings"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(section.id)}
                    className="p-1.5 rounded-lg bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] transition-colors cursor-pointer"
                    title="Duplicate section"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(section.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Section Floating / Bottom Prompt */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsTypeSelectorOpen(true)}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#08A9A2] hover:bg-[#08A9A2]/5 text-slate-600 hover:text-[#08A9A2] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Homepage Section</span>
        </button>
      </div>

      {/* MODAL 1: Section Type Selector */}
      <SectionTypeSelectorModal
        isOpen={isTypeSelectorOpen}
        onClose={() => setIsTypeSelectorOpen(false)}
        onSelect={handleSelectSectionType}
      />

      {/* MODAL 2: Universal Section Configuration Drawer */}
      {editingSection && (
        <SectionConfigDrawer
          isOpen={Boolean(editingSection)}
          section={editingSection}
          allProducts={products}
          categories={mainCategories}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveSectionConfig}
          onDelete={handleDelete}
          onPreview={() => setIsPreviewModalOpen(true)}
        />
      )}

      {/* MODAL 3: Full Homepage Live Preview Modal */}
      <HomepagePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        sections={activeSections}
      />
    </div>
  );
};
