'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';

export function SubmissionActions({
  submissionId,
  videoUrl,
  title,
}: {
  submissionId: string;
  videoUrl: string;
  title: string;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'approved' | 'rejected'>('idle');

  const handleAction = async (action: 'approve' | 'reject') => {
    setStatus('loading');
    const res = await fetch(`/api/admin/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setStatus(action === 'approve' ? 'approved' : 'rejected');
    } else {
      setStatus('idle');
    }
  };

  if (status === 'approved') {
    return <span className="badge bg-emerald-500/20 text-emerald-400">Approved</span>;
  }

  if (status === 'rejected') {
    return <span className="badge bg-red-500/20 text-red-400">Rejected</span>;
  }

  return (
    <div className="flex flex-col gap-2 flex-shrink-0">
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Preview
      </a>
      <button
        onClick={() => handleAction('approve')}
        disabled={status === 'loading'}
        className="btn btn-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20"
      >
        {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Approve
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={status === 'loading'}
        className="btn btn-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
      >
        <XCircle className="w-3.5 h-3.5" />
        Reject
      </button>
    </div>
  );
}
