'use client';
import { useState } from 'react';

export function UploadID({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    setLoading(false);
    onUploaded(data.url);
  };

  return (
    <div className="glass p-6">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 disabled:opacity-50" disabled={!file || loading} onClick={handleUpload}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
