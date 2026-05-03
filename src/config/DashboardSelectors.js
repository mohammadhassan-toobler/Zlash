// src/config/DashboardSelectors.js

export const DASHBOARD_SELECTORS = {
  PAGE_TITLE: {
    // FIX 1: Look specifically for the heading, ignoring the sidebar text
    role: { role: 'heading', name: 'Dashboard' }, 
    xpath: '//h2[contains(text(), "Dashboard")]',
  },
  STORE_NAME: {
    dataTest: 'store-name',
    text: 'C R O W N ▽ N E X U S', 
    cssClass: 'store-name',
  },
  STORE_EMAIL: {
    dataTest: 'store-email',
    text: 'nexusli@2.trend.com',
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
    // FIX 2: Look specifically for the <a> link role, ignoring the inner span
    role: { role: 'link', name: /products/i },
    xpath: '//a[contains(@href, "/admin/product")]'
  }
};