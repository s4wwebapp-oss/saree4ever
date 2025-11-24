import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="heading-serif-md mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Get in touch with us for any queries, custom orders, or feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-50 p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">Email</p>
                <a href="mailto:hello@saree4ever.com" className="text-gray-600 hover:text-black">
                  hello@saree4ever.com
                </a>
              </div>
              <div>
                <p className="font-medium mb-1">Phone</p>
                <a href="tel:+911234567890" className="text-gray-600 hover:text-black">
                  +91 123 456 7890
                </a>
              </div>
              <div>
                <p className="font-medium mb-1">Address</p>
                <p className="text-gray-600">
                  123 Fashion Street<br />
                  Mumbai, Maharashtra 400001<br />
                  India
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Monday - Friday:</span> 9:00 AM - 7:00 PM</p>
              <p><span className="font-medium">Saturday:</span> 10:00 AM - 6:00 PM</p>
              <p><span className="font-medium">Sunday:</span> Closed</p>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Online orders are processed 24/7. For custom orders or special requests, 
                please contact us via email or phone.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-2xl font-serif mb-6">Send us a Message</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field w-full"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input-field w-full"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="input-field w-full"
                placeholder="What is this regarding?"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="input-field w-full"
                placeholder="Tell us how we can help..."
              />
            </div>
            <button type="submit" className="btn-primary w-full md:w-auto">
              Send Message
            </button>
          </form>
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Have a quick question? Check out our{' '}
            <Link href="/faq" className="text-black underline hover:no-underline">
              Frequently Asked Questions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
