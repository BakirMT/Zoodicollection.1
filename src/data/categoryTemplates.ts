import { CategorySpecificationTemplate, ProductSpecificationField, VariantOptionType } from '../types';

export const DEFAULT_CATEGORY_TEMPLATES: CategorySpecificationTemplate[] = [
  // 1. CLOTHING & FASHION
  {
    id: 'tmpl_fashion',
    categoryId: 'cat_fashion',
    categoryName: 'Fashion & Clothing',
    defaultVariantType: 'clothing_size',
    defaultSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fields: [
      {
        id: 'field_style_name',
        key: 'style_name',
        label: 'Style Name',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. BOYS FEARLESS 5/S, ZOODI SIGNATURE DROP',
        displayOrder: 1,
      },
      {
        id: 'field_style_number',
        key: 'style_number',
        label: 'Style Number / Supplier Code',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 2773, ZD-JKT-88',
        displayOrder: 2,
      },
      {
        id: 'field_style',
        key: 'style',
        label: 'Product Style',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Boys 5 Sleeve T-Shirt with Printed Design',
        displayOrder: 3,
      },
      {
        id: 'field_target_audience',
        key: 'target_audience',
        label: 'Target Audience / Gender',
        type: 'select',
        value: '',
        options: ['Men', 'Women', 'Boys', 'Girls', 'Unisex', 'Kids', 'Toddler'],
        visibleToCustomers: true,
        displayOrder: 4,
      },
      {
        id: 'field_fabric',
        key: 'fabric',
        label: 'Fabric',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Loopnet Fabric, 100% Combed Cotton, Linen Blend',
        displayOrder: 5,
      },
      {
        id: 'field_gsm',
        key: 'gsm',
        label: 'GSM (Fabric Weight)',
        type: 'text',
        value: '',
        unit: 'GSM',
        visibleToCustomers: true,
        description: 'e.g. 220 GSM, 200 GSM, 180 GSM',
        displayOrder: 6,
      },
      {
        id: 'field_fit_type',
        key: 'fit_type',
        label: 'Fit Type',
        type: 'select',
        value: '',
        options: ['Regular Fit', 'Slim Fit', 'Oversized', 'Relaxed Fit', 'Boxy Fit', 'Comfort Fit'],
        visibleToCustomers: true,
        displayOrder: 7,
      },
      {
        id: 'field_sleeve_type',
        key: 'sleeve_type',
        label: 'Sleeve Type',
        type: 'select',
        value: '',
        options: ['Half Sleeve', 'Full Sleeve', '5/S Sleeve', 'Sleeveless', 'Raglan Sleeve', 'Three-Quarter'],
        visibleToCustomers: true,
        displayOrder: 8,
      },
      {
        id: 'field_neck_type',
        key: 'neck_type',
        label: 'Neck / Collar Type',
        type: 'select',
        value: '',
        options: ['Round Neck / Crew', 'V-Neck', 'Polo Collar', 'Mandarin / Chinese Collar', 'Hooded', 'High Neck'],
        visibleToCustomers: true,
        displayOrder: 9,
      },
      {
        id: 'field_pattern',
        key: 'pattern',
        label: 'Pattern / Print Type',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Puff Printed, Graphic Print, Solid, Typographic, Embroidered',
        displayOrder: 10,
      },
      {
        id: 'field_colors_description',
        key: 'colors_description',
        label: 'Colors Description',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 8 Multi Colours with Printed Design, MIX COLOUR ONLY',
        displayOrder: 11,
      },
      {
        id: 'field_ratio',
        key: 'ratio',
        label: 'Wholesale / Set Ratio',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 8:8:8:8:8 or 10:10:10 (Descriptive breakdown)',
        displayOrder: 12,
      },
      {
        id: 'field_accessories',
        key: 'accessories',
        label: 'Accessories Included',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Original Tag and Label, Extra Buttons',
        displayOrder: 13,
      },
      {
        id: 'field_packaging',
        key: 'packaging',
        label: 'Packaging Details',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Single Piece Packed in Premium Polybag',
        displayOrder: 14,
      },
      {
        id: 'field_care_instructions',
        key: 'care_instructions',
        label: 'Care Instructions',
        type: 'textarea',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Machine wash cold with like colors. Do not iron directly on puff print.',
        displayOrder: 15,
      },
      {
        id: 'field_country_of_origin',
        key: 'country_of_origin',
        label: 'Country of Origin',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 16,
      },
      {
        id: 'field_manufacturer',
        key: 'manufacturer',
        label: 'Manufacturer / Brand Details',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 17,
      },
    ],
  },

  // 2. FOOTWEAR
  {
    id: 'tmpl_footwear',
    categoryId: 'cat_footwear',
    categoryName: 'Footwear',
    defaultVariantType: 'shoe_size',
    defaultSizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    fields: [
      {
        id: 'field_shoe_style',
        key: 'shoe_style',
        label: 'Shoe Style',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Low-Top Retro Sneaker, Classic Penny Loafer',
        displayOrder: 1,
      },
      {
        id: 'field_shoe_type',
        key: 'shoe_type',
        label: 'Shoe Type',
        type: 'select',
        value: '',
        options: ['Sneakers', 'Running Shoes', 'Formal Oxfords', 'Loafers', 'Boots', 'Casual Sandals', 'Sliders / Slippers'],
        visibleToCustomers: true,
        displayOrder: 2,
      },
      {
        id: 'field_size_system',
        key: 'size_system',
        label: 'Size System',
        type: 'select',
        value: '',
        options: ['UK / IND', 'EU', 'US'],
        visibleToCustomers: true,
        displayOrder: 3,
      },
      {
        id: 'field_upper_material',
        key: 'upper_material',
        label: 'Upper Material',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Genuine Suede Leather, Breathable Mesh, Top-grain Nappa Leather',
        displayOrder: 4,
      },
      {
        id: 'field_sole_material',
        key: 'sole_material',
        label: 'Sole Material',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Anti-skid Vulcanized Rubber, Lightweight EVA Phylon, Leather Sole',
        displayOrder: 5,
      },
      {
        id: 'field_closure_type',
        key: 'closure_type',
        label: 'Closure Type',
        type: 'select',
        value: '',
        options: ['Lace-Up', 'Slip-On', 'Velcro Strap', 'Buckle', 'Zipper', 'Elastic Gusset'],
        visibleToCustomers: true,
        displayOrder: 6,
      },
      {
        id: 'field_fit_type_footwear',
        key: 'fit_type',
        label: 'Fit Type',
        type: 'select',
        value: '',
        options: ['Regular Fit', 'Wide Fit', 'Snug Athletic Fit'],
        visibleToCustomers: true,
        displayOrder: 7,
      },
      {
        id: 'field_occasion',
        key: 'occasion',
        label: 'Occasion',
        type: 'select',
        value: '',
        options: ['Casual / Everyday', 'Athletic / Running', 'Formal / Business', 'Party / Evening', 'Outdoor / Trail'],
        visibleToCustomers: true,
        displayOrder: 8,
      },
      {
        id: 'field_product_weight',
        key: 'weight',
        label: 'Product Weight (Pair)',
        type: 'text',
        value: '',
        unit: 'g',
        visibleToCustomers: true,
        description: 'e.g. 680 g',
        displayOrder: 9,
      },
      {
        id: 'field_package_contents',
        key: 'package_contents',
        label: 'Package Contents',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 1 Pair of Shoes, Extra Waxed Laces, Dust Bag',
        displayOrder: 10,
      },
      {
        id: 'field_care_footwear',
        key: 'care_instructions',
        label: 'Care Instructions',
        type: 'textarea',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Clean with a soft brush and leather balm. Avoid submerging in water.',
        displayOrder: 11,
      },
      {
        id: 'field_country_footwear',
        key: 'country_of_origin',
        label: 'Country of Origin',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 12,
      },
    ],
  },

  // 3. FRAGRANCES & PERFUMES
  {
    id: 'tmpl_perfume',
    categoryId: 'sub_fragrance',
    categoryName: 'Perfumes & Fragrances',
    defaultVariantType: 'volume_ml',
    defaultSizes: ['30 ml', '50 ml', '100 ml'],
    fields: [
      {
        id: 'field_fragrance_name',
        key: 'fragrance_name',
        label: 'Fragrance Name',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. ZOODI Oud Royale, Velvet Amber Extract',
        displayOrder: 1,
      },
      {
        id: 'field_fragrance_type',
        key: 'fragrance_type',
        label: 'Fragrance Type',
        type: 'select',
        value: '',
        options: ['Eau de Parfum (EDP)', 'Extrait de Parfum', 'Eau de Toilette (EDT)', 'Pure Perfume Oil / Attar', 'Eau de Cologne', 'Body Mist'],
        visibleToCustomers: true,
        displayOrder: 2,
      },
      {
        id: 'field_volume',
        key: 'volume',
        label: 'Bottle Volume',
        type: 'text',
        value: '',
        unit: 'ml',
        visibleToCustomers: true,
        description: 'e.g. 100 ml, 50 ml, 12 ml',
        displayOrder: 3,
      },
      {
        id: 'field_fragrance_family',
        key: 'fragrance_family',
        label: 'Fragrance Family',
        type: 'select',
        value: '',
        options: ['Woody & Oriental', 'Fresh & Citrus', 'Spicy & Smoky', 'Floral & Sweet', 'Aquatic & Marine', 'Aromatic Fougere', 'Gourmand'],
        visibleToCustomers: true,
        displayOrder: 4,
      },
      {
        id: 'field_top_notes',
        key: 'top_notes',
        label: 'Top Notes',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Bergamot, Sicilian Lemon, Saffron, Cardamom',
        displayOrder: 5,
      },
      {
        id: 'field_middle_notes',
        key: 'middle_notes',
        label: 'Heart / Middle Notes',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Damask Rose, French Lavender, Nutmeg, Cedar',
        displayOrder: 6,
      },
      {
        id: 'field_base_notes',
        key: 'base_notes',
        label: 'Base Notes',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Cambodian Agarwood / Oud, White Musk, Golden Amber, Madagascar Vanilla',
        displayOrder: 7,
      },
      {
        id: 'field_concentration',
        key: 'concentration',
        label: 'Oil Concentration',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 25% High Concentration (Long-lasting 12+ hours)',
        displayOrder: 8,
      },
      {
        id: 'field_target_perfume',
        key: 'target_audience',
        label: 'Target Audience',
        type: 'select',
        value: '',
        options: ['Unisex', 'Men', 'Women'],
        visibleToCustomers: true,
        displayOrder: 9,
      },
      {
        id: 'field_ingredients',
        key: 'ingredients',
        label: 'Ingredients',
        type: 'textarea',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Alcohol Denat, Parfum (Fragrance), Aqua, Limonene, Linalool',
        displayOrder: 10,
      },
      {
        id: 'field_usage_instructions',
        key: 'usage_instructions',
        label: 'Usage Instructions',
        type: 'textarea',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Hold 6 inches from pulse points (wrists, neck). Do not rub.',
        displayOrder: 11,
      },
      {
        id: 'field_packaging_perfume',
        key: 'packaging',
        label: 'Packaging Details',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Heavyweight Glass Bottle with Magnetic Cap & Velvet Presentation Box',
        displayOrder: 12,
      },
      {
        id: 'field_country_perfume',
        key: 'country_of_origin',
        label: 'Country of Origin',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 13,
      },
    ],
  },

  // 4. BAGS & WALLETS
  {
    id: 'tmpl_bags',
    categoryId: 'sub_bags',
    categoryName: 'Bags & Wallets',
    defaultVariantType: 'none',
    defaultSizes: [],
    fields: [
      {
        id: 'field_material_bag',
        key: 'material',
        label: 'Material',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Genuine Full Grain Leather, Water-resistant Cordura, Waxed Canvas',
        displayOrder: 1,
      },
      {
        id: 'field_dimensions_bag',
        key: 'dimensions',
        label: 'Dimensions (L x W x H)',
        type: 'text',
        value: '',
        unit: 'cm',
        visibleToCustomers: true,
        description: 'e.g. 11.5 cm x 9.5 cm x 2 cm',
        displayOrder: 2,
      },
      {
        id: 'field_compartments',
        key: 'compartments',
        label: 'Compartments & Slots',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 2 Cash Compartments, 8 Card Slots, 1 RFID Protected Coin Pocket',
        displayOrder: 3,
      },
      {
        id: 'field_closure_bag',
        key: 'closure_type',
        label: 'Closure Type',
        type: 'select',
        value: '',
        options: ['Bi-Fold', 'Tri-Fold', 'YKK Metal Zipper', 'Magnetic Clasp', 'Flap with Snap'],
        visibleToCustomers: true,
        displayOrder: 4,
      },
      {
        id: 'field_lining',
        key: 'lining_material',
        label: 'Inner Lining',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. RFID Shielded Microfiber Lining',
        displayOrder: 5,
      },
      {
        id: 'field_care_bag',
        key: 'care_instructions',
        label: 'Care Instructions',
        type: 'textarea',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Wipe clean with a dry microfiber cloth. Condition with leather cream.',
        displayOrder: 6,
      },
      {
        id: 'field_packaging_bag',
        key: 'packaging',
        label: 'Packaging Details',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Packed in Matte Black Matte Gift Box with Ribbon',
        displayOrder: 7,
      },
    ],
  },

  // 5. BELTS
  {
    id: 'tmpl_belts',
    categoryId: 'sub_belts',
    categoryName: 'Belts',
    defaultVariantType: 'custom',
    defaultSizes: ['30 in', '32 in', '34 in', '36 in', '38 in', '40 in'],
    fields: [
      {
        id: 'field_belt_material',
        key: 'material',
        label: 'Belt Material',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 100% Genuine Italian Full Grain Leather',
        displayOrder: 1,
      },
      {
        id: 'field_belt_width',
        key: 'belt_width',
        label: 'Belt Width',
        type: 'text',
        value: '',
        unit: 'mm',
        visibleToCustomers: true,
        description: 'e.g. 35 mm, 38 mm',
        displayOrder: 2,
      },
      {
        id: 'field_buckle_type',
        key: 'buckle_type',
        label: 'Buckle Type',
        type: 'select',
        value: '',
        options: ['Classic Single Prong Pin', 'Automatic Ratchet Click', 'Reversible Twist Buckle', 'Plate Buckle'],
        visibleToCustomers: true,
        displayOrder: 3,
      },
      {
        id: 'field_buckle_material',
        key: 'buckle_material',
        label: 'Buckle Material & Finish',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Solid Zinc Alloy with Brushed Antique Gunmetal Finish',
        displayOrder: 4,
      },
      {
        id: 'field_belt_color',
        key: 'belt_color',
        label: 'Color',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Dual Reversible Black / Tan Brown',
        displayOrder: 5,
      },
    ],
  },

  // 6. GENERAL ACCESSORIES (Watches, Jewellery, Eyewear)
  {
    id: 'tmpl_accessories',
    categoryId: 'cat_accessories',
    categoryName: 'Accessories',
    defaultVariantType: 'none',
    defaultSizes: [],
    fields: [
      {
        id: 'field_acc_material',
        key: 'material',
        label: 'Primary Material',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 316L Surgical Stainless Steel, 18K Gold Plated Brass, Acetate',
        displayOrder: 1,
      },
      {
        id: 'field_acc_dimensions',
        key: 'dimensions',
        label: 'Dimensions',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Dial 40mm, Strap 20mm',
        displayOrder: 2,
      },
      {
        id: 'field_acc_weight',
        key: 'weight',
        label: 'Weight',
        type: 'text',
        value: '',
        unit: 'g',
        visibleToCustomers: true,
        displayOrder: 3,
      },
      {
        id: 'field_acc_finish',
        key: 'finish',
        label: 'Plating / Finish',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Matte PVD Rose Gold, Polished Silver',
        displayOrder: 4,
      },
      {
        id: 'field_acc_packaging',
        key: 'packaging',
        label: 'Packaging Details',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Hard Luxury Case with Authenticity Card',
        displayOrder: 5,
      },
    ],
  },

  // 7. ELECTRONICS & TECH
  {
    id: 'tmpl_electronics',
    categoryId: 'cat_electronics',
    categoryName: 'Electronics',
    defaultVariantType: 'none',
    defaultSizes: [],
    fields: [
      {
        id: 'field_connectivity',
        key: 'connectivity',
        label: 'Connectivity',
        type: 'select',
        value: '',
        options: ['Bluetooth 5.3', 'Wireless 2.4GHz + Bluetooth', 'USB Type-C Fast Charge', 'Wired 3.5mm'],
        visibleToCustomers: true,
        displayOrder: 1,
      },
      {
        id: 'field_battery_life',
        key: 'battery_life',
        label: 'Battery Life',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. Up to 40 Hours with ANC Off',
        displayOrder: 2,
      },
      {
        id: 'field_warranty',
        key: 'warranty',
        label: 'Warranty Period',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 3,
      },
    ],
  },

  // 8. HOME & LIVING
  {
    id: 'tmpl_home',
    categoryId: 'cat_home',
    categoryName: 'Home & Living',
    defaultVariantType: 'none',
    defaultSizes: [],
    fields: [
      {
        id: 'field_home_material',
        key: 'material',
        label: 'Material / Fabric',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 100% Cotton 400 Thread Count, Pure Soy Wax',
        displayOrder: 1,
      },
      {
        id: 'field_home_dimensions',
        key: 'dimensions',
        label: 'Dimensions',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 274 cm x 274 cm (King Size)',
        displayOrder: 2,
      },
      {
        id: 'field_home_set_contents',
        key: 'package_contents',
        label: 'Set Contents',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        description: 'e.g. 1 King Bedsheet, 2 Pillow Covers',
        displayOrder: 3,
      },
    ],
  },
];

