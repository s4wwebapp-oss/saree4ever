'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('_prisma_migrations').select('id').limit(1);
        if (error) {
          setError(error.message);
          setStatus('Connection failed');
        } else {
          setStatus('Connected to Supabase');
          setError(null);
        }
      } catch (err: any) {
        setError(err.message);
        setStatus('Connection error');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-2">Supabase Connection Status</h3>
      <p className={error ? 'text-red-500' : 'text-green-500'}>
        {status}
      </p>
      {error && (
        <p className="text-sm text-gray-500 mt-2">
          Error: {error}
        </p>
      )}
    </div>
  );
}

