/**
 * Logo Component Usage Examples
 * 
 * This file demonstrates various ways to use the Logo component
 * with different sizes and background colors.
 */

import Logo from './Logo';

export function LogoExamples() {
  return (
    <div className="p-8 space-y-12 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Logo Component Examples</h1>

      {/* Example 1: Default (Medium, White Background) */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">1. Default Logo (Medium, White)</h2>
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Logo />`}
        </pre>
      </section>

      {/* Example 2: Size Presets */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">2. Size Presets</h2>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <Logo size="small" />
            <p className="text-xs mt-2">Small</p>
          </div>
          <div className="text-center">
            <Logo size="medium" />
            <p className="text-xs mt-2">Medium</p>
          </div>
          <div className="text-center">
            <Logo size="large" />
            <p className="text-xs mt-2">Large</p>
          </div>
          <div className="text-center">
            <Logo size="xlarge" />
            <p className="text-xs mt-2">XLarge</p>
          </div>
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Logo size="small" />
<Logo size="medium" />
<Logo size="large" />
<Logo size="xlarge" />`}
        </pre>
      </section>

      {/* Example 3: Custom Sizes */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">3. Custom Sizes</h2>
        <div className="flex items-center gap-6 flex-wrap">
          <Logo size={{ width: 150, height: 60 }} />
          <Logo size={{ width: 300, height: 100 }} />
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Logo size={{ width: 150, height: 60 }} />
<Logo size={{ width: 300, height: 100 }} />`}
        </pre>
      </section>

      {/* Example 4: Background Colors */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">4. Different Background Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded">
            <Logo size="medium" backgroundColor="white" />
            <p className="text-xs mt-2">White</p>
          </div>
          <div className="text-center p-4 bg-black rounded">
            <Logo size="medium" backgroundColor="black" />
            <p className="text-xs mt-2 text-white">Black</p>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded">
            <Logo size="medium" backgroundColor="#f3f4f6" />
            <p className="text-xs mt-2">Light Gray</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded">
            <Logo size="medium" backgroundColor="transparent" />
            <p className="text-xs mt-2">Transparent</p>
          </div>
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Logo backgroundColor="white" />
<Logo backgroundColor="black" />
<Logo backgroundColor="#f3f4f6" />
<Logo backgroundColor="transparent" />`}
        </pre>
      </section>

      {/* Example 5: Without Link */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">5. Logo Without Link</h2>
        <div className="flex items-center gap-4">
          <Logo link={false} />
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Logo link={false} />`}
        </pre>
      </section>

      {/* Example 6: Without Hover Effects */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">6. Logo Without Hover Effects</h2>
        <div className="flex items-center gap-4">
          <Logo hover={false} />
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Logo hover={false} />`}
        </pre>
      </section>

      {/* Example 7: Custom Styling */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">7. Custom Styling</h2>
        <div className="flex items-center gap-4">
          <Logo 
            size="large" 
            backgroundColor="#1a1a1a"
            style={{ borderRadius: '12px', padding: '1rem' }}
            className="custom-logo"
          />
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Logo 
  size="large" 
  backgroundColor="#1a1a1a"
  style={{ borderRadius: '12px', padding: '1rem' }}
  className="custom-logo"
/>`}
        </pre>
      </section>

      {/* Example 8: Real-world Usage - Header */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">8. Header Usage (Desktop & Mobile)</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600 mb-2">Desktop Header:</p>
            <Logo size="large" backgroundColor="white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Mobile Header:</p>
            <Logo size="small" backgroundColor="white" />
          </div>
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`{/* Desktop */}
<Logo size="large" backgroundColor="white" />

{/* Mobile */}
<Logo size="small" backgroundColor="white" />`}
        </pre>
      </section>

      {/* Example 9: Hero Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">9. Hero Section Usage</h2>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-lg text-center">
          <Logo size="xlarge" backgroundColor="transparent" />
        </div>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<div className="hero-section">
  <Logo size="xlarge" backgroundColor="transparent" />
</div>`}
        </pre>
      </section>
    </div>
  );
}





