# Content Script Implementation Specification

## Overview
This specification defines the detailed implementation of content scripts that will transform FirstTechFed's interface. The content scripts will handle DOM manipulation, form transformations, and dynamic content updates.

## Content Script Architecture

### Main Entry Point (main.js)
```javascript
/**
 * FirstTechFed UX Fixer - Main Content Script
 * Entry point for the extension that orchestrates all transformations
 */

class FirstTechFedUXFixer {
  constructor() {
    this.initialized = false;
    this.transformers = [];
    this.observers = [];
    this.config = {
      debug: false,
      retransformDelay: 100,
      maxRetransformAttempts: 3
    };
  }

  /**
   * Initialize the extension
   */
  async init() {
    if (this.initialized) return;
    
    this.log('Initializing FirstTechFed UX Fixer...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
    
    this.initialized = true;
  }

  /**
   * Start the transformation process
   */
  start() {
    try {
      // Initialize transformers
      this.transformers = [
        new FormTransformer(),
        new UITransformer(),
        new NavigationTransformer(),
        new TypographyTransformer(),
        new LayoutTransformer()
      ];
      
      // Apply initial transformations
      this.applyTransformations();
      
      // Set up observers for dynamic content
      this.setupObservers();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.log('FirstTechFed UX Fixer initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize extension', error);
    }
  }

  /**
   * Apply all transformations
   */
  applyTransformations() {
    this.transformers.forEach(transformer => {
      try {
        transformer.transform();
      } catch (error) {
        this.logError(`Transformation error in ${transformer.constructor.name}`, error);
      }
    });
  }

  /**
   * Set up mutation observers for dynamic content
   */
  setupObservers() {
    // Main DOM observer
    const domObserver = new MutationObserver((mutations) => {
      let shouldRetransform = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if added nodes contain elements we need to transform
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (this.shouldTransformNode(node)) {
                shouldRetransform = true;
              }
            }
          });
        }
      });
      
      if (shouldRetransform) {
        this.debouncedRetransform();
      }
    });
    
    domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.observers.push(domObserver);
  }

  /**
   * Check if a node should trigger retransformation
   */
  shouldTransformNode(node) {
    const selectors = [
      'form', 'input', 'select', 'textarea',
      'nav', '.nav', '.navigation',
      '.dropdown', '.menu', '.hamburger',
      'table', '.table',
      '.container', '.wrapper', '.content'
    ];
    
    return selectors.some(selector => {
      return node.matches && node.matches(selector) ||
             node.querySelector && node.querySelector(selector);
    });
  }

  /**
   * Debounced retransformation to avoid excessive processing
   */
  debouncedRetransform() {
    clearTimeout(this.retransformTimeout);
    this.retransformTimeout = setTimeout(() => {
      this.applyTransformations();
    }, this.config.retransformDelay);
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Handle form submissions
    document.addEventListener('submit', (event) => {
      this.handleFormSubmit(event);
    });
    
    // Handle input changes
    document.addEventListener('input', (event) => {
      this.handleInputChange(event);
    });
    
    // Handle focus events for accessibility
    document.addEventListener('focusin', (event) => {
      this.handleFocusIn(event);
    });
  }

  /**
   * Handle form submission events
   */
  handleFormSubmit(event) {
    const form = event.target;
    if (form.classList.contains('ux-fixer-form')) {
      this.log('Form submitted:', form);
      // Add any form submission enhancements here
    }
  }

  /**
   * Handle input change events
   */
  handleInputChange(event) {
    const input = event.target;
    if (input.classList.contains('ux-fixer-input')) {
      // Trigger validation if needed
      this.validateInput(input);
    }
  }

  /**
   * Handle focus events for accessibility
   */
  handleFocusIn(event) {
    const element = event.target;
    if (element.classList.contains('ux-fixer-input') || 
        element.classList.contains('ux-fixer-btn')) {
      element.classList.add('ux-fixer-focus-visible');
    }
  }

  /**
   * Validate input field
   */
  validateInput(input) {
    const value = input.value;
    const required = input.hasAttribute('required');
    const type = input.type;
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (required && !value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    
    // Type-specific validation
    if (isValid && value) {
      switch (type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
          }
          break;
        case 'tel':
          if (!this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
          }
          break;
        case 'number':
          if (isNaN(value) || value < 0) {
            isValid = false;
            errorMessage = 'Please enter a valid number';
          }
          break;
      }
    }
    
    // Show or hide error
    if (!isValid) {
      this.showInputError(input, errorMessage);
    } else {
      this.clearInputError(input);
    }
  }

  /**
   * Show input error
   */
  showInputError(input, message) {
    this.clearInputError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ux-fixer-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    input.parentNode.appendChild(errorDiv);
    input.classList.add('ux-fixer-input-error');
    input.setAttribute('aria-invalid', 'true');
  }

  /**
   * Clear input error
   */
  clearInputError(input) {
    const errorDiv = input.parentNode.querySelector('.ux-fixer-error');
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove('ux-fixer-input-error');
    input.setAttribute('aria-invalid', 'false');
  }

  /**
   * Validation helpers
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Utility methods
   */
  log(message, ...args) {
    if (this.config.debug) {
      console.log('[FirstTechFed UX Fixer]', message, ...args);
    }
  }

  logError(message, error) {
    console.error('[FirstTechFed UX Fixer]', message, error);
  }

  /**
   * Cleanup method
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.initialized = false;
  }
}

// Initialize the extension
const uxFixer = new FirstTechFedUXFixer();
uxFixer.init();
```