/**
 * Returns the best matching category specification template for a given category ID.
 * Priority: Exact subcategory match -> Main category match -> Default general template.
 */
export function getCategoryTemplate(
  mainCatId: string,
  subCatId?: string,
  customTemplates: CategorySpecificationTemplate[] = [],
  subSubCatId?: string
): CategorySpecificationTemplate {
  const matchesCat = (t: CategorySpecificationTemplate, catId: string) =>
    t.categoryId === catId || (t.applicableCategoryIds && t.applicableCategoryIds.includes(catId));

  // 1. Check custom/saved templates first (Child -> Sub -> Main)
  if (subSubCatId) {
    const customChild = customTemplates.find((t) => matchesCat(t, subSubCatId));
    if (customChild) return customChild;
  }
  if (subCatId) {
    const customSub = customTemplates.find((t) => matchesCat(t, subCatId));
    if (customSub) return customSub;
  }
  if (mainCatId) {
    const customMain = customTemplates.find((t) => matchesCat(t, mainCatId));
    if (customMain) return customMain;
  }

  // 2. Check default built-in templates
  if (subCatId) {
    const subLower = subCatId.toLowerCase();
    if (subLower.includes('fragrance') || subLower.includes('perfume')) {
      const perfTmpl = DEFAULT_CATEGORY_TEMPLATES.find((t) => t.id === 'tmpl_perfume');
      if (perfTmpl) return perfTmpl;
    }
    if (subLower.includes('bag') || subLower.includes('wallet')) {
      const bagTmpl = DEFAULT_CATEGORY_TEMPLATES.find((t) => t.id === 'tmpl_bags');
      if (bagTmpl) return bagTmpl;
    }
    if (subLower.includes('belt')) {
      const beltTmpl = DEFAULT_CATEGORY_TEMPLATES.find((t) => t.id === 'tmpl_belts');
      if (beltTmpl) return beltTmpl;
    }
  }

  // Main category check
  const defaultMain = DEFAULT_CATEGORY_TEMPLATES.find((t) => t.categoryId === mainCatId);
  if (defaultMain) return defaultMain;

  // Fallback to fashion template if it looks like clothing or fashion, or general template
  const mainLower = (mainCatId || '').toLowerCase();
  if (mainLower.includes('fashion') || mainLower.includes('clothing') || mainLower.includes('wear')) {
    return DEFAULT_CATEGORY_TEMPLATES[0]; // Fashion
  }
  if (mainLower.includes('foot') || mainLower.includes('shoe')) {
    return DEFAULT_CATEGORY_TEMPLATES[1]; // Footwear
  }
  if (mainLower.includes('access')) {
    return DEFAULT_CATEGORY_TEMPLATES[5]; // Accessories
  }

  // Generic fallback template
  return {
    id: 'tmpl_generic',
    categoryId: mainCatId || 'default',
    categoryName: 'General Product',
    defaultVariantType: 'none',
    defaultSizes: [],
    fields: [
      {
        id: 'field_style',
        key: 'style',
        label: 'Style / Model',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 1,
      },
      {
        id: 'field_material',
        key: 'material',
        label: 'Material',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 2,
      },
      {
        id: 'field_dimensions',
        key: 'dimensions',
        label: 'Dimensions / Size',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 3,
      },
      {
        id: 'field_accessories',
        key: 'accessories',
        label: 'Accessories Included',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 4,
      },
      {
        id: 'field_packaging',
        key: 'packaging',
        label: 'Packaging Details',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 5,
      },
      {
        id: 'field_country',
        key: 'country_of_origin',
        label: 'Country of Origin',
        type: 'text',
        value: '',
        visibleToCustomers: true,
        displayOrder: 6,
      },
    ],
  };
}

/**
 * Returns candidate selectable variant sizes/options for a variant option type.
 * NOTE: These are candidate options for the admin to manually click/select; they are NOT auto-selected.
 */
export function getDefaultSizesForVariantType(variantType: VariantOptionType): string[] {
  switch (variantType) {
    case 'clothing_size':
    case 'clothing_sizes':
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    case 'age_size':
    case 'age_sizes':
      return ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '8-9Y', '10-12Y', '12-14Y', '14-16Y'];
    case 'shoe_size':
    case 'shoe_sizes':
      return ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
    case 'volume_ml':
      return ['15ml', '30ml', '50ml', '100ml', '150ml', '200ml'];
    case 'custom':
    case 'custom_sizes':
      return [];
    case 'none':
    default:
      return [];
  }
}
