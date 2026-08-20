'use client';

import { useState } from 'react';
import { Download, XCircle, Loader2, CheckCircle } from 'lucide-react';

interface YouTubeAdminActionsProps {
  candidateId: string;
  videoId: string;
  title: string;
}

export function YouTubeAdminActions({ candidateId, videoId, title }: YouTubeAdminActionsProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'imported' | 'rejected'>('idle');
  const [error, setError] = useState('');

  const handleAction = async (action: 'import' | 'reject') => {
    setStatus('loading');
    setError('');

    try {
      const res = await fetch(`/api/admin/youtube/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(action === 'import' ? 'imported' : 'rejected');
      } else {
        setError(data.error || 'Action failed');
        setStatus('idle');
      }
    } catch {
      setError('An error occurred');
      setStatus('idle');
    }
  };

  if (status === 'imported') {
    return (
      <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        Imported to database
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-1.5 text-white/30 text-sm">
        <XCircle className="w-4 h-4" />
        Rejected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => handleAction('import')}
          disabled={status === 'loading'}
          className="flex-1 btn btn-sm bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 border border-brand-500/20 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Import
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={status === 'loading'}
          className="flex-1 btn btn-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50"
        >
          <XCircle className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    </div>
  );
}
