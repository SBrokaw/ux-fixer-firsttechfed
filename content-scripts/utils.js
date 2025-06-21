// utils.js
// Utility functions for FirstTechFed UX Fixer

// Example: DOM query helpers, validation, etc.

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function addClass(el, className) {
  if (el && !el.classList.contains(className)) {
    el.classList.add(className);
  }
}

export function removeClass(el, className) {
  if (el && el.classList.contains(className)) {
    el.classList.remove(className);
  }
} 