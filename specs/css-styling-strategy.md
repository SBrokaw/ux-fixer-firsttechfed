# CSS Styling Strategy Specification

## Overview
This specification defines the CSS styling strategy for the FirstTechFed UX Fixer extension, including organization, specificity management, and component-specific styles that transform the interface into a dense, CLI-inspired design.

## CSS Architecture Principles

### 1. Modular Organization
- **Component-based**: Each component type has its own CSS file
- **Utility-first**: Reusable utility classes for common patterns
- **Namespace isolation**: All styles prefixed with `ux-fixer-` to avoid conflicts

### 2. Specificity Management
- **Low specificity**: Use classes over IDs to maintain flexibility
- **Cascade control**: Use `!important` sparingly and strategically
- **Override strategy**: Target specific FirstTechFed selectors when needed

### 3. Performance Optimization
- **Efficient selectors**: Avoid deep nesting and complex selectors
- **Minimal repaints**: Use transform and opacity for animations
- **Critical CSS**: Load essential styles first

## CSS File Organization

### Main Stylesheet (main.css)
```css
/* CSS Custom Properties and Global Overrides */
:root {
  /* Color System */
  --ux-fixer-primary: #007bff;
  --ux-fixer-primary-dark: #0056b3;
  --ux-fixer-success: #28a745;
  --ux-fixer-warning: #ffc107;
  --ux-fixer-danger: #dc3545;
  --ux-fixer-info: #17a2b8;
  
  /* Neutral Colors */
  --ux-fixer-white: #ffffff;
  --ux-fixer-gray-100: #f8f9fa;
  --ux-fixer-gray-200: #e9ecef;
  --ux-fixer-gray-300: #dee2e6;
  --ux-fixer-gray-400: #ced4da;
  --ux-fixer-gray-500: #adb5bd;
  --ux-fixer-gray-600: #6c757d;
  --ux-fixer-gray-700: #495057;
  --ux-fixer-gray-800: #343a40;
  --ux-fixer-gray-900: #212529;
  
  /* Typography */
  --ux-fixer-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --ux-fixer-font-family-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  --ux-fixer-font-size-xs: 0.75rem;
  --ux-fixer-font-size-sm: 0.875rem;
  --ux-fixer-font-size-base: 1rem;
  --ux-fixer-font-size-lg: 1.125rem;
  --ux-fixer-font-size-xl: 1.25rem;
  --ux-fixer-line-height-tight: 1.25;
  --ux-fixer-line-height-normal: 1.4;
  --ux-fixer-line-height-relaxed: 1.6;
  
  /* Spacing */
  --ux-fixer-spacing-0: 0;
  --ux-fixer-spacing-1: 0.125rem;
  --ux-fixer-spacing-2: 0.25rem;
  --ux-fixer-spacing-3: 0.5rem;
  --ux-fixer-spacing-4: 0.75rem;
  --ux-fixer-spacing-5: 1rem;
  --ux-fixer-spacing-6: 1.5rem;
  --ux-fixer-spacing-8: 2rem;
  
  /* Borders */
  --ux-fixer-border-width: 1px;
  --ux-fixer-border-radius: 4px;
  --ux-fixer-border-radius-sm: 2px;
  --ux-fixer-border-radius-lg: 8px;
  
  /* Shadows */
  --ux-fixer-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ux-fixer-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --ux-fixer-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Transitions */
  --ux-fixer-transition-fast: 150ms ease-in-out;
  --ux-fixer-transition-normal: 250ms ease-in-out;
  --ux-fixer-transition-slow: 350ms ease-in-out;
}

/* Global Reset and Base Styles */
* {
  box-sizing: border-box;
}

body {
  font-family: var(--ux-fixer-font-family);
  font-size: var(--ux-fixer-font-size-sm);
  line-height: var(--ux-fixer-line-height-normal);
  color: var(--ux-fixer-gray-900);
  background-color: var(--ux-fixer-white);
  margin: 0;
  padding: 0;
}

/* Utility Classes */
.ux-fixer-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ux-fixer-focus-visible {
  outline: 2px solid var(--ux-fixer-primary);
  outline-offset: 2px;
}
```

