// src/config/DashboardSelectors.js

export const DASHBOARD_SELECTORS = {
  PAGE_TITLE: {
    // FIX 1: Look specifically for the heading, ignoring the sidebar text
    role: { role: 'heading', name: 'Dashboard' }, 
    xpath: '//h2[contains(text(), "Dashboard")]',
  },
  // 
  // --- DASHBOARD READ-ONLY DISPLAY LOCATORS ---
  STORE_NAME_DISPLAY: {
    // Anchors to the "Store Status" heading, grabs the 1st paragraph
    locator: 'div:has(h5:has-text("Store Status")) > p:nth-of-type(1)'
  },
  STORE_EMAIL: {
    // Anchors to the "Store Status" heading, grabs the paragraph with the @ symbol
    locator: 'div:has(h5:has-text("Store Status")) > p:has-text("@")'
  },
  STORE_STATUS_VALUE: {
    // Anchors to the "Store Status" heading, grabs the last paragraph (ONLINE/OFFLINE)
    locator: 'div:has(h5:has-text("Store Status")) > p:last-of-type'
  },
  GO_TO_STORE_BUTTON: {
    // The undisputed best practice for Playwright. 
    // Finds the <button> tag containing the text, ignoring the SVG icon.
    role: { role: 'button', name: /go to store/i },
    
    // An explicit fallback string just in case your LocatorManager needs it
    locator: 'button:has-text("Go to Store")' 
  },
  PRODUCTS_LINK: {
    // FIX 2: Look specifically for the <a> link role, ignoring the inner span
    role: { role: 'link', name: /products/i },
    xpath: '//a[contains(@href, "/admin/product")]'
  },
  // --- EDIT STORE FORM ---
  EDIT_STORE_BUTTON: { role: { role: 'button', name: /edit store/i } },
  
  STORE_FORM: {
    // NAME_INPUT: { role: { role: 'textbox', name: /store name/i } },
    // Use this for edit-store.spec.js (looking for the field in the form)
    NAME_INPUT: { 
      locator: "input[name='storeName']",
      role: { role: 'textbox', name: /store name/i } 
    },
    PHONE_INPUT: { locator: 'input[placeholder="Store Phone Number"]' }, // Better than nth(1)!
    EMAIL_INPUT: { role: { role: 'textbox', name: /email/i } },
    BIO_INPUT: { role: { role: 'textbox', name: /bio/i } },
    STATUS_DROPDOWN: { role: { role: 'combobox', name: /store status/i } },
    CATEGORY_INPUT: { locator: '.css-1hwfws3' }, // Typical React-Select input class, update if needed
    // ... other inputs ...
    LOGO_UPLOAD_INPUT: { locator: 'input[type="file"]' },
    
    // NEW: Target the Delete button using its aria-label
    LOGO_DELETE_BUTTON: { 
      role: { role: 'button', name: /delete/i },
      locator: 'button[aria-label="Delete"]' 
    },
    // The red 'Delete' button inside the confirmation popup
    CONFIRM_DELETE_BUTTON: {
      role: { role: 'button', name: /^delete$/i },
      locator: 'button.chakra-button:has-text("Delete")'
    },
    // The actual input that accepts the file
    LOGO_UPLOAD_INPUT: { 
      locator: 'input[type="file"]' 
    }, 
    // File inputs are usually hidden
    UPDATE_BUTTON: { role: { role: 'button', name: /update/i } },
    CANCEL_BUTTON: { role: { role: 'button', name: /cancel/i } }
  }
};
