# Favicon Generation Script

This directory contains scripts for generating favicons and icons from the logo.

## Generate Favicon from Logo

The `generate-favicon.js` script converts the `saree4ever-logo.png` to square favicon files with proper sizing.

### Usage

```bash
npm run generate-favicon
```

### What it does

1. Reads the logo from `public/saree4ever-logo.png`
2. Creates square versions with white padding to maintain aspect ratio
3. Generates multiple sizes:
   - `icon.png` (32x32px) - Standard favicon
   - `apple-icon.png` (192x192px) - Apple touch icon
   - `icon-512.png` (512x512px) - High-resolution icon

### Output

The generated files are saved in `src/app/` directory. Next.js 13+ automatically detects and uses `icon.png` as the favicon.

### Requirements

- Node.js
- `sharp` library (installed as dev dependency)

### Regenerating

If you update the logo, simply run the script again to regenerate all favicon files.