### Typography Stylesheet (typography.css)
```css
/* Typography System */
.ux-fixer-text-xs { font-size: var(--ux-fixer-font-size-xs); }
.ux-fixer-text-sm { font-size: var(--ux-fixer-font-size-sm); }
.ux-fixer-text-base { font-size: var(--ux-fixer-font-size-base); }
.ux-fixer-text-lg { font-size: var(--ux-fixer-font-size-lg); }
.ux-fixer-text-xl { font-size: var(--ux-fixer-font-size-xl); }

.ux-fixer-font-mono { font-family: var(--ux-fixer-font-family-mono); }
.ux-fixer-font-sans { font-family: var(--ux-fixer-font-family); }

.ux-fixer-leading-tight { line-height: var(--ux-fixer-line-height-tight); }
.ux-fixer-leading-normal { line-height: var(--ux-fixer-line-height-normal); }
.ux-fixer-leading-relaxed { line-height: var(--ux-fixer-line-height-relaxed); }

.ux-fixer-font-normal { font-weight: 400; }
.ux-fixer-font-medium { font-weight: 500; }
.ux-fixer-font-semibold { font-weight: 600; }
.ux-fixer-font-bold { font-weight: 700; }

/* Text Colors */
.ux-fixer-text-primary { color: var(--ux-fixer-gray-900); }
.ux-fixer-text-secondary { color: var(--ux-fixer-gray-600); }
.ux-fixer-text-muted { color: var(--ux-fixer-gray-500); }
.ux-fixer-text-success { color: var(--ux-fixer-success); }
.ux-fixer-text-warning { color: var(--ux-fixer-warning); }
.ux-fixer-text-danger { color: var(--ux-fixer-danger); }
.ux-fixer-text-info { color: var(--ux-fixer-info); }

/* Headings */
.ux-fixer-heading-1 {
  font-size: var(--ux-fixer-font-size-xl);
  font-weight: 600;
  line-height: var(--ux-fixer-line-height-tight);
  margin: 0 0 var(--ux-fixer-spacing-4) 0;
}

.ux-fixer-heading-2 {
  font-size: var(--ux-fixer-font-size-lg);
  font-weight: 600;
  line-height: var(--ux-fixer-line-height-tight);
  margin: 0 0 var(--ux-fixer-spacing-3) 0;
}

.ux-fixer-heading-3 {
  font-size: var(--ux-fixer-font-size-base);
  font-weight: 600;
  line-height: var(--ux-fixer-line-height-tight);
  margin: 0 0 var(--ux-fixer-spacing-2) 0;
}

.ux-fixer-heading-4 {
  font-size: var(--ux-fixer-font-size-sm);
  font-weight: 600;
  line-height: var(--ux-fixer-line-height-tight);
  margin: 0 0 var(--ux-fixer-spacing-2) 0;
}
```

### Form Stylesheet (forms.css)
```css
/* Form Container */
.ux-fixer-form {
  display: flex;
  flex-direction: column;
  gap: var(--ux-fixer-spacing-3);
  max-width: 100%;
}

/* Form Groups */
.ux-fixer-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--ux-fixer-spacing-1);
}

.ux-fixer-form-group-inline {
  display: flex;
  align-items: center;
  gap: var(--ux-fixer-spacing-3);
}

/* Labels */
.ux-fixer-label {
  font-size: var(--ux-fixer-font-size-sm);
  font-weight: 500;
  color: var(--ux-fixer-gray-700);
  margin-bottom: var(--ux-fixer-spacing-1);
}

.ux-fixer-label-required::after {
  content: " *";
  color: var(--ux-fixer-danger);
}

/* Input Fields */
.ux-fixer-input {
  padding: var(--ux-fixer-spacing-2) var(--ux-fixer-spacing-3);
  border: var(--ux-fixer-border-width) solid var(--ux-fixer-gray-300);
  border-radius: var(--ux-fixer-border-radius);
  font-size: var(--ux-fixer-font-size-sm);
  line-height: var(--ux-fixer-line-height-normal);
  background-color: var(--ux-fixer-white);
  color: var(--ux-fixer-gray-900);
  transition: border-color var(--ux-fixer-transition-fast);
  width: 100%;
}

.ux-fixer-input:focus {
  outline: none;
  border-color: var(--ux-fixer-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.ux-fixer-input:disabled {
  background-color: var(--ux-fixer-gray-100);
  color: var(--ux-fixer-gray-500);
  cursor: not-allowed;
}

.ux-fixer-input-error {
  border-color: var(--ux-fixer-danger);
}

.ux-fixer-input-error:focus {
  border-color: var(--ux-fixer-danger);
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

/* Radio Button Groups */
.ux-fixer-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--ux-fixer-spacing-2);
}

.ux-fixer-radio-group-inline {
  flex-direction: row;
  flex-wrap: wrap;
}

.ux-fixer-radio-item {
  display: flex;
  align-items: center;
  gap: var(--ux-fixer-spacing-2);
}

.ux-fixer-radio-item input[type="radio"] {
  margin: 0;
  width: 16px;
  height: 16px;
}

.ux-fixer-radio-item label {
  font-size: var(--ux-fixer-font-size-sm);
  color: var(--ux-fixer-gray-700);
  cursor: pointer;
}

/* Toggle Switches */
.ux-fixer-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.ux-fixer-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.ux-fixer-toggle .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--ux-fixer-gray-300);
  transition: var(--ux-fixer-transition-fast);
  border-radius: 24px;
}

.ux-fixer-toggle .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--ux-fixer-white);
  transition: var(--ux-fixer-transition-fast);
  border-radius: 50%;
  box-shadow: var(--ux-fixer-shadow-sm);
}

.ux-fixer-toggle input:checked + .slider {
  background-color: var(--ux-fixer-primary);
}

.ux-fixer-toggle input:checked + .slider:before {
  transform: translateX(20px);
}

/* Error Messages */
.ux-fixer-error {
  color: var(--ux-fixer-danger);
  font-size: var(--ux-fixer-font-size-xs);
  margin-top: var(--ux-fixer-spacing-1);
  display: flex;
  align-items: center;
  gap: var(--ux-fixer-spacing-1);
}

.ux-fixer-error::before {
  content: "⚠";
  font-size: var(--ux-fixer-font-size-sm);
}

/* Success Messages */
.ux-fixer-success {
  color: var(--ux-fixer-success);
  font-size: var(--ux-fixer-font-size-xs);
  margin-top: var(--ux-fixer-spacing-1);
  display: flex;
  align-items: center;
  gap: var(--ux-fixer-spacing-1);
}

.ux-fixer-success::before {
  content: "✓";
  font-size: var(--ux-fixer-font-size-sm);
}
```

