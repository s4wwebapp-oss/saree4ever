# Logo Component Documentation

A reusable React component for displaying the Saree4ever logo with customizable size and background color.

## Features

- ✅ **Fixed Logo Design**: The logo image itself cannot be modified (as per requirements)
- ✅ **Customizable Size**: Preset sizes or custom dimensions
- ✅ **Background Color Control**: Change background to match your design
- ✅ **Responsive**: Works well on all screen sizes
- ✅ **Hover Effects**: Optional hover animations
- ✅ **Link Support**: Can be used as a clickable link or standalone

## Installation

The component is already in your project at:
```
frontend/src/components/Logo.tsx
```

## Basic Usage

```tsx
import Logo from '@/components/Logo';

// Default (medium size, white background)
<Logo />

// With size preset
<Logo size="large" />

// With custom background
<Logo backgroundColor="black" />

// Custom size
<Logo size={{ width: 300, height: 100 }} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge' \| { width: number, height: number }` | `'medium'` | Logo size preset or custom dimensions |
| `backgroundColor` | `string` | `'white'` | Background color (any valid CSS color) |
| `link` | `boolean` | `true` | Whether to wrap in a Link component |
| `href` | `string` | `'/'` | Link destination (if `link={true}`) |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Custom inline styles |
| `hover` | `boolean` | `true` | Enable hover effects |
| `src` | `string` | `'/saree4ever-logo.png'` | Logo image source |
| `alt` | `string` | `'Saree4ever - Drape Your Dreams'` | Alt text for accessibility |

## Size Presets

| Preset | Dimensions | Use Case |
|--------|-----------|----------|
| `small` | 128×48px | Mobile headers, compact spaces |
| `medium` | 200×75px | Standard usage, sidebars |
| `large` | 256×96px | Desktop headers, main navigation |
| `xlarge` | 320×120px | Hero sections, landing pages |

## Examples

### Header Usage

```tsx
// Desktop Header
<Logo size="large" backgroundColor="white" />

// Mobile Header
<Logo size="small" backgroundColor="white" />
```

### Different Backgrounds

```tsx
// White background (default)
<Logo backgroundColor="white" />

// Black background
<Logo backgroundColor="black" />

// Transparent background
<Logo backgroundColor="transparent" />

// Custom color
<Logo backgroundColor="#f3f4f6" />
<Logo backgroundColor="rgb(255, 255, 255)" />
```

### Custom Sizes

```tsx
// Custom dimensions
<Logo size={{ width: 150, height: 60 }} />

// Responsive with custom sizes
<Logo 
  size={{ 
    width: typeof window !== 'undefined' && window.innerWidth < 768 ? 128 : 256,
    height: typeof window !== 'undefined' && window.innerWidth < 768 ? 48 : 96
  }} 
/>
```

### Without Link

```tsx
// Just the logo, not clickable
<Logo link={false} />
```

### Without Hover Effects

```tsx
// Static logo without hover animation
<Logo hover={false} />
```

### Custom Styling

```tsx
<Logo 
  size="large"
  backgroundColor="#1a1a1a"
  style={{ borderRadius: '12px', padding: '1rem' }}
  className="custom-logo-class"
/>
```

## CSS Classes

The component uses these CSS classes (defined in `globals.css`):

- `.logo-container` - Main container with border, shadow, and padding
- `.logo-hover` - Applied when hover effects are enabled
- `.logo-image` - The actual logo image with filters

## Styling Customization

You can customize the logo appearance by:

1. **Background Color**: Use the `backgroundColor` prop
2. **Size**: Use the `size` prop or custom dimensions
3. **Additional Styles**: Use `className` and `style` props
4. **CSS Override**: Override `.logo-container` in your CSS

### Example: Custom CSS

```css
.my-custom-logo .logo-container {
  border-radius: 16px;
  border-width: 3px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.my-custom-logo .logo-container:hover {
  transform: scale(1.05);
}
```

```tsx
<Logo className="my-custom-logo" size="large" />
```

## HTML/CSS Version

If you need to use the logo in plain HTML/CSS (without React), see:
- `frontend/public/logo-examples.html` - Complete HTML/CSS examples

## Important Notes

⚠️ **Logo Design is Fixed**: The logo image itself cannot be modified. Only the container size and background color can be changed.

✅ **Responsive**: The component is responsive and works well on all devices.

✅ **Accessibility**: Always provide meaningful `alt` text when using custom images.

## See Also

- `LogoExamples.tsx` - Component with all usage examples
- `logo-examples.html` - Standalone HTML/CSS examples
- `globals.css` - Logo styling definitions





