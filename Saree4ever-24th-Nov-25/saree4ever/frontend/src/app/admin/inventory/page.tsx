'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface StockLevel {
  variant_id: string;
  variant_name: string;
  variant_sku: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  current_stock: number;
  is_low_stock: boolean;
  track_inventory: boolean;
}

interface StockAdjustment {
  id: string;
  variant_id: string;
  previous_stock: number;
  new_stock: number;
  quantity_change: number;
  reason: string;
  notes: string;
  created_at: string;
  variant: {
    name: string;
    sku: string;
  };
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'levels' | 'history'>('levels');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [threshold, setThreshold] = useState(10);
  
  // Adjustment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<StockLevel | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustType, setAdjustType] = useState('manual_adjustment');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    if (activeTab === 'levels') {
      loadStockLevels();
    } else {
      loadHistory();
    }
  }, [activeTab, threshold]);

  const loadStockLevels = async () => {
    setLoading(true);
    try {
      // Ensure we have admin token
      if (!localStorage.getItem('token') && !localStorage.getItem('admin_token')) {
        if (localStorage.getItem('admin_auth') === 'true') {
          setError('Admin token not available. Please refresh the page or log out and log back in.');
        } else {
          setError('Admin authentication required.');
        }
        setLoading(false);
        return;
      }
      
      const res: any = await api.inventory.getStockLevels(threshold);
      setStockLevels(res.stock_levels || []);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load stock levels';
      setError(errorMessage);
      console.error('Failed to load stock levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Ensure we have admin token
      if (!localStorage.getItem('token') && !localStorage.getItem('admin_token')) {
        if (localStorage.getItem('admin_auth') === 'true') {
          setError('Admin token not available. Please refresh the page or log out and log back in.');
        } else {
          setError('Admin authentication required.');
        }
        setLoading(false);
        return;
      }
      
      const res: any = await api.inventory.getAdjustments({ limit: 50 });
      setAdjustments(res.adjustments || []);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load history';
      setError(errorMessage);
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustClick = (variant: StockLevel) => {
    setSelectedVariant(variant);
    setAdjustQuantity(0);
    setAdjustType('manual_adjustment');
    setAdjustNotes('');
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || adjustQuantity === 0) return;

    setAdjusting(true);
    try {
      await api.inventory.adjust({
        variant_id: selectedVariant.variant_id,
        quantity_change: adjustQuantity,
        type: adjustType,
        notes: adjustNotes,
      });
      
      setIsModalOpen(false);
      loadStockLevels(); // Reload data
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Failed to update stock');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="heading-serif-md mb-2">Inventory Management</h1>
          <p className="text-gray-600">Track stock levels and adjustments</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'levels' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'history' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {activeTab === 'levels' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Low Stock Threshold:</span>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing {stockLevels.length} items
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-3">Product / Variant</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3 text-center">Stock</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Loading inventory...
                    </td>
                  </tr>
                ) : stockLevels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  stockLevels.map((item) => (
                    <tr key={item.variant_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.product_name}</div>
                        {item.variant_name !== 'Default Variant' && (
                          <div className="text-gray-500 text-xs">{item.variant_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {item.variant_sku || item.product_sku}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {item.current_stock}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.is_low_stock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleAdjustClick(item)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Change</th>
                  <th className="px-6 py-3">New Stock</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Loading history...
                    </td>
                  </tr>
                ) : adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No history found.
                    </td>
                  </tr>
                ) : (
                  adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(adj.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{adj.variant?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{adj.variant?.sku}</div>
                      </td>
                      <td className={`px-6 py-4 font-medium ${adj.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {adj.new_stock}
                      </td>
                      <td className="px-6 py-4 text-gray-600 capitalize">
                        {adj.reason || 'Manual Adjustment'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 italic">
                        {adj.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {isModalOpen && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Adjust Stock</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedVariant.product_name} 
              {selectedVariant.variant_name !== 'Default Variant' && ` - ${selectedVariant.variant_name}`}
            </p>
            
            <form onSubmit={handleAdjustSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity Change</label>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  Current: {selectedVariant.current_stock}
                </div>
                <input
                  type="number"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="input-field"
                  placeholder="e.g. 5 or -3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use positive numbers to add stock, negative to remove.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="input-field"
                >
                  <option value="manual_adjustment">Manual Adjustment</option>
                  <option value="restock">Restock</option>
                  <option value="correction">Inventory Correction</option>
                  <option value="damage">Damage/Loss</option>
                  <option value="return">Return</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Optional details..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || adjustQuantity === 0}
                  className={`btn-primary ${adjusting ? 'opacity-50' : ''}`}
                >
                  {adjusting ? 'Saving...' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