### Form Transformer (form-transformer.js)
```javascript
/**
 * Form Transformer - Handles all form-related transformations
 */

class FormTransformer {
  constructor() {
    this.selectors = {
      forms: 'form',
      inputs: 'input, select, textarea',
      dropdowns: 'select',
      checkboxes: 'input[type="checkbox"]',
      radioButtons: 'input[type="radio"]',
      labels: 'label',
      fieldsets: 'fieldset',
      legends: 'legend'
    };
    
    this.transformedElements = new WeakSet();
  }

  /**
   * Main transformation method
   */
  transform() {
    this.transformForms();
    this.transformDropdowns();
    this.transformCheckboxes();
    this.transformInputs();
    this.transformLabels();
    this.transformFieldsets();
    this.addFormEnhancements();
  }

  /**
   * Transform form containers
   */
  transformForms() {
    const forms = document.querySelectorAll(this.selectors.forms);
    forms.forEach(form => {
      if (this.transformedElements.has(form)) return;
      
      form.classList.add('ux-fixer-form');
      this.transformedElements.add(form);
      
      // Add form-level enhancements
      this.addFormValidation(form);
      this.addFormAccessibility(form);
    });
  }

  /**
   * Transform dropdown menus to radio buttons
   */
  transformDropdowns() {
    const dropdowns = document.querySelectorAll(this.selectors.dropdowns);
    dropdowns.forEach(dropdown => {
      if (this.transformedElements.has(dropdown)) return;
      
      // Only transform small dropdowns (5 or fewer options)
      if (dropdown.options.length <= 5) {
        this.convertDropdownToRadioButtons(dropdown);
      } else {
        // For larger dropdowns, just style them
        this.styleDropdown(dropdown);
      }
      
      this.transformedElements.add(dropdown);
    });
  }

  /**
   * Convert dropdown to radio button group
   */
  convertDropdownToRadioButtons(selectElement) {
    const radioGroup = document.createElement('div');
    radioGroup.className = 'ux-fixer-radio-group';
    
    // Add group label if there's an associated label
    const label = this.findAssociatedLabel(selectElement);
    if (label) {
      const groupLabel = document.createElement('div');
      groupLabel.className = 'ux-fixer-label';
      groupLabel.textContent = label.textContent;
      if (selectElement.hasAttribute('required')) {
        groupLabel.classList.add('ux-fixer-label-required');
      }
      radioGroup.appendChild(groupLabel);
    }
    
    // Create radio buttons
    Array.from(selectElement.options).forEach((option, index) => {
      const radioItem = document.createElement('div');
      radioItem.className = 'ux-fixer-radio-item';
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = selectElement.name;
      radio.value = option.value;
      radio.id = `ux-fixer-${selectElement.name}-${option.value}`;
      radio.checked = option.selected;
      radio.required = selectElement.hasAttribute('required');
      
      const radioLabel = document.createElement('label');
      radioLabel.htmlFor = radio.id;
      radioLabel.textContent = option.textContent;
      
      radioItem.appendChild(radio);
      radioItem.appendChild(radioLabel);
      radioGroup.appendChild(radioItem);
    });
    
    // Replace the select element
    selectElement.parentNode.replaceChild(radioGroup, selectElement);
  }

  /**
   * Style dropdown without converting
   */
  styleDropdown(selectElement) {
    selectElement.classList.add('ux-fixer-input');
    selectElement.classList.add('ux-fixer-select');
  }

  /**
   * Transform checkboxes to toggle switches
   */
  transformCheckboxes() {
    const checkboxes = document.querySelectorAll(this.selectors.checkboxes);
    checkboxes.forEach(checkbox => {
      if (this.transformedElements.has(checkbox)) return;
      
      this.convertCheckboxToToggle(checkbox);
      this.transformedElements.add(checkbox);
    });
  }

  /**
   * Convert checkbox to toggle switch
   */
  convertCheckboxToToggle(checkboxElement) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ux-fixer-toggle';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checkboxElement.checked;
    input.name = checkboxElement.name;
    input.value = checkboxElement.value;
    input.required = checkboxElement.hasAttribute('required');
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    
    wrapper.appendChild(input);
    wrapper.appendChild(slider);
    
    // Add label if there's an associated one
    const label = this.findAssociatedLabel(checkboxElement);
    if (label) {
      const toggleLabel = document.createElement('span');
      toggleLabel.className = 'ux-fixer-toggle-label';
      toggleLabel.textContent = label.textContent;
      wrapper.appendChild(toggleLabel);
    }
    
    checkboxElement.parentNode.replaceChild(wrapper, checkboxElement);
  }

  /**
   * Transform input fields
   */
  transformInputs() {
    const inputs = document.querySelectorAll(this.selectors.inputs);
    inputs.forEach(input => {
      if (this.transformedElements.has(input)) return;
      
      this.styleInput(input);
      this.addInputEnhancements(input);
      this.transformedElements.add(input);
    });
  }

  /**
   * Style input field
   */
  styleInput(input) {
    input.classList.add('ux-fixer-input');
    
    // Add specific classes based on input type
    switch (input.type) {
      case 'email':
        input.classList.add('ux-fixer-input-email');
        break;
      case 'password':
        input.classList.add('ux-fixer-input-password');
        break;
      case 'number':
        input.classList.add('ux-fixer-input-number');
        break;
      case 'tel':
        input.classList.add('ux-fixer-input-tel');
        break;
      case 'date':
        input.classList.add('ux-fixer-input-date');
        break;
    }
  }

  /**
   * Add input enhancements
   */
  addInputEnhancements(input) {
    // Add placeholder if missing and there's a label
    if (!input.placeholder) {
      const label = this.findAssociatedLabel(input);
      if (label) {
        input.placeholder = label.textContent;
      }
    }
    
    // Add autocomplete attributes
    this.addAutocompleteAttributes(input);
    
    // Add input masks for specific types
    this.addInputMasks(input);
  }

  /**
   * Add autocomplete attributes
   */
  addAutocompleteAttributes(input) {
    const type = input.type;
    const name = input.name.toLowerCase();
    
    if (type === 'email') {
      input.setAttribute('autocomplete', 'email');
    } else if (type === 'password') {
      input.setAttribute('autocomplete', 'current-password');
    } else if (type === 'tel') {
      input.setAttribute('autocomplete', 'tel');
    } else if (name.includes('first') || name.includes('given')) {
      input.setAttribute('autocomplete', 'given-name');
    } else if (name.includes('last') || name.includes('family')) {
      input.setAttribute('autocomplete', 'family-name');
    } else if (name.includes('address')) {
      input.setAttribute('autocomplete', 'street-address');
    } else if (name.includes('city')) {
      input.setAttribute('autocomplete', 'address-level2');
    } else if (name.includes('state') || name.includes('province')) {
      input.setAttribute('autocomplete', 'address-level1');
    } else if (name.includes('zip') || name.includes('postal')) {
      input.setAttribute('autocomplete', 'postal-code');
    }
  }

  /**
   * Add input masks
   */
  addInputMasks(input) {
    const type = input.type;
    const name = input.name.toLowerCase();
    
    if (type === 'tel') {
      this.addPhoneMask(input);
    } else if (name.includes('account') || name.includes('routing')) {
      this.addAccountNumberMask(input);
    }
  }

  /**
   * Add phone number mask
   */
  addPhoneMask(input) {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      
      if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
      }
      
      e.target.value = value;
    });
  }

  /**
   * Add account number mask
   */
  addAccountNumberMask(input) {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 17) value = value.slice(0, 17);
      
      // Add spaces every 4 digits
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      
      e.target.value = value;
    });
  }

  /**
   * Transform labels
   */
  transformLabels() {
    const labels = document.querySelectorAll(this.selectors.labels);
    labels.forEach(label => {
      if (this.transformedElements.has(label)) return;
      
      label.classList.add('ux-fixer-label');
      
      // Check if associated input is required
      const forId = label.getAttribute('for');
      if (forId) {
        const input = document.getElementById(forId);
        if (input && input.hasAttribute('required')) {
          label.classList.add('ux-fixer-label-required');
        }
      }
      
      this.transformedElements.add(label);
    });
  }

  /**
   * Transform fieldsets
   */
  transformFieldsets() {
    const fieldsets = document.querySelectorAll(this.selectors.fieldsets);
    fieldsets.forEach(fieldset => {
      if (this.transformedElements.has(fieldset)) return;
      
      fieldset.classList.add('ux-fixer-fieldset');
      this.transformedElements.add(fieldset);
    });
  }

  /**
   * Add form-level enhancements
   */
  addFormEnhancements() {
    const forms = document.querySelectorAll(this.selectors.forms);
    forms.forEach(form => {
      // Add form validation
      this.addFormValidation(form);
      
      // Add form accessibility
      this.addFormAccessibility(form);
      
      // Add form submission enhancements
      this.addFormSubmissionEnhancements(form);
    });
  }

  /**
   * Add form validation
   */
  addFormValidation(form) {
    form.addEventListener('submit', (e) => {
      const inputs = form.querySelectorAll('input, select, textarea');
      let isValid = true;
      
      inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          isValid = false;
          this.showInputError(input, 'This field is required');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        // Focus first invalid input
        const firstInvalid = form.querySelector('.ux-fixer-input-error');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  }

  /**
   * Add form accessibility
   */
  addFormAccessibility(form) {
    // Add ARIA attributes
    form.setAttribute('role', 'form');
    
    // Add error summary
    const errorSummary = document.createElement('div');
    errorSummary.className = 'ux-fixer-error-summary';
    errorSummary.setAttribute('role', 'alert');
    errorSummary.setAttribute('aria-live', 'polite');
    form.insertBefore(errorSummary, form.firstChild);
  }

  /**
   * Add form submission enhancements
   */
  addFormSubmissionEnhancements(form) {
    const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
    if (submitButton) {
      submitButton.classList.add('ux-fixer-btn', 'ux-fixer-btn-primary');
    }
  }

  /**
   * Find associated label for an input
   */
  findAssociatedLabel(input) {
    // Check for explicit association
    const forId = input.getAttribute('id');
    if (forId) {
      const label = document.querySelector(`label[for="${forId}"]`);
      if (label) return label;
    }
    
    // Check for implicit association (label wrapping input)
    const parent = input.parentNode;
    if (parent.tagName === 'LABEL') {
      return parent;
    }
    
    return null;
  }
}
```

