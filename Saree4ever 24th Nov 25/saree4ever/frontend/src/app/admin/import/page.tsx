'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ImportSummary {
  total_rows: number;
  imported?: number;
  updated?: number;
  failed: number;
  success_rate?: string;
}

interface ImportError {
  row: number;
  error: string;
  data: any;
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'variants' | 'stock'>('products');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    summary: ImportSummary;
    errors: ImportError[];
    successes: any[];
    error_report_url?: string;
  } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res: any = await api.csv.getHistory();
      setHistory(res.imports || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // Clear previous results
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      let res;
      if (activeTab === 'products') {
        res = await api.csv.importProducts(formData);
      } else if (activeTab === 'variants') {
        res = await api.csv.importVariants(formData);
      } else if (activeTab === 'stock') {
        res = await api.csv.importStock(formData);
      }

      setResult(res as any);
      loadHistory(); // Refresh history
      setFile(null); // Clear file input
    } catch (error: any) {
      console.error('Import failed:', error);
      alert('Import failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="heading-serif-md mb-2">CSV Import</h1>
        <p className="text-gray-600">Bulk import products, variants, and stock updates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex space-x-4 mb-6 border-b">
              <button
                className={`pb-2 px-1 text-sm font-medium ${
                  activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('products')}
              >
                Import Products
              </button>
              <button
                className={`pb-2 px-1 text-sm font-medium ${
                  activeTab === 'variants' ? 'border-b-2 border-black text-black' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('variants')}
              >
                Import Variants
              </button>
              <button
                className={`pb-2 px-1 text-sm font-medium ${
                  activeTab === 'stock' ? 'border-b-2 border-black text-black' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('stock')}
              >
                Update Stock
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {file ? file.name : 'Click to upload CSV'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {file ? 'Click to change file' : 'CSV files only'}
                  </span>
                </label>
              </div>

              {file && (
                <div className="flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`btn-primary ${uploading ? 'opacity-50' : ''}`}
                  >
                    {uploading ? 'Importing...' : 'Start Import'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-sm text-gray-500 bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2 text-gray-700">CSV Template Format:</h4>
              {activeTab === 'products' && (
                <code className="block whitespace-pre-wrap text-xs">
                  sku,name,description,base_price,mrp,color,weave,length_m,blouse_included,category_ids,type_ids
                </code>
              )}
              {activeTab === 'variants' && (
                <code className="block whitespace-pre-wrap text-xs">
                  product_sku,variant_sku,variant_name,stock_quantity,price
                </code>
              )}
              {activeTab === 'stock' && (
                <code className="block whitespace-pre-wrap text-xs">
                  sku,stock_quantity
                </code>
              )}
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Import Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Total Rows</div>
                  <div className="text-xl font-bold">{result.summary.total_rows}</div>
                </div>
                {result.summary.imported !== undefined && (
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-xs text-green-600">New Created</div>
                    <div className="text-xl font-bold text-green-700">{result.summary.imported}</div>
                  </div>
                )}
                {result.summary.updated !== undefined && (
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-xs text-blue-600">Updated</div>
                    <div className="text-xl font-bold text-blue-700">{result.summary.updated}</div>
                  </div>
                )}
                <div className="bg-red-50 p-3 rounded">
                  <div className="text-xs text-red-600">Failed</div>
                  <div className="text-xl font-bold text-red-700">{result.summary.failed}</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-red-700 mb-2">Errors ({result.errors.length})</h4>
                  <div className="bg-red-50 border border-red-100 rounded max-h-48 overflow-y-auto p-2">
                    {result.errors.map((err, i) => (
                      <div key={i} className="text-xs text-red-600 mb-1 border-b border-red-100 pb-1 last:border-0">
                        <span className="font-bold">Row {err.row}:</span> {err.error}
                      </div>
                    ))}
                  </div>
                  {result.error_report_url && (
                    <a
                      href={`http://localhost:5001${result.error_report_url}`}
                      target="_blank"
                      className="text-xs text-red-600 underline mt-2 inline-block"
                    >
                      Download Full Error Report
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recent Imports</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No history found.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 last:border-0 pb-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium uppercase px-2 py-0.5 bg-gray-100 rounded">
                        {item.resource_type || 'Import'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{item.file_name}</p>
                    <div className="flex text-xs text-gray-500 space-x-2 mt-1">
                      <span className="text-green-600">{item.success_count} success</span>
                      <span>•</span>
                      <span className="text-red-600">{item.error_count} errors</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
