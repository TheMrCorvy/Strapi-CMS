# Development Setup Guide

This guide covers the development environment setup for the Strapi CMS project.

## Prerequisites

- Node.js 18.x - 20.x
- npm 6.0.0+
- VS Code (recommended)

## VS Code Setup

### Required Extensions

The project includes VS Code extension recommendations in `.vscode/extensions.json`. Install the recommended extensions for the best development experience:

- **Prettier - Code formatter** (`esbenp.prettier-vscode`) - Required for code formatting
- **TypeScript** extensions for better TS support
- **Path Intellisense** for better import suggestions

### Settings

The project includes VS Code workspace settings in `.vscode/settings.json` that:

- Enable format on save
- Set tab size to 4 spaces
- Configure Prettier as the default formatter
- Enable auto-import organization
- Set up proper file associations

## Code Formatting

### Prettier Configuration

The project uses Prettier for consistent code formatting with these key settings:

- **Tab Width**: 4 spaces (as requested)
- **Single Quotes**: Enabled
- **Semicolons**: Enabled
- **Trailing Commas**: ES5 style
- **Print Width**: 80 characters
- **Line Endings**: LF (Unix style)

### NPM Scripts

```bash
# Check formatting issues
npm run format:check

# Fix all formatting issues automatically
npm run format

# Pre-commit format check (fails if formatting is needed)
npm run lint:format
```

### Manual Formatting

You can also run Prettier directly:

```bash
# Format specific files
npx prettier --write "src/**/*.ts"

# Check specific files
npx prettier --check "src/**/*.ts"

# Format all supported files
npx prettier --write "**/*.{js,ts,tsx,jsx,json,md}"
```

## Debugging

### VS Code Debugging

The project includes debug configurations in `.vscode/launch.json`:

- **Launch Strapi**: Start Strapi in development mode with debugging
- **Debug Strapi Build**: Debug the build process

To use:
1. Open VS Code
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select "Launch Strapi" from the dropdown
4. Press F5 to start debugging

### Breakpoints

You can set breakpoints in:
- Controllers (`src/api/*/controllers/*.ts`)
- Services (`src/api/*/services/*.ts`) 
- Routes (`src/api/*/routes/*.ts`)
- Any custom TypeScript files

## File Structure

```
.vscode/                  # VS Code workspace configuration
├── extensions.json       # Recommended extensions
├── launch.json          # Debug configurations
└── settings.json        # Workspace settings

src/api/                 # API endpoints
├── anime-episode/       # Anime episode content type
│   ├── controllers/     # Custom controllers with bulk operations
│   ├── routes/         # Custom routes including bulk endpoints
│   └── services/       # Services (auto-generated)
└── directory/          # Directory content type
    ├── controllers/    # Custom controllers with bulk operations
    ├── routes/        # Custom routes including bulk endpoints
    └── services/      # Services (auto-generated)

.prettierrc             # Prettier configuration
.prettierignore         # Files to ignore during formatting
```

## Best Practices

### Code Style

- Use 4 spaces for indentation (enforced by Prettier)
- Use single quotes for strings
- Include trailing commas in objects/arrays
- Keep lines under 80 characters when possible
- Use semicolons consistently

### TypeScript

- Enable strict type checking
- Use proper typing for Strapi entities
- Import types relatively when possible
- Organize imports automatically (handled by VS Code)

### Development Workflow

1. **Install dependencies**: `npm install`
2. **Check formatting**: `npm run format:check`
3. **Fix formatting**: `npm run format` (if needed)
4. **Start development**: `npm run develop`
5. **Build for production**: `npm run build`

### Before Committing

Always run the format check before committing:

```bash
npm run lint:format
```

This ensures consistent code formatting across the project.

## Troubleshooting

### Prettier Not Working in VS Code

1. Ensure the Prettier extension is installed
2. Check that Prettier is set as the default formatter in settings
3. Verify the workspace settings are being applied
4. Try reloading VS Code window (Cmd+R / Ctrl+R)

### TypeScript Errors

1. Run `npm install` to ensure all dependencies are installed
2. Check that TypeScript version matches project requirements
3. Restart TypeScript server in VS Code: Cmd+Shift+P > "TypeScript: Restart TS Server"

### Build Issues

1. Ensure all files are properly formatted: `npm run format`
2. Check for TypeScript compilation errors
3. Clear build cache and try again: `rm -rf build/ dist/ && npm run build`
