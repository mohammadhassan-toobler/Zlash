// src/config/DashboardSelectors.js

export const DASHBOARD_SELECTORS = {
  PAGE_TITLE: {
    dataTest: 'page-title',
    text: 'Dashboard',
    xpath: '//heading[contains(text(), "Dashboard")]',
  },
  STORE_NAME: {
    dataTest: 'store-name',
    text: 'VYBE Men', 
    cssClass: 'store-name',
  },
  STORE_EMAIL: {
    dataTest: 'store-email',
    text: 'vybemen@gmail.com',
    cssClass: 'store-email',
  },
  STORE_STATUS_VALUE: {
    dataTest: 'store-status-value',
    text: 'ONLINE',
    cssClass: 'status-online',
    role: { role: 'status' }
  },
  GO_TO_STORE_BUTTON: {
    dataTest: 'go-to-store-btn',
    role: { role: 'button', name: /go to store/i },
    text: 'Go to Store',
    cssClass: 'btn-go-to-store',
  },
  PRODUCTS_LINK: {
    dataTest: 'products-menu',
    role: { role: 'link', name: /products/i },
    text: 'Products',
  }
};