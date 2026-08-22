'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Document, Role } from '@/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Edit3,
  Eye,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ShareModal } from '@/components/ShareModal';

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { currentUser } = useUser();

  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const fetchDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        headers: {
          'x-user-id': currentUser.id,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError('403 Forbidden: You do not have permission to view this document.');
        } else if (res.status === 404) {
          setError('404 Not Found: Document does not exist.');
        } else {
          setError('Failed to load document');
        }
        setDocument(null);
        return;
      }

      const data: Document = await res.json();
      setDocument(data);
      setTitle(data.title);
    } catch (err: any) {
      setError(err.message || 'Error fetching document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (docId && currentUser.id) {
      fetchDocument();
    }
  }, [docId, currentUser]);

  const handleTitleBlur = async () => {
    if (!document || title === document.title || document.currentUserRole === 'VIEWER') return;

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDocument(updated);
      }
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleSaveContent = async (htmlContent: string) => {
    if (!document || document.currentUserRole === 'VIEWER') return;

    const res = await fetch(`/api/documents/${docId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id,
      },
      body: JSON.stringify({ content: htmlContent }),
    });

    if (!res.ok) {
      throw new Error('Save failed');
    }
    const updated = await res.json();
    setDocument((prev) => (prev ? { ...prev, content: updated.content } : null));
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 flex items-center justify-center gap-2 font-medium">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" /> Loading document content...
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Access Restricted</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{error || 'Unable to access document'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const role: Role = document.currentUserRole || 'NONE';
  const isReadOnly = role === 'VIEWER';

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Navigation & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link
            href="/"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              disabled={isReadOnly}
              className="w-full text-lg sm:text-xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-500 focus:outline-none px-1 py-0.5 rounded transition disabled:opacity-80 truncate"
              placeholder="Document Title"
            />
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 px-1 truncate">
              <span className="truncate">Owned by <strong>{document.owner.name}</strong></span>
              <span>•</span>
              <span
                className={`font-semibold uppercase text-[10px] px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                  role === 'OWNER'
                    ? 'text-brand-700 bg-brand-50 border border-brand-100'
                    : role === 'EDITOR'
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                    : 'text-blue-700 bg-blue-50 border border-blue-100'
                }`}
              >
                {role === 'OWNER' && <ShieldCheck className="w-3 h-3 text-brand-600" />}
                {role === 'EDITOR' && <Edit3 className="w-3 h-3 text-emerald-600" />}
                {role === 'VIEWER' && <Eye className="w-3 h-3 text-blue-600" />}
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setIsShareOpen(true)}
            className="bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <RichTextEditor
        initialContent={document.content}
        onSave={handleSaveContent}
        readOnly={isReadOnly}
      />

      {/* Share Modal */}
      <ShareModal
        document={document}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShareUpdated={fetchDocument}
      />
    </div>
  );
}
