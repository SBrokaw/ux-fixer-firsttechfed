/**
 * Unit tests for FirstTechFed UX Fixer main content script
 */

// Mock DOM environment
document.body.innerHTML = `
  <div class="container">
    <nav class="navbar">
      <button class="hamburger">Menu</button>
      <ul class="nav-menu" style="display: none;">
        <li><a href="#">Home</a></li>
        <li><a href="#">Accounts</a></li>
      </ul>
    </nav>
    <form>
      <label for="account">Account</label>
      <select id="account" name="account">
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
      </select>
      <input type="checkbox" id="confirm" name="confirm">
      <label for="confirm">Confirm</label>
    </form>
  </div>
`;

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Import the main script
require('../../content-scripts/main.js');

describe('FirstTechFed UX Fixer', () => {
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
  });

  test('should initialize without errors', () => {
    expect(console.error).not.toHaveBeenCalled();
  });

  test('should log initialization message', () => {
    expect(console.log).toHaveBeenCalledWith('[UX Fixer]', 'Initializing FirstTechFed UX Fixer...');
  });

  test('should apply dense layout class to body', () => {
    expect(document.body.classList.contains('ux-fixer-dense-layout')).toBe(true);
  });

  test('should transform navigation elements', () => {
    const nav = document.querySelector('nav');
    expect(nav.classList.contains('ux-fixer-nav')).toBe(true);
  });

  test('should expand hamburger menu', () => {
    const hamburger = document.querySelector('.hamburger');
    expect(hamburger).toBeNull(); // Should be removed
  });

  test('should make nav menu visible', () => {
    const navMenu = document.querySelector('.nav-menu');
    expect(navMenu.style.display).toBe('flex');
  });

  test('should transform form elements', () => {
    const form = document.querySelector('form');
    expect(form.classList.contains('ux-fixer-form')).toBe(true);
  });

  test('should convert small dropdowns to radio buttons', () => {
    const select = document.querySelector('select');
    expect(select).toBeNull(); // Should be replaced with radio group
    
    const radioGroup = document.querySelector('.ux-fixer-radio-group');
    expect(radioGroup).toBeTruthy();
  });

  test('should convert checkboxes to toggles', () => {
    const checkbox = document.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeNull(); // Should be replaced with toggle
    
    const toggle = document.querySelector('.ux-fixer-toggle');
    expect(toggle).toBeTruthy();
  });

  test('should transform labels', () => {
    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
      expect(label.classList.contains('ux-fixer-label')).toBe(true);
    });
  });
}); 