# Firefox Extension Structure Specification

## Overview
This specification defines the structure and organization of the FirstTechFed UX Fixer Firefox extension, including the manifest file, content scripts, and overall architecture.

## Extension Architecture

### Manifest V3 Structure
The extension will use Manifest V3, the latest Firefox extension format, which provides better security and performance.

### File Organization
```
ux-fixer-firsttechfed/
├── manifest.json                 # Extension manifest
├── content-scripts/              # Scripts that run on web pages
│   ├── main.js                   # Main content script entry point
│   ├── form-transformer.js       # Form transformation logic
│   ├── ui-transformer.js         # UI transformation logic
│   └── utils.js                  # Utility functions
├── styles/                       # CSS files for styling
│   ├── main.css                  # Main stylesheet
│   ├── forms.css                 # Form-specific styles
│   ├── navigation.css            # Navigation styles
│   ├── typography.css            # Typography system
│   └── components.css            # Component styles
├── utils/                        # Shared utilities
│   ├── selectors.js              # CSS selector definitions
│   ├── transformations.js        # Transformation functions
│   └── validation.js             # Validation utilities
├── specs/                        # Specification documents
├── README.md                     # Project documentation
└── package.json                  # Development dependencies
```

## Manifest.json Specification

### Basic Manifest Structure
```json
{
  "manifest_version": 3,
  "name": "FirstTechFed UX Fixer",
  "version": "1.0.0",
  "description": "Transform FirstTechFed's interface into a dense, efficient, text-based design",
  "author": "Your Name",
  "homepage_url": "https://github.com/sbrokaw/ux-fixer-firsttechfed",
  
  "permissions": [
    "activeTab"
  ],
  
  "host_permissions": [
    "https://*.firsttechfed.com/*"
  ],
  
  "content_scripts": [
    {
      "matches": ["https://*.firsttechfed.com/*"],
      "css": [
        "styles/main.css",
        "styles/forms.css",
        "styles/navigation.css",
        "styles/typography.css",
        "styles/components.css"
      ],
      "js": [
        "content-scripts/main.js"
      ],
      "run_at": "document_start"
    }
  ],
  
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  
  "web_accessible_resources": [
    {
      "resources": ["styles/*"],
      "matches": ["https://*.firsttechfed.com/*"]
    }
  ]
}
```

### Permission Requirements
- **activeTab**: Access to the current tab when extension is activated
- **host_permissions**: Access to FirstTechFed domains only

## Content Script Architecture

### Main Content Script (main.js)
```javascript
// Main entry point for the extension
class FirstTechFedUXFixer {
  constructor() {
    this.initialized = false;
    this.transformers = [];
  }

  async init() {
    if (this.initialized) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
    
    this.initialized = true;
  }

  start() {
    console.log('FirstTechFed UX Fixer: Initializing...');
    
    // Initialize transformers
    this.transformers = [
      new FormTransformer(),
      new UITransformer(),
      new NavigationTransformer()
    ];
    
    // Apply transformations
    this.applyTransformations();
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
  }

  applyTransformations() {
    this.transformers.forEach(transformer => {
      try {
        transformer.transform();
      } catch (error) {
        console.error('Transformation error:', error);
      }
    });
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldRetransform = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRetransform = true;
        }
      });
      
      if (shouldRetransform) {
        // Debounce retransformation
        clearTimeout(this.retransformTimeout);
        this.retransformTimeout = setTimeout(() => {
          this.applyTransformations();
        }, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize the extension
const uxFixer = new FirstTechFedUXFixer();
uxFixer.init();
```

### Form Transformer (form-transformer.js)
```javascript
class FormTransformer {
  constructor() {
    this.selectors = {
      forms: 'form',
      inputs: 'input, select, textarea',
      dropdowns: 'select',
      checkboxes: 'input[type="checkbox"]',
      radioButtons: 'input[type="radio"]'
    };
  }

  transform() {
    this.transformDropdowns();
    this.transformCheckboxes();
    this.optimizeFormLayouts();
    this.addInlineValidation();
  }

  transformDropdowns() {
    const dropdowns = document.querySelectorAll(this.selectors.dropdowns);
    dropdowns.forEach(dropdown => {
      if (dropdown.options.length <= 5) {
        this.convertToRadioButtons(dropdown);
      }
    });
  }

  convertToRadioButtons(selectElement) {
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-group ux-fixer-radio-group';
    
    Array.from(selectElement.options).forEach(option => {
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = selectElement.name;
      radio.value = option.value;
      radio.id = `ux-fixer-${selectElement.name}-${option.value}`;
      
      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.textContent = option.textContent;
      
      radioGroup.appendChild(radio);
      radioGroup.appendChild(label);
    });
    
    selectElement.parentNode.replaceChild(radioGroup, selectElement);
  }

  transformCheckboxes() {
    const checkboxes = document.querySelectorAll(this.selectors.checkboxes);
    checkboxes.forEach(checkbox => {
      this.convertToToggleSwitch(checkbox);
    });
  }

  convertToToggleSwitch(checkbox) {
    const wrapper = document.createElement('div');
    wrapper.className = 'toggle-switch ux-fixer-toggle';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checkbox.checked;
    input.name = checkbox.name;
    input.value = checkbox.value;
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    
    wrapper.appendChild(input);
    wrapper.appendChild(slider);
    
    checkbox.parentNode.replaceChild(wrapper, checkbox);
  }

  optimizeFormLayouts() {
    const forms = document.querySelectorAll(this.selectors.forms);
    forms.forEach(form => {
      form.classList.add('ux-fixer-form');
    });
  }

  addInlineValidation() {
    const inputs = document.querySelectorAll(this.selectors.inputs);
    inputs.forEach(input => {
      input.addEventListener('blur', this.validateField.bind(this));
      input.addEventListener('input', this.clearError.bind(this));
    });
  }

  validateField(event) {
    const input = event.target;
    const value = input.value;
    
    // Add validation logic here
    if (input.required && !value) {
      this.showError(input, 'This field is required');
    } else {
      this.clearError(input);
    }
  }

  showError(input, message) {
    this.clearError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ux-fixer-error';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
    input.classList.add('ux-fixer-error-input');
  }

  clearError(input) {
    const errorDiv = input.parentNode.querySelector('.ux-fixer-error');
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove('ux-fixer-error-input');
  }
}
```

