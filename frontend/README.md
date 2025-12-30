# Saree4ever Frontend

Next.js frontend for the Saree4ever e-commerce platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=admin123  # For dev admin access
```

3. Run development server:
```bash
npm run dev
```

Visit http://localhost:3000

## Features

✅ **Homepage** - Hero section with featured products
✅ **Collections** - Browse collections and filter products
✅ **Product Detail** - Variant selector with stock checking
✅ **Cart** - Shopping cart with localStorage persistence
✅ **Checkout** - Order creation with address collection
✅ **Orders** - Order tracking with status timeline
✅ **Admin** - Product management and CSV import
✅ **Real-time Updates** - SSE integration ready

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Homepage
│   ├── collections/  # Collections listing
│   ├── product/      # Product detail pages
│   ├── cart/         # Shopping cart
│   ├── checkout/     # Checkout flow
│   ├── orders/       # Order tracking
│   └── admin/        # Admin dashboard
├── components/       # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── ProductVariantSelector.tsx
├── contexts/         # React contexts
│   └── CartContext.tsx
└── lib/              # Utilities
    └── api.ts         # API helper functions
```

## API Integration

All API calls go through `src/lib/api.ts` which:
- Handles authentication tokens
- Provides type-safe API methods
- Manages error handling
- Uses `NEXT_PUBLIC_API_URL` for backend URL

## Styling

- **Tailwind CSS** for utility-first styling
- **Black & White** theme (product images in full color)
- **Serif fonts** for headings (Playfair Display)
- **Responsive** design (mobile-first)

## Next Steps

1. Add payment integration (Stripe/Razorpay)
2. Implement user authentication
3. Add product search functionality
4. Connect real-time updates (SSE)
5. Add image optimization
6. Implement SEO meta tags
# Deployment trigger