### Navigation Stylesheet (navigation.css)
```css
/* Main Navigation */
.ux-fixer-nav {
  background-color: var(--ux-fixer-gray-100);
  border-bottom: var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200);
  padding: var(--ux-fixer-spacing-3) var(--ux-fixer-spacing-5);
}

.ux-fixer-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.ux-fixer-nav-brand {
  font-size: var(--ux-fixer-font-size-lg);
  font-weight: 600;
  color: var(--ux-fixer-gray-900);
  text-decoration: none;
}

.ux-fixer-nav-menu {
  display: flex;
  align-items: center;
  gap: var(--ux-fixer-spacing-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.ux-fixer-nav-item {
  position: relative;
}

.ux-fixer-nav-link {
  display: block;
  padding: var(--ux-fixer-spacing-2) var(--ux-fixer-spacing-3);
  color: var(--ux-fixer-gray-600);
  text-decoration: none;
  font-size: var(--ux-fixer-font-size-sm);
  border-radius: var(--ux-fixer-border-radius);
  transition: all var(--ux-fixer-transition-fast);
}

.ux-fixer-nav-link:hover {
  color: var(--ux-fixer-gray-900);
  background-color: var(--ux-fixer-gray-200);
}

.ux-fixer-nav-link.active {
  color: var(--ux-fixer-primary);
  background-color: rgba(0, 123, 255, 0.1);
  font-weight: 500;
}

/* Breadcrumbs */
.ux-fixer-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--ux-fixer-spacing-2);
  padding: var(--ux-fixer-spacing-3) var(--ux-fixer-spacing-5);
  background-color: var(--ux-fixer-white);
  border-bottom: var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200);
  font-size: var(--ux-fixer-font-size-xs);
}

.ux-fixer-breadcrumb-item {
  color: var(--ux-fixer-gray-500);
  text-decoration: none;
}

.ux-fixer-breadcrumb-item:hover {
  color: var(--ux-fixer-gray-700);
  text-decoration: underline;
}

.ux-fixer-breadcrumb-item.active {
  color: var(--ux-fixer-gray-900);
  font-weight: 500;
}

.ux-fixer-breadcrumb-separator {
  color: var(--ux-fixer-gray-400);
  margin: 0 var(--ux-fixer-spacing-1);
}

/* Mobile Navigation */
@media (max-width: 768px) {
  .ux-fixer-nav-container {
    flex-direction: column;
    gap: var(--ux-fixer-spacing-3);
  }
  
  .ux-fixer-nav-menu {
    flex-direction: column;
    width: 100%;
    gap: var(--ux-fixer-spacing-1);
  }
  
  .ux-fixer-nav-link {
    width: 100%;
    text-align: center;
  }
}
```

