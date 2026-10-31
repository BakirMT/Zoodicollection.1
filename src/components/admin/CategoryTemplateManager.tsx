import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CategorySpecificationTemplate,
  ProductSpecificationField,
  SpecificationInputType,
  VariantOptionType,
} from '../../types';
import {
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  EyeOff,
  FolderTree,
} from 'lucide-react';

export const CategoryTemplateManager: React.FC = () => {
  const {
    categoryTemplates,
    saveCategoryTemplate,
    deleteCategoryTemplate,
    resetCategoryTemplatesToDefault,
    mainCategories,
    subCategories,
    subSubCategories,
  } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    categoryTemplates[0]?.id || 'tmpl_fashion'
  );
  const [editingTemplate, setEditingTemplate] = useState<CategorySpecificationTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Field Add / Edit Form State
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingFieldOriginalKey, setEditingFieldOriginalKey] = useState<string | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<SpecificationInputType>('text');
  const [fieldUnit, setFieldUnit] = useState('');
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldRequired, setFieldRequired] = useState<boolean>(false);
  const [fieldVisibleToCustomers, setFieldVisibleToCustomers] = useState<boolean>(true);

  const activeTemplate =
    editingTemplate ||
    categoryTemplates.find((t) => t.id === selectedTemplateId) ||
    categoryTemplates[0];

  // Helper to resolve category name from ID
  const getCategoryDisplayName = (catId?: string) => {
    if (!catId || catId === 'all') return 'All / General Categories';
    const main = mainCategories.find((m) => m.id === catId);
    if (main) return `Main Category: ${main.name}`;
    const sub = subCategories.find((s) => s.id === catId);
    if (sub) {
      const parentMain = mainCategories.find((m) => m.id === sub.mainCategoryId);
      return `Subcategory: ${parentMain ? `${parentMain.name} → ` : ''}${sub.name}`;
    }
    const child = subSubCategories.find((ss) => ss.id === catId);
    if (child) {
      const parentSub = subCategories.find((s) => s.id === child.subCategoryId);
      return `Child Category: ${parentSub ? `${parentSub.name} → ` : ''}${child.name}`;
    }
    return catId;
  };

  const resetFieldForm = () => {
    setEditingFieldOriginalKey(null);
    setFieldLabel('');
    setFieldKey('');
    setFieldType('text');
    setFieldUnit('');
    setFieldOptions('');
    setFieldPlaceholder('');
    setFieldRequired(false);
    setFieldVisibleToCustomers(true);
    setShowFieldForm(false);
  };

  const handleStartEdit = (tpl: CategorySpecificationTemplate) => {
    setEditingTemplate(JSON.parse(JSON.stringify(tpl)));
    setIsCreatingNew(false);
    resetFieldForm();
  };

  const handleStartNew = () => {
    const newTpl: CategorySpecificationTemplate = {
      id: `tpl_custom_${Date.now()}`,
      name: '',
      categoryName: '',
      categoryId: '',
      applicableCategoryIds: [],
      defaultVariantType: 'clothing_sizes',
      defaultSizes: [],
      fields: [],
      isDefault: false,
    };
    setEditingTemplate(newTpl);
    setIsCreatingNew(true);
    resetFieldForm();
  };

  const handleSaveCurrentTemplate = () => {
    if (!editingTemplate) return;
    const tplName = (editingTemplate.name || editingTemplate.categoryName || '').trim();
    if (!tplName) {
      setSaveStatus('Error: Template name is required');
      setTimeout(() => setSaveStatus(null), 3500);
      return;
    }
    const payload: CategorySpecificationTemplate = {
      ...editingTemplate,
      name: tplName,
      categoryName: tplName,
      updatedAt: new Date().toISOString(),
    };
    saveCategoryTemplate(payload);
    setSelectedTemplateId(payload.id);
    setEditingTemplate(null);
    setIsCreatingNew(false);
    resetFieldForm();
    setSaveStatus('Product specification template saved and synced!');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteCategoryTemplate(id);
    const remaining = categoryTemplates.filter((t) => t.id !== id);
    setSelectedTemplateId(remaining[0]?.id || '');
    setEditingTemplate(null);
    resetFieldForm();
    setSaveStatus('Template deleted.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleResetDefaults = () => {
    resetCategoryTemplatesToDefault();
    setEditingTemplate(null);
    resetFieldForm();
    setSaveStatus('Templates restored to system defaults');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleOpenAddField = () => {
    resetFieldForm();
    setShowFieldForm(true);
  };

  const handleOpenEditField = (field: ProductSpecificationField) => {
    setEditingFieldOriginalKey(field.key);
    setFieldLabel(field.label || '');
    setFieldKey(field.key || '');
    setFieldType((field.inputType || field.type || 'text') as SpecificationInputType);
    setFieldUnit(field.unit || '');
    setFieldOptions(field.options ? field.options.join(', ') : '');
    setFieldPlaceholder(field.placeholder || field.description || '');
    setFieldRequired(Boolean(field.required));
    setFieldVisibleToCustomers(
      field.visibleToCustomers !== false && field.isVisibleOnStorefront !== false
    );
    setShowFieldForm(true);
  };

  const handleSaveFieldToTemplate = () => {
    if (!editingTemplate) return;
    if (!fieldLabel.trim()) return;

    const cleanKey =
      fieldKey.trim() ||
      fieldLabel
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');

    const optionsList =
      fieldType === 'select' ||
      (fieldType as string) === 'multi-select' ||
      fieldType === 'multiselect'
        ? fieldOptions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const fieldObj: ProductSpecificationField = {
      key: cleanKey,
      label: fieldLabel.trim(),
      type: fieldType,
      inputType: fieldType,
      value: '', // Always blank definition — never pre-fill product values
      unit: fieldUnit.trim() || undefined,
      placeholder: fieldPlaceholder.trim() || undefined,
      description: fieldPlaceholder.trim() || undefined,
      options: optionsList,
      required: fieldRequired,
      visibleToCustomers: fieldVisibleToCustomers,
      isVisibleOnStorefront: fieldVisibleToCustomers,
      displayOrder:
        editingFieldOriginalKey !== null
          ? editingTemplate.fields.find((f) => f.key === editingFieldOriginalKey)?.displayOrder ||
            editingTemplate.fields.length + 1
          : editingTemplate.fields.length + 1,
    };

    if (editingFieldOriginalKey !== null) {
      setEditingTemplate({
        ...editingTemplate,
        fields: editingTemplate.fields.map((f) =>
          f.key === editingFieldOriginalKey ? fieldObj : f
        ),
      });
    } else {
      // Avoid duplicate key
      const filtered = editingTemplate.fields.filter((f) => f.key !== cleanKey);
      setEditingTemplate({
        ...editingTemplate,
        fields: [...filtered, fieldObj],
      });
    }

    resetFieldForm();
  };

  const handleToggleFieldRequired = (targetKey: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.map((f) =>
        f.key === targetKey ? { ...f, required: !f.required } : f
      ),
    });
  };

  const handleToggleFieldVisibility = (targetKey: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.map((f) => {
        if (f.key !== targetKey) return f;
        const currentlyVisible =
          f.visibleToCustomers !== false && f.isVisibleOnStorefront !== false;
        return {
          ...f,
          visibleToCustomers: !currentlyVisible,
          isVisibleOnStorefront: !currentlyVisible,
        };
      }),
    });
  };

  const handleRemoveField = (targetKey: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.filter((f) => f.key !== targetKey),
    });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplate) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingTemplate.fields.length) return;
    const updated = [...editingTemplate.fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((f, idx) => {
      f.displayOrder = idx + 1;
    });
    setEditingTemplate({
      ...editingTemplate,
      fields: updated,
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6EAF0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#08A9A2]" />
            <h1 className="text-lg font-black text-[#192E4D]">Product Specification Templates</h1>
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Create and manage reusable specification field templates per product category. Field definitions appear in the Add/Edit Product form with empty values until filled by the administrator.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleStartNew}
            className="px-3.5 py-2 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Specification Template</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#192E4D] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Restore built-in templates"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Built-in Templates</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Grid: Template Selector Sidebar + Template Details/Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar list of templates */}
        <div className="lg:col-span-4 space-y-2.5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#697586] px-1">
            Saved Templates ({categoryTemplates.length})
          </h2>

          <div className="space-y-2">
            {categoryTemplates.map((tpl) => {
              const isSelected =
                (!editingTemplate && selectedTemplateId === tpl.id) ||
                (editingTemplate && editingTemplate.id === tpl.id);
              const tplName = tpl.name || tpl.categoryName || tpl.id;
              const variantLabel = tpl.defaultVariantType
                ? tpl.defaultVariantType.replace('_', ' ')
                : 'clothing sizes';
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setEditingTemplate(null);
                    resetFieldForm();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-white border-[#08A9A2] shadow-sm ring-2 ring-[#08A9A2]/20'
                      : 'bg-white/80 hover:bg-white border-[#E6EAF0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#192E4D] text-xs">{tplName}</span>
                    {tpl.isDefault && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        Built-in
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#08A9A2] font-semibold mt-1">
                    <FolderTree className="w-3 h-3 shrink-0" />
                    <span className="truncate">{getCategoryDisplayName(tpl.categoryId)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#697586] mt-1.5">
                    <span>{tpl.fields.length} Spec Fields</span>
                    <span>•</span>
                    <span className="capitalize">{variantLabel}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F0F4F8]">
                    <span className="text-[10px] font-mono text-gray-400">ID: {tpl.id}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(tpl);
                      }}
                      className="text-[11px] font-bold text-[#08A9A2] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Configure</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template Detail / Editor View */}
        <div className="lg:col-span-8">
          {editingTemplate ? (
            /* EDITING MODE */
            <div className="bg-white rounded-2xl border border-[#E6EAF0] p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#08A9A2]" />
                  <h2 className="text-sm font-extrabold text-[#192E4D]">
                    {isCreatingNew
                      ? 'Create New Specification Template'
                      : `Editing Template: ${editingTemplate.name || editingTemplate.categoryName}`}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setIsCreatingNew(false);
                      resetFieldForm();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#697586] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCurrentTemplate}
                    className="px-4 py-1.5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>

              {/* Template Meta: Name, Applicable Category, Variant Option Model */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name || editingTemplate.categoryName || ''}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value,
                        categoryName: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
                    placeholder="e.g. T-Shirts, Footwear, Perfumes, Wallets"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">
                    Applicable Product Category
                  </label>
                  <select
                    value={editingTemplate.categoryId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingTemplate({
                        ...editingTemplate,
                        categoryId: val,
                        applicableCategoryIds: val ? [val] : [],
                      });
                    }}
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-bold text-[#192E4D] bg-white focus:outline-hidden focus:border-[#08A9A2]"
                  >
                    <option value="">-- Select Applicable Category --</option>
                    <optgroup label="Level 1: Main Categories">
                      {mainCategories.map((mc) => (
                        <option key={mc.id} value={mc.id}>
                          {mc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Level 2: Subcategories">
                      {subCategories.map((sc) => {
                        const parent = mainCategories.find((m) => m.id === sc.mainCategoryId);
                        return (
                          <option key={sc.id} value={sc.id}>
                            {parent ? `${parent.name} → ` : ''}{sc.name}
                          </option>
                        );
                      })}
                    </optgroup>
                    <optgroup label="Level 3: Child Categories">
                      {subSubCategories.map((ssc) => {
                        const parentSub = subCategories.find((s) => s.id === ssc.subCategoryId);
                        return (
                          <option key={ssc.id} value={ssc.id}>
                            {parentSub ? `${parentSub.name} → ` : ''}{ssc.name}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">
                    Purchase / Variant Option Type
                  </label>
                  <select
                    value={editingTemplate.defaultVariantType || 'clothing_sizes'}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        defaultVariantType: e.target.value as VariantOptionType,
                      })
                    }
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-bold text-[#192E4D] bg-white focus:outline-hidden focus:border-[#08A9A2]"
                  >
                    <option value="clothing_sizes">Clothing Sizes (S, M, L, XL, XXL)</option>
                    <option value="age_sizes">Age Sizes (2-3Y, 3-4Y, 4-5Y, etc.)</option>
                    <option value="shoe_sizes">Shoe Sizes (UK 6, 7, 8, 9, 10, 11)</option>
                    <option value="volume_ml">Perfume / Bottle Volume (30ml, 50ml, 100ml)</option>
                    <option value="custom_sizes">Custom Selectable Options</option>
                    <option value="none">No Sizes / Single Unit (Bags, Wallets, Belts)</option>
                  </select>
                </div>
              </div>

              {/* Candidate selectable options (e.g. sizes offered for manual selection) */}
              {editingTemplate.defaultVariantType !== 'none' && (
                <div>
                  <label className="block text-xs font-bold text-[#192E4D] mb-1">
                    Available Option Choices for Manual Selection (comma separated, optional)
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.defaultSizes?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        defaultSizes: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
                    placeholder="e.g. S, M, L, XL, XXL or UK 7, UK 8, UK 9 or 30ml, 50ml, 100ml"
                  />
                  <p className="text-[11px] text-[#697586] mt-1">
                    These choices appear as unselected buttons in the product form so the administrator can manually click the sizes available for a specific product.
                  </p>
                </div>
              )}

              {/* Category-Specific Specification Fields */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#192E4D]">
                      Template Specification Fields ({editingTemplate.fields.length})
                    </h3>
                    <p className="text-[11px] text-[#697586]">
                      Configure field names, input types, required/optional rules, and customer storefront visibility.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddField}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#08A9A2] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Specification Field</span>
                  </button>
                </div>

                {/* Inline Add / Edit Field Form */}
                {showFieldForm && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-teal-200 space-y-3 text-xs animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#192E4D] flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-[#08A9A2]" />
                        <span>
                          {editingFieldOriginalKey !== null
                            ? `Edit Specification Field: ${fieldLabel}`
                            : 'Add New Specification Field'}
                        </span>
                      </h4>
                      <button
                        type="button"
                        onClick={resetFieldForm}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#192E4D] mb-1">
                          Custom Field Name *
                        </label>
                        <input
                          type="text"
                          value={fieldLabel}
                          onChange={(e) => setFieldLabel(e.target.value)}
                          placeholder="e.g. Fabric, GSM, Upper Material, Fragrance Notes"
                          className="w-full h-9 px-2.5 border border-[#E6EAF0] rounded-lg text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#192E4D] mb-1">
                          Input Type
                        </label>
                        <select
                          value={fieldType}
                          onChange={(e) => setFieldType(e.target.value as SpecificationInputType)}
                          className="w-full h-9 px-2.5 border border-[#E6EAF0] rounded-lg text-xs font-semibold bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="select">Dropdown Select</option>
                          <option value="multi-select">Multi-Select Chips</option>
                          <option value="boolean">Toggle (Yes/No)</option>
                          <option value="textarea">Multi-line Text</option>
                          <option value="dimensions">Dimensions (LxWxH)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#192E4D] mb-1">
                          Measurement Unit (Optional)
                        </label>
                        <input
                          type="text"
                          value={fieldUnit}
                          onChange={(e) => setFieldUnit(e.target.value)}
                          placeholder="e.g. GSM, ml, cm, g"
                          className="w-full h-9 px-2.5 border border-[#E6EAF0] rounded-lg text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#192E4D] mb-1">
                          Guidance / Placeholder Hint (Not saved as value)
                        </label>
                        <input
                          type="text"
                          value={fieldPlaceholder}
                          onChange={(e) => setFieldPlaceholder(e.target.value)}
                          placeholder="e.g. Enter fabric composition..."
                          className="w-full h-9 px-2.5 border border-[#E6EAF0] rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#192E4D] mb-1">
                          Field Key (Auto-generated if blank)
                        </label>
                        <input
                          type="text"
                          value={fieldKey}
                          onChange={(e) => setFieldKey(e.target.value)}
                          placeholder="e.g. upper_material"
                          className="w-full h-9 px-2.5 border border-[#E6EAF0] rounded-lg text-xs font-mono bg-white"
                        />
                      </div>
                    </div>

                    {(fieldType === 'select' ||
                      (fieldType as string) === 'multi-select' ||
                      fieldType === 'multiselect') && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#192E4D] mb-1">
                          Selectable Options (comma separated) *
                        </label>
                        <input
                          type="text"
                          value={fieldOptions}
                          onChange={(e) => setFieldOptions(e.target.value)}
                          placeholder="e.g. Regular Fit, Slim Fit, Oversized"
                          className="w-full h-9 px-2.5 border border-[#E6EAF0] rounded-lg text-xs bg-white"
                        />
                      </div>
                    )}

                    {/* Required vs Optional & Customer Visibility Toggles */}
                    <div className="flex flex-wrap items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fieldRequired}
                          onChange={(e) => setFieldRequired(e.target.checked)}
                          className="rounded text-[#08A9A2]"
                        />
                        <span className="font-bold text-[#192E4D]">
                          Required Field (Must be filled before publishing)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fieldVisibleToCustomers}
                          onChange={(e) => setFieldVisibleToCustomers(e.target.checked)}
                          className="rounded text-[#08A9A2]"
                        />
                        <span className="font-bold text-[#192E4D]">
                          Visible to Customers on Product Page
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={resetFieldForm}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveFieldToTemplate}
                        className="px-4 py-1.5 rounded-lg bg-[#08A9A2] text-white text-xs font-bold shadow-xs hover:bg-[#079690] cursor-pointer"
                      >
                        {editingFieldOriginalKey !== null ? 'Update Field' : 'Add Field to Template'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Fields Table */}
                <div className="border border-[#E6EAF0] rounded-xl overflow-hidden divide-y divide-[#F0F4F8]">
                  {editingTemplate.fields.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#697586]">
                      No specification fields defined yet. Click <strong>+ Add Specification Field</strong> above to add fields.
                    </div>
                  ) : (
                    editingTemplate.fields.map((field, idx) => {
                      const isVisible =
                        field.visibleToCustomers !== false && field.isVisibleOnStorefront !== false;
                      return (
                        <div
                          key={field.key}
                          className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-[#192E4D]">{field.label}</span>
                                <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {field.key}
                                </span>
                                {field.unit && (
                                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                    Unit: {field.unit}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFieldRequired(field.key)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                                    field.required
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}
                                  title="Click to toggle Required / Optional"
                                >
                                  {field.required ? 'Required' : 'Optional'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFieldVisibility(field.key)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer ${
                                    isVisible
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-gray-100 text-gray-500 border-gray-200'
                                  }`}
                                  title="Click to toggle Customer Storefront Visibility"
                                >
                                  {isVisible ? (
                                    <>
                                      <Eye className="w-3 h-3" />
                                      <span>Customer Visible</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      <span>Hidden</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-[#697586] mt-0.5">
                                <span className="capitalize font-medium">
                                  Type: {field.inputType || field.type}
                                </span>
                                {field.options && field.options.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-xs">
                                      Options: {field.options.join(', ')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveField(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveField(idx, 'down')}
                              disabled={idx === editingTemplate.fields.length - 1}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditField(field)}
                              className="p-1.5 rounded-lg text-[#08A9A2] hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Edit field"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(field.key)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F0F4F8]">
                {!editingTemplate.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(editingTemplate.id)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Template</span>
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setIsCreatingNew(false);
                      resetFieldForm();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCurrentTemplate}
                    className="px-5 py-2 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW / READ-ONLY MODE */
            <div className="bg-white rounded-2xl border border-[#E6EAF0] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-[#192E4D]">
                      {activeTemplate.name || activeTemplate.categoryName || 'Category Template'}
                    </h2>
                    {activeTemplate.isDefault && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        Built-in Template
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#697586] mt-0.5">
                    Applicable Category:{' '}
                    <strong className="text-[#08A9A2]">
                      {getCategoryDisplayName(activeTemplate.categoryId)}
                    </strong>{' '}
                    • Variant Model:{' '}
                    <strong className="text-[#192E4D] capitalize">
                      {activeTemplate.defaultVariantType
                        ? activeTemplate.defaultVariantType.replace('_', ' ')
                        : 'clothing sizes'}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartEdit(activeTemplate)}
                  className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#08A9A2] text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure Template</span>
                </button>
              </div>

              {/* Candidate Options Preview */}
              {activeTemplate.defaultSizes && activeTemplate.defaultSizes.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-[#192E4D] block mb-1.5">
                    Available Option Choices (Admin manually selects per product):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeTemplate.defaultSizes.map((sz) => (
                      <span
                        key={sz}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E6EAF0] text-xs font-bold text-[#192E4D] shadow-2xs"
                      >
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fields List */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#192E4D]">
                  Configured Specification Fields ({activeTemplate.fields.length})
                </h3>

                <div className="border border-[#E6EAF0] rounded-xl overflow-hidden divide-y divide-[#F0F4F8]">
                  {activeTemplate.fields.map((f, i) => {
                    const isVisible =
                      f.visibleToCustomers !== false && f.isVisibleOnStorefront !== false;
                    return (
                      <div
                        key={f.key}
                        className="p-3 bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-[#192E4D]">{f.label}</span>
                              <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {f.key}
                              </span>
                              {f.unit && (
                                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                  {f.unit}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  f.required
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                {f.required ? 'Required' : 'Optional'}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  isVisible
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                              >
                                {isVisible ? 'Customer Visible' : 'Hidden'}
                              </span>
                            </div>
                            {(f.placeholder || f.description) && (
                              <p className="text-[11px] text-gray-400 mt-0.5 italic">
                                {f.placeholder || f.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                          {f.inputType || f.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
