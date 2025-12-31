'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DataTable from '@/components/admin/DataTable';

interface AuditLog {
  id: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  before_data: any;
  after_data: any;
  created_at: string;
  ip_address: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.audit.getLogs(filters);
      // setLogs(response.logs || []);
      
      // Mock data for now
      setLogs([]);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Time',
      sortable: true,
      render: (log: AuditLog) => (
        <div className="text-sm">
          {new Date(log.created_at).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'actor_email',
      label: 'User',
      render: (log: AuditLog) => (
        <div className="text-sm">{log.actor_email || 'System'}</div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: AuditLog) => (
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {log.action}
        </span>
      ),
    },
    {
      key: 'resource_type',
      label: 'Resource',
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium">{log.resource_type}</div>
          <div className="text-xs text-gray-600">{log.resource_id?.substring(0, 8)}...</div>
        </div>
      ),
    },
    {
      key: 'changes',
      label: 'Changes',
      render: (log: AuditLog) => (
        <button
          onClick={() => {
            // TODO: Show diff modal
            console.log('Before:', log.before_data, 'After:', log.after_data);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          View Diff
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-serif-md mb-2">Audit Logs</h1>
        <p className="text-gray-600">Track all admin actions and changes</p>
      </div>

      {/* Filters */}
      <div className="border border-black p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">All Actions</option>
              <option value="product.create">Product Create</option>
              <option value="product.update">Product Update</option>
              <option value="product.delete">Product Delete</option>
              <option value="stock.adjust">Stock Adjust</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Resource Type</label>
            <select
              value={filters.resource_type}
              onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">All Types</option>
              <option value="product">Product</option>
              <option value="order">Order</option>
              <option value="variant">Variant</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="input-field text-sm"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <DataTable
        data={logs}
        columns={columns}
        loading={loading}
      />

      {logs.length === 0 && !loading && (
        <div className="border border-black p-12 text-center">
          <p className="text-gray-600">No audit logs found</p>
          <p className="text-sm text-gray-500 mt-2">Admin actions will appear here once logged</p>
        </div>
      )}
    </div>
  );
}



