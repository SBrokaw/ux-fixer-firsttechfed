# ux-fixer-firsttechfed

> **⚠️ PROJECT ABANDONED**  
> This project was abandoned due to technical limitations. The FirstTechFed website uses a modern Single Page Application (SPA) with strict Content Security Policy (CSP) and complex JavaScript frameworks that make reliable UI transformation impossible from a browser extension. See [Technical Limitations](#technical-limitations) below for details.

A Firefox extension that transforms FirstTechFed's banking interface into a dense, efficient, text-based design inspired by excellent CLI interfaces. This extension eliminates dropdown menus, hamburger menus, and hidden functionality while maximizing information density and preserving all existing functionality.

## Project Status: ABANDONED ❌

**Reason for Abandonment**: The FirstTechFed website proved to be technically unsuitable for browser extension-based UI transformation due to:

1. **Modern SPA Architecture**: Uses Alkami's Iris framework with dynamic content loading
2. **Content Security Policy**: Strict CSP blocks or reverts extension modifications
3. **Complex Event Handling**: `data-close-on-leave` and other framework behaviors fight against transformations
4. **Framework Interference**: Site's JavaScript immediately reverts any changes made by the extension
5. **Dynamic Navigation**: Navigation elements load after page load with complex state management

**Manual Testing Results**: 
- Extension loads and runs without errors
- Console shows successful element detection and transformation attempts
- However, all changes are immediately reverted by the site's framework
- Dropdown menus actually become worse (gaps, disappearing behavior)
- No reliable UI transformation is possible

**Lessons Learned**: 
- Modern banking sites with heavy SPA frameworks are poor candidates for extension-based UI transformation
- CSP and framework interference make reliable modification impossible without site owner cooperation
- Simpler, more static websites would be much better candidates for this type of project

## Technical Limitations

### Why This Project Failed

The FirstTechFed site uses several technologies that make browser extension transformation impossible:

1. **Alkami Iris Framework**: A complex banking platform that uses:
   - `iris-popover` components with `data-close-on-leave` behavior
   - Dynamic navigation with `data-primarynavigationinitcomplete` state
   - Event-driven architecture that fights against external modifications

2. **Content Security Policy (CSP)**: The site likely has strict CSP that:
   - Blocks inline style modifications
   - Prevents script injection
   - Reverts DOM changes made by extensions

3. **Single Page Application (SPA)**: The site loads content dynamically:
   - Navigation elements appear after initial page load
   - Complex state management prevents reliable targeting
   - Framework continuously re-renders and reverts changes

4. **Framework Interference**: The site's JavaScript:
   - Immediately detects and reverts any DOM modifications
   - Uses complex event handling that conflicts with extension code
   - Maintains strict control over UI state

### What Was Attempted

The extension included several advanced techniques to overcome these limitations:

- **Continuous Retransformation**: Checks every 2 seconds for 30 seconds for new content
- **Framework-Specific Selectors**: Targets `iris-popover`, `nav-menu__popover`, etc.
- **Aggressive CSS Overrides**: Uses `!important` declarations to override framework styles
- **Attribute Removal**: Removes `data-close-on-leave` and other problematic attributes
- **SPA Detection**: Monitors for navigation completion indicators

Despite these efforts, the site's framework consistently reverted all changes, making reliable transformation impossible.

## Alternative Website Suggestions

For future projects of this type, consider these websites that would be much better candidates:

### News/Aggregation Sites (Similar to Pinboard.in/popular)
- **Reddit** - Static content, simple structure, good candidate for dense UI
- **Hacker News** - Already text-focused, could be made even more dense
- **Lobste.rs** - Similar to HN, good structure for transformation
- **Slashdot** - Classic news site with simple layout
- **Digg** - News aggregation with straightforward structure

### Documentation/Reference Sites
- **Wikipedia** - Excellent candidate for dense, text-focused transformation
- **Stack Overflow** - Could benefit from more compact layout
- **GitHub** - Repository pages could be made more dense
- **MDN Web Docs** - Documentation site with good structure

### Shopping/E-commerce (Simpler than Banking)
- **Amazon** - Complex but more static than banking sites
- **eBay** - Good candidate for dense product listings
- **Newegg** - Tech-focused, could benefit from CLI-style interface

### Social Media (Simpler Platforms)
- **Twitter** - Could be transformed into a more text-focused interface
- **Mastodon** - Open source, simpler than commercial platforms
- **Discourse forums** - Good structure for dense transformation

### Key Criteria for Good Candidates
1. **Static or Simple SPA** - Avoid complex frameworks like React/Vue with heavy state management
2. **No Strict CSP** - Sites that don't aggressively block modifications
3. **Simple DOM Structure** - Avoid sites with complex component hierarchies
4. **Text-Heavy Content** - Sites where information density would be valuable
5. **No Critical Security** - Avoid banking, healthcare, or other security-critical sites

## Features

- **Dense Layout**: Maximizes screen real estate with compact spacing and typography
- **No Hidden Options**: Eliminates dropdown menus, hamburger menus, and slide-in popups
- **Form Excellence**: Applies proven form design patterns from Nate Silver's "Form Design Patterns"
- **Text-Based Interface**: Prioritizes text over graphical elements for efficiency
- **Accessibility First**: Maintains WCAG compliance and keyboard navigation
- **Performance Optimized**: Minimal impact on page load and interaction speed

## Installation

### Development Installation

1. Clone the repository:
```bash
git clone https://github.com/sbrokaw/ux-fixer-firsttechfed.git
cd ux-fixer-firsttechfed
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Firefox:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the project directory

### Production Installation

1. Download the latest release from the [Releases page](https://github.com/sbrokaw/ux-fixer-firsttechfed/releases)
2. Open Firefox and navigate to `about:addons`
3. Click the gear icon and select "Install Add-on From File"
4. Select the downloaded `.xpi` file

## Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

```
ux-fixer-firsttechfed/
├── manifest.json                 # Extension manifest
├── content-scripts/              # Scripts that run on web pages
│   └── main.js                   # Main content script
├── styles/                       # CSS files for styling
│   ├── main.css                  # Main stylesheet
│   ├── forms.css                 # Form-specific styles
│   ├── navigation.css            # Navigation styles
│   ├── typography.css            # Typography system
│   └── components.css            # Component styles
├── specs/                        # Specification documents
├── .github/                      # GitHub Actions workflows
├── package.json                  # Development dependencies
└── README.md                     # Project documentation
```

### Testing

The extension includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run accessibility tests
npm run test:a11y
```

### Building and Packaging

```bash
# Build extension
npm run build

# Package for distribution
npm run package

# Sign for Firefox Add-ons store (requires API keys)
npm run sign
```

## GitHub Integration

### Required Secrets

To enable automatic releases and signing, add these secrets to your GitHub repository:

1. **FIREFOX_ADDONS_API_KEY**: Your Firefox Add-ons API key
2. **FIREFOX_ADDONS_API_SECRET**: Your Firefox Add-ons API secret

### Getting Firefox Add-ons API Keys

1. Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in with your Mozilla account
3. Go to "API Keys" section
4. Generate a new API key
5. Copy the JWT issuer and secret

### Workflows

The repository includes two GitHub Actions workflows:

- **Test**: Runs on every push and pull request to validate the extension
- **Release**: Runs when you push a tag starting with 'v' to create a release

### Making a Release

1. Update version in `package.json` and `manifest.json`
2. Commit your changes
3. Create and push a tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

The release workflow will automatically:
- Build the extension
- Sign it (if API keys are configured)
- Create a GitHub release
- Upload the signed extension

## Configuration

### Environment Variables

Create a `.env` file for local development:

```env
FIREFOX_ADDONS_API_KEY=your_api_key_here
FIREFOX_ADDONS_API_SECRET=your_api_secret_here
```

### Extension Settings

The extension can be configured by modifying the `config` object in `content-scripts/main.js`:

```javascript
this.config = {
  debug: true,                    // Enable console logging
  retransformDelay: 100,          // Debounce delay for DOM changes
  maxRetransformAttempts: 3       // Maximum retransformation attempts
};
```

## Supported Pages

The extension is designed to work on all FirstTechFed banking pages, including:

- Dashboard (`/DashboardV2`)
- Account Summary
- Transfer Funds
- Pay Bills
- Settings
- And more...

## Browser Compatibility

- Firefox 78+
- Firefox Developer Edition
- Firefox Nightly

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Test on actual FirstTechFed pages
- Ensure accessibility compliance
- Maintain performance standards

## Troubleshooting

### Extension Not Loading

1. Check the browser console for errors
2. Verify the manifest.json is valid: `npm run validate:manifest`
3. Ensure all file paths in manifest.json are correct
4. Check that the extension has the correct permissions

### Styles Not Applying

1. Check that CSS files are being loaded
2. Verify CSS selectors match the target elements
3. Check for CSS specificity conflicts
4. Ensure the extension is running on the correct domain

### Performance Issues

1. Check for infinite loops in transformation code
2. Verify debouncing is working correctly
3. Monitor memory usage in browser dev tools
4. Check for excessive DOM queries

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

1. Check the [Issues page](https://github.com/sbrokaw/ux-fixer-firsttechfed/issues)
2. Create a new issue with detailed information
3. Include browser version, extension version, and steps to reproduce

## Acknowledgments

- Inspired by Nate Silver's "Form Design Patterns"
- Built with modern web standards and accessibility in mind
- Community contributions welcome 