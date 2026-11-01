import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Product,
  ProductColor,
  ProductVariant,
  StructuredSpecification,
  VariantOptionType,
  VariantStockCombination,
} from '../../types';
import { getCategoryTemplate, getDefaultSizesForVariantType } from '../../data/categoryTemplates';
import { formatCombinationSku } from '../../lib/commerceLogic';
import {
  extractAndNormalizeImageUrls,
  normalizeSingleImageUrl,
  reconstructAndNormalizeImageList,
} from '../../services/firestoreSync';
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
  Star,
  ChevronLeft,
  ChevronRight,
  Palette,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Jet Black', hex: '#000000' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#192E4D' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Maroon', hex: '#831843' },
  { name: 'Forest Green', hex: '#16A34A' },
  { name: 'Olive Green', hex: '#65A30D' },
  { name: 'Golden Yellow', hex: '#EAB308' },
  { name: 'Warm Orange', hex: '#EA580C' },
  { name: 'Lavender Purple', hex: '#9333EA' },
  { name: 'Blush Pink', hex: '#EC4899' },
  { name: 'Teal Green', hex: '#0D9488' },
  { name: 'Sand Beige', hex: '#D4B996' },
  { name: 'Charcoal Grey', hex: '#4B5563' },
];

const SAMPLE_IMAGE_SETS = [
  {
    label: "Men's Apparel",
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    label: 'Jackets & Outerwear',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    label: 'Footwear & Sneakers',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

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
    orders,
  } = useApp();

  // Active section tab (1 to 11)
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

  // SECTION 3: COMMON PRODUCT IMAGES (Belongs to entire product common gallery, NOT to individual colors)
  const [pPrimaryImage, setPPrimaryImage] = useState('');
  const [pGalleryImages, setPGalleryImages] = useState<string[]>([]);
  const [galleryImageInput, setGalleryImageInput] = useState('');
  const [bulkImageInput, setBulkImageInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({});
  const [pSizeChartImage, setPSizeChartImage] = useState('');
  const [pCareImage, setPCareImage] = useState('');

  // SECTION 4: PRODUCT COLORS (Independent section, NOT linked to images)
  const [pColors, setPColors] = useState<ProductColor[]>([]);
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [cNameInput, setCNameInput] = useState('');
  const [cHexInput, setCHexInput] = useState('#192E4D');
  const [colorModalError, setColorModalError] = useState<string | null>(null);

  // SECTION 5: SIZES & COMBINATION INVENTORY
  const [variantType, setVariantType] = useState<VariantOptionType>('clothing_sizes');
  const [pAvailableSizes, setPAvailableSizes] = useState<string[]>([]);
  const [customCandidateSizes, setCustomCandidateSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Colour + Size combination inventory state keyed by `${colorId}__${sizeKey}`
  const [combinationInventory, setCombinationInventory] = useState<
    Record<string, { sku: string; stockQuantity: string; isActive: boolean }>
  >({});
  const [bulkStockFillInput, setBulkStockFillInput] = useState<string>('');
  const [pendingRemovalWarning, setPendingRemovalWarning] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

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

  // SECTION 7: PRICING (Blank by default for new products; inventory is derived from Colour + Size combinations)
  const [pPrice, setPPrice] = useState<string>('');
  const [pSalePrice, setPSalePrice] = useState<string>('');

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
    setPendingRemovalWarning(null);

    // Section 1: Blank
    setPName('');
    setPBrand('');
    setPSku('');
    setPDesc('');

    // Section 2: Blank until selected by admin
    setPMainCat('');
    setPSubCat('');
    setPSubSubCat('');

    // Section 3: Blank common image gallery
    setPPrimaryImage('');
    setPGalleryImages([]);
    setGalleryImageInput('');
    setBulkImageInput('');
    setShowBulkInput(false);
    setFailedImageUrls({});
    setPSizeChartImage('');
    setPCareImage('');

    // Section 4: Blank decoupled product colors
    setPColors([]);
    setShowColorModal(false);
    setEditingColorIndex(null);
    setCNameInput('');
    setCHexInput('#192E4D');
    setColorModalError(null);

    // Section 5: No automatic size or variant selection!
    setVariantType('clothing_sizes');
    setPAvailableSizes([]);
    setCustomCandidateSizes([]);
    setCustomSizeInput('');
    setCombinationInventory({});
    setBulkStockFillInput('');

    // Section 6: All optional specifications start completely empty
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

    // Section 7: Custom specs empty
    setCustomSpecs([]);
    setNewCustomLabel('');
    setNewCustomValue('');
    setNewCustomUnit('');

    // Section 8: Pricing blank
    setPPrice('');
    setPSalePrice('');

    // Section 9 & 10: Clean defaults
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
      setPendingRemovalWarning(null);
      setBulkStockFillInput('');

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

      const firstVar = editingProduct.variants?.[0];
      setPSku(firstVar?.sku || '');

      // 1. Gather all existing images into common product image gallery (reconstructing any comma-split fragments)
      const rawCandidateImages: string[] = [];
      if (editingProduct.primaryImage && editingProduct.primaryImage.trim()) {
        rawCandidateImages.push(editingProduct.primaryImage.trim());
      }
      if (Array.isArray(editingProduct.images)) {
        rawCandidateImages.push(...editingProduct.images);
      }
      if (Array.isArray(editingProduct.additionalImages)) {
        rawCandidateImages.push(...editingProduct.additionalImages);
      }
      (editingProduct.variants || []).forEach((v) => {
        if (Array.isArray(v.images)) {
          rawCandidateImages.push(...v.images);
        }
      });
      const allLoadedImages = reconstructAndNormalizeImageList(rawCandidateImages);
      const normalizedPrimary = editingProduct.primaryImage
        ? normalizeSingleImageUrl(editingProduct.primaryImage)
        : '';
      const activePrimary =
        (normalizedPrimary && allLoadedImages.includes(normalizedPrimary)
          ? normalizedPrimary
          : allLoadedImages[0]) || '';
      if (activePrimary && !allLoadedImages.includes(activePrimary)) {
        allLoadedImages.unshift(activePrimary);
      }
      setPPrimaryImage(activePrimary);
      setPGalleryImages(allLoadedImages);
      setGalleryImageInput('');
      setBulkImageInput('');
      setShowBulkInput(false);
      setFailedImageUrls({});
      setPSizeChartImage(editingProduct.sizeChartImage || '');
      setPCareImage(editingProduct.careImage || '');

      // 2. Load decoupled product colors
      const loadedColors: ProductColor[] = [];
      if (Array.isArray(editingProduct.colors) && editingProduct.colors.length > 0) {
        editingProduct.colors.forEach((c, idx) => {
          if (c && c.name && c.name.trim()) {
            loadedColors.push({
              id: c.id || `col_${idx}`,
              name: c.name.trim(),
              hex: c.hex || (c as any).code || '#192E4D',
            });
          }
        });
      } else {
        const configuredVariants = (editingProduct.variants || []).filter(
          (v) =>
            v.attributes?.isUnconfiguredDefault !== 'true' &&
            v.colorName &&
            v.colorName.trim() !== '' &&
            v.colorName.trim().toLowerCase() !== 'standard' &&
            v.colorName.trim().toLowerCase() !== 'default'
        );
        configuredVariants.forEach((v, idx) => {
          if (!loadedColors.some((lc) => lc.name.toLowerCase() === v.colorName.trim().toLowerCase())) {
            loadedColors.push({
              id: v.id || `col_${idx}`,
              name: v.colorName.trim(),
              hex: v.colorCode || '#192E4D',
            });
          }
        });
      }
      setPColors(loadedColors);
      setShowColorModal(false);
      setEditingColorIndex(null);
      setCNameInput('');
      setCHexInput('#192E4D');
      setColorModalError(null);

      // 3. Sizes & Combination Inventory
      const loadedVariantType = editingProduct.variantType || 'clothing_sizes';
      const loadedSizes = editingProduct.sizes ? [...editingProduct.sizes] : [];
      setVariantType(loadedVariantType);
      setPAvailableSizes(loadedSizes);
      setCustomCandidateSizes(loadedSizes);
      setCustomSizeInput('');

      // Load Colour + Size combination inventory from existing product variants & variantCombinations
      const initialComboMap: Record<
        string,
        { sku: string; stockQuantity: string; isActive: boolean }
      > = {};
      const effectiveSizeKeys =
        loadedVariantType === 'none' || loadedSizes.length === 0 ? ['Single Unit'] : loadedSizes;

      const configuredVariants = (editingProduct.variants || []).filter(
        (v) =>
          v.attributes?.isUnconfiguredDefault !== 'true' &&
          v.colorName &&
          v.colorName.trim() !== '' &&
          v.colorName.trim().toLowerCase() !== 'standard' &&
          v.colorName.trim().toLowerCase() !== 'default'
      );

      if (loadedColors.length > 0) {
        loadedColors.forEach((c) => {
          const matchedVariant = configuredVariants.find(
            (v) => v.id === c.id || v.colorName.toLowerCase() === c.name.toLowerCase()
          );
          const disabledSet = new Set(matchedVariant?.disabledSizes || []);
          effectiveSizeKeys.forEach((sz) => {
            const comboKey = `${c.id}__${sz}`;
            // Check saved variantCombinations first
            const savedComb = (editingProduct.variantCombinations || []).find(
              (vc) => (vc.colorId === c.id || vc.colorName.toLowerCase() === c.name.toLowerCase()) && vc.size === sz
            );

            let rawQty = 0;
            if (savedComb && typeof savedComb.stockQuantity === 'number') {
              rawQty = savedComb.stockQuantity;
            } else if (matchedVariant?.sizeStock && matchedVariant.sizeStock[sz] !== undefined) {
              rawQty = matchedVariant.sizeStock[sz];
            } else if (effectiveSizeKeys.length === 1 && matchedVariant?.stock !== undefined) {
              rawQty = matchedVariant.stock;
            }

            const existingSku =
              savedComb?.sku ||
              matchedVariant?.sizeSku?.[sz] ||
              formatCombinationSku(
                matchedVariant?.sku || firstVar?.sku || editingProduct.id,
                c.name,
                sz
              );

            const isComboActive =
              savedComb !== undefined
                ? savedComb.isActive !== false
                : !disabledSet.has(sz) && matchedVariant?.isActive !== false;

            initialComboMap[comboKey] = {
              sku: existingSku,
              stockQuantity: String(Math.max(0, Math.floor(Number(rawQty) || 0))),
              isActive: isComboActive,
            };
          });
        });
      } else if (firstVar) {
        const disabledSet = new Set(firstVar.disabledSizes || []);
        const defaultColorLabel =
          editingProduct.customColors || firstVar.colorName || 'Standard';
        effectiveSizeKeys.forEach((sz) => {
          const comboKey = `default_color__${sz}`;
          const savedComb = (editingProduct.variantCombinations || []).find((vc) => vc.size === sz);
          let rawQty = 0;
          if (savedComb && typeof savedComb.stockQuantity === 'number') {
            rawQty = savedComb.stockQuantity;
          } else if (firstVar.sizeStock && firstVar.sizeStock[sz] !== undefined) {
            rawQty = firstVar.sizeStock[sz];
          } else if (effectiveSizeKeys.length === 1 && firstVar.stock !== undefined) {
            rawQty = firstVar.stock;
          }

          const existingSku =
            savedComb?.sku ||
            firstVar.sizeSku?.[sz] ||
            formatCombinationSku(firstVar.sku || editingProduct.id, defaultColorLabel, sz);

          const isComboActive =
            savedComb !== undefined
              ? savedComb.isActive !== false
              : !disabledSet.has(sz) && firstVar.isActive !== false;

          initialComboMap[comboKey] = {
            sku: existingSku,
            stockQuantity: String(Math.max(0, Math.floor(Number(rawQty) || 0))),
            isActive: isComboActive,
          };
        });
      }
      setCombinationInventory(initialComboMap);

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

  // Active Colour & Size axes for dynamic Colour + Size combination generation
  const effectiveColorEntries =
    pColors.length > 0
      ? pColors.map((c) => ({
          id: c.id,
          colorName: c.name,
          colorCode: c.hex,
          baseSku: pSku.trim() || editingProduct?.id || 'ZD-001',
        }))
      : [
          {
            id: 'default_color',
            colorName: pCustomColors.trim() || 'Standard',
            colorCode: '#192E4D',
            baseSku: pSku.trim() || editingProduct?.id || 'ZD-001',
          },
        ];

  const effectiveSizeEntries =
    variantType === 'none' ? ['Single Unit'] : pAvailableSizes;

  // Build live Colour + Size rows while preserving all existing combination inventory & SKUs
  const activeCombinationRows = effectiveColorEntries.flatMap((c) =>
    effectiveSizeEntries.map((sz) => {
      const comboKey = `${c.id}__${sz}`;
      const existing = combinationInventory[comboKey];
      const suggestedSku = formatCombinationSku(c.baseSku, c.colorName, sz);
      const rawQtyStr = existing ? existing.stockQuantity : '';
      const parsedQty =
        rawQtyStr.trim() === '' ? 0 : Math.max(0, Math.floor(Number(rawQtyStr) || 0));
      const isActive = existing ? existing.isActive : true;
      return {
        comboKey,
        colorId: c.id,
        colorName: c.colorName,
        colorCode: c.colorCode,
        size: sz,
        sku: existing?.sku !== undefined ? existing.sku : suggestedSku,
        stockQuantityStr: rawQtyStr,
        stockQuantityNum: isActive ? parsedQty : 0,
        rawStockQuantityNum: parsedQty,
        isActive,
      };
    })
  );

  const derivedTotalStock = activeCombinationRows.reduce(
    (sum, row) => sum + (row.isActive ? row.stockQuantityNum : 0),
    0
  );

  const updateCombinationCell = (
    comboKey: string,
    defaultSku: string,
    patch: Partial<{ sku: string; stockQuantity: string; isActive: boolean }>
  ) => {
    setCombinationInventory((prev) => {
      const current = prev[comboKey] || {
        sku: defaultSku,
        stockQuantity: '',
        isActive: true,
      };
      return {
        ...prev,
        [comboKey]: {
          ...current,
          ...patch,
        },
      };
    });
  };

  const handleApplyBulkStockToActiveRows = () => {
    const parsed = parseInt(bulkStockFillInput, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      setValidationError('Please enter a valid non-negative whole number to apply to active combinations.');
      return;
    }
    setValidationError(null);
    setCombinationInventory((prev) => {
      const next = { ...prev };
      activeCombinationRows.forEach((row) => {
        const current = next[row.comboKey] || {
          sku: row.sku,
          stockQuantity: '',
          isActive: true,
        };
        if (current.isActive) {
          next[row.comboKey] = {
            ...current,
            stockQuantity: String(parsed),
          };
        }
      });
      return next;
    });
  };

  const hasOrderHistoryForSize = (size: string): boolean => {
    if (!editingProduct) return false;
    return orders.some((o) =>
      o.items.some((item) => item.productId === editingProduct.id && item.size === size)
    );
  };

  const hasOrderHistoryForColor = (colorId: string): boolean => {
    if (!editingProduct) return false;
    const colorObj = pColors.find((c) => c.id === colorId);
    return orders.some((o) =>
      o.items.some(
        (item) =>
          item.productId === editingProduct.id &&
          (item.variantId === colorId ||
            (colorObj && item.colorName?.toLowerCase() === colorObj.name.toLowerCase()))
      )
    );
  };

  const applyMainCategoryChange = (newCatId: string) => {
    setPMainCat(newCatId);
    setPSubCat('');
    setPSubSubCat('');
    setCategoryChangeWarning(null);
    setPendingMainCat(null);
    setValidationError(null);
  };

  const handleMainCategoryChange = (newCatId: string) => {
    if (newCatId === pMainCat) return;
    const hasEnteredData =
      Object.keys(specValues).length > 0 ||
      pStyle.trim() !== '' ||
      pFabric.trim() !== '' ||
      pGsm.trim() !== '' ||
      customSpecs.length > 0;

    if (pMainCat && hasEnteredData) {
      setPendingMainCat(newCatId);
      setCategoryChangeWarning(
        'Switching categories may reset or change available specification templates. Do you want to proceed?'
      );
      return;
    }
    applyMainCategoryChange(newCatId);
  };

  const handleSubCategoryChange = (newSubId: string) => {
    setPSubCat(newSubId);
    setPSubSubCat('');
    setValidationError(null);
  };

  const handleChildCategoryChange = (newChildId: string) => {
    setPSubSubCat(newChildId);
    setValidationError(null);
  };

  const toggleSizeSelection = (sz: string) => {
    const isSelected = pAvailableSizes.includes(sz);
    if (isSelected) {
      const sizeStockTotal = effectiveColorEntries.reduce((sum, c) => {
        const entry = combinationInventory[`${c.id}__${sz}`];
        const qty = entry ? Math.max(0, Math.floor(Number(entry.stockQuantity) || 0)) : 0;
        return sum + qty;
      }, 0);
      const hasOrders = hasOrderHistoryForSize(sz);

      if (sizeStockTotal > 0 || hasOrders) {
        setPendingRemovalWarning({
          message: `Size "${sz}" currently has ${sizeStockTotal} unit(s) in stock${
            hasOrders ? ' and customer order history' : ''
          }. Removing this size will remove its inventory combination rows.`,
          onConfirm: () => {
            setPAvailableSizes((prev) => prev.filter((s) => s !== sz));
            setPendingRemovalWarning(null);
          },
        });
        return;
      }
      setPAvailableSizes((prev) => prev.filter((s) => s !== sz));
    } else {
      setPAvailableSizes((prev) => [...prev, sz]);
    }
    setValidationError(null);
  };

  // ==========================================
  // SECTION 3: COMMON IMAGE GALLERY HELPERS
  // ==========================================
  const handleAddGalleryImage = (urlToAdd?: string) => {
    const raw = (urlToAdd ?? galleryImageInput).trim();
    if (!raw) return;
    const extracted = extractAndNormalizeImageUrls(raw);
    if (extracted.length === 0) return;

    const updated = [...pGalleryImages];
    extracted.forEach((u) => {
      if (!updated.includes(u)) {
        updated.push(u);
      }
    });
    setPGalleryImages(updated);
    if (!pPrimaryImage.trim() && updated.length > 0) {
      setPPrimaryImage(updated[0]);
    }
    setFailedImageUrls((prev) => {
      const next = { ...prev };
      extracted.forEach((u) => delete next[u]);
      return next;
    });
    if (urlToAdd === undefined) {
      setGalleryImageInput('');
    }
    setValidationError(null);
  };

  const handleBulkAddImages = () => {
    if (!bulkImageInput.trim()) return;
    const extracted = extractAndNormalizeImageUrls(bulkImageInput);
    if (extracted.length === 0) return;

    const updated = [...pGalleryImages];
    extracted.forEach((u) => {
      if (!updated.includes(u)) {
        updated.push(u);
      }
    });
    setPGalleryImages(updated);
    if (!pPrimaryImage.trim() && updated.length > 0) {
      setPPrimaryImage(updated[0]);
    }
    setFailedImageUrls((prev) => {
      const next = { ...prev };
      extracted.forEach((u) => delete next[u]);
      return next;
    });
    setBulkImageInput('');
    setShowBulkInput(false);
    setValidationError(null);
  };

  const handleUpdateGalleryImageUrl = (idx: number, newRawUrl: string) => {
    const normalized = normalizeSingleImageUrl(newRawUrl);
    const oldUrl = pGalleryImages[idx];
    const nextList = [...pGalleryImages];
    nextList[idx] = normalized;
    setPGalleryImages(nextList);
    if (pPrimaryImage === oldUrl) {
      setPPrimaryImage(normalized);
    }
    setFailedImageUrls((prev) => {
      const next = { ...prev };
      delete next[oldUrl];
      delete next[normalized];
      return next;
    });
  };

  const handleFileUploadToGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (result) {
          setPGalleryImages((prev) => {
            if (prev.includes(result)) return prev;
            const next = [...prev, result];
            setPPrimaryImage((currPrimary) => (currPrimary.trim() ? currPrimary : result));
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    setValidationError(null);
  };

  const handleSetPrimaryImage = (img: string) => {
    setPPrimaryImage(img);
    // Bring primary image to the front of gallery
    const reordered = [img, ...pGalleryImages.filter((u) => u !== img)];
    setPGalleryImages(reordered);
  };

  const handleMoveImage = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= pGalleryImages.length) return;
    const nextList = [...pGalleryImages];
    const temp = nextList[idx];
    nextList[idx] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setPGalleryImages(nextList);
    if (idx === 0 || targetIdx === 0) {
      if (!pPrimaryImage || pPrimaryImage === temp || pPrimaryImage === nextList[0]) {
        setPPrimaryImage(nextList[0]);
      }
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    const targetImg = pGalleryImages[idx];
    const remaining = pGalleryImages.filter((_, i) => i !== idx);
    setPGalleryImages(remaining);
    if (pPrimaryImage === targetImg) {
      setPPrimaryImage(remaining[0] || '');
    }
  };

  // ==========================================
  // SECTION 4: PRODUCT COLORS (DECOUPLED)
  // ==========================================
  const openAddColorModal = () => {
    setEditingColorIndex(null);
    setCNameInput('');
    setCHexInput('#192E4D');
    setColorModalError(null);
    setShowColorModal(true);
  };

  const openEditColorModal = (idx: number) => {
    const c = pColors[idx];
    if (!c) return;
    setEditingColorIndex(idx);
    setCNameInput(c.name);
    setCHexInput(c.hex);
    setColorModalError(null);
    setShowColorModal(true);
  };

  const handleSaveColor = () => {
    const trimmed = cNameInput.trim();
    if (!trimmed) {
      setColorModalError('Please enter a colour name (e.g. Jet Black, Pearl White, Navy Blue).');
      return;
    }

    const duplicateExists = pColors.some(
      (c, idx) =>
        idx !== editingColorIndex &&
        c.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicateExists) {
      setColorModalError(`A colour named "${trimmed}" already exists for this product.`);
      return;
    }

    const colorId =
      editingColorIndex !== null
        ? pColors[editingColorIndex].id
        : `col_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const currentSizes = variantType === 'none' ? ['Single Unit'] : pAvailableSizes;

    // If first colour is added and user had entered quantities under default_color, migrate to this colour
    if (editingColorIndex === null && pColors.length === 0) {
      setCombinationInventory((prev) => {
        const next = { ...prev };
        currentSizes.forEach((sz) => {
          const defaultEntry = next[`default_color__${sz}`];
          const newKey = `${colorId}__${sz}`;
          if (defaultEntry && !next[newKey]) {
            next[newKey] = {
              sku: formatCombinationSku(pSku.trim() || 'ZD-001', trimmed, sz),
              stockQuantity: defaultEntry.stockQuantity,
              isActive: defaultEntry.isActive,
            };
          }
        });
        return next;
      });
    }

    const newColorRecord: ProductColor = {
      id: colorId,
      name: trimmed,
      hex: cHexInput,
    };

    if (editingColorIndex !== null) {
      const next = [...pColors];
      next[editingColorIndex] = newColorRecord;
      setPColors(next);
    } else {
      setPColors([...pColors, newColorRecord]);
    }

    setShowColorModal(false);
  };

  const handleDeleteColor = (idx: number) => {
    const targetColor = pColors[idx];
    if (!targetColor) return;
    setPendingRemovalWarning(null);

    const colorStockTotal = effectiveSizeEntries.reduce((sum, sz) => {
      const entry = combinationInventory[`${targetColor.id}__${sz}`];
      const qty = entry ? Math.max(0, Math.floor(Number(entry.stockQuantity) || 0)) : 0;
      return sum + qty;
    }, 0);
    const hasOrders = hasOrderHistoryForColor(targetColor.id);

    if (colorStockTotal > 0 || hasOrders) {
      setPendingRemovalWarning({
        message: `Colour "${targetColor.name}" currently has ${colorStockTotal} unit(s) in stock${
          hasOrders ? ' and existing customer order history' : ''
        }. Removing this colour will remove its Colour + Size inventory combinations.`,
        onConfirm: () => {
          setPColors((prev) => prev.filter((_, i) => i !== idx));
          setPendingRemovalWarning(null);
        },
      });
      return;
    }

    setPColors(pColors.filter((_, i) => i !== idx));
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
      pGalleryImages.length > 0;
    if (finalStatus === 'published' && !hasAnyImage) {
      setValidationError('Please provide at least one product image in Section 3 before publishing.');
      setActiveSection(3);
      return;
    }

    // 4. Validate Manual Size Selection when size/option model is active
    if (finalStatus === 'published' && variantType !== 'none' && pAvailableSizes.length === 0) {
      setValidationError(
        'Please manually select at least one available size/option in Section 5, or switch the Purchase Option Model to "No Sizes / Single Unit" if sizes are not applicable.'
      );
      setActiveSection(5);
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
          `The field "${missingRequiredField.label}" is marked as required in this category template (Section 6).`
        );
        setActiveSection(6);
        return;
      }
    }

    // 6. Validate Base Price
    const numericPrice = parseFloat(pPrice);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setValidationError('Please enter a valid Base Retail Price (greater than 0) in Section 8.');
      setActiveSection(8);
      return;
    }

    const numericSalePrice = parseFloat(pSalePrice);
    const validSalePrice =
      !Number.isNaN(numericSalePrice) && numericSalePrice > 0 && numericSalePrice < numericPrice
        ? numericSalePrice
        : undefined;

    // 7. Validate Colour + Size combination stock quantities (must be non-negative whole numbers)
    for (const row of activeCombinationRows) {
      if (row.stockQuantityStr.trim() !== '') {
        const num = Number(row.stockQuantityStr);
        if (Number.isNaN(num) || num < 0 || !Number.isInteger(num)) {
          setValidationError(
            `Invalid stock quantity for ${row.colorName} / ${row.size} in Section 4. Stock must be a non-negative whole number (0 or greater).`
          );
          setActiveSection(4);
          return;
        }
      }
    }

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
    const sizeKeysForInventory = finalSizes.length > 0 ? finalSizes : ['Single Unit'];

    // Common Product Image Gallery (also include any pending un-submitted URLs in the inputs)
    const pendingSingleUrls = galleryImageInput.trim()
      ? extractAndNormalizeImageUrls(galleryImageInput)
      : [];
    const pendingBulkUrls = bulkImageInput.trim()
      ? extractAndNormalizeImageUrls(bulkImageInput)
      : [];
    const finalGalleryImages = reconstructAndNormalizeImageList([
      ...pGalleryImages,
      ...pendingSingleUrls,
      ...pendingBulkUrls,
    ]);
    const normalizedPrimary = normalizeSingleImageUrl(pPrimaryImage.trim());
    if (normalizedPrimary && !finalGalleryImages.includes(normalizedPrimary)) {
      finalGalleryImages.unshift(normalizedPrimary);
    } else if (normalizedPrimary && finalGalleryImages.includes(normalizedPrimary)) {
      const without = finalGalleryImages.filter((img) => img !== normalizedPrimary);
      finalGalleryImages.splice(0, finalGalleryImages.length, normalizedPrimary, ...without);
    }

    if (finalGalleryImages.length === 0) {
      setActiveSection(3);
      setValidationError('Please provide at least one product image in Section 3 (Product Images).');
      return;
    }

    const previousBasePrice = editingProduct?.price;
    const previousSalePrice = editingProduct?.salePrice;
    const productId = editingProduct ? editingProduct.id : `prod_${Date.now()}`;

    const builtCombinations: VariantStockCombination[] = [];

    // Prepare variants from decoupled Product Colors and their Colour + Size combination stock maps
    const finalVariants: ProductVariant[] =
      pColors.length > 0
        ? pColors.map((c, idx) => {
            const sizeStockMap: Record<string, number> = {};
            const sizeSkuMap: Record<string, string> = {};
            const disabledSizesList: string[] = [];

            sizeKeysForInventory.forEach((sz) => {
              const comboKey = `${c.id}__${sz}`;
              const cell = combinationInventory[comboKey];
              const rawQty =
                cell && cell.stockQuantity.trim() !== ''
                  ? Math.max(0, Math.floor(Number(cell.stockQuantity) || 0))
                  : 0;
              const isComboActive = cell ? cell.isActive : true;
              const comboSku =
                cell?.sku?.trim() ||
                formatCombinationSku(pSku.trim() || productId, c.name, sz);

              sizeStockMap[sz] = isComboActive ? rawQty : 0;
              sizeSkuMap[sz] = comboSku;
              if (!isComboActive) {
                disabledSizesList.push(sz);
              }

              builtCombinations.push({
                id: comboKey,
                colorId: c.id,
                colorName: c.name,
                colorCode: c.hex,
                size: sz,
                sku: comboSku,
                stockQuantity: isComboActive ? rawQty : 0,
                isActive: isComboActive,
                price: numericPrice,
                salePrice: validSalePrice,
              });
            });

            const derivedVariantStock = Object.entries(sizeStockMap).reduce(
              (acc, [sz, qty]) => (disabledSizesList.includes(sz) ? acc : acc + qty),
              0
            );

            return {
              id: c.id,
              colorName: c.name,
              colorCode: c.hex,
              sku: formatCombinationSku(pSku.trim() || productId, c.name, 'ALL'),
              price: numericPrice,
              salePrice: validSalePrice,
              stock: derivedVariantStock,
              sizeStock: sizeStockMap,
              sizeSku: sizeSkuMap,
              disabledSizes: disabledSizesList.length > 0 ? disabledSizesList : undefined,
              images: finalGalleryImages, // Common gallery shared by all variants
            };
          })
        : (() => {
            const carrierId = editingProduct?.variants?.[0]?.id || `var_${Date.now()}`;
            const carrierColorName = pCustomColors.trim() || 'Standard';
            const carrierBaseSku =
              pSku.trim() ||
              editingProduct?.variants?.[0]?.sku ||
              `ZD-${Date.now().toString().slice(-5)}`;

            const sizeStockMap: Record<string, number> = {};
            const sizeSkuMap: Record<string, string> = {};
            const disabledSizesList: string[] = [];

            sizeKeysForInventory.forEach((sz) => {
              const comboKey = `default_color__${sz}`;
              const cell = combinationInventory[comboKey];
              const rawQty =
                cell && cell.stockQuantity.trim() !== ''
                  ? Math.max(0, Math.floor(Number(cell.stockQuantity) || 0))
                  : 0;
              const isComboActive = cell ? cell.isActive : true;
              const comboSku =
                cell?.sku?.trim() ||
                formatCombinationSku(carrierBaseSku, carrierColorName, sz);

              sizeStockMap[sz] = isComboActive ? rawQty : 0;
              sizeSkuMap[sz] = comboSku;
              if (!isComboActive) {
                disabledSizesList.push(sz);
              }

              builtCombinations.push({
                id: `${carrierId}__${sz}`,
                colorId: carrierId,
                colorName: carrierColorName,
                colorCode: '#192E4D',
                size: sz,
                sku: comboSku,
                stockQuantity: isComboActive ? rawQty : 0,
                isActive: isComboActive,
                price: numericPrice,
                salePrice: validSalePrice,
              });
            });

            const derivedVariantStock = Object.entries(sizeStockMap).reduce(
              (acc, [sz, qty]) => (disabledSizesList.includes(sz) ? acc : acc + qty),
              0
            );

            return [
              {
                id: carrierId,
                colorName: carrierColorName,
                colorCode: '#192E4D',
                images: finalGalleryImages,
                sku: carrierBaseSku,
                price: numericPrice,
                salePrice: validSalePrice,
                stock: derivedVariantStock,
                sizeStock: sizeStockMap,
                sizeSku: sizeSkuMap,
                disabledSizes: disabledSizesList.length > 0 ? disabledSizesList : undefined,
                attributes: pCustomColors.trim()
                  ? undefined
                  : { isUnconfiguredDefault: 'true' },
              },
            ];
          })();

    const derivedProductTotalStock = finalVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

    // Build clean specifications object (only non-empty entries)
    const cleanSpecificationsMap: Record<string, string> = {};
    if (pFabric.trim()) cleanSpecificationsMap.Fabric = pFabric.trim();
    if (pCareInstructions.trim()) cleanSpecificationsMap.Care = pCareInstructions.trim();

    const productPayload: Product = {
      id: productId,
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
      primaryImage: pPrimaryImage.trim() || finalGalleryImages[0] || '',
      images: finalGalleryImages,
      additionalImages: finalGalleryImages.slice(1),
      colors: pColors,
      variants: finalVariants,
      variantCombinations: builtCombinations,
      totalStock: derivedProductTotalStock,
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
    { num: 4, title: 'Product Colors' },
    { num: 5, title: 'Sizes & Stock' },
    { num: 6, title: 'Category Specs' },
    { num: 7, title: 'Custom Specs' },
    { num: 8, title: 'Pricing & Stock' },
    { num: 9, title: 'Shipping & Pack' },
    { num: 10, title: 'Display Settings' },
    { num: 11, title: 'Preview & Save' },
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

          {/* SECTION 3: COMMON PRODUCT IMAGES GALLERY */}
          {activeSection === 3 && (
            <div className="space-y-5 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-[#192E4D]">Section 3: Common Product Images</h3>
                  <p className="text-xs text-[#697586]">
                    Upload and organize product images in one common gallery. All images belong to the product as a whole and remain visible across all color selections.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-extrabold text-xs shrink-0">
                  {pGalleryImages.length} Image(s) in Gallery
                </span>
              </div>

              {/* Sample image quick-presets */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Quick Load High-Quality Sample Image Sets
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_IMAGE_SETS.map((set) => (
                    <button
                      key={set.label}
                      type="button"
                      onClick={() => {
                        const merged = Array.from(new Set([...pGalleryImages, ...set.images]));
                        setPGalleryImages(merged);
                        if (!pPrimaryImage && merged.length > 0) {
                          setPPrimaryImage(merged[0]);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#192E4D] hover:border-[#08A9A2] hover:bg-teal-50/50 cursor-pointer transition-all"
                    >
                      + {set.label} ({set.images.length} views)
                    </button>
                  ))}
                  {pGalleryImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPGalleryImages([]);
                        setPPrimaryImage('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer ml-auto"
                    >
                      Clear Gallery
                    </button>
                  )}
                </div>
              </div>

              {/* Add Single or Multiple Image URLs */}
              <div className="space-y-2">
                <label className="font-bold text-[#192E4D] text-xs block">
                  Add Product Image URL(s)
                </label>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={galleryImageInput}
                    onChange={(e) => setGalleryImageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGalleryImage();
                      }
                    }}
                    placeholder="Paste image URL (or multiple URLs separated by spaces/lines)..."
                    className="flex-1 min-w-[200px] h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono font-medium bg-white focus:outline-hidden focus:border-[#08A9A2]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddGalleryImage()}
                    className="px-4 h-10 bg-[#08A9A2] hover:bg-[#079690] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add to Gallery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkInput(!showBulkInput)}
                    className="px-3 h-10 bg-white border border-[#E6EAF0] hover:bg-slate-50 text-[#192E4D] rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                  >
                    {showBulkInput ? 'Close Bulk' : 'Bulk URLs'}
                  </button>
                  <label className="px-3 h-10 bg-white border border-[#E6EAF0] hover:bg-slate-50 text-[#192E4D] rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#08A9A2]" />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUploadToGallery}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Bulk Image URLs Drawer */}
              {showBulkInput && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-[#192E4D]">
                      Paste Multiple Image URLs (one URL per line — URLs with commas inside them are supported)
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={bulkImageInput}
                    onChange={(e) => setBulkImageInput(e.target.value)}
                    placeholder="https://example.com/product-front.jpg&#10;https://example.com/product-back.jpg&#10;https://example.com/product-side.jpg"
                    className="w-full p-2.5 border border-[#E6EAF0] rounded-xl text-xs font-mono bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkInput(false)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkAddImages}
                      className="px-4 py-1.5 rounded-lg bg-[#192E4D] text-white text-xs font-bold cursor-pointer"
                    >
                      Add All URLs
                    </button>
                  </div>
                </div>
              )}

              {/* Common Gallery Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#192E4D] text-xs">
                    Common Product Gallery ({pGalleryImages.length} Image{pGalleryImages.length !== 1 ? 's' : ''})
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">
                    The primary image is shown first on catalog cards and store listings.
                  </span>
                </div>

                {pGalleryImages.length === 0 ? (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50/50 text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="font-bold text-gray-600 text-xs">
                      No common images added to gallery yet.
                    </p>
                    <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                      Add image URLs above, upload photos, or click one of the quick sample sets to populate the product gallery.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {pGalleryImages.map((img, idx) => {
                      const isPrimary = pPrimaryImage === img;
                      const hasLoadFailed = Boolean(failedImageUrls[img]);
                      return (
                        <div
                          key={`gallery_slot_${idx}`}
                          className={`relative group rounded-2xl border p-2 bg-white flex flex-col justify-between transition-all ${
                            isPrimary
                              ? 'border-[#08A9A2] ring-2 ring-[#08A9A2]/30 shadow-sm'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                            {!hasLoadFailed ? (
                              <img
                                src={img}
                                alt={`Product view ${idx + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onLoad={() => {
                                  if (failedImageUrls[img]) {
                                    setFailedImageUrls((prev) => {
                                      const next = { ...prev };
                                      delete next[img];
                                      return next;
                                    });
                                  }
                                }}
                                onError={() => {
                                  setFailedImageUrls((prev) => ({ ...prev, [img]: true }));
                                }}
                              />
                            ) : (
                              <div className="p-3 text-center space-y-1.5">
                                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                                <p className="text-[10px] font-bold text-slate-700 leading-tight">
                                  Preview blocked or invalid direct image link
                                </p>
                                <p className="text-[9px] text-slate-400 break-all line-clamp-2 font-mono">
                                  {img}
                                </p>
                              </div>
                            )}
                            {isPrimary && (
                              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#08A9A2] text-white text-[10px] font-black flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 fill-current" />
                                <span>PRIMARY</span>
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-mono">
                              #{idx + 1}
                            </div>
                          </div>

                          {/* Editable Individual Image URL Input so each card shows its exact URL */}
                          <div className="pt-1.5">
                            <input
                              type="text"
                              value={img}
                              onChange={(e) => handleUpdateGalleryImageUrl(idx, e.target.value)}
                              title={img}
                              placeholder={`Image #${idx + 1} URL`}
                              className="w-full px-2 py-1 text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:bg-white focus:border-[#08A9A2] focus:outline-hidden truncate"
                            />
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-1">
                            {!isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(img)}
                                className="px-2 py-1 rounded-lg bg-teal-50 text-[#08A9A2] hover:bg-teal-100 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Set as primary image"
                              >
                                <Star className="w-3 h-3" />
                                <span>Set Primary</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-teal-700 px-1.5">
                                Primary View
                              </span>
                            )}

                            <div className="flex items-center gap-0.5 ml-auto">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, 'left')}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Earlier"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === pGalleryImages.length - 1}
                                onClick={() => handleMoveImage(idx, 'right')}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Later"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                                title="Remove image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Optional Visual Guides: Size Chart & Care */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0F4F8]">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1 text-xs">
                    Size Chart Diagram Image <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={pSizeChartImage}
                    onChange={(e) => setPSizeChartImage(e.target.value)}
                    placeholder="https://... size-chart.jpg"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#192E4D] block mb-1 text-xs">
                    Fabric & Care Guide Image <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={pCareImage}
                    onChange={(e) => setPCareImage(e.target.value)}
                    placeholder="https://... care-guide.jpg"
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PRODUCT COLORS (INDEPENDENT) */}
          {activeSection === 4 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-[#192E4D]">
                    Section 4: Product Colors (Independent)
                  </h3>
                  <p className="text-xs text-[#697586]">
                    Add and manage product colors independently. Colors are completely decoupled from images, and all product photos remain available across all color options.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddColorModal}
                  className="px-3.5 py-2 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Product Color</span>
                </button>
              </div>

              {pendingRemovalWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 font-extrabold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Inventory / Order History Warning</span>
                  </div>
                  <p className="font-medium leading-relaxed">{pendingRemovalWarning.message}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPendingRemovalWarning(null)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-gray-700 font-bold text-xs cursor-pointer"
                    >
                      Keep Color
                    </button>
                    <button
                      type="button"
                      onClick={pendingRemovalWarning.onConfirm}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Confirm Removal
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Preset Colors Picker */}
              <div className="p-3.5 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Click to Quick-Add Preset Product Colors
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((preset) => {
                    const alreadyAdded = pColors.some(
                      (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => {
                          if (!alreadyAdded) {
                            const newCol: ProductColor = {
                              id: `col_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                              name: preset.name,
                              hex: preset.hex,
                            };
                            setPColors([...pColors, newCol]);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          alreadyAdded
                            ? 'bg-teal-50 text-teal-800 border-teal-200 opacity-60'
                            : 'bg-white text-[#192E4D] border-gray-200 hover:border-[#08A9A2]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                        {alreadyAdded && <Check className="w-3 h-3 text-teal-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Configured Colors List */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#192E4D] text-xs uppercase tracking-wider">
                    Configured Colors ({pColors.length})
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    Each color generates distinct size inventory rows in Section 5.
                  </span>
                </div>

                {pColors.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500 space-y-1">
                    <p className="font-bold text-[#192E4D]">No specific colors added yet.</p>
                    <p className="text-[11px] text-gray-400">
                      Product inventory below will default to "Standard". Click{' '}
                      <span className="font-bold text-[#08A9A2]">+ Add Product Color</span> or choose preset chips above to add colors (e.g. Black, White, Blue).
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {pColors.map((color, idx) => (
                      <div
                        key={color.id || idx}
                        className="p-3 bg-white rounded-xl border border-[#E6EAF0] flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="truncate">
                            <span className="font-extrabold text-[#192E4D] text-xs block truncate">
                              {color.name}
                            </span>
                            <span className="font-mono text-[10px] text-gray-400 block uppercase">
                              {color.hex}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditColorModal(idx)}
                            className="px-2 py-1 rounded-lg bg-teal-50 text-[#08A9A2] font-bold text-[11px] hover:bg-teal-100 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteColor(idx)}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Remove color"
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

          {/* SECTION 5: SIZES & COMBINATION INVENTORY */}
          {activeSection === 5 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-[#192E4D]">
                    Section 5: Sizes & Combination Inventory Table
                  </h3>
                  <p className="text-xs text-[#697586]">
                    Select available sizes and manage exact Colour + Size combination stock in one unified place. No size is selected automatically.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-extrabold text-xs">
                    Total Stock: {derivedTotalStock} pcs
                  </span>
                </div>
              </div>

              {pendingRemovalWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 font-extrabold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Inventory / Order History Warning</span>
                  </div>
                  <p className="font-medium leading-relaxed">{pendingRemovalWarning.message}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPendingRemovalWarning(null)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-gray-700 font-bold text-xs cursor-pointer"
                    >
                      Keep Size
                    </button>
                    <button
                      type="button"
                      onClick={pendingRemovalWarning.onConfirm}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Confirm Removal
                    </button>
                  </div>
                </div>
              )}

              {/* Variant option type selection */}
              <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#192E4D] block text-xs">Purchase Option Model</label>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    {variantType === 'none'
                      ? 'Single Unit (No Sizes)'
                      : `${pAvailableSizes.length} Size(s) Selected`}
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
                        setPendingRemovalWarning(null);
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
                          onClick={() => {
                            if (derivedTotalStock > 0) {
                              setPendingRemovalWarning({
                                message: `Clearing all selected sizes will remove ${activeCombinationRows.length} Colour + Size combination row(s) (${derivedTotalStock} total unit(s) in stock).`,
                                onConfirm: () => {
                                  setPAvailableSizes([]);
                                  setPendingRemovalWarning(null);
                                },
                              });
                            } else {
                              setPAvailableSizes([]);
                            }
                          }}
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

              {/* COLOUR + SIZE COMBINATION INVENTORY TABLE (Single Source of Truth for Stock) */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#08A9A2]/30 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6EAF0] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-[#192E4D] text-xs uppercase tracking-wider">
                        Colour + Size Combination Inventory Table
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#08A9A2] font-extrabold text-[10px] border border-teal-200">
                        Single Source of Truth
                      </span>
                    </div>
                    <p className="text-[11px] text-[#697586] mt-0.5">
                      Enter the exact stock quantity for each Colour + Size combination. Total product stock ({derivedTotalStock} pcs) is automatically calculated from active rows below.
                    </p>
                  </div>

                  {activeCombinationRows.length > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={bulkStockFillInput}
                        onChange={(e) => setBulkStockFillInput(e.target.value)}
                        placeholder="Quick fill qty..."
                        className="w-28 h-8 px-2.5 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkStockToActiveRows}
                        className="px-2.5 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                      >
                        Apply to Active Rows
                      </button>
                    </div>
                  )}
                </div>

                {variantType !== 'none' && pAvailableSizes.length === 0 ? (
                  <div className="p-6 rounded-xl bg-amber-50/60 border border-dashed border-amber-300 text-center space-y-1">
                    <p className="font-extrabold text-amber-900 text-xs">
                      Select Available Sizes Above to Generate Inventory Combinations
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Click one or more sizes above (e.g. M, L, XL) — or choose "No Sizes / Single Unit" if this product does not use sizes — to manage Colour + Size stock quantities.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#E6EAF0]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F6F8FA] text-[#192E4D] border-b border-[#E6EAF0] text-[11px] font-extrabold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Colour</th>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Stock Quantity</th>
                          <th className="py-2.5 px-3 text-right">Combination Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6EAF0]">
                        {activeCombinationRows.map((row) => (
                          <tr
                            key={row.comboKey}
                            className={`transition-colors ${
                              row.isActive ? 'bg-white hover:bg-slate-50/70' : 'bg-gray-50 opacity-60'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-bold text-[#192E4D]">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                                  style={{ backgroundColor: row.colorCode }}
                                />
                                <span>{row.colorName}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-extrabold text-[#192E4D] text-[11px]">
                                {row.size}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={row.sku}
                                disabled={!row.isActive}
                                onChange={(e) =>
                                  updateCombinationCell(row.comboKey, row.sku, {
                                    sku: e.target.value,
                                  })
                                }
                                placeholder="SKU code"
                                className="w-full max-w-[180px] h-8 px-2.5 border border-gray-200 rounded-lg font-mono text-[11px] font-bold text-[#192E4D] bg-white disabled:bg-gray-100"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  disabled={!row.isActive}
                                  value={row.stockQuantityStr}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d+$/.test(val)) {
                                      updateCombinationCell(row.comboKey, row.sku, {
                                        stockQuantity: val,
                                      });
                                      setValidationError(null);
                                    }
                                  }}
                                  placeholder="0"
                                  className="w-24 h-8 px-2.5 border border-gray-300 rounded-lg font-extrabold text-xs text-[#192E4D] bg-white focus:border-[#08A9A2] focus:outline-hidden disabled:bg-gray-100"
                                />
                                <span className="text-[10px] font-semibold text-gray-500">pcs</span>
                                {row.isActive && row.stockQuantityNum === 0 && (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCombinationCell(row.comboKey, row.sku, {
                                    isActive: !row.isActive,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                                  row.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {row.isActive ? 'Available' : 'Disabled'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#F6F8FA] border-t border-[#E6EAF0] font-extrabold text-[#192E4D]">
                          <td colSpan={3} className="py-2.5 px-3 text-xs">
                            Total Derived Product Stock ({activeCombinationRows.filter((r) => r.isActive).length} active combination(s))
                          </td>
                          <td colSpan={2} className="py-2.5 px-3 text-right text-sm text-[#08A9A2]">
                            {derivedTotalStock} pcs
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 6: CATEGORY-SPECIFIC SPECIFICATIONS */}
          {activeSection === 6 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#192E4D]">
                    Section 6: Category-Specific Specifications (
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

          {/* SECTION 7: CUSTOM SPECIFICATIONS BUILDER */}
          {activeSection === 7 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 7: Additional Custom Specifications (Optional)
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

          {/* SECTION 8: PRICING & VARIANT INVENTORY SUMMARY */}
          {activeSection === 8 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">Section 8: Price & Variant Stock Summary</h3>
                <p className="text-xs text-[#697586]">
                  Configure product retail and promotional sale pricing. Product stock is strictly derived from the Colour + Size inventory table in Section 5.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Read-Only Summary of Colour + Size Variant Inventory */}
              <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-[#192E4D] text-xs uppercase tracking-wider">
                      Read-Only Variant Inventory Summary
                    </h4>
                    <p className="text-[11px] text-[#697586]">
                      Global stock inputs have been removed to prevent inventory conflicts. Edit individual Colour + Size quantities in Section 5.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E6EAF0] font-black text-xs text-[#192E4D]">
                      Total Stock: <span className="text-[#08A9A2]">{derivedTotalStock} pcs</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSection(5)}
                      className="px-3 py-1.5 rounded-xl bg-[#192E4D] hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                    >
                      Edit Colour + Size Stock (Sec 5)
                    </button>
                  </div>
                </div>

                {activeCombinationRows.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                    {activeCombinationRows.map((row) => (
                      <div
                        key={row.comboKey}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          row.isActive
                            ? 'bg-white border-[#E6EAF0]'
                            : 'bg-gray-100 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: row.colorCode }}
                          />
                          <span className="font-bold text-[#192E4D] truncate">
                            {row.colorName} • {row.size}
                          </span>
                        </div>
                        <span
                          className={`font-extrabold shrink-0 ml-1 ${
                            !row.isActive
                              ? 'text-gray-400'
                              : row.stockQuantityNum > 0
                              ? 'text-teal-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {row.isActive ? `${row.stockQuantityNum} pcs` : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 9: SHIPPING & PACKAGING */}
          {activeSection === 9 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 9: Shipping, Packaging & Compliance (Optional)
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

          {/* SECTION 10: CUSTOMER DISPLAY SETTINGS */}
          {activeSection === 10 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 10: Customer Display Badges & Status
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

          {/* SECTION 11: PREVIEW & PUBLISH */}
          {activeSection === 11 && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="border-b border-[#F0F4F8] pb-2">
                <h3 className="text-sm font-black text-[#192E4D]">
                  Section 11: Summary & Confirmation
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
                      referrerPolicy="no-referrer"
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
                    <span className="text-gray-400 block">Product Colors:</span>
                    <span className="font-bold">
                      {pColors.length > 0
                        ? pColors.map((c) => c.name).join(', ')
                        : pCustomColors.trim() || 'Standard'}
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
                    <span className="text-gray-400 block">Common Gallery:</span>
                    <span className="font-bold">
                      {pGalleryImages.length} Image(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Derived Total Stock:</span>
                    <span className="font-extrabold text-[#08A9A2]">
                      {derivedTotalStock} pcs ({activeCombinationRows.filter((r) => r.isActive).length} active combinations)
                    </span>
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
            {activeSection < 11 && (
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

        {/* SUB-MODAL: INDEPENDENT COLOR EDITOR */}
        {showColorModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#08A9A2]" />
                  <h4 className="font-extrabold text-[#192E4D] text-sm">
                    {editingColorIndex !== null ? 'Edit Product Color' : 'Add Product Color'}
                  </h4>
                </div>
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
                <label className="font-bold text-[#192E4D] block mb-1">
                  Color Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cNameInput}
                  onChange={(e) => {
                    setCNameInput(e.target.value);
                    setColorModalError(null);
                  }}
                  placeholder="e.g. Jet Black, Pure White, Royal Navy"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl font-bold bg-white text-xs focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Color Swatch & Hex Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cHexInput}
                    onChange={(e) => setCHexInput(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={cHexInput}
                    onChange={(e) => setCHexInput(e.target.value)}
                    placeholder="#000000"
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl font-mono text-xs uppercase font-bold"
                  />
                </div>
              </div>

              {/* Preset swatches */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-gray-500 block">
                  Quick Palette Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setCNameInput(preset.name);
                        setCHexInput(preset.hex);
                        setColorModalError(null);
                      }}
                      className="px-2 py-1 rounded-lg border border-gray-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-[11px] text-teal-900 leading-relaxed">
                Colors are independent and not linked to individual photos. All uploaded product images remain in the common gallery and are visible across all colors on the storefront.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="px-3.5 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveColor}
                  className="px-4 py-2 bg-[#08A9A2] hover:bg-[#079690] text-white rounded-xl font-bold cursor-pointer text-xs shadow-xs"
                >
                  {editingColorIndex !== null ? 'Update Color' : 'Save Color'}
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
