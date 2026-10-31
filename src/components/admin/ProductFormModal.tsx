import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Product,
  ProductVariant,
  StructuredSpecification,
  VariantOptionType,
} from '../../types';
import { getCategoryTemplate, getDefaultSizesForVariantType } from '../../data/categoryTemplates';
import { CategoryLevel, CategoryModal } from './CategoryModal';
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  Package,
  RotateCcw,
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSaveSuccess: (message: string) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  onSaveSuccess,
}) => {
  const {
    mainCategories,
    subCategories,
    subSubCategories,
    saveProduct,
    categoryTemplates,
  } = useApp();

  // Active section tab (1 to 10)
  const [activeSection, setActiveSection] = useState<number>(1);
  // Inline validation message (no browser alerts)
  const [validationError, setValidationError] = useState<string | null>(null);

  // SECTION 1: BASIC INFORMATION
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pSku, setPSku] = useState('');
  const [pDesc, setPDesc] = useState('');

  // SECTION 2: CATEGORY & PRODUCT TYPE
  const [pMainCat, setPMainCat] = useState('');
  const [pSubCat, setPSubCat] = useState('');
  const [pSubSubCat, setPSubSubCat] = useState('');
  const [categoryChangeWarning, setCategoryChangeWarning] = useState<string | null>(null);
  const [pendingMainCat, setPendingMainCat] = useState<string | null>(null);

  // Quick category creation modal inside product modal
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [quickCategoryLevel, setQuickCategoryLevel] = useState<CategoryLevel>('sub');

  // SECTION 3: PRODUCT IMAGES
  const [pPrimaryImage, setPPrimaryImage] = useState('');
  const [pAdditionalImages, setPAdditionalImages] = useState<string[]>([]);
  const [additionalImageInput, setAdditionalImageInput] = useState('');
  const [pSizeChartImage, setPSizeChartImage] = useState('');
  const [pCareImage, setPCareImage] = useState('');

  // SECTION 4: PRODUCT VARIANTS & SIZES (Never preselected automatically!)
  const [variantType, setVariantType] = useState<VariantOptionType>('clothing_sizes');
  const [pAvailableSizes, setPAvailableSizes] = useState<string[]>([]);
  const [customCandidateSizes, setCustomCandidateSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [pVariants, setPVariants] = useState<ProductVariant[]>([]);

  // Color variant sub-modal
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [vColorName, setVColorName] = useState('');
  const [vColorCode, setVColorCode] = useState('#192E4D');
  const [vSku, setVSku] = useState('');
  const [vPrice, setVPrice] = useState<string>('');
  const [vSalePrice, setVSalePrice] = useState<string>('');
  const [vStock, setVStock] = useState<string>('');
  const [vImages, setVImages] = useState<string[]>([]);
  const [vImageUrlInput, setVImageUrlInput] = useState('');
  const [colorModalError, setColorModalError] = useState<string | null>(null);

  // SECTION 5: CATEGORY SPECIFICATIONS (Values mapped by field key — always blank by default)
  const [specValues, setSpecValues] = useState<Record<string, any>>({});

  // Core clothing & specification fields (All start completely empty)
  const [pStyle, setPStyle] = useState('');
  const [pStyleName, setPStyleName] = useState('');
  const [pStyleNumber, setPStyleNumber] = useState('');
  const [pFabric, setPFabric] = useState('');
  const [pGsm, setPGsm] = useState('');
  const [pRatio, setPRatio] = useState('');
  const [pAccessories, setPAccessories] = useState('');
  const [pPackaging, setPPackaging] = useState('');
  const [pCustomColors, setPCustomColors] = useState('');
  const [pCountryOfOrigin, setPCountryOfOrigin] = useState('');
  const [pManufacturer, setPManufacturer] = useState('');
  const [pCareInstructions, setPCareInstructions] = useState('');

  // SECTION 6: CUSTOM SPECIFICATION BUILDER
  const [customSpecs, setCustomSpecs] = useState<StructuredSpecification[]>([]);
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');
  const [newCustomUnit, setNewCustomUnit] = useState('');

  // SECTION 7: PRICING & INVENTORY (Blank by default for new products)
  const [pPrice, setPPrice] = useState<string>('');
  const [pSalePrice, setPSalePrice] = useState<string>('');
  const [pBaseStock, setPBaseStock] = useState<string>('');

  // SECTION 8: SHIPPING & PACKAGING
  const [pShippingEligible, setPShippingEligible] = useState(true);
  const [pReturnEligible, setPReturnEligible] = useState(true);

  // SECTION 9: CUSTOMER DISPLAY SETTINGS
  const [pFeatured, setPFeatured] = useState(false);
  const [pTrending, setPTrending] = useState(false);
  const [pNewArrival, setPNewArrival] = useState(false);
  const [pBestSeller, setPBestSeller] = useState(false);
  const [pStatus, setPStatus] = useState<'published' | 'draft'>('published');

  // Complete reset function for New Product data isolation
  const resetToBlankNewProduct = () => {
    setActiveSection(1);
    setValidationError(null);
    setCategoryChangeWarning(null);
    setPendingMainCat(null);

    // Section 1: Blank
    setPName('');
    setPBrand('');
    setPSku('');
    setPDesc('');

    // Section 2: Blank until selected by admin
    setPMainCat('');
    setPSubCat('');
    setPSubSubCat('');

    // Section 3: Blank images and previews
    setPPrimaryImage('');
    setPAdditionalImages([]);
    setAdditionalImageInput('');
    setPSizeChartImage('');
    setPCareImage('');

    // Section 4: No automatic size or variant selection!
    setVariantType('clothing_sizes');
    setPAvailableSizes([]);
    setCustomCandidateSizes([]);
    setCustomSizeInput('');
    setPVariants([]);
    setShowColorModal(false);
    setEditingVariantIndex(null);
    setVColorName('');
    setVColorCode('#192E4D');
    setVSku('');
    setVPrice('');
    setVSalePrice('');
    setVStock('');
    setVImages([]);
    setVImageUrlInput('');
    setColorModalError(null);

    // Section 5: All optional specifications start completely empty
    setSpecValues({});
    setPStyle('');
    setPStyleName('');
    setPStyleNumber('');
    setPFabric('');
    setPGsm('');
    setPRatio('');
    setPAccessories('');
    setPPackaging('');
    setPCustomColors('');
    setPCountryOfOrigin('');
    setPManufacturer('');
    setPCareInstructions('');

    // Section 6: Custom specs empty
    setCustomSpecs([]);
    setNewCustomLabel('');
    setNewCustomValue('');
    setNewCustomUnit('');

    // Section 7: Pricing & Stock blank
    setPPrice('');
    setPSalePrice('');
    setPBaseStock('');

    // Section 8 & 9: Clean defaults
    setPShippingEligible(true);
    setPReturnEligible(true);
    setPFeatured(false);
    setPTrending(false);
    setPNewArrival(false);
    setPBestSeller(false);
    setPStatus('published');
  };

  // Initialize form when modal opens or editingProduct changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      setActiveSection(1);
      setValidationError(null);
      setCategoryChangeWarning(null);
      setPendingMainCat(null);

      setPName(editingProduct.name || '');
      setPBrand(editingProduct.brand || '');
      setPDesc(editingProduct.description || '');
      setPMainCat(editingProduct.mainCategoryId || '');
      setPSubCat(editingProduct.subCategoryId || '');
      setPSubSubCat(editingProduct.subSubCategoryId || '');
      setPPrice(editingProduct.price !== undefined ? String(editingProduct.price) : '');
      setPSalePrice(
        editingProduct.salePrice !== undefined ? String(editingProduct.salePrice) : ''
      );

      // Filter out internal unconfigured carrier variants so only real configured variants show in the variant list
      const configuredVariants = (editingProduct.variants || []).filter(
        (v) =>
          v.attributes?.isUnconfiguredDefault !== 'true' &&
          v.colorName &&
          v.colorName.trim() !== ''
      );
      setPVariants(configuredVariants.map((v) => ({ ...v })));

      const firstVar = editingProduct.variants?.[0];
      setPSku(firstVar?.sku || '');
      setPBaseStock(firstVar?.stock !== undefined ? String(firstVar.stock) : '');
      setPPrimaryImage(firstVar?.images?.[0] || '');
      setPAdditionalImages(
        editingProduct.additionalImages || (firstVar?.images ? firstVar.images.slice(1) : [])
      );
      setPSizeChartImage(editingProduct.sizeChartImage || '');
      setPCareImage(editingProduct.careImage || '');

      setVariantType(editingProduct.variantType || 'clothing_sizes');
      setPAvailableSizes(editingProduct.sizes ? [...editingProduct.sizes] : []);
      setCustomCandidateSizes(editingProduct.sizes ? [...editingProduct.sizes] : []);
      setCustomSizeInput('');

      // Saved specification fields
      setPStyle(editingProduct.style || '');
      setPStyleName(editingProduct.styleName || '');
      setPStyleNumber(editingProduct.styleNumber || '');
      setPFabric(editingProduct.fabric || '');
      setPGsm(editingProduct.gsm || '');
      setPRatio(editingProduct.ratio || '');
      setPAccessories(editingProduct.accessories || editingProduct.accessoriesIncluded || '');
      setPPackaging(editingProduct.packaging || editingProduct.packagingDetails || '');
      setPCustomColors(editingProduct.customColors || editingProduct.colorsDescription || '');
      setPCountryOfOrigin(editingProduct.countryOfOrigin || '');
      setPManufacturer(editingProduct.manufacturer || '');
      setPCareInstructions(editingProduct.careInstructions || '');

      // Structured specifications
      const initialSpecValues: Record<string, any> = {};
      const customList: StructuredSpecification[] = [];

      (editingProduct.structuredSpecifications || []).forEach((s) => {
        const k = s.key || s.fieldKey || '';
        if (s.isCustom) {
          customList.push({ ...s, key: k });
        } else if (k) {
          initialSpecValues[k] = s.value;
        }
      });
      setSpecValues(initialSpecValues);
      setCustomSpecs(customList);

      // Display settings
      setPFeatured(Boolean(editingProduct.featured));
      setPTrending(Boolean(editingProduct.trending));
      setPNewArrival(Boolean(editingProduct.newArrival));
      setPBestSeller(Boolean(editingProduct.bestSeller));
      setPStatus(editingProduct.status === 'draft' ? 'draft' : 'published');
      setPShippingEligible(editingProduct.shippingEligible ?? true);
      setPReturnEligible(editingProduct.returnEligible ?? true);
    } else {
      resetToBlankNewProduct();
    }
  }, [isOpen, editingProduct?.id]);

  // Current category specification template
  const currentTemplate = getCategoryTemplate(
    pMainCat,
    pSubCat,
    categoryTemplates,
    pSubSubCat
  );

  // Candidate sizes offered for manual selection (None are selected automatically)
  const candidateSizes = Array.from(
    new Set([
      ...(currentTemplate.defaultSizes && currentTemplate.defaultSizes.length > 0
        ? currentTemplate.defaultSizes
        : []),
      ...getDefaultSizesForVariantType(variantType),
      ...customCandidateSizes,
      ...pAvailableSizes,
    ])
  );

  const toggleSizeSelection = (size: string) => {
    setValidationError(null);
    if (pAvailableSizes.includes(size)) {
      setPAvailableSizes(pAvailableSizes.filter((s) => s !== size));
    } else {
      setPAvailableSizes([...pAvailableSizes, size]);
    }
  };

  // Category switch with safety check
  const handleMainCategoryChange = (newMainId: string) => {
    setValidationError(null);
    const hasEnteredData =
      Object.values(specValues).some((v) => v !== undefined && String(v).trim() !== '') ||
      pStyle.trim() !== '' ||
      pFabric.trim() !== '' ||
      customSpecs.length > 0;

    if (hasEnteredData && pMainCat && newMainId !== pMainCat) {
      setPendingMainCat(newMainId);
      setCategoryChangeWarning(
        'Changing category will load the specification template for the new category. Any values you have already entered will be preserved.'
      );
    } else {
      applyMainCategoryChange(newMainId);
    }
  };

  const applyMainCategoryChange = (newMainId: string) => {
    setPMainCat(newMainId);
    setPSubCat('');
    setPSubSubCat('');

    if (newMainId) {
      const tpl = getCategoryTemplate(newMainId, '', categoryTemplates, '');
      setVariantType(tpl.defaultVariantType || 'clothing_sizes');
    }
    // Never auto-select sizes when changing category!
    setCategoryChangeWarning(null);
    setPendingMainCat(null);
  };

  const handleSubCategoryChange = (newSubId: string) => {
    setValidationError(null);
    setPSubCat(newSubId);
    setPSubSubCat('');

    if (pMainCat || newSubId) {
      const tpl = getCategoryTemplate(pMainCat, newSubId, categoryTemplates, '');
      setVariantType(tpl.defaultVariantType || 'clothing_sizes');
    }
    // Never auto-select sizes when changing subcategory!
  };

  const handleChildCategoryChange = (newChildId: string) => {
    setValidationError(null);
    setPSubSubCat(newChildId);
    if (newChildId) {
      const tpl = getCategoryTemplate(pMainCat, pSubCat, categoryTemplates, newChildId);
      if (tpl.defaultVariantType) {
        setVariantType(tpl.defaultVariantType);
      }
    }
  };

  // Color variant helpers
  const openAddColorModal = () => {
    setEditingVariantIndex(null);
    setVColorName('');
    setVColorCode('#192E4D');
    setVSku('');
    setVPrice(pPrice || '');
    setVSalePrice(pSalePrice || '');
    setVStock(pBaseStock || '');
    setVImages([]);
    setVImageUrlInput('');
    setColorModalError(null);
    setShowColorModal(true);
  };

  const openEditColorModal = (idx: number) => {
    const v = pVariants[idx];
    if (!v) return;
    setEditingVariantIndex(idx);
    setVColorName(v.colorName);
    setVColorCode(v.colorCode);
    setVSku(v.sku || '');
    setVPrice(v.price !== undefined ? String(v.price) : '');
    setVSalePrice(v.salePrice !== undefined ? String(v.salePrice) : '');
    setVStock(v.stock !== undefined ? String(v.stock) : '');
    setVImages([...(v.images || [])]);
    setVImageUrlInput('');
    setColorModalError(null);
    setShowColorModal(true);
  };

  const handleSaveColorVariant = () => {
    if (!vColorName.trim()) {
      setColorModalError('Please enter a color / variant name.');
      return;
    }
    const parsedPrice = parseFloat(vPrice) || parseFloat(pPrice) || 0;
    const parsedSalePrice = parseFloat(vSalePrice) || parseFloat(pSalePrice) || undefined;
    const parsedStock = parseInt(vStock, 10);
    const finalStock = Number.isNaN(parsedStock) ? parseInt(pBaseStock, 10) || 10 : parsedStock;

    // Distribute stock across manually selected sizes if any
    const sizeStockMap: Record<string, number> = {};
    if (pAvailableSizes.length > 0) {
      const perSize = Math.max(1, Math.floor(finalStock / pAvailableSizes.length));
      pAvailableSizes.forEach((sz) => {
        sizeStockMap[sz] = perSize;
      });
    }

    const updatedVariant: ProductVariant = {
      id:
        editingVariantIndex !== null
          ? pVariants[editingVariantIndex].id
          : `var_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      colorName: vColorName.trim(),
      colorCode: vColorCode,
      sku: vSku.trim() || pSku.trim() || `ZD-${Date.now().toString().slice(-4)}`,
      price: parsedPrice,
      salePrice: parsedSalePrice,
      stock: finalStock,
      sizeStock: pAvailableSizes.length > 0 ? sizeStockMap : undefined,
      images: vImages.length > 0 ? vImages : pPrimaryImage.trim() ? [pPrimaryImage.trim()] : [],
    };

    if (editingVariantIndex !== null) {
      const next = [...pVariants];
      next[editingVariantIndex] = updatedVariant;
      setPVariants(next);
    } else {
      setPVariants([...pVariants, updatedVariant]);
    }
    setShowColorModal(false);
  };

  const handleDeleteVariant = (idx: number) => {
    setPVariants(pVariants.filter((_, i) => i !== idx));
  };

  // Custom Spec Builder helpers
  const handleAddCustomSpec = () => {
    if (!newCustomLabel.trim() || !newCustomValue.trim()) return;
    const key = newCustomLabel
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
    const newSpec: StructuredSpecification = {
      key,
      label: newCustomLabel.trim(),
      value: newCustomValue.trim(),
      unit: newCustomUnit.trim() || undefined,
      inputType: 'text',
      isVisibleOnStorefront: true,
      visibleToCustomers: true,
      isCustom: true,
    };
    setCustomSpecs([...customSpecs.filter((s) => s.key !== key), newSpec]);
    setNewCustomLabel('');
    setNewCustomValue('');
    setNewCustomUnit('');
  };

  const handleToggleSpecVisibility = (key: string) => {
    setCustomSpecs(
      customSpecs.map((s) => {
        if (s.key !== key) return s;
        const nextVis = !(s.isVisibleOnStorefront !== false && s.visibleToCustomers !== false);
        return {
          ...s,
          isVisibleOnStorefront: nextVis,
          visibleToCustomers: nextVis,
        };
      })
    );
  };

  const handleRemoveCustomSpec = (key: string) => {
    setCustomSpecs(customSpecs.filter((s) => s.key !== key));
  };

  // Main Submit Handler
  const handleFormSubmit = async (statusOverride?: 'published' | 'draft') => {
    setValidationError(null);
    const finalStatus = statusOverride || pStatus;

    // 1. Validate Product Name
    if (!pName.trim()) {
      setValidationError('Product Title is required in Section 1.');
      setActiveSection(1);
      return;
    }

    // 2. Validate Category Selection
    if (!pMainCat) {
      setValidationError('Please select a Main Category in Section 2.');
      setActiveSection(2);
      return;
    }

    // 3. Validate Primary Image when publishing
    const hasAnyImage =
      pPrimaryImage.trim() !== '' ||
      pAdditionalImages.length > 0 ||
      pVariants.some((v) => v.images && v.images.length > 0);
    if (finalStatus === 'published' && !hasAnyImage) {
      setValidationError('Please provide a Primary Product Image URL in Section 3 before publishing.');
      setActiveSection(3);
      return;
    }

    // 4. Validate Manual Size Selection when size/option model is active
    if (finalStatus === 'published' && variantType !== 'none' && pAvailableSizes.length === 0) {
      setValidationError(
        'Please manually select at least one available size/option in Section 4, or switch the Purchase Option Model to "No Sizes / Single Unit" if sizes are not applicable.'
      );
      setActiveSection(4);
      return;
    }

    // 5. Validate any Template Specification Field explicitly marked as Required by the admin
    if (finalStatus === 'published') {
      const missingRequiredField = currentTemplate.fields.find((f) => {
        if (!f.required) return false;
        const v = specValues[f.key];
        return v === undefined || v === null || String(v).trim() === '';
      });
      if (missingRequiredField) {
        setValidationError(
          `The field "${missingRequiredField.label}" is marked as required in this category template (Section 5).`
        );
        setActiveSection(5);
        return;
      }
    }

    // 6. Validate Base Price
    const numericPrice = parseFloat(pPrice);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setValidationError('Please enter a valid Base Retail Price (greater than 0) in Section 7.');
      setActiveSection(7);
      return;
    }

    const numericSalePrice = parseFloat(pSalePrice);
    const validSalePrice =
      !Number.isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice
        ? numericSalePrice
        : undefined;

    const numericStock = parseInt(pBaseStock, 10);
    const validStock = !Number.isNaN(numericStock) && numericStock >= 0 ? numericStock : 20;

    // Build structured specifications array ONLY from non-empty template fields + custom fields
    const finalStructuredSpecs: StructuredSpecification[] = [];

    currentTemplate.fields.forEach((f) => {
      const val = specValues[f.key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const displayValue = Array.isArray(val) ? val.join(', ') : val;
        if (String(displayValue).trim() !== '') {
          finalStructuredSpecs.push({
            key: f.key,
            label: f.label,
            value: displayValue,
            unit: f.unit,
            inputType: f.inputType || f.type,
            isVisibleOnStorefront:
              f.isVisibleOnStorefront !== false && f.visibleToCustomers !== false,
            visibleToCustomers:
              f.isVisibleOnStorefront !== false && f.visibleToCustomers !== false,
            isCustom: false,
          });
        }
      }
    });

    customSpecs.forEach((cs) => {
      if (cs.value !== undefined && cs.value !== null && String(cs.value).trim() !== '') {
        finalStructuredSpecs.push(cs);
      }
    });

    // Final sizes: strictly what the admin manually selected (never auto-filled!)
    const finalSizes = variantType === 'none' ? [] : [...pAvailableSizes];

    // Build sizeStock map for variants (accurately reflects updated stock, including 0 stock)
    const buildSizeStock = (
      totalStock: number,
      existingSizeStock?: Record<string, number>,
      forceRecalculate?: boolean
    ) => {
      if (finalSizes.length === 0) return undefined;
      const map: Record<string, number> = {};
      if (totalStock <= 0) {
        finalSizes.forEach((sz) => {
          map[sz] = 0;
        });
        return map;
      }
      const perSize = Math.max(1, Math.floor(totalStock / finalSizes.length));
      finalSizes.forEach((sz) => {
        map[sz] =
          !forceRecalculate && existingSizeStock && existingSizeStock[sz] !== undefined
            ? existingSizeStock[sz]
            : perSize;
      });
      return map;
    };

    const allProductImages = [
      ...(pPrimaryImage.trim() ? [pPrimaryImage.trim()] : []),
      ...pAdditionalImages.filter((u) => u.trim() !== ''),
    ];

    const previousBasePrice = editingProduct?.price;
    const previousSalePrice = editingProduct?.salePrice;
    const previousFirstStock = editingProduct?.variants?.[0]?.stock;
    const baseStockChanged =
      editingProduct !== null &&
      previousFirstStock !== undefined &&
      validStock !== previousFirstStock;

    // Prepare variants:
    // If admin explicitly added color variants or entered pCustomColors, use those.
    // Otherwise create an internal carrier variant marked isUnconfiguredDefault: 'true' so the storefront does NOT show a fake color swatch.
    const finalVariants: ProductVariant[] =
      pVariants.length > 0
        ? pVariants.map((v, idx) => {
            // Update variant price if it matched the old base price or wasn't overridden
            const effectiveVarPrice =
              !v.price || v.price <= 0 || (previousBasePrice !== undefined && v.price === previousBasePrice)
                ? numericPrice
                : v.price;

            // Update variant salePrice if product salePrice was updated or cleared
            const effectiveVarSalePrice =
              validSalePrice !== undefined && validSalePrice < effectiveVarPrice
                ? validSalePrice
                : validSalePrice === undefined &&
                  previousSalePrice !== undefined &&
                  v.salePrice === previousSalePrice
                ? undefined
                : v.salePrice && v.salePrice > 0 && v.salePrice < effectiveVarPrice
                ? v.salePrice
                : undefined;

            // Update variant stock if base stock in Section 7 was edited
            const effectiveVarStock =
              baseStockChanged && (idx === 0 || pVariants.length === 1)
                ? validStock
                : v.stock >= 0
                ? v.stock
                : validStock;

            // Update primary variant images if Section 3 primary/additional images were updated
            const effectiveVarImages =
              idx === 0 && allProductImages.length > 0
                ? allProductImages
                : v.images && v.images.length > 0
                ? v.images
                : allProductImages;

            return {
              ...v,
              price: effectiveVarPrice,
              salePrice: effectiveVarSalePrice,
              stock: effectiveVarStock,
              sizeStock: buildSizeStock(
                effectiveVarStock,
                v.sizeStock,
                baseStockChanged || effectiveVarStock === 0
              ),
              images: effectiveVarImages,
            };
          })
        : [
            {
              id: editingProduct?.variants?.[0]?.id || `var_${Date.now()}`,
              colorName: pCustomColors.trim() || '',
              colorCode: '#192E4D',
              images: allProductImages,
              sku: pSku.trim() || `ZD-${Date.now().toString().slice(-5)}`,
              price: numericPrice,
              salePrice: validSalePrice,
              stock: validStock,
              sizeStock: buildSizeStock(
                validStock,
                editingProduct?.variants?.[0]?.sizeStock,
                true
              ),
              attributes: pCustomColors.trim()
                ? undefined
                : { isUnconfiguredDefault: 'true' },
            },
          ];

    // Build clean specifications object (only non-empty entries)
    const cleanSpecificationsMap: Record<string, string> = {};
    if (pFabric.trim()) cleanSpecificationsMap.Fabric = pFabric.trim();
    if (pCareInstructions.trim()) cleanSpecificationsMap.Care = pCareInstructions.trim();

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      name: pName.trim(),
      brand: pBrand.trim(),
      description: pDesc.trim(),
      mainCategoryId: pMainCat,
      subCategoryId: pSubCat || '',
      subSubCategoryId: pSubSubCat || undefined,
      price: numericPrice,
      salePrice: validSalePrice,
      rating: editingProduct?.rating ?? 5.0,
      reviewCount: editingProduct?.reviewCount ?? 0,
      featured: pFeatured,
      trending: pTrending,
      newArrival: pNewArrival,
      bestSeller: pBestSeller,
      tags: [
        ...(pBrand.trim() ? [pBrand.trim().toLowerCase()] : []),
        ...(variantType !== 'none' ? [variantType] : []),
      ],
      specifications: cleanSpecificationsMap,
      sizes: finalSizes,
      variantType,
      status: finalStatus,
      shippingEligible: pShippingEligible,
      returnEligible: pReturnEligible,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      variants: finalVariants,
      additionalImages: pAdditionalImages.length > 0 ? pAdditionalImages : undefined,
      sizeChartImage: pSizeChartImage.trim() || undefined,
      careImage: pCareImage.trim() || undefined,
      // Optional specification fields saved ONLY when explicitly entered by the admin
      style: (pStyle.trim() || specValues.style || '').trim() || undefined,
      styleName: (pStyleName.trim() || specValues.style_name || '').trim() || undefined,
      styleNumber: (pStyleNumber.trim() || specValues.style_number || '').trim() || undefined,
      fabric: (pFabric.trim() || specValues.fabric || '').trim() || undefined,
      gsm: (pGsm.trim() || specValues.gsm || '').trim() || undefined,
      ratio: (pRatio.trim() || specValues.ratio || '').trim() || undefined,
      accessories: (pAccessories.trim() || specValues.accessories || '').trim() || undefined,
      accessoriesIncluded:
        (pAccessories.trim() || specValues.accessories || '').trim() || undefined,
      packaging: (pPackaging.trim() || specValues.packaging || '').trim() || undefined,
      packagingDetails: (pPackaging.trim() || specValues.packaging || '').trim() || undefined,
      customColors:
        (pCustomColors.trim() || specValues.colors_description || '').trim() || undefined,
      colorsDescription:
        (pCustomColors.trim() || specValues.colors_description || '').trim() || undefined,
      countryOfOrigin:
        (pCountryOfOrigin.trim() || specValues.country_of_origin || '').trim() || undefined,
      manufacturer:
        (pManufacturer.trim() || specValues.manufacturer || '').trim() || undefined,
      careInstructions:
        (pCareInstructions.trim() || specValues.care_instructions || '').trim() || undefined,
      structuredSpecifications: finalStructuredSpecs,
    };

    const result = await saveProduct(productPayload);
    if (!result.success) {
      setValidationError(result.error || 'Failed to save product to Firebase database.');
      return;
    }

    onSaveSuccess(
      editingProduct
        ? `Product "${productPayload.name}" updated and synced to Firebase!`
        : `Product "${productPayload.name}" saved and published to Firebase!`
    );
    onClose();
  };

  if (!isOpen) return null;

  const sectionsList = [
    { num: 1, title: 'Basic Information' },
    { num: 2, title: 'Category & Type' },
    { num: 3, title: 'Product Images' },
    { num: 4, title: 'Variants & Sizes' },
    { num: 5, title: 'Category Specs' },
    { num: 6, title: 'Custom Specs' },
    { num: 7, title: 'Pricing & Stock' },
    { num: 8, title: 'Shipping & Pack' },
    { num: 9, title: 'Display Settings' },
    { num: 10, title: 'Preview & Save' },
  ];

  const nonEmptySpecCount =
    Object.values(specValues).filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
      .length +
    [
      pStyle,
      pStyleName,
      pStyleNumber,
      pFabric,
      pGsm,
      pRatio,
      pAccessories,
      pPackaging,
      pCustomColors,
      pCountryOfOrigin,
      pManufacturer,
      pCareInstructions,
    ].filter((s) => s.trim() !== '').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl my-4 text-xs text-left max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 bg-[#192E4D] text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-extrabold text-white">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product & Variants'}
              </h2>
              <p className="text-[11px] text-teal-300 font-mono">
                {pMainCat
                  ? `Template: ${currentTemplate.name || currentTemplate.categoryName} • All Spec Fields Optional`
                  : 'Fresh Blank Form • Select a Category in Step 2 to Load Specification Fields'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editingProduct && (
              <button
                type="button"
                onClick={resetToBlankNewProduct}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear all unsaved inputs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Form</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECTION NAV TABS */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-[#E6EAF0] overflow-x-auto shrink-0 scrollbar-none">
          {sectionsList.map((sec) => (
            <button
              key={sec.num}
              type="button"
              onClick={() => setActiveSection(sec.num)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === sec.num
                  ? 'bg-[#08A9A2] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-[#192E4D] border border-[#E6EAF0]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                {sec.num}
              </span>
              <span>{sec.title}</span>
            </button>
          ))}
        </div>

        {/* VALIDATION ERROR BANNER */}
        {validationError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: BASIC PRODUCT INFORMATION */}
          {activeSection === 1 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">Section 1: Basic Product Information</h3>
                <p className="text-xs text-[#697586]">
                  Enter the product title and optional brand or description. All fields start blank.
                </p>
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => {
                    setPName(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="Enter product name..."
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Brand Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    placeholder="Enter brand name..."
                    className="w-full h-10 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Base SKU / Product Code <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    placeholder="Enter SKU or style code..."
                    className="w-full h-10 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-[#08A9A2]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">
                  Product Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Enter product description (leave blank if not needed)..."
                  className="w-full p-3 border border-[#E6EAF0] rounded-xl text-xs focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>
            </div>
          )}

          {/* SECTION 2: CATEGORY & PRODUCT TYPE */}
          {activeSection === 2 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">Section 2: Category and Product Type</h3>
                <p className="text-xs text-[#697586]">
                  Select the product category. The form dynamically loads the relevant specification fields for the selected category without auto-filling any values.
                </p>
              </div>

              {categoryChangeWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Category Change Notice</span>
                  </div>
                  <p>{categoryChangeWarning}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCategoryChangeWarning(null)}
                      className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-gray-700 cursor-pointer"
                    >
                      Keep Current
                    </button>
                    {pendingMainCat !== null && (
                      <button
                        type="button"
                        onClick={() => applyMainCategoryChange(pendingMainCat)}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer"
                      >
                        Confirm Switch
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Level 1: Main Category */}
                  <div>
                    <label className="font-bold text-[#192E4D] block mb-1 text-[11px]">
                      Level 1: Main Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={pMainCat}
                      onChange={(e) => handleMainCategoryChange(e.target.value)}
                      className="w-full h-10 px-2.5 border border-[#E6EAF0] rounded-xl bg-white text-xs font-bold text-[#192E4D] focus:outline-hidden focus:border-[#08A9A2]"
                    >
                      <option value="">-- Select Main Category --</option>
                      {mainCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level 2: Subcategory */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#192E4D] text-[11px]">
                        Level 2: Subcategory
                      </label>
                      {pMainCat && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuickCategoryLevel('sub');
                            setShowQuickCategoryModal(true);
                          }}
                          className="text-[10px] text-[#08A9A2] font-bold hover:underline cursor-pointer"
                        >
                          + Add Sub
                        </button>
                      )}
                    </div>
                    <select
                      value={pSubCat}
                      disabled={!pMainCat}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      className="w-full h-10 px-2.5 border border-[#E6EAF0] rounded-xl bg-white text-xs font-bold text-[#192E4D] focus:outline-hidden focus:border-[#08A9A2] disabled:opacity-50"
                    >
                      <option value="">-- Select Subcategory --</option>
                      {subCategories
                        .filter((s) => s.mainCategoryId === pMainCat)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Level 3: Child Category */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#192E4D] text-[11px]">
                        Level 3: Child Category
                      </label>
                      {pSubCat && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuickCategoryLevel('subsub');
                            setShowQuickCategoryModal(true);
                          }}
                          className="text-[10px] text-[#F20D58] font-bold hover:underline cursor-pointer"
                        >
                          + Add Child
                        </button>
                      )}
                    </div>
                    <select
                      value={pSubSubCat}
                      disabled={!pSubCat}
                      onChange={(e) => handleChildCategoryChange(e.target.value)}
                      className="w-full h-10 px-2.5 border border-[#E6EAF0] rounded-xl bg-white text-xs font-bold text-[#192E4D] focus:outline-hidden focus:border-[#08A9A2] disabled:opacity-50"
                    >
                      <option value="">(None / General)</option>
                      {subSubCategories
                        .filter((ss) => ss.subCategoryId === pSubCat)
                        .map((ss) => (
                          <option key={ss.id} value={ss.id}>
                            {ss.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {pMainCat && (
                  <div className="p-3 bg-white rounded-xl border border-teal-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#08A9A2]" />
                      <span className="font-bold text-[#192E4D]">Loaded Specification Template:</span>
                      <span className="text-[#08A9A2] font-black">
                        {currentTemplate.name || currentTemplate.categoryName}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {currentTemplate.fields.length} Configurable Fields
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: PRODUCT IMAGES */}
          {activeSection === 3 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">Section 3: Product Images & Visual Guides</h3>
                <p className="text-xs text-[#697586]">
                  Provide the primary product image URL and any optional gallery, size chart, or care guide images.
                </p>
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">
                  Primary Product Image URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={pPrimaryImage}
                    onChange={(e) => {
                      setPPrimaryImage(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="https://..."
                    className="flex-1 h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono font-semibold"
                  />
                  {pPrimaryImage.trim() && (
                    <img
                      src={pPrimaryImage}
                      alt="Primary Preview"
                      className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                    />
                  )}
                </div>
              </div>

              {/* Additional Gallery Images */}
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">
                  Additional Gallery Images <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={additionalImageInput}
                    onChange={(e) => setAdditionalImageInput(e.target.value)}
                    placeholder="https://... additional angle photo"
                    className="flex-1 h-9 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (additionalImageInput.trim()) {
                        setPAdditionalImages([...pAdditionalImages, additionalImageInput.trim()]);
                        setAdditionalImageInput('');
                      }
                    }}
                    className="px-3.5 h-9 bg-[#192E4D] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Add Image
                  </button>
                </div>
                {pAdditionalImages.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {pAdditionalImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPAdditionalImages(pAdditionalImages.filter((_, idx) => idx !== i))
                          }
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Size Chart Diagram Image <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={pSizeChartImage}
                    onChange={(e) => setPSizeChartImage(e.target.value)}
                    placeholder="https://... size-chart.jpg"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Fabric & Care Guide Image <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={pCareImage}
                    onChange={(e) => setPCareImage(e.target.value)}
                    placeholder="https://... care-guide.jpg"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PRODUCT VARIANTS AND SIZES */}
          {activeSection === 4 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">Section 4: Product Variants and Sizes</h3>
                <p className="text-xs text-[#697586]">
                  No size or color variant is selected automatically. Manually click each size available for this product, or select "No Sizes / Single Unit" if sizes do not apply.
                </p>
              </div>

              {/* Variant option type selection */}
              <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#192E4D] block text-xs">Purchase Option Model</label>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    {pAvailableSizes.length} Option(s) Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'clothing_sizes', label: 'Clothing Sizes (S, M, L, XL...)' },
                    { id: 'age_sizes', label: 'Age Sizes (2-3Y, 3-4Y...)' },
                    { id: 'shoe_sizes', label: 'Shoe Sizes (UK 6, 7, 8...)' },
                    { id: 'volume_ml', label: 'Bottle Volume (30ml, 50ml, 100ml)' },
                    { id: 'custom_sizes', label: 'Custom Selectable Options' },
                    { id: 'none', label: 'No Sizes / Single Unit' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setVariantType(opt.id as VariantOptionType);
                        // Clear selected sizes when switching option model — never auto-select!
                        setPAvailableSizes([]);
                        setValidationError(null);
                      }}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        variantType === opt.id
                          ? 'bg-[#08A9A2] text-white border-[#08A9A2] shadow-xs'
                          : 'bg-white text-[#192E4D] border-[#E6EAF0] hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Manual Multi-Select Size / Option Buttons */}
                {variantType !== 'none' && (
                  <div className="pt-2 space-y-2.5 border-t border-[#E6EAF0]">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#192E4D] block text-xs">
                        Manually Select Available Sizes / Options:
                      </label>
                      {pAvailableSizes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPAvailableSizes([])}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear All Selected
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {candidateSizes.map((sz) => {
                        const isSelected = pAvailableSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSizeSelection(sz)}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#08A9A2] text-white border-[#08A9A2] shadow-xs'
                                : 'bg-white text-[#192E4D] border-[#E6EAF0] hover:border-[#08A9A2]'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isSelected
                                  ? 'bg-white text-[#08A9A2] border-white'
                                  : 'border-gray-300 bg-gray-50'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span>{sz}</span>
                            <span className="text-[10px] opacity-75 font-normal">
                              ({isSelected ? 'Selected' : 'Not selected'})
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Add custom size/option input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        placeholder="Add custom size/option (e.g. 4XL, 250ml, 36 in)..."
                        className="w-64 h-9 px-3 text-xs border border-gray-300 rounded-xl bg-white font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customSizeInput.trim();
                          if (val) {
                            if (!customCandidateSizes.includes(val)) {
                              setCustomCandidateSizes([...customCandidateSizes, val]);
                            }
                            if (!pAvailableSizes.includes(val)) {
                              setPAvailableSizes([...pAvailableSizes, val]);
                            }
                            setCustomSizeInput('');
                          }
                        }}
                        className="px-3.5 h-9 bg-[#192E4D] text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + Add & Select Option
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Variants List with independent images */}
              <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-[#192E4D] text-xs uppercase tracking-wider">
                      Color Variants ({pVariants.length} Configured)
                    </h4>
                    <p className="text-[11px] text-[#697586]">
                      Optional: Add selectable color variants with their own images, SKU, price, and stock. Leave empty if this product does not have separate color variants.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddColorModal}
                    className="px-3 py-1.5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Color Variant</span>
                  </button>
                </div>

                {pVariants.length === 0 ? (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                    No separate color variants configured. You can add color variants above or specify a general color description (such as "Mix Colour Only") in Section 5.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pVariants.map((v, idx) => (
                      <div
                        key={v.id || idx}
                        className="p-3 bg-white rounded-xl border border-[#E6EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md shrink-0"
                            style={{ backgroundColor: v.colorCode }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#192E4D]">{v.colorName}</span>
                              {v.sku && (
                                <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                  {v.sku}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#697586] mt-0.5">
                              <span>Stock: {v.stock} pcs</span>
                              {v.price > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-[#08A9A2]">₹{v.price}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                          {v.images.map((img, i) => (
                            <img key={i} src={img} alt="" className="w-8 h-8 object-cover rounded-lg border" />
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => openEditColorModal(idx)}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#08A9A2] font-bold text-xs hover:bg-teal-100 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(idx)}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: CATEGORY-SPECIFIC SPECIFICATIONS */}
          {activeSection === 5 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#192E4D]">
                    Section 5: Category-Specific Specifications (
                    {pMainCat
                      ? currentTemplate.name || currentTemplate.categoryName
                      : 'General Specifications'}
                    )
                  </h3>
                  <p className="text-xs text-[#697586]">
                    All optional specification fields start empty. Enter only the details applicable to this product; empty fields are automatically hidden on the customer page.
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 shrink-0">
                  Blank by Default
                </span>
              </div>

              {/* Dynamic rendering of template fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentTemplate.fields.map((field) => {
                  const currentValue = specValues[field.key] ?? '';
                  const fType = field.inputType || field.type || 'text';
                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#192E4D] text-xs">
                          {field.label}{' '}
                          {field.unit && (
                            <span className="text-gray-400 font-normal">({field.unit})</span>
                          )}
                          {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                        </label>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {field.required ? '(Required)' : '(Optional)'}
                        </span>
                      </div>

                      {fType === 'select' && field.options ? (
                        <select
                          value={currentValue}
                          onChange={(e) =>
                            setSpecValues({ ...specValues, [field.key]: e.target.value })
                          }
                          className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold bg-white"
                        >
                          <option value="">-- Select (Optional) --</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (fType === 'multi-select' || fType === 'multiselect') &&
                        field.options ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {field.options.map((opt) => {
                            const selectedArr: string[] = Array.isArray(currentValue)
                              ? currentValue
                              : typeof currentValue === 'string' && currentValue
                              ? currentValue.split(',').map((s) => s.trim())
                              : [];
                            const isPicked = selectedArr.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const next = isPicked
                                    ? selectedArr.filter((i) => i !== opt)
                                    : [...selectedArr, opt];
                                  setSpecValues({
                                    ...specValues,
                                    [field.key]: next.join(', '),
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                                  isPicked
                                    ? 'bg-[#08A9A2] text-white border-[#08A9A2]'
                                    : 'bg-white text-gray-700 border-gray-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : fType === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={currentValue}
                          onChange={(e) =>
                            setSpecValues({ ...specValues, [field.key]: e.target.value })
                          }
                          placeholder={field.placeholder || field.description || ''}
                          className="w-full p-2.5 border border-[#E6EAF0] rounded-xl text-xs"
                        />
                      ) : fType === 'boolean' ? (
                        <select
                          value={currentValue === true ? 'Yes' : currentValue === false ? 'No' : String(currentValue)}
                          onChange={(e) =>
                            setSpecValues({ ...specValues, [field.key]: e.target.value })
                          }
                          className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold bg-white"
                        >
                          <option value="">-- Not Specified --</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <input
                          type={fType === 'number' ? 'number' : 'text'}
                          value={currentValue}
                          onChange={(e) =>
                            setSpecValues({ ...specValues, [field.key]: e.target.value })
                          }
                          placeholder={field.placeholder || field.description || ''}
                          className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Direct Core Specification Fields (All Optional & Blank by Default) */}
              <div className="p-3.5 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-3 mt-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Direct Product Specification Fields (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Style / Style Description
                    </label>
                    <input
                      type="text"
                      value={pStyle}
                      onChange={(e) => setPStyle(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Style Number
                    </label>
                    <input
                      type="text"
                      value={pStyleNumber}
                      onChange={(e) => setPStyleNumber(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Fabric</label>
                    <input
                      type="text"
                      value={pFabric}
                      onChange={(e) => setPFabric(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">GSM</label>
                    <input
                      type="text"
                      value={pGsm}
                      onChange={(e) => setPGsm(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Ratio</label>
                    <input
                      type="text"
                      value={pRatio}
                      onChange={(e) => setPRatio(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Colors Description
                    </label>
                    <input
                      type="text"
                      value={pCustomColors}
                      onChange={(e) => setPCustomColors(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Accessories Included
                    </label>
                    <input
                      type="text"
                      value={pAccessories}
                      onChange={(e) => setPAccessories(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Packaging Details
                    </label>
                    <input
                      type="text"
                      value={pPackaging}
                      onChange={(e) => setPPackaging(e.target.value)}
                      placeholder="Leave blank if not applicable"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: CUSTOM SPECIFICATIONS BUILDER */}
          {activeSection === 6 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 6: Additional Custom Specifications (Optional)
                </h3>
                <p className="text-xs text-[#697586]">
                  Add custom key-value specification rows unique to this product.
                </p>
              </div>

              {/* Add Custom Spec Form */}
              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
                <span className="text-xs font-bold text-[#192E4D] block">
                  + Add Custom Specification Row
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newCustomLabel}
                    onChange={(e) => setNewCustomLabel(e.target.value)}
                    placeholder="Field Name"
                    className="h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={newCustomValue}
                    onChange={(e) => setNewCustomValue(e.target.value)}
                    placeholder="Field Value"
                    className="h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomUnit}
                      onChange={(e) => setNewCustomUnit(e.target.value)}
                      placeholder="Unit (optional)"
                      className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSpec}
                      className="px-3.5 h-9 bg-[#08A9A2] hover:bg-[#079690] text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* List of custom specs */}
              <div className="space-y-2">
                {customSpecs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">
                    No custom specifications added for this product.
                  </p>
                ) : (
                  customSpecs.map((cs) => (
                    <div
                      key={cs.key}
                      className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#192E4D]">{cs.label}:</span>
                        <span className="text-gray-700">{cs.value}</span>
                        {cs.unit && <span className="text-gray-400">({cs.unit})</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSpecVisibility(cs.key)}
                          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                            cs.isVisibleOnStorefront !== false
                              ? 'text-teal-700 bg-teal-50'
                              : 'text-gray-400 bg-gray-100'
                          }`}
                          title="Toggle customer visibility"
                        >
                          {cs.isVisibleOnStorefront !== false ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomSpec(cs.key)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECTION 7: PRICING & INVENTORY */}
          {activeSection === 7 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">Section 7: Pricing & Inventory Control</h3>
                <p className="text-xs text-[#697586]">
                  Enter the product price (₹) and available inventory stock.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Base Retail Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pPrice}
                    onChange={(e) => {
                      setPPrice(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="Enter price in ₹"
                    className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-sm font-bold text-[#192E4D]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Promotional Sale Price (₹) <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pSalePrice}
                    onChange={(e) => setPSalePrice(e.target.value)}
                    placeholder="Optional discounted price"
                    className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-sm font-bold text-teal-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Available Inventory Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pBaseStock}
                    onChange={(e) => setPBaseStock(e.target.value)}
                    placeholder="Enter total stock qty"
                    className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-sm font-bold text-[#192E4D]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: SHIPPING & PACKAGING */}
          {activeSection === 8 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 8: Shipping, Packaging & Compliance (Optional)
                </h3>
                <p className="text-xs text-[#697586]">
                  All fields below are optional and start blank.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Packaging Details <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pPackaging}
                    onChange={(e) => setPPackaging(e.target.value)}
                    placeholder="Leave blank if not specified"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Country of Origin <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pCountryOfOrigin}
                    onChange={(e) => setPCountryOfOrigin(e.target.value)}
                    placeholder="Leave blank if not specified"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Manufacturer Details <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pManufacturer}
                    onChange={(e) => setPManufacturer(e.target.value)}
                    placeholder="Leave blank if not specified"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">
                    Care Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pCareInstructions}
                    onChange={(e) => setPCareInstructions(e.target.value)}
                    placeholder="Leave blank if not specified"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pShippingEligible}
                    onChange={(e) => setPShippingEligible(e.target.checked)}
                    className="rounded text-[#08A9A2]"
                  />
                  <span className="font-bold text-xs text-[#192E4D]">Express Shipping Eligible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pReturnEligible}
                    onChange={(e) => setPReturnEligible(e.target.checked)}
                    className="rounded text-[#08A9A2]"
                  />
                  <span className="font-bold text-xs text-[#192E4D]">Return Policy Eligible</span>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 9: CUSTOMER DISPLAY SETTINGS */}
          {activeSection === 9 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 9: Customer Display Badges & Status
                </h3>
                <p className="text-xs text-[#697586]">
                  Choose optional promotional badges and publication visibility.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPFeatured(!pFeatured)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                    pFeatured
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  Featured ★
                </button>
                <button
                  type="button"
                  onClick={() => setPTrending(!pTrending)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                    pTrending
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  Trending 🔥
                </button>
                <button
                  type="button"
                  onClick={() => setPNewArrival(!pNewArrival)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                    pNewArrival
                      ? 'bg-teal-50 text-teal-800 border-teal-300'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  New Arrival ✨
                </button>
                <button
                  type="button"
                  onClick={() => setPBestSeller(!pBestSeller)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                    pBestSeller
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  Best Seller 🏆
                </button>
              </div>

              <div className="pt-2">
                <label className="font-bold text-[#192E4D] block mb-1">Publication Status</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={pStatus === 'published'}
                      onChange={() => setPStatus('published')}
                    />
                    <span className="font-bold text-emerald-700">
                      Published (Visible to all shoppers)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={pStatus === 'draft'}
                      onChange={() => setPStatus('draft')}
                    />
                    <span className="font-bold text-gray-500">Draft (Hidden from catalog)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: PREVIEW & PUBLISH */}
          {activeSection === 10 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 10: Summary & Confirmation
                </h3>
                <p className="text-xs text-[#697586]">
                  Review only the information explicitly entered for this product before saving.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-4">
                  {pPrimaryImage.trim() ? (
                    <img
                      src={pPrimaryImage}
                      alt="Preview"
                      className="w-20 h-24 object-cover rounded-xl border bg-white"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 text-center p-1">
                      No Image Set
                    </div>
                  )}
                  <div className="space-y-1">
                    {pBrand.trim() && (
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                        {pBrand}
                      </span>
                    )}
                    <h4 className="text-sm font-extrabold text-[#192E4D]">
                      {pName.trim() || 'No Product Title Entered'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#192E4D]">
                        {pPrice ? `₹${pPrice}` : 'Price Not Entered'}
                      </span>
                      {pSalePrice && parseFloat(pSalePrice) < parseFloat(pPrice || '0') && (
                        <span className="text-xs text-teal-700 font-bold">
                          (Sale: ₹{pSalePrice})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {pMainCat
                        ? `Template: ${currentTemplate.name || currentTemplate.categoryName} • Option Type: ${variantType.replace('_', ' ')}`
                        : 'Category Not Selected'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Color Variants:</span>
                    <span className="font-bold">
                      {pVariants.length > 0
                        ? pVariants.map((v) => v.colorName).join(', ')
                        : pCustomColors.trim() || 'None configured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Selected Sizes:</span>
                    <span className="font-bold">
                      {variantType === 'none'
                        ? 'Single Unit (No sizes)'
                        : pAvailableSizes.length > 0
                        ? pAvailableSizes.join(', ')
                        : 'None selected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Entered Specs:</span>
                    <span className="font-bold">{nonEmptySpecCount} field(s)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Custom Specs:</span>
                    <span className="font-bold">{customSpecs.length} row(s)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-[#E6EAF0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {activeSection > 1 && (
              <button
                type="button"
                onClick={() => setActiveSection((s) => s - 1)}
                className="px-3.5 py-2 rounded-xl border border-gray-300 font-bold text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Previous
              </button>
            )}
            {activeSection < 10 && (
              <button
                type="button"
                onClick={() => setActiveSection((s) => s + 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 font-bold text-xs text-[#192E4D] hover:bg-slate-300 cursor-pointer"
              >
                Next Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleFormSubmit('draft')}
              className="px-4 py-2 rounded-xl border border-[#08A9A2] text-[#08A9A2] hover:bg-teal-50 font-bold text-xs transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleFormSubmit('published')}
              className="px-5 py-2 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {editingProduct ? 'Save & Update Product' : 'Publish to Catalog'}
            </button>
          </div>
        </div>

        {/* SUB-MODAL: COLOR VARIANT EDITOR */}
        {showColorModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-[#192E4D] text-sm">
                  {editingVariantIndex !== null ? 'Edit Color Variant' : 'Add Color Variant'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {colorModalError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                  {colorModalError}
                </div>
              )}

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Color Name *</label>
                <input
                  type="text"
                  value={vColorName}
                  onChange={(e) => {
                    setVColorName(e.target.value);
                    setColorModalError(null);
                  }}
                  placeholder="Enter color name (e.g. Black, Navy Blue)"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">Color Swatch</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={vColorCode}
                      onChange={(e) => setVColorCode(e.target.value)}
                      className="w-9 h-9 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={vColorCode}
                      onChange={(e) => setVColorCode(e.target.value)}
                      className="w-full h-9 px-2 border rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">Variant Price (₹)</label>
                  <input
                    type="number"
                    value={vPrice}
                    onChange={(e) => setVPrice(e.target.value)}
                    placeholder={pPrice || 'Base price'}
                    className="w-full h-9 px-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">SKU (Optional)</label>
                  <input
                    type="text"
                    value={vSku}
                    onChange={(e) => setVSku(e.target.value)}
                    placeholder="Optional variant SKU"
                    className="w-full h-9 px-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">Variant Stock</label>
                  <input
                    type="number"
                    value={vStock}
                    onChange={(e) => setVStock(e.target.value)}
                    placeholder="Stock qty"
                    className="w-full h-9 px-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* Photos for this color */}
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">
                  Photos for this Color ({vImages.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={vImageUrlInput}
                    onChange={(e) => setVImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 h-9 px-2 border rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (vImageUrlInput.trim()) {
                        setVImages([...vImages, vImageUrlInput.trim()]);
                        setVImageUrlInput('');
                      }
                    }}
                    className="px-3 h-9 bg-[#192E4D] text-white rounded-lg font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {vImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => setVImages(vImages.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="px-3 py-1.5 rounded-lg text-gray-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveColorVariant}
                  className="px-4 py-1.5 bg-[#08A9A2] text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Color
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK CATEGORY CREATION MODAL */}
        <CategoryModal
          isOpen={showQuickCategoryModal}
          onClose={() => setShowQuickCategoryModal(false)}
          initialLevel={quickCategoryLevel}
          initialParentMainId={pMainCat}
          initialParentSubId={pSubCat}
        />
      </div>
    </div>
  );
};
