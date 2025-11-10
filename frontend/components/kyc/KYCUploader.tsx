'use client';
import { useState, useRef } from 'react';
import { Upload, CheckCircle, X } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/env';

interface KYCUploaderProps {
  type: 'id_front' | 'id_back' | 'selfie';
  label: string;
  onUploadComplete: (url: string) => void;
}

export function KYCUploader({ type, label, onUploadComplete }: KYCUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validation
    if (selected.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5MB)');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selected.type)) {
      setError('Format non supporté (JPG/PNG uniquement)');
      return;
    }

    setError('');
    setFile(selected);

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');

      // 1. Get presigned URL
      const urlRes = await fetch(`${base}/kyc/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!urlRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, fileKey } = await urlRes.json();

      // 2. Upload to presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('Upload error:', uploadRes.status, errorText);
        throw new Error(`Upload failed: ${uploadRes.status} - ${errorText || 'Unknown error'}`);
      }

      setUploaded(true);
      onUploadComplete(fileKey);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setUploaded(false);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">{label}</p>

      {!preview ? (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
            <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/60">Cliquez pour sélectionner un fichier</p>
            <p className="text-xs text-white/40 mt-1">JPG, PNG - Max 5MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border border-white/10">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover filter blur-sm"
              style={{ filter: 'blur(8px)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <p className="text-white text-sm">Aperçu flouté pour votre sécurité</p>
            </div>
          </div>

          {!uploaded && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Upload en cours...' : 'Confirmer l\'upload'}
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploaded && (
            <div className="flex items-center gap-2 mt-3 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Document uploadé avec succès</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