### UI Transformer (ui-transformer.js)
```javascript
class UITransformer {
  constructor() {
    this.selectors = {
      navigation: 'nav, .nav, .navigation',
      hamburgerMenus: '.hamburger, .menu-toggle, .mobile-menu',
      dropdownMenus: '.dropdown, .dropdown-menu',
      modals: '.modal, .popup, .overlay'
    };
  }

  transform() {
    this.transformNavigation();
    this.removeHamburgerMenus();
    this.transformDropdownMenus();
    this.optimizeLayouts();
  }

  transformNavigation() {
    const navElements = document.querySelectorAll(this.selectors.navigation);
    navElements.forEach(nav => {
      nav.classList.add('ux-fixer-nav');
    });
  }

  removeHamburgerMenus() {
    const hamburgerMenus = document.querySelectorAll(this.selectors.hamburgerMenus);
    hamburgerMenus.forEach(menu => {
      this.expandHamburgerMenu(menu);
    });
  }

  expandHamburgerMenu(menuElement) {
    // Find the hidden menu content
    const menuContent = menuElement.querySelector('ul, .menu-items, .nav-items');
    if (menuContent) {
      // Make it visible and inline
      menuContent.style.display = 'flex';
      menuContent.style.flexDirection = 'row';
      menuContent.style.gap = '1rem';
      
      // Remove the hamburger trigger
      menuElement.remove();
    }
  }

  transformDropdownMenus() {
    const dropdownMenus = document.querySelectorAll(this.selectors.dropdownMenus);
    dropdownMenus.forEach(dropdown => {
      this.convertDropdownToInline(dropdown);
    });
  }

  convertDropdownToInline(dropdownElement) {
    const items = dropdownElement.querySelectorAll('a, button');
    const parent = dropdownElement.parentNode;
    
    items.forEach(item => {
      item.style.display = 'inline-block';
      item.style.marginRight = '1rem';
    });
    
    // Remove dropdown wrapper
    parent.replaceChild(...items);
  }

  optimizeLayouts() {
    // Add dense layout classes to common containers
    const containers = document.querySelectorAll('.container, .wrapper, .content');
    containers.forEach(container => {
      container.classList.add('ux-fixer-dense-layout');
    });
  }
}
```

## CSS Injection Strategy

### Main Stylesheet (main.css)
```css
/* Main stylesheet with CSS custom properties */
:root {
  /* Color palette */
  --ux-fixer-primary: #007bff;
  --ux-fixer-success: #28a745;
  --ux-fixer-warning: #ffc107;
  --ux-fixer-danger: #dc3545;
  --ux-fixer-dark: #212529;
  --ux-fixer-medium: #6c757d;
  --ux-fixer-light: #adb5bd;
  --ux-fixer-border: #dee2e6;
  --ux-fixer-bg: #f8f9fa;
  
  /* Typography */
  --ux-fixer-font-size: 14px;
  --ux-fixer-line-height: 1.4;
  --ux-fixer-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --ux-fixer-monospace: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  
  /* Spacing */
  --ux-fixer-spacing-xs: 0.125rem;
  --ux-fixer-spacing-sm: 0.25rem;
  --ux-fixer-spacing-md: 0.5rem;
  --ux-fixer-spacing-lg: 1rem;
  --ux-fixer-spacing-xl: 1.5rem;
}

/* Global overrides for FirstTechFed */
body {
  font-family: var(--ux-fixer-font-family);
  font-size: var(--ux-fixer-font-size);
  line-height: var(--ux-fixer-line-height);
  color: var(--ux-fixer-dark);
}

/* Utility classes */
.ux-fixer-dense-layout {
  padding: var(--ux-fixer-spacing-md);
  margin: var(--ux-fixer-spacing-sm);
}

.ux-fixer-error {
  color: var(--ux-fixer-danger);
  font-size: 0.75rem;
  margin-top: var(--ux-fixer-spacing-xs);
}

.ux-fixer-error-input {
  border-color: var(--ux-fixer-danger) !important;
}
```

## Development Workflow

### Local Development
1. **Setup**: Clone repository and install dependencies
2. **Development**: Use `web-ext` for development server
3. **Testing**: Load extension in Firefox Developer Edition
4. **Building**: Package extension for distribution

### Testing Strategy
- **Manual testing**: Test on actual FirstTechFed pages
- **Automated testing**: Unit tests for transformation functions
- **Cross-browser**: Ensure compatibility with Firefox versions

### Distribution
- **Firefox Add-ons**: Submit to Mozilla Add-ons store
- **Self-distribution**: Provide .xpi file for manual installation
- **GitHub releases**: Tagged releases with changelog

---

*Next: Define CSS styling strategy and component-specific styles* 