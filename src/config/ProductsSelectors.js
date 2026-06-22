// src/config/ProductsSelectors.js
//
// Central resilient selector config for all Products-related pages.
// Each key maps to a selectorObj consumed by LocatorManager.getResilientLocator().
// Multiple strategies are layered so that if one breaks the others still resolve.

export const PRODUCTS_SELECTORS = {

  // ══════════════════════════════════════════════════════════════════════════
  // PRODUCTS LIST PAGE  (/admin/product)
  // ══════════════════════════════════════════════════════════════════════════

  PRODUCTS_MENU: {
    role: { role: 'link', name: 'Products' },
    xpath: '//a[contains(@href, "/admin/product")]',
  },

  PRODUCT_LIST_HEADER: {
    locator: 'h2:has-text("Products Lists")',
    xpath: '//h2[contains(text(), "Products")]',
  },

  ADD_PRODUCT_BUTTON: {
    role: { role: 'button', name: 'Add Products' },
    locator: 'button:has-text("Add Products")',
  },

  SEARCH_INPUT: {
    locator: 'input[placeholder="Search Products"]',
  },

  PRODUCT_ROWS: {
    locator: 'table tbody tr',
  },

  PRODUCT_IMAGE: {
    locator: 'table tbody tr img',
  },

  CLEAR_FILTER_BUTTON: {
    locator: '[aria-label="Clear selected options"]',
  },

  ERROR_MESSAGE: {
    text: 'Data do not exists',
    locator: ':text("Data do not exists")',
  },

  // ── Product Detail Page ─────────────────────────────────────────────────

  PRODUCT_DETAILS_HEADER: {
    role: { role: 'heading', name: 'Product Details' },
    xpath: '//h2[contains(text(), "Product Details")]',
  },

  BACK_TO_PRODUCTS_LIST: {
    text: 'Back to Product List',
    locator: ':text("Back to Product List")',
  },

  EDIT_PRODUCT_BUTTON: {
    role: { role: 'button', name: 'Edit Product' },
    locator: 'button:has-text("Edit Product")',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CREATE / EDIT PRODUCT – SHARED WIZARD TABS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Tab Navigation ────────────────────────────────────────────────────────

  TAB_PRODUCT_CATEGORY: {
    role: { role: 'tab', name: 'Product Category' },
  },

  TAB_PRODUCT_IDENTITY: {
    role: { role: 'tab', name: 'Product Identity' },
  },

  TAB_PRODUCT_DETAILS: {
    role: { role: 'tab', name: 'Product Details' },
  },

  TAB_PRODUCT_ATTRIBUTES: {
    role: { role: 'tab', name: 'Product Attributes' },
  },

  TAB_PRODUCT_OPTIONS: {
    role: { role: 'tab', name: 'Product Options' },
  },

  // ── Tab 1: Product Category ───────────────────────────────────────────────

  ADD_PRODUCT_PAGE_HEADER: {
    role: { role: 'heading', name: 'Add a Product' },
    xpath: '//h2[contains(text(), "Add a Product")]',
  },

  EDIT_PRODUCT_PAGE_HEADER: {
    role: { role: 'heading', name: 'Edit Product' },
    xpath: '//h2[contains(text(), "Edit Product")]',
  },

  ADD_MEDIA_HEADER: {
    text: 'Add Media of your Product',
    locator: ':text("Add Media of your Product")',
  },

  SELECT_CATEGORY_HEADER: {
    role: { role: 'heading', name: 'Select a Category to get started!' },
    text: 'Select a Category to get started!',
  },

  CHOOSE_MEDIA_BUTTON: {
    text: 'Choose your Media',
    locator: ':text("Choose your Media")',
  },

  MEDIA_UPLOAD_INPUT: {
    locator: 'input[type="file"]',
  },

  UPLOADED_PRODUCT_IMAGE: {
    locator: 'img[alt^="media"], img[src*="data:image"], img[src*="amazonaws.com"]',
  },

  SELECT_CATEGORY_BUTTON: {
    text: 'Select a Category',
    exact: true,
    locator: ':text-is("Select a Category")',
  },

  CATEGORY_LOCKED_TEXT: {
    text: 'selected category cannot be edited',
    locator: ':text("selected category cannot be edited")',
  },

  CATEGORY_DISPLAYED: {
    text: 'Fashion & Apparel',
    locator: ':text("Fashion & Apparel")',
  },

  CONTINUE_BUTTON: {
    role: { role: 'button', name: 'Continue' },
    locator: 'button:has-text("Continue")',
  },

  // ── Tab 2: Product Identity ───────────────────────────────────────────────

  PRODUCT_IDENTITY_HEADER: {
    text: 'Set the Identity of your Product',
    locator: ':text("Set the Identity of your Product")',
  },

  PRODUCT_NAME_INPUT: {
    role: { role: 'textbox', name: 'Product Name' },
    locator: 'input[aria-label="Product Name"]',
  },

  BRAND_NAME_INPUT: {
    role: { role: 'textbox', name: 'Brand Name' },
    locator: 'input[aria-label="Brand Name"]',
  },

  PRODUCT_CATEGORY_BADGE: {
    locator: 'span:has-text("Fashion & Apparel")',
  },

  // ── Tab 3: Product Details ────────────────────────────────────────────────

  PRODUCT_DETAILS_TAB_HEADER: {
    text: 'Set the Details of your Product',
    locator: ':text("Set the Details of your Product")',
  },

  DESCRIPTION_INPUT: {
    role: { role: 'textbox', name: 'Description' },
    locator: 'textarea[aria-label="Description"]',
  },

  SLEEVE_INPUT: {
    role: { role: 'textbox', name: 'Sleeve Type' },
    locator: '[aria-label="Sleeve Type"]',
  },

  NECK_TYPE_INPUT: {
    role: { role: 'textbox', name: 'Neck / Collar Type' },
    locator: '[aria-label="Neck / Collar Type"]',
  },

  LENGTH_INPUT: {
    role: { role: 'textbox', name: 'Length' },
    locator: '[aria-label="Length"]',
  },

  WASHCARE_INPUT: {
    role: { role: 'textbox', name: 'Washcare' },
    locator: '[aria-label="Washcare"]',
  },

  // ── Tab 4: Product Attributes ─────────────────────────────────────────────

  PRODUCT_ATTRIBUTES_HEADER: {
    text: 'Set the Attributes of your Product',
    locator: ':text("Set the Attributes of your Product")',
  },

  CHOOSE_VARIANT_TYPE_BUTTON: {
    role: { role: 'button', name: 'Choose Variant Type' },
    locator: 'button:has-text("Choose Variant Type")',
  },

  VARIANT_SIZE_BUTTON: {
    role: { role: 'button', name: 'Size' },
    locator: 'button:has-text("Size")',
  },

  VARIANT_COLOR_BUTTON: {
    role: { role: 'button', name: 'Color' },
    locator: 'button:has-text("Color")',
  },

  VARIANT_GENDER_BUTTON: {
    role: { role: 'button', name: 'Gender' },
    locator: 'button:has-text("Gender")',
  },

  VARIANT_FIT_BUTTON: {
    role: { role: 'button', name: 'Fit' },
    locator: 'button:has-text("Fit")',
  },

  VARIANT_PATTERN_BUTTON: {
    role: { role: 'button', name: 'Pattern' },
    locator: 'button:has-text("Pattern")',
  },

  VARIANT_SAVE_BUTTON: {
    role: { role: 'button', name: 'Save' },
    locator: '[data-scope="dialog"] button:has-text("Save")',
  },

  ADD_VARIANT_BUTTON: {
    role: { role: 'button', name: 'Add Variants' },
    locator: 'button:has-text("Add Variants")',
  },

  VARIANT_SIZE_SELECT: {
    text: 'Select Size',
    locator: ':text("Select Size")',
  },

  VARIANT_COLOR_SELECT: {
    text: 'Select Color',
    locator: ':text("Select Color")',
  },

  VARIANT_GENDER_SELECT: {
    text: 'Select Gender',
    locator: ':text("Select Gender")',
  },

  VARIANT_FIT_SELECT: {
    text: 'Select Fit',
    locator: ':text("Select Fit")',
  },

  VARIANT_PATTERN_SELECT: {
    text: 'Select Pattern',
    locator: ':text("Select Pattern")',
  },

  VARIANT_ERROR_MESSAGES: {
    locator: 'span:has-text("Required")',
  },

  VARIANT_QUANTITY_INPUT: {
    role: { role: 'textbox', name: 'Quantity' },
    locator: 'input[placeholder*="Quantity"]',
  },

  VARIANT_PRICE_INPUT: {
    role: { role: 'textbox', name: 'Price' },
    locator: 'input[name="price"]',
  },

  AVAILABLE_TO_PURCHASE_TOGGLE: {
    locator: "span[id='switch:isAvailable:control']",
  },

  VARIANT_IMAGE_BUTTON: {
    text: 'Choose Your Media',
    locator: ':text("Choose Your Media")',
  },

  DISCOUNT_INPUT: {
    locator: 'input[placeholder="Enter the Amount"]',
  },

  DISCOUNT_TOGGLE_TEXT: {
    text: 'This product has Discount?',
    locator: ':text("This product has Discount?")',
  },

  // ── Edit Variant Drawer ───────────────────────────────────────────────────

  VARIANT_DRAWER_HEADER: {
    text: 'Edit Variant',
    locator: ':text("Edit Variant")',
  },

  VARIANT_QUANTITY_DRAWER_INPUT: {
    locator: 'input[placeholder*="Quantity (Total quantity added by seller)"]',
  },

  VARIANT_PRICE_DRAWER_INPUT: {
    locator: 'input[name="price"]',
  },

  VARIANT_EDIT_BUTTON: {
    role: { role: 'button', name: 'Edit' },
    locator: 'button:has-text("Edit")',
  },

  VARIANT_UPDATE_BUTTON: {
    role: { role: 'button', name: 'Update' },
    locator: 'button:has-text("Update")',
  },

  VARIANT_DELETE_BUTTON: {
    role: { role: 'button', name: 'Delete' },
    locator: '[data-scope="dialog"] button:has-text("Delete")',
  },

  // ── Tab 5: Product Options ────────────────────────────────────────────────

  PRODUCT_OPTIONS_HEADER: {
    text: 'Set the Store Options',
    locator: ':text("Set the Store Options")',
  },

  SAVE_BUTTON: {
    role: { role: 'button', name: 'Save' },
    locator: 'button:has-text("Save")',
  },

  DELETE_PRODUCT_BUTTON: {
    role: { role: 'button', name: 'Delete' },
    locator: 'button:has-text("Delete")',
  },

  RECOMMEND_LABEL: {
    text: 'Recommend',
    locator: ':text("Recommend")',
  },

  AVAILABLE_TO_SELL_LABEL: {
    text: 'Available to sell?',
    locator: ':text("Available to sell?")',
  },

  ENABLE_DELIVERY_LABEL: {
    text: 'Enable Delivery',
    locator: ':text("Enable Delivery")',
  },

  ENABLE_RETURN_LABEL: {
    text: 'Enable Return',
    locator: ':text("Enable Return")',
  },

  DELETE_PRODUCT_LABEL: {
    text: 'Delete this Product?',
    locator: ':text("Delete this Product?")',
  },

  BACK_TO_PRODUCT_LIST_LINK: {
    text: 'Back to Product List',
    locator: ':text("Back to Product List")',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DELETE CONFIRMATION DIALOG
  // ══════════════════════════════════════════════════════════════════════════

  DELETE_DIALOG_HEADER: {
    text: 'Delete Product',
    locator: ':text("Delete Product")',
  },

  DELETE_DIALOG_BODY: {
    text: 'Are you sure you want to delete this product? This action cannot be undone.',
    locator: ':text("Are you sure you want to delete this product")',
  },

  CONFIRM_DELETE_BUTTON: {
    role: { role: 'button', name: 'Delete' },
    locator: '[data-scope="dialog"] button:has-text("Delete")',
  },

  CANCEL_DELETE_BUTTON: {
    role: { role: 'button', name: 'Cancel' },
    locator: '[data-scope="dialog"] button:has-text("Cancel")',
  },
};