### Component Stylesheet (components.css)
```css
/* Buttons */
.ux-fixer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ux-fixer-spacing-2);
  padding: var(--ux-fixer-spacing-2) var(--ux-fixer-spacing-4);
  border: var(--ux-fixer-border-width) solid transparent;
  border-radius: var(--ux-fixer-border-radius);
  font-size: var(--ux-fixer-font-size-sm);
  font-weight: 500;
  line-height: var(--ux-fixer-line-height-normal);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--ux-fixer-transition-fast);
  background-color: var(--ux-fixer-gray-100);
  color: var(--ux-fixer-gray-700);
}

.ux-fixer-btn:hover {
  background-color: var(--ux-fixer-gray-200);
  color: var(--ux-fixer-gray-900);
}

.ux-fixer-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.ux-fixer-btn-primary {
  background-color: var(--ux-fixer-primary);
  color: var(--ux-fixer-white);
}

.ux-fixer-btn-primary:hover {
  background-color: var(--ux-fixer-primary-dark);
}

.ux-fixer-btn-success {
  background-color: var(--ux-fixer-success);
  color: var(--ux-fixer-white);
}

.ux-fixer-btn-danger {
  background-color: var(--ux-fixer-danger);
  color: var(--ux-fixer-white);
}

.ux-fixer-btn-small {
  padding: var(--ux-fixer-spacing-1) var(--ux-fixer-spacing-3);
  font-size: var(--ux-fixer-font-size-xs);
}

.ux-fixer-btn-large {
  padding: var(--ux-fixer-spacing-3) var(--ux-fixer-spacing-6);
  font-size: var(--ux-fixer-font-size-base);
}

/* Cards */
.ux-fixer-card {
  background-color: var(--ux-fixer-white);
  border: var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200);
  border-radius: var(--ux-fixer-border-radius);
  box-shadow: var(--ux-fixer-shadow);
  overflow: hidden;
}

.ux-fixer-card-header {
  padding: var(--ux-fixer-spacing-4);
  border-bottom: var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200);
  background-color: var(--ux-fixer-gray-50);
}

.ux-fixer-card-body {
  padding: var(--ux-fixer-spacing-4);
}

.ux-fixer-card-footer {
  padding: var(--ux-fixer-spacing-4);
  border-top: var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200);
  background-color: var(--ux-fixer-gray-50);
}

/* Tables */
.ux-fixer-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--ux-fixer-font-size-sm);
  font-family: var(--ux-fixer-font-family-mono);
}

.ux-fixer-table th,
.ux-fixer-table td {
  padding: var(--ux-fixer-spacing-2) var(--ux-fixer-spacing-3);
  text-align: left;
  border-bottom: var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200);
}

.ux-fixer-table th {
  background-color: var(--ux-fixer-gray-50);
  font-weight: 600;
  color: var(--ux-fixer-gray-700);
  font-family: var(--ux-fixer-font-family);
}

.ux-fixer-table tr:hover {
  background-color: var(--ux-fixer-gray-50);
}

/* Alerts */
.ux-fixer-alert {
  padding: var(--ux-fixer-spacing-3) var(--ux-fixer-spacing-4);
  border: var(--ux-fixer-border-width) solid transparent;
  border-radius: var(--ux-fixer-border-radius);
  margin-bottom: var(--ux-fixer-spacing-4);
  display: flex;
  align-items: flex-start;
  gap: var(--ux-fixer-spacing-3);
}

.ux-fixer-alert-info {
  background-color: rgba(23, 162, 184, 0.1);
  border-color: var(--ux-fixer-info);
  color: var(--ux-fixer-info);
}

.ux-fixer-alert-success {
  background-color: rgba(40, 167, 69, 0.1);
  border-color: var(--ux-fixer-success);
  color: var(--ux-fixer-success);
}

.ux-fixer-alert-warning {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: var(--ux-fixer-warning);
  color: var(--ux-fixer-warning);
}

.ux-fixer-alert-danger {
  background-color: rgba(220, 53, 69, 0.1);
  border-color: var(--ux-fixer-danger);
  color: var(--ux-fixer-danger);
}
```

## Specificity and Override Strategy

### CSS Specificity Hierarchy
1. **Base styles**: Element selectors (low specificity)
2. **Component styles**: Class selectors (medium specificity)
3. **Utility styles**: Single-class selectors (medium specificity)
4. **Override styles**: Multiple classes or `!important` (high specificity)

### FirstTechFed Override Strategy
```css
/* Target specific FirstTechFed elements when needed */
.firsttechfed-header .ux-fixer-nav {
  /* Override specific FirstTechFed header styles */
}

.firsttechfed-form .ux-fixer-input {
  /* Override specific FirstTechFed form styles */
}

/* Use !important sparingly and only for critical overrides */
.ux-fixer-critical-override {
  display: block !important;
  visibility: visible !important;
}
```

## Performance Considerations

### CSS Loading Strategy
- **Critical CSS**: Load essential styles in `<head>`
- **Non-critical CSS**: Load after page render
- **CSS optimization**: Minify and compress for production

### Selector Efficiency
```css
/* Efficient selectors */
.ux-fixer-nav-item { /* Good */ }
.ux-fixer-nav .ux-fixer-nav-item { /* Avoid deep nesting */ }

/* Use attribute selectors sparingly */
.ux-fixer-input[type="text"] { /* Only when necessary */ }
```

---

*Next: Define content script implementation details* 