'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface LandingPageSection {
  id: string;
  section_key: string;
  section_name: string;
  description: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function LandingPageSectionsManager() {
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        setError('Not authenticated. Please login at /admin first.');
        return;
      }

      const response: any = await api.landingPageSections.getAll();
      setSections(response.sections || response || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch sections';
      if (errorMessage.includes('No token provided') || errorMessage.includes('401')) {
        setError('Authentication required. Please logout and login again at /admin');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (sectionKey: string, currentVisibility: boolean) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.landingPageSections.updateVisibility(sectionKey, !currentVisibility);

      setSections(prev => prev.map(section =>
        section.section_key === sectionKey
          ? { ...section, is_visible: !currentVisibility }
          : section
      ));

      setSuccess(`Section ${!currentVisibility ? 'shown' : 'hidden'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update section visibility');
      console.error('Error updating section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleShowAll = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updates = sections.map(section => ({
        section_key: section.section_key,
        is_visible: true,
      }));

      await api.landingPageSections.bulkUpdateVisibility(updates);

      setSections(prev => prev.map(section => ({ ...section, is_visible: true })));

      setSuccess('All sections are now visible!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update sections');
      console.error('Error updating sections:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleHideAll = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updates = sections.map(section => ({
        section_key: section.section_key,
        is_visible: false,
      }));

      await api.landingPageSections.bulkUpdateVisibility(updates);

      setSections(prev => prev.map(section => ({ ...section, is_visible: false })));

      setSuccess('All sections are now hidden!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update sections');
      console.error('Error updating sections:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading sections...</div>;
  }

  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-serif-md mb-2">Landing Page Sections</h1>
          <p className="text-gray-600">Control which sections are visible on your landing page</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShowAll}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Show All
          </button>
          <button
            onClick={handleHideAll}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hide All
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6 rounded">
          {success}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSections.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No sections found
                </td>
              </tr>
            ) : (
              sortedSections.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {section.section_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {section.section_key}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {section.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        section.is_visible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {section.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleVisibility(section.section_key, section.is_visible)}
                      disabled={saving}
                      className={`px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        section.is_visible
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {section.is_visible ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Hidden sections won't appear on your landing page at all</li>
          <li>• Changes take effect immediately</li>
          <li>• Use "Hide All" when you have limited content, then show sections as you add more</li>
          <li>• Visit your landing page (/) to see the changes</li>
        </ul>
      </div>
    </div>
  );
}
