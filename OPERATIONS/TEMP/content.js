// OBI Content Script — Natural English Training
// Future: Floating chat widget on any webpage

// Only activate on non-NET pages
if (!window.location.hostname.includes('naturalenglishtraining.com')) {
  // Future expansion: inject floating OBI chat button
  // For v0, the content script is minimal
  // The popup is the primary interface

  console.log('[OBI] Content script loaded — Natural English Training');
}
