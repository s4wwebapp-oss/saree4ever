'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface SocialMediaSetting {
  platform: string;
  url: string | null;
  is_visible: boolean;
  display_order: number;
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSetting[]>([]);
  const [loadingSocialMedia, setLoadingSocialMedia] = useState(true);

  useEffect(() => {
    fetchSocialMediaSettings();
  }, []);

  const fetchSocialMediaSettings = async () => {
    try {
      setLoadingSocialMedia(true);
      const response: any = await api.socialMediaSettings.getAll();
      setSocialMediaSettings(response.settings || []);
    } catch (error: any) {
      console.error('Error fetching social media settings:', error);
      setMessage({ type: 'error', text: 'Failed to load social media settings' });
    } finally {
      setLoadingSocialMedia(false);
    }
  };

  const handleSocialMediaUpdate = async (platform: string, updates: { url?: string; is_visible?: boolean }) => {
    try {
      setSaving(true);
      setMessage(null);
      await api.socialMediaSettings.updateSetting(platform, updates);
      setMessage({ type: 'success', text: 'Social media settings updated successfully!' });
      fetchSocialMediaSettings();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update social media settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSocialMediaVisibilityToggle = (platform: string, currentVisibility: boolean) => {
    handleSocialMediaUpdate(platform, { is_visible: !currentVisibility });
  };

  const getPlatformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      twitter: 'Twitter/X',
      youtube: 'YouTube',
      pinterest: 'Pinterest',
    };
    return labels[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    setMessage(null);
    
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: 'success', text: `${section} settings saved successfully!` });
    }, 1000);
  };

  return (
    <div className="p-8">
        <div className="mb-6">
          <h1 className="heading-serif-md mb-2">Settings</h1>
          <p className="text-gray-600">Manage your store settings and configuration</p>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  defaultValue="Saree4Ever"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Email
                </label>
                <input
                  type="email"
                  defaultValue="info@saree4ever.com"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Phone
                </label>
                <input
                  type="tel"
                  defaultValue="+91 1234567890"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Address
                </label>
                <textarea
                  rows={3}
                  defaultValue="Your store address here"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <button
                onClick={() => handleSave('General')}
                disabled={saving}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save General Settings'}
              </button>
            </div>
          </div>

          {/* Shipping Settings */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Shipping Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  defaultValue="5000"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Orders above this amount qualify for free shipping
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Days
                </label>
                <input
                  type="number"
                  defaultValue="7"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <button
                onClick={() => handleSave('Shipping')}
                disabled={saving}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Shipping Settings'}
              </button>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Payment Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Gateway
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black">
                  <option>Razorpay</option>
                  <option>Stripe</option>
                  <option>PayPal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enable_cod"
                  defaultChecked
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <label htmlFor="enable_cod" className="ml-2 text-sm text-gray-700">
                  Enable Cash on Delivery (COD)
                </label>
              </div>
              <button
                onClick={() => handleSave('Payment')}
                disabled={saving}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </button>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Email Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    defaultValue="587"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP User
                  </label>
                  <input
                    type="email"
                    placeholder="your-email@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  defaultValue="noreply@saree4ever.com"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <button
                onClick={() => handleSave('Email')}
                disabled={saving}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Email Settings'}
              </button>
            </div>
          </div>

          {/* Social Media Settings */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">Social Media Settings</h2>
            <p className="text-sm text-gray-600 mb-4">
              Manage social media links and visibility in the header. Toggle visibility to show or hide each platform.
            </p>
            
            {loadingSocialMedia ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading social media settings...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {socialMediaSettings.map((setting) => (
                  <div key={setting.platform} className="border border-gray-200 p-4 rounded">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {getPlatformLabel(setting.platform)}
                          </label>
                          <button
                            onClick={() => handleSocialMediaVisibilityToggle(setting.platform, setting.is_visible)}
                            disabled={saving}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                              setting.is_visible
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {setting.is_visible ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                        <input
                          type="url"
                          value={setting.url || ''}
                          onChange={(e) => {
                            const updatedSettings = socialMediaSettings.map((s) =>
                              s.platform === setting.platform ? { ...s, url: e.target.value } : s
                            );
                            setSocialMediaSettings(updatedSettings);
                          }}
                          onBlur={(e) => {
                            if (e.target.value !== setting.url) {
                              handleSocialMediaUpdate(setting.platform, { url: e.target.value });
                            }
                          }}
                          placeholder={`https://www.${setting.platform}.com/yourprofile`}
                          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black text-sm"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {socialMediaSettings.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <p>No social media settings found. Please run the database migration first.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-semibold mb-4">System Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">{process.env.NODE_ENV || 'development'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API URL:</span>
                <span className="font-medium">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