### UI Transformer (ui-transformer.js)
```javascript
/**
 * UI Transformer - Handles navigation and layout transformations
 */

class UITransformer {
  constructor() {
    this.selectors = {
      navigation: 'nav, .nav, .navigation, header',
      hamburgerMenus: '.hamburger, .menu-toggle, .mobile-menu, .navbar-toggler',
      dropdownMenus: '.dropdown, .dropdown-menu, .nav-dropdown',
      modals: '.modal, .popup, .overlay, .dialog',
      containers: '.container, .wrapper, .content, .main',
      tables: 'table, .table',
      buttons: 'button, .btn, .button',
      links: 'a, .link'
    };
    
    this.transformedElements = new WeakSet();
  }

  /**
   * Main transformation method
   */
  transform() {
    this.transformNavigation();
    this.removeHamburgerMenus();
    this.transformDropdownMenus();
    this.transformModals();
    this.transformContainers();
    this.transformTables();
    this.transformButtons();
    this.transformLinks();
  }

  /**
   * Transform navigation elements
   */
  transformNavigation() {
    const navElements = document.querySelectorAll(this.selectors.navigation);
    navElements.forEach(nav => {
      if (this.transformedElements.has(nav)) return;
      
      nav.classList.add('ux-fixer-nav');
      this.expandNavigation(nav);
      this.transformedElements.add(nav);
    });
  }

  /**
   * Expand navigation to show all items
   */
  expandNavigation(navElement) {
    // Find hidden menu items
    const hiddenMenus = navElement.querySelectorAll('.menu, .nav-menu, .navbar-menu, ul');
    hiddenMenus.forEach(menu => {
      // Make menu visible and inline
      menu.style.display = 'flex';
      menu.style.flexDirection = 'row';
      menu.style.gap = '1rem';
      menu.style.alignItems = 'center';
      menu.classList.add('ux-fixer-nav-menu');
      
      // Style menu items
      const menuItems = menu.querySelectorAll('li, .nav-item, .menu-item');
      menuItems.forEach(item => {
        item.classList.add('ux-fixer-nav-item');
        
        const link = item.querySelector('a, .nav-link, .menu-link');
        if (link) {
          link.classList.add('ux-fixer-nav-link');
        }
      });
    });
  }

  /**
   * Remove hamburger menus
   */
  removeHamburgerMenus() {
    const hamburgerMenus = document.querySelectorAll(this.selectors.hamburgerMenus);
    hamburgerMenus.forEach(menu => {
      if (this.transformedElements.has(menu)) return;
      
      this.expandHamburgerMenu(menu);
      this.transformedElements.add(menu);
    });
  }

  /**
   * Expand hamburger menu content
   */
  expandHamburgerMenu(menuElement) {
    // Find the hidden menu content
    const menuContent = menuElement.querySelector('.menu-content, .nav-content, .navbar-collapse, ul');
    if (menuContent) {
      // Make it visible and inline
      menuContent.style.display = 'flex';
      menuContent.style.flexDirection = 'row';
      menuContent.style.gap = '1rem';
      menuContent.style.alignItems = 'center';
      
      // Move menu content to parent container
      const parent = menuElement.parentNode;
      parent.insertBefore(menuContent, menuElement.nextSibling);
      
      // Remove the hamburger trigger
      menuElement.remove();
    }
  }

  /**
   * Transform dropdown menus
   */
  transformDropdownMenus() {
    const dropdownMenus = document.querySelectorAll(this.selectors.dropdownMenus);
    dropdownMenus.forEach(dropdown => {
      if (this.transformedElements.has(dropdown)) return;
      
      this.convertDropdownToInline(dropdown);
      this.transformedElements.add(dropdown);
    });
  }

  /**
   * Convert dropdown to inline menu
   */
  convertDropdownToInline(dropdownElement) {
    const items = dropdownElement.querySelectorAll('a, button, .dropdown-item');
    const parent = dropdownElement.parentNode;
    
    // Create inline container
    const inlineContainer = document.createElement('div');
    inlineContainer.className = 'ux-fixer-inline-menu';
    inlineContainer.style.display = 'flex';
    inlineContainer.style.gap = '1rem';
    inlineContainer.style.alignItems = 'center';
    
    items.forEach(item => {
      item.classList.add('ux-fixer-nav-link');
      inlineContainer.appendChild(item.cloneNode(true));
    });
    
    // Replace dropdown with inline menu
    parent.replaceChild(inlineContainer, dropdownElement);
  }

  /**
   * Transform modals and popups
   */
  transformModals() {
    const modals = document.querySelectorAll(this.selectors.modals);
    modals.forEach(modal => {
      if (this.transformedElements.has(modal)) return;
      
      this.convertModalToInline(modal);
      this.transformedElements.add(modal);
    });
  }

  /**
   * Convert modal to inline content
   */
  convertModalToInline(modalElement) {
    // Find modal content
    const modalContent = modalElement.querySelector('.modal-content, .popup-content, .dialog-content');
    if (modalContent) {
      // Make modal visible and inline
      modalElement.style.display = 'block';
      modalElement.style.position = 'static';
      modalElement.style.transform = 'none';
      modalElement.style.opacity = '1';
      modalElement.style.visibility = 'visible';
      
      // Remove backdrop
      const backdrop = modalElement.querySelector('.modal-backdrop, .overlay');
      if (backdrop) {
        backdrop.remove();
      }
      
      // Remove close buttons
      const closeButtons = modalElement.querySelectorAll('.close, .modal-close, .popup-close');
      closeButtons.forEach(button => button.remove());
    }
  }

  /**
   * Transform containers
   */
  transformContainers() {
    const containers = document.querySelectorAll(this.selectors.containers);
    containers.forEach(container => {
      if (this.transformedElements.has(container)) return;
      
      container.classList.add('ux-fixer-container');
      this.transformedElements.add(container);
    });
  }

  /**
   * Transform tables
   */
  transformTables() {
    const tables = document.querySelectorAll(this.selectors.tables);
    tables.forEach(table => {
      if (this.transformedElements.has(table)) return;
      
      table.classList.add('ux-fixer-table');
      this.addTableEnhancements(table);
      this.transformedElements.add(table);
    });
  }

  /**
   * Add table enhancements
   */
  addTableEnhancements(table) {
    // Add responsive wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'ux-fixer-table-wrapper';
    wrapper.style.overflowX = 'auto';
    
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    
    // Add table header styling
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      header.classList.add('ux-fixer-table-header');
    });
    
    // Add table row styling
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
      row.classList.add('ux-fixer-table-row');
      if (index % 2 === 1) {
        row.classList.add('ux-fixer-table-row-striped');
      }
    });
  }

  /**
   * Transform buttons
   */
  transformButtons() {
    const buttons = document.querySelectorAll(this.selectors.buttons);
    buttons.forEach(button => {
      if (this.transformedElements.has(button)) return;
      
      this.styleButton(button);
      this.transformedElements.add(button);
    });
  }

  /**
   * Style button
   */
  styleButton(button) {
    button.classList.add('ux-fixer-btn');
    
    // Add specific classes based on button type or text
    const text = button.textContent.toLowerCase();
    const type = button.type;
    
    if (type === 'submit' || text.includes('submit') || text.includes('save')) {
      button.classList.add('ux-fixer-btn-primary');
    } else if (text.includes('delete') || text.includes('remove') || text.includes('cancel')) {
      button.classList.add('ux-fixer-btn-danger');
    } else if (text.includes('success') || text.includes('confirm')) {
      button.classList.add('ux-fixer-btn-success');
    }
    
    // Add size classes based on padding or text length
    const padding = window.getComputedStyle(button).padding;
    if (padding && parseInt(padding) < 8) {
      button.classList.add('ux-fixer-btn-small');
    } else if (padding && parseInt(padding) > 16) {
      button.classList.add('ux-fixer-btn-large');
    }
  }

  /**
   * Transform links
   */
  transformLinks() {
    const links = document.querySelectorAll(this.selectors.links);
    links.forEach(link => {
      if (this.transformedElements.has(link)) return;
      
      // Only style links that aren't already styled as buttons
      if (!link.classList.contains('ux-fixer-btn')) {
        link.classList.add('ux-fixer-link');
      }
      
      this.transformedElements.add(link);
    });
  }
}
```

