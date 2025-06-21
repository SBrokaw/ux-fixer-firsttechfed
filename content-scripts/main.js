/**
 * FirstTechFed UX Fixer - Main Content Script
 * Entry point for the extension that orchestrates all transformations
 */

// IMMEDIATE VISUAL INDICATOR THAT EXTENSION IS LOADING
console.log('🚀 FirstTechFed UX Fixer: EXTENSION LOADED AND RUNNING!');
console.log('🔍 Current URL:', window.location.href);
console.log('📅 Timestamp:', new Date().toISOString());

// Add a visible indicator to the page
const indicator = document.createElement('div');
indicator.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: #007bff;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  z-index: 999999;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;
indicator.textContent = 'UX Fixer Active';
document.body.appendChild(indicator);

// Remove indicator after 5 seconds
setTimeout(() => {
  if (indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}, 5000);

class FirstTechFedUXFixer {
  constructor() {
    this.initialized = false;
    this.transformers = [];
    this.observers = [];
    this.config = {
      debug: true,
      retransformDelay: 100,
      maxRetransformAttempts: 10, // Increased for SPA
      retransformInterval: 2000, // Check every 2 seconds for new content
      maxRetransformTime: 30000 // Try for 30 seconds total
    };
    this.retransformCount = 0;
    this.startTime = Date.now();
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
      this.log('Starting transformations...');
      
      // Initialize transformers
      this.transformers = [
        new LayoutTransformer(),
        new NavigationTransformer(),
        new FormTransformer(),
        new UITransformer(),
        new TypographyTransformer()
      ];
      
      // Apply initial transformations
      this.applyTransformations();
      
      // Set up observers for dynamic content
      this.setupObservers();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Set up continuous retransformation for SPA
      this.setupContinuousRetransform();
      
      this.log('FirstTechFed UX Fixer initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize extension', error);
    }
  }

  /**
   * Set up continuous retransformation for SPA content loading
   */
  setupContinuousRetransform() {
    const interval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      
      // Stop if we've been trying too long
      if (elapsed > this.config.maxRetransformTime) {
        this.log('Stopping continuous retransform - timeout reached');
        clearInterval(interval);
        return;
      }
      
      // Check if navigation is complete
      const navComplete = document.querySelector('[data-primarynavigationinitcomplete="true"]');
      const irisPopovers = document.querySelectorAll('.iris-popover');
      const navMenu = document.querySelector('#nav_menu');
      
      if (navComplete || irisPopovers.length > 0 || navMenu) {
        this.log('Navigation elements detected, applying transformations...');
        this.applyTransformations();
        this.retransformCount++;
        
        // Stop if we've applied enough times
        if (this.retransformCount >= this.config.maxRetransformAttempts) {
          this.log('Stopping continuous retransform - max attempts reached');
          clearInterval(interval);
        }
      }
    }, this.config.retransformInterval);
  }

  /**
   * Apply all transformations
   */
  applyTransformations() {
    console.log('🔄 Starting transformations...');
    console.log('📊 Document ready state:', document.readyState);
    console.log('🏗️ Body exists:', !!document.body);
    console.log('🔍 Total elements:', document.querySelectorAll('*').length);
    
    this.transformers.forEach(transformer => {
      try {
        this.log(`Applying ${transformer.constructor.name}...`);
        const beforeCount = document.querySelectorAll('*').length;
        transformer.transform();
        const afterCount = document.querySelectorAll('*').length;
        console.log(`✅ ${transformer.constructor.name} completed. Elements: ${beforeCount} → ${afterCount}`);
      } catch (error) {
        this.logError(`Transformation error in ${transformer.constructor.name}`, error);
      }
    });
    
    console.log('🎉 All transformations completed!');
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
      'nav', '.nav', '.navigation', '.navbar',
      '.dropdown', '.menu', '.hamburger',
      'table', '.table',
      '.container', '.wrapper', '.content',
      '.card', '.panel', '.well'
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
      this.log('Retransforming due to DOM changes...');
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
    if (form.tagName === 'FORM') {
      this.log('Form submitted:', form);
    }
  }

  /**
   * Handle input change events
   */
  handleInputChange(event) {
    const input = event.target;
    if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
      // Trigger validation if needed
      this.validateInput(input);
    }
  }

  /**
   * Handle focus events for accessibility
   */
  handleFocusIn(event) {
    const element = event.target;
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA' || element.tagName === 'BUTTON') {
      element.classList.add('ux-fixer-focus-visible');
    }
  }

  /**
   * Validate input field
   */
  validateInput(input) {
    const value = input.value;
    const required = input.hasAttribute('required');
    
    if (required && !value.trim()) {
      this.showInputError(input, 'This field is required');
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
   * Utility methods
   */
  log(message, ...args) {
    if (this.config.debug) {
      console.log('[UX Fixer]', message, ...args);
    }
  }

  logError(message, error) {
    console.error('[UX Fixer]', message, error);
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

/**
 * Layout Transformer - Handles overall layout transformations
 */
class LayoutTransformer {
  constructor() {
    this.transformedElements = new WeakSet();
  }

  transform() {
    this.transformContainers();
    this.transformCards();
    this.transformTables();
    this.addDenseLayout();
  }

  transformContainers() {
    const containers = document.querySelectorAll('.container, .container-fluid, .row, .col, .col-*');
    containers.forEach(container => {
      if (this.transformedElements.has(container)) return;
      
      container.classList.add('ux-fixer-dense-layout');
      this.transformedElements.add(container);
    });
  }

  transformCards() {
    const cards = document.querySelectorAll('.card, .panel, .well, .jumbotron');
    cards.forEach(card => {
      if (this.transformedElements.has(card)) return;
      
      card.classList.add('ux-fixer-card');
      this.transformedElements.add(card);
    });
  }

  transformTables() {
    const tables = document.querySelectorAll('table, .table');
    tables.forEach(table => {
      if (this.transformedElements.has(table)) return;
      
      table.classList.add('ux-fixer-table');
      this.transformedElements.add(table);
    });
  }

  addDenseLayout() {
    // Add dense layout to body
    document.body.classList.add('ux-fixer-dense-layout');
  }
}

/**
 * Navigation Transformer - Handles navigation transformations
 */
class NavigationTransformer {
  constructor() {
    this.transformedElements = new WeakSet();
  }

  transform() {
    console.log('🧭 NavigationTransformer starting...');
    this.transformNavigation();
    this.removeHamburgerMenus();
    this.transformDropdownMenus();
    this.expandMobileMenus();
    console.log('🧭 NavigationTransformer completed');
  }

  transformNavigation() {
    const navElements = document.querySelectorAll('nav, .nav, .navigation, .navbar, header');
    console.log('🧭 Found navigation elements:', navElements.length);
    navElements.forEach((nav, index) => {
      if (this.transformedElements.has(nav)) return;
      
      console.log(`🧭 Transforming nav ${index + 1}:`, nav.tagName, nav.className);
      nav.classList.add('ux-fixer-nav');
      this.transformedElements.add(nav);
    });
  }

  removeHamburgerMenus() {
    const hamburgerMenus = document.querySelectorAll('.hamburger, .menu-toggle, .mobile-menu-toggle, .navbar-toggler');
    console.log('🧭 Found hamburger menus:', hamburgerMenus.length);
    hamburgerMenus.forEach((menu, index) => {
      if (this.transformedElements.has(menu)) return;
      
      console.log(`🧭 Expanding hamburger menu ${index + 1}:`, menu.tagName, menu.className);
      this.expandHamburgerMenu(menu);
      this.transformedElements.add(menu);
    });
  }

  expandHamburgerMenu(menuElement) {
    // Find the hidden menu content
    const menuContent = menuElement.querySelector('.menu-content, .nav-content, .navbar-collapse, ul, .nav-menu');
    console.log('🧭 Hamburger menu content found:', !!menuContent);
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
      console.log('🧭 Hamburger menu expanded and removed');
    }
  }

  transformDropdownMenus() {
    // FirstTechFed specific selectors
    const dropdownMenus = document.querySelectorAll('.dropdown-menu, .dropdown-content, .submenu, .iris-popover, .nav-menu__popover, .popover');
    console.log('🧭 Found dropdown menus:', dropdownMenus.length);
    dropdownMenus.forEach((dropdown, index) => {
      if (this.transformedElements.has(dropdown)) return;
      
      console.log(`🧭 Converting dropdown ${index + 1} to inline:`, dropdown.tagName, dropdown.className);
      this.convertDropdownToInline(dropdown);
      this.transformedElements.add(dropdown);
    });
    
    // Handle FirstTechFed specific iris-popover components
    const irisPopovers = document.querySelectorAll('.iris-popover');
    console.log('🧭 Found iris popovers:', irisPopovers.length);
    irisPopovers.forEach((popover, index) => {
      if (this.transformedElements.has(popover)) return;
      
      console.log(`🧭 Converting iris popover ${index + 1} to inline:`, popover.tagName, popover.className);
      this.convertIrisPopoverToInline(popover);
      this.transformedElements.add(popover);
    });
  }

  convertDropdownToInline(dropdownElement) {
    // Make dropdown visible and inline
    dropdownElement.style.display = 'flex';
    dropdownElement.style.flexDirection = 'row';
    dropdownElement.style.gap = '0.5rem';
    dropdownElement.style.position = 'static';
    dropdownElement.style.opacity = '1';
    dropdownElement.style.visibility = 'visible';
    dropdownElement.style.transform = 'none';
    dropdownElement.style.boxShadow = 'none';
    dropdownElement.style.border = 'none';
    dropdownElement.style.background = 'transparent';
    
    // Remove any close-on-leave behavior
    dropdownElement.removeAttribute('data-close-on-leave');
    dropdownElement.removeAttribute('data-close-on-escape');
  }

  convertIrisPopoverToInline(popoverElement) {
    // Remove iris popover behavior
    popoverElement.classList.remove('iris-popover--collapsed');
    popoverElement.style.display = 'flex';
    popoverElement.style.flexDirection = 'row';
    popoverElement.style.gap = '0.5rem';
    popoverElement.style.position = 'static';
    popoverElement.style.opacity = '1';
    popoverElement.style.visibility = 'visible';
    popoverElement.style.transform = 'none';
    popoverElement.style.boxShadow = 'none';
    popoverElement.style.border = 'none';
    popoverElement.style.background = 'transparent';
    popoverElement.style.zIndex = 'auto';
    
    // Remove iris-specific attributes
    popoverElement.removeAttribute('data-close-on-leave');
    popoverElement.removeAttribute('data-close-on-escape');
    popoverElement.removeAttribute('data-focus-target');
    popoverElement.removeAttribute('data-return-focus');
    
    // Make all list items inline
    const listItems = popoverElement.querySelectorAll('li, .iris-list-item');
    listItems.forEach(item => {
      item.style.display = 'inline-block';
      item.style.marginRight = '0.5rem';
    });
  }

  expandMobileMenus() {
    const mobileMenus = document.querySelectorAll('.mobile-menu, .navbar-collapse, .collapse');
    mobileMenus.forEach(menu => {
      if (this.transformedElements.has(menu)) return;
      
      menu.style.display = 'flex';
      menu.style.flexDirection = 'row';
      menu.style.gap = '1rem';
      menu.style.alignItems = 'center';
      menu.style.opacity = '1';
      menu.style.visibility = 'visible';
      menu.style.transform = 'none';
      menu.style.height = 'auto';
      menu.style.overflow = 'visible';
      
      this.transformedElements.add(menu);
    });
  }
}

/**
 * Form Transformer - Handles form transformations
 */
class FormTransformer {
  constructor() {
    this.transformedElements = new WeakSet();
  }

  transform() {
    this.transformForms();
    this.transformDropdowns();
    this.transformCheckboxes();
    this.transformInputs();
    this.transformLabels();
  }

  transformForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (this.transformedElements.has(form)) return;
      
      form.classList.add('ux-fixer-form');
      this.transformedElements.add(form);
    });
  }

  transformDropdowns() {
    const dropdowns = document.querySelectorAll('select');
    dropdowns.forEach(dropdown => {
      if (this.transformedElements.has(dropdown)) return;
      
      // Only transform small dropdowns (5 or fewer options)
      if (dropdown.options.length <= 5) {
        this.convertDropdownToRadioButtons(dropdown);
      } else {
        // For larger dropdowns, just style them
        dropdown.classList.add('ux-fixer-input');
      }
      
      this.transformedElements.add(dropdown);
    });
  }

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

  transformCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (this.transformedElements.has(checkbox)) return;
      
      this.convertCheckboxToToggle(checkbox);
      this.transformedElements.add(checkbox);
    });
  }

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

  transformInputs() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (this.transformedElements.has(input)) return;
      
      input.classList.add('ux-fixer-input');
      this.transformedElements.add(input);
    });
  }

  transformLabels() {
    const labels = document.querySelectorAll('label');
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

/**
 * UI Transformer - Handles general UI transformations
 */
class UITransformer {
  constructor() {
    this.transformedElements = new WeakSet();
  }

  transform() {
    this.transformButtons();
    this.transformAlerts();
    this.transformModals();
    this.removeExcessiveStyling();
  }

  transformButtons() {
    const buttons = document.querySelectorAll('button, .btn, .button');
    buttons.forEach(button => {
      if (this.transformedElements.has(button)) return;
      
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
      
      this.transformedElements.add(button);
    });
  }

  transformAlerts() {
    const alerts = document.querySelectorAll('.alert, .alert-info, .alert-success, .alert-warning, .alert-danger');
    alerts.forEach(alert => {
      if (this.transformedElements.has(alert)) return;
      
      alert.classList.add('ux-fixer-alert');
      
      if (alert.classList.contains('alert-info')) {
        alert.classList.add('ux-fixer-alert-info');
      } else if (alert.classList.contains('alert-success')) {
        alert.classList.add('ux-fixer-alert-success');
      } else if (alert.classList.contains('alert-warning')) {
        alert.classList.add('ux-fixer-alert-warning');
      } else if (alert.classList.contains('alert-danger')) {
        alert.classList.add('ux-fixer-alert-danger');
      }
      
      this.transformedElements.add(alert);
    });
  }

  transformModals() {
    const modals = document.querySelectorAll('.modal, .popup, .dialog');
    modals.forEach(modal => {
      if (this.transformedElements.has(modal)) return;
      
      // Make modal visible and inline
      modal.style.position = 'static';
      modal.style.opacity = '1';
      modal.style.visibility = 'visible';
      modal.style.transform = 'none';
      modal.style.background = 'var(--ux-fixer-white)';
      modal.style.border = 'var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200)';
      modal.style.borderRadius = 'var(--ux-fixer-border-radius)';
      modal.style.margin = 'var(--ux-fixer-spacing-3) 0';
      
      // Remove backdrop
      const backdrop = modal.querySelector('.modal-backdrop, .overlay');
      if (backdrop) {
        backdrop.remove();
      }
      
      // Remove close buttons
      const closeButtons = modal.querySelectorAll('.close, .modal-close, .popup-close');
      closeButtons.forEach(button => button.remove());
      
      this.transformedElements.add(modal);
    });
  }

  removeExcessiveStyling() {
    // Remove excessive shadows
    const elementsWithShadows = document.querySelectorAll('[style*="box-shadow"]');
    elementsWithShadows.forEach(element => {
      element.style.boxShadow = 'var(--ux-fixer-shadow-sm)';
    });
    
    // Remove excessive borders
    const elementsWithBorders = document.querySelectorAll('[style*="border"]');
    elementsWithBorders.forEach(element => {
      if (!element.style.border.includes('var(--ux-fixer-border-width)')) {
        element.style.border = 'var(--ux-fixer-border-width) solid var(--ux-fixer-gray-200)';
      }
    });
  }
}

/**
 * Typography Transformer - Handles typography transformations
 */
class TypographyTransformer {
  constructor() {
    this.transformedElements = new WeakSet();
  }

  transform() {
    this.transformHeadings();
    this.transformText();
    this.transformMonospace();
  }

  transformHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      if (this.transformedElements.has(heading)) return;
      
      const level = parseInt(heading.tagName.charAt(1));
      heading.classList.add(`ux-fixer-heading-${level}`);
      
      this.transformedElements.add(heading);
    });
  }

  transformText() {
    const textElements = document.querySelectorAll('p, span, div, a');
    textElements.forEach(element => {
      if (this.transformedElements.has(element)) return;
      
      element.classList.add('ux-fixer-text-sm');
      
      this.transformedElements.add(element);
    });
  }

  transformMonospace() {
    const monospaceElements = document.querySelectorAll('.account-number, .routing-number, .amount, .balance, .date');
    monospaceElements.forEach(element => {
      if (this.transformedElements.has(element)) return;
      
      element.classList.add('ux-fixer-font-mono');
      
      this.transformedElements.add(element);
    });
  }
}

// Initialize the extension
const uxFixer = new FirstTechFedUXFixer();
uxFixer.init(); 