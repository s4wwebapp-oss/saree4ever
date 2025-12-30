'use client';

import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I know the saree size?',
    answer: 'All our sarees come in a standard length of 5.5 to 6 meters, which is suitable for most body types. If you need a custom length, please contact us before placing your order.',
  },
  {
    question: 'Do you provide blouse pieces?',
    answer: 'Yes! Many of our sarees come with matching blouse pieces included. You can check the product description to see if a blouse is included. We also offer blouse pieces as separate purchases.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for unused items in their original packaging. Custom orders and personalized items are not eligible for returns. Please contact us for return authorization.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping within India takes 5-7 business days. International shipping takes 10-15 business days. Express shipping options are available at checkout.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'We currently ship across India with free shipping on all orders. We are working on expanding our shipping to other countries soon.',
  },
  {
    question: 'How do I care for my saree?',
    answer: 'Most silk sarees should be dry cleaned. Cotton and linen sarees can be hand washed with mild detergent. Always check the care label on your specific saree for detailed instructions.',
  },
  {
    question: 'Can I customize a saree?',
    answer: 'Yes, we offer customization services for select sarees. Please contact us with your requirements, and we\'ll work with our artisans to create your perfect saree.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, UPI, net banking, and cash on delivery (for select locations). All payments are processed securely.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="heading-serif-md mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, and services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 hover:border-black transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 flex justify-between items-center"
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <span className="text-2xl text-gray-400 flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-gray-50 p-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Please get in touch with our friendly team.
          </p>
          <a href="/contact" className="btn-primary">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

