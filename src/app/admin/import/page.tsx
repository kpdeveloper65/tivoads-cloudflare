'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Upload, FileText, AlertCircle, CheckCircle,
  Loader2, Download, ArrowRight, Info
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  batchId: string;
  imported: number;
  skipped: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

export default function ImportPage() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [importMode, setImportMode] = useState<'csv' | 'json'>('csv');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState('PUBLISHED');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('skipDuplicates', skipDuplicates.toString());
    formData.append('defaultStatus', defaultStatus);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed.');
      }
    } catch (err) {
      setError('An error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Import Tool</h1>
        <p className="text-white/40 text-sm mt-1">Import ads from CSV or JSON files</p>
      </div>

      {/* Info box */}
      <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-5 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Expected CSV Format</h3>
            <p className="text-sm text-white/60 mb-3">
              Your CSV should have these columns (case-insensitive):
            </p>
            <code className="text-xs bg-black/30 rounded-lg px-3 py-2 block text-brand-300 overflow-x-auto">
              title, brand_name, category, description_short, description_long, video_url, thumbnail_url, duration, year, tags, slogan, campaign
            </code>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Import Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Default Status</label>
            <select
              value={defaultStatus}
              onChange={(e) => setDefaultStatus(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="PUBLISHED" className="bg-zinc-900 text-white">Published</option>
              <option value="PENDING" className="bg-zinc-900 text-white">Pending Review</option>
              <option value="DRAFT" className="bg-zinc-900 text-white">Draft</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
            <span className="text-sm text-white/60">Skip duplicate entries</span>
          </div>
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer mb-6 ${
          dragOver ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="w-10 h-10 text-white/30 mx-auto mb-4" />
        {file ? (
          <div>
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-white/40 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-white/60 font-medium">Drop your CSV or JSON file here</p>
            <p className="text-white/30 text-sm mt-1">or click to browse</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={!file || isImporting}
        className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isImporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Importing... This may take a moment
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Start Import
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className={`mt-6 rounded-2xl border p-6 ${result.success ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <h3 className="font-semibold text-white">
              Import {result.success ? 'Completed' : 'Completed with Errors'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Imported', value: result.imported, color: 'text-emerald-400' },
              { label: 'Skipped', value: result.skipped, color: 'text-white/50' },
              { label: 'Duplicates', value: result.duplicates, color: 'text-amber-400' },
              { label: 'Failed', value: result.failed, color: 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4 rounded-xl bg-black/20 p-3">
              <p className="text-xs font-semibold text-white/50 mb-2">Errors ({result.errors.length})</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-300">{err}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Link href="/admin/import/logs" className="btn btn-sm border border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              View Import Logs
            </Link>
            <Link href="/admin/ads" className="btn btn-sm btn-primary flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4" />
              View Imported Ads
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}