## Utility Functions (utils.js)
```javascript
/**
 * Utility functions for the FirstTechFed UX Fixer
 */

class UXFixerUtils {
  /**
   * Debounce function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Generate unique ID
   */
  static generateId(prefix = 'ux-fixer') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if element is visible
   */
  static isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * Wait for element to be available
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Safe querySelector with error handling
   */
  static safeQuerySelector(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return null;
    }
  }

  /**
   * Safe querySelectorAll with error handling
   */
  static safeQuerySelectorAll(selector, parent = document) {
    try {
      return parent.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return [];
    }
  }

  /**
   * Add CSS class safely
   */
  static addClass(element, className) {
    if (element && element.classList) {
      element.classList.add(className);
    }
  }

  /**
   * Remove CSS class safely
   */
  static removeClass(element, className) {
    if (element && element.classList) {
      element.classList.remove(className);
    }
  }

  /**
   * Check if element has class
   */
  static hasClass(element, className) {
    return element && element.classList && element.classList.contains(className);
  }

  /**
   * Get computed style value
   */
  static getComputedStyle(element, property) {
    try {
      return window.getComputedStyle(element).getPropertyValue(property);
    } catch (error) {
      console.warn(`Error getting computed style for ${property}`, error);
      return null;
    }
  }

  /**
   * Set CSS custom property
   */
  static setCSSProperty(element, property, value) {
    try {
      element.style.setProperty(property, value);
    } catch (error) {
      console.warn(`Error setting CSS property ${property}`, error);
    }
  }

  /**
   * Format currency
   */
  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format date
   */
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
  }

  /**
   * Validate email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Sanitize HTML
   */
  static sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Escape HTML
   */
  static escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UXFixerUtils;
}
```

---

*Next: Define testing and validation procedures* 