'use client';

import React, { useState, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { X, Upload, FileText, FileCode, FileCheck, AlertCircle } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { currentUser } = useUser();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (!['txt', 'md', 'markdown', 'docx'].includes(ext || '')) {
        setError('Unsupported file type. Please upload a .txt, .md, or .docx file.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-user-id': currentUser.id,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to import file');
      }

      const doc = await res.json();
      onClose();
      router.push(`/documents/${doc.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Import Document</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleUpload} className="p-6 space-y-4">
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg flex items-start gap-2.5 text-xs text-brand-800">
            <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Supported formats: .txt, .md, .docx</p>
              <p className="text-brand-600 mt-0.5">
                Uploaded files are converted to editable rich-text documents.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer transition bg-gray-50/50 hover:bg-brand-50/30 flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
                <FileCheck className="w-6 h-6 text-emerald-600" />
                <span>{file.name}</span>
              </div>
            ) : (
              <>
                <div className="p-3 bg-white shadow-sm border border-gray-200 rounded-full text-gray-500">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-700">Click to choose a file</p>
                <p className="text-xs text-gray-400">Plain Text (.txt), Markdown (.md), Word (.docx)</p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="px-5 py-2 bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
            >
              {loading ? 'Importing...' : 'Import & Edit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
