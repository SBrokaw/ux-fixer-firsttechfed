# ux-fixer-firsttechfed

A Firefox extension that transforms FirstTechFed's banking interface into a dense, efficient, text-based design inspired by excellent CLI interfaces. This extension eliminates dropdown menus, hamburger menus, and hidden functionality while maximizing information density and preserving all existing functionality.

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