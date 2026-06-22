export const COUPON_SELECTORS = {
    LIST_PAGE: {
      HEADER: { locator: 'text="Coupon Lists"' },
      SEARCH_BAR: { locator: 'input[placeholder="Search Coupon Codes"]' },
      ADD_BTN: { locator: 'button:has-text("Add Coupon")' },
      TABS: {
        ALL: { locator: 'button:has-text("All")' },
        ACTIVE: { locator: 'button:has-text("Active")' },
        EXPIRED: { locator: 'button:has-text("Expired")' }
      },
      TABLE: {
        ROWS: { locator: 'tbody tr' },
        CELL_CODE: { locator: 'td:nth-child(3)' },   // 3rd column is Code
        CELL_STATUS: { locator: 'td:nth-child(6)' }, // 6th column is Status
        ACTION_EDIT: { locator: 'button:has-text("Edit")' },
        ACTION_DELETE: { locator: 'button:has-text("Delete")' },
        getRowByCode: (code) => `tbody tr:has(td:text-is("${code}"))`,
        EMPTY_STATE: { locator: 'text="No records found"' } // Adjust if UI says "No Data"
      },
      DELETE_MODAL: {
        CONTAINER: { locator: '[role="dialog"]' },
        CANCEL_BTN: { locator: '[role="dialog"] button:has-text("Cancel")' },
        CONFIRM_BTN: { locator: '[role="dialog"] button:has-text("Delete"), [role="dialog"] button:has-text("Confirm")' }
      }
    },
    ADD_PAGE: {
      INPUTS: {
        NAME: { locator: 'input[placeholder="Coupon Name"]' },
        CODE: { locator: 'input[placeholder="Coupon Code"]' },
        DISCOUNT_PRICE: { locator: 'input[placeholder="Discounted Price"]' },
        MIN_ORDER: { locator: 'input[placeholder="Minimum Order Amount"]' }
      },
      
      ERRORS: {
        NAME_REQUIRED: { locator: 'text="Coupon name is required"' },
        CODE_REQUIRED: { locator: 'text="Coupon code is required"' },
        DISCOUNT_REQUIRED: { locator: 'text="Discount value is required"' },
        DISCOUNT_NUMBER: { locator: 'text="Discount value must be a number"' }, 
        MIN_ORDER_NUMBER: { locator: 'text="Minimum order amount must be a number"' },
        START_DATE_REQUIRED: { locator: 'text="Start date is required"' },
        END_DATE_REQUIRED: { locator: 'text="End date is required"' },
        TERMS_REQUIRED: { locator: 'text="Terms and conditions are required"' },
        TAG_REQUIRED: { locator: 'text="Please select at least one product"' },
        CODE_FORMAT: { 
        // This structural locator says: "Find the error text span specifically inside the Code field group"
          locator: 'div:has(input[name="code"]) span[data-part="error-text"]' },
      },
      TAG_DROPDOWN: {
        // Structurally mapped to bypass random Chakra UI classes
        CONTAINER: { locator: 'div[role="group"]:has(label:has-text("Tag Products"))' },
        TRIGGER: { locator: 'div[data-scope="field"]:has(label:has-text("Tag Products")) div[data-part="trigger"]' },
        POPOVER_CONTENT: { locator: 'div[data-part="content"][role="dialog"]' },
        SEARCH: { locator: 'div[data-part="content"][role="dialog"] input[placeholder="Search..."]' },
        getOption: (productName) => `div[data-part="content"][role="dialog"] >> text="${productName}"`
      },
      TOGGLES: {
        ACTIVE: { locator: 'button[role="switch"]' }, 
        // 🌟 THE FIX: Structural locator linking the text label to its sibling switch
        APPLY_ALL_PRODUCTS: { 
          locator: 'div:has(> label:has-text("Apply coupon to all products?")) label[data-scope="switch"]' 
        } 
      },
      RADIOS: {
        FLAT_DISCOUNT: { locator: 'label:has-text("Flat Discount")' },
        PERCENTAGE_DISCOUNT: { locator: 'label:has-text("Percentage Discount")' }
      },
      SUBMIT_BTN: { locator: 'button:has-text("Add")' 
      },
      UPDATE_BTN: { locator: 'button:has-text("Update"), button:has-text("Save")' },
      COMPLEX_INPUTS: {
        VALID_FROM: { locator: 'input[name="startDate"]' },
        VALID_TILL: { locator: 'input[name="endDate"]' },
        TERMS_EDITOR: { locator: 'div[contenteditable="true"]' },
        IMAGE_UPLOAD: { locator: 'input[type="file"]' }
      },
    }
  };