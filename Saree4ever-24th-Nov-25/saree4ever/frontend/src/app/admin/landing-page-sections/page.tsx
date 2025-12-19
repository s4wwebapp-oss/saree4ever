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

export default function AdminLandingPageSectionsPage() {
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        setError('Not authenticated. Please login at /admin first.');
        return;
      }
      
      const response: any = await api.landingPageSections.getAll();
      setSections(response.sections || []);
      
      // Check if we got default sections (schema cache issue)
      if (response.sections && response.sections.length > 0 && response.sections[0].id === '1') {
        setError(
          '⚠️ PostgREST schema cache has not refreshed yet. ' +
          'The table was created but Supabase needs 1-5 minutes to update its schema cache. ' +
          'You can refresh the cache in Supabase Dashboard → Settings → API → Refresh Schema Cache, ' +
          'or wait a few minutes and refresh this page. Default sections are shown below.'
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch sections';
      if (errorMessage.includes('No token provided') || errorMessage.includes('401')) {
        setError('Authentication required. Please logout and login again at /admin');
      } else if (errorMessage.includes('schema cache') || errorMessage.includes('Could not find the table')) {
        setError(
          '⚠️ PostgREST schema cache has not refreshed yet. ' +
          'Run this SQL in Supabase SQL Editor to refresh immediately: NOTIFY pgrst, \'reload schema\'; ' +
          'Or wait 1-5 minutes for automatic refresh.'
        );
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
      setSuccessMessage(null);

      // Check for authentication token before making API call
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        setError('Not authenticated. Please logout and login again at /admin');
        setSaving(false);
        return;
      }

      await api.landingPageSections.updateVisibility(sectionKey, !currentVisibility);
      
      // Update local state
      setSections(prevSections =>
        prevSections.map(section =>
          section.section_key === sectionKey
            ? { ...section, is_visible: !currentVisibility }
            : section
        )
      );

      setSuccessMessage(`Section "${sectionKey}" visibility updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update section visibility';
      
      // Check for authentication errors
      if (errorMessage.includes('No token provided') || errorMessage.includes('401') || errorMessage.includes('Invalid or expired token')) {
        setError('Authentication required. Please logout and login again at /admin');
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_auth');
      } else if (errorMessage.includes('schema cache') || errorMessage.includes('Could not find the table')) {
        setError(
          '⚠️ PostgREST schema cache has not refreshed yet. ' +
          'Please wait 1-5 minutes after creating the table, or refresh the schema cache in ' +
          'Supabase Dashboard → Settings → API → Refresh Schema Cache. ' +
          'Alternatively, you can run this SQL in Supabase SQL Editor: NOTIFY pgrst, \'reload schema\';'
        );
      } else {
        setError(errorMessage);
      }
      console.error('Error updating section visibility:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkToggle = async (isVisible: boolean) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const updates = sections.map(section => ({
        section_key: section.section_key,
        is_visible: isVisible,
      }));

      const response: any = await api.landingPageSections.bulkUpdateVisibility(updates);
      setSections(response.sections || sections);

      setSuccessMessage(`All sections ${isVisible ? 'shown' : 'hidden'} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update sections';
      
      // Check for schema cache errors
      if (errorMessage.includes('schema cache') || errorMessage.includes('Could not find the table')) {
        setError(
          '⚠️ PostgREST schema cache has not refreshed yet. ' +
          'Please wait 1-5 minutes after creating the table, or refresh the schema cache in ' +
          'Supabase Dashboard → Settings → API → Refresh Schema Cache. ' +
          'Alternatively, you can run this SQL in Supabase SQL Editor: NOTIFY pgrst, \'reload schema\';'
        );
      } else {
        setError(errorMessage);
      }
      console.error('Error bulk updating sections:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-serif-md mb-2">Landing Page Sections</h1>
          <p className="text-gray-600">Control which sections are visible on the landing page</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkToggle(true)}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Show All
          </button>
          <button
            onClick={() => handleBulkToggle(false)}
            disabled={saving}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sections.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No sections found. Please run the database migration first.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{section.section_name}</div>
                    <div className="text-sm text-gray-500 mt-1">{section.section_key}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {section.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        section.is_visible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {section.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleVisibility(section.section_key, section.is_visible)}
                      disabled={saving}
                      className={`px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Hide sections when you have fewer products to avoid showing empty sections</li>
          <li>Enable sections as you add more content to your store</li>
          <li>Changes take effect immediately on the landing page</li>
          <li>You can always show/hide individual sections or use bulk actions</li>
        </ul>
      </div>
    </div>
  );
}
