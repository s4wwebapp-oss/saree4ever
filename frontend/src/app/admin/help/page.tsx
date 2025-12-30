import Link from 'next/link';

const howToGuides = [
  {
    title: 'What is SKU? (Stock Keeping Unit)',
    steps: [
      'SKU = A unique code/ID for each product (like a serial number or barcode).',
      'Used to track inventory, process orders, and organize your warehouse.',
      'Example: KAN-RED-001 = Kanjivaram Silk in Red, Product #1.',
      'Your system AUTO-GENERATES SKUs! Just leave the SKU field blank when adding products.',
      'Format: [TYPE]-[COLOR]-[NUMBER] for products, [PRODUCT_SKU]-V1/V2 for variants.',
      'You can also provide custom SKU codes if you have an existing system.',
    ],
  },
  {
    title: 'Adding Products',
    steps: [
      'Open Admin ▸ Products ▸ "New Product".',
      'Fill in product title, description, base price, tax, and status.',
      'Upload lifestyle + catalog images (recommended 1200x1600 JPG under 1.5MB).',
      'SKU field is OPTIONAL - leave blank for auto-generation (e.g., KAN-RED-001).',
      'Assign at least one Type, Category, Collection for better SKU generation.',
      'Use the Variants tab to add sizes/colors with unique SKU + stock.',
      'Publish to make it visible on the storefront.',
    ],
  },
  {
    title: 'Understanding Types, Categories & Collections',
    steps: [
      'Types describe the fabric or occasion (e.g., Kanjivaram, Bridal, Daily Wear). They power filters on the listings page.',
      'Categories map directly to the top navigation menu (e.g., Sarees ▸ Silk). Keep them broad and mutually exclusive.',
      'Collections are curated groupings such as "Festive Drop" or "Celebrity Edit" and can mix products from any category.',
    ],
  },
  {
    title: 'Image & Media Requirements',
    steps: [
      'Hero Slides: 2000x900 JPG/PNG, < 1.5MB per slide for fast load.',
      'Product Gallery: 1200x1600 portrait for sarees, keep background consistent.',
      'Landing Videos: MP4 or WebM, 10–15s loop, < 12MB, hosted via Supabase storage. Provide poster image for fallback.',
      'Reels/Stories: 1080x1920 vertical videos, < 20MB.',
    ],
  },
  {
    title: 'Adding Landing Page Videos',
    steps: [
      'Go to Admin ▸ Landing Videos.',
      'Upload an MP4 or paste an external URL (Supabase public storage recommended).',
      'Set headline, subtext, optional CTA label + link.',
      'Toggle "Active" to immediately show it on the homepage hero block.',
    ],
  },
  {
    title: 'CSV Import - Bulk Upload Products',
    steps: [
      'Go to Admin ▸ CSV Import to access the bulk upload interface.',
      'Download sample CSV files below or create your own following the template format.',
      'IMPORTANT: Import products FIRST, then variants. Products must exist before adding color/size variants.',
      'SKU codes are OPTIONAL! Leave blank for auto-generation (e.g., CHF-RED-001, BAN-BLU-002).',
      'Required fields for products: name, base_price. Optional: sku, description, collection_id, category_id, type_id, color.',
      'Required fields for variants: product_sku (must match existing product), name. Optional: sku, price, color, stock_quantity.',
      'Upload CSV files and review the import results. Download error reports to fix any failed rows.',
      'Test with 5-10 products first to verify format, then upload larger batches (recommended: 50-100 at a time).',
    ],
  },
];

const quickLinks = [
  { label: 'How to add products (doc)', href: 'https://github.com/s4wwebapp-oss/saree4ever-v2/blob/main/saree4ever/HOW_TO_ADD_PRODUCTS.md' },
  { label: 'Category rules & taxonomy', href: 'https://github.com/s4wwebapp-oss/saree4ever-v2/blob/main/saree4ever/TAXONOMY_IMPLEMENTATION.md' },
  { label: 'Landing video walkthrough', href: 'https://github.com/s4wwebapp-oss/saree4ever-v2/blob/main/saree4ever/LANDING_PAGE_SECTIONS_CONTROL.md' },
  { label: 'Media upload guide', href: 'https://github.com/s4wwebapp-oss/saree4ever-v2/blob/main/saree4ever/IMAGE_UPLOAD_GUIDE.md' },
];

const csvTemplates = [
  {
    label: 'Sample Products CSV (15 sarees)',
    href: '/sample-products-import.csv',
    description: '15 ready-to-import saree products with realistic data'
  },
  {
    label: 'Sample Variants CSV (37 variants)',
    href: '/sample-variants-import.csv',
    description: 'Color variants for the sample products with stock quantities'
  },
  {
    label: 'CSV Import Full Guide',
    href: '/CSV-IMPORT-INSTRUCTIONS.md',
    description: 'Complete step-by-step instructions, troubleshooting, and best practices'
  },
  {
    label: 'SKU Auto-Generation Guide',
    href: '/SKU-AUTO-GENERATION-INFO.md',
    description: 'Learn how automatic SKU codes work (SKU fields are optional!)'
  },
];

function GuideCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="border border-black/10 rounded-xl p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="list-decimal list-inside space-y-2 text-sm text-gray-700">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminHelpPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="uppercase text-xs tracking-widest text-gray-500">Admin Help Desk</p>
        <h1 className="heading-serif-md">Guides & Best Practices</h1>
        <p className="text-gray-600 max-w-3xl">
          Quick explanations of the most common workflows in the Saree4Ever dashboard. Hover the sidebar menu
          for instant tips, and refer to the in-depth notes below whenever you are onboarding a new team member.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">How-to Library</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {howToGuides.map((guide) => (
            <GuideCard key={guide.title} title={guide.title} steps={guide.steps} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Definitions at a Glance</h2>
          <p className="text-sm text-gray-600">Use these cheat-codes when deciding where a product belongs.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Types</h3>
            <p className="text-sm text-gray-700">Fabric, drape style, or use-case. Appears inside the filter chips on listings.</p>
          </div>
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Categories</h3>
            <p className="text-sm text-gray-700">Menu buckets (e.g., Sarees ▸ Silk). One product usually has one primary category.</p>
          </div>
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Collections</h3>
            <p className="text-sm text-gray-700">Story-driven groups (Limited Drop, Celebrity Look). Multiple collections per product are allowed.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">SKU Examples</h2>
          <p className="text-sm text-gray-600">Real examples of how SKU codes work in your store (auto-generated when you leave SKU field blank).</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">Product SKUs</h3>
              <div className="space-y-3">
                <div className="bg-white rounded p-3 border border-blue-200">
                  <code className="text-sm font-mono text-blue-700">KAN-RED-001</code>
                  <p className="text-xs text-gray-600 mt-1">Kanjivaram + Red color → Product #1</p>
                </div>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <code className="text-sm font-mono text-blue-700">BAN-BLU-002</code>
                  <p className="text-xs text-gray-600 mt-1">Banarasi + Blue color → Product #2</p>
                </div>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <code className="text-sm font-mono text-blue-700">COT-GEN-003</code>
                  <p className="text-xs text-gray-600 mt-1">Cotton + No color → Generic #3</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">Variant SKUs</h3>
              <div className="space-y-3">
                <div className="bg-white rounded p-3 border border-blue-200">
                  <code className="text-sm font-mono text-blue-700">KAN-RED-001-V1</code>
                  <p className="text-xs text-gray-600 mt-1">Product KAN-RED-001 → Variant 1 (Maroon shade)</p>
                </div>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <code className="text-sm font-mono text-blue-700">KAN-RED-001-V2</code>
                  <p className="text-xs text-gray-600 mt-1">Product KAN-RED-001 → Variant 2 (Crimson shade)</p>
                </div>
                <div className="bg-white rounded p-3 border border-blue-200">
                  <code className="text-sm font-mono text-blue-700">KAN-RED-001-V3</code>
                  <p className="text-xs text-gray-600 mt-1">Product KAN-RED-001 → Variant 3 (Dark red shade)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800">
            <strong>💡 Tip:</strong> Leave the SKU field blank when creating products/variants. The system automatically generates professional codes based on your product type and color!
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">CSV Import Templates & Samples</h2>
          <p className="text-sm text-gray-600">Download ready-to-use CSV files for bulk product import. Start with the samples to learn the format.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📋</div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Quick Start: Import Sample Products</h3>
                <p className="text-sm text-amber-800 mb-3">
                  We've created sample CSV files with 15 saree products and 37 color variants. Download and import them to quickly populate your store!
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {csvTemplates.map((template) => (
                  <a
                    key={template.href}
                    href={template.href}
                    download
                    className="block p-4 bg-white border border-amber-300 rounded-lg hover:border-amber-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-amber-600 group-hover:text-amber-700">⬇</span>
                      <span className="font-medium text-sm text-amber-900 group-hover:text-amber-700">{template.label}</span>
                    </div>
                    <p className="text-xs text-amber-700">{template.description}</p>
                  </a>
                ))}
              </div>
              <div className="bg-white border border-amber-300 rounded p-4 mt-4">
                <h4 className="font-semibold text-sm text-amber-900 mb-2">Import Order (Important!):</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
                  <li>First, import <strong>sample-products-import.csv</strong> (creates 15 products)</li>
                  <li>Then, import <strong>sample-variants-import.csv</strong> (adds color variants)</li>
                  <li>Review the results and customize as needed</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Useful Links</h2>
          <p className="text-sm text-gray-600">Opens existing internal documentation bundled with the project.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-black text-sm hover:bg-black hover:text-white transition-colors"
            >
              <span>↗</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
