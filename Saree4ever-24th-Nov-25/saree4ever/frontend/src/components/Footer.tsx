import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-black bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-lg md:text-xl font-serif mb-2 md:mb-4">saree4ever</h2>
            <p className="text-xs md:text-sm text-gray-600">
              Traditional sarees for modern occasions
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-4">Quick Links</h3>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link href="/collections" className="hover:underline">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:underline">
                  Offers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-4">Support</h3>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:underline">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:underline">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - Move to second row on mobile */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-4">Legal</h3>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-4 md:mt-8 pt-4 md:pt-8 text-center text-xs md:text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} saree4ever. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

