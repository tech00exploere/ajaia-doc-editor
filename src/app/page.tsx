'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Document } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Upload,
  Trash2,
  Share2,
  Clock,
  Edit3,
  Eye,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import { FileUploadModal } from '@/components/FileUploadModal';

export default function Dashboard() {
  const { currentUser } = useUser();
  const router = useRouter();
  const [ownedDocs, setOwnedDocs] = useState<Document[]>([]);
  const [sharedDocs, setSharedDocs] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents', {
        headers: {
          'x-user-id': currentUser.id,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  const handleCreateDocument = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          title: 'Untitled Document',
          content: '<h1>Untitled Document</h1><p>Start writing your document content here...</p>',
        }),
      });

      if (res.ok) {
        const newDoc = await res.json();
        router.push(`/documents/${newDoc.id}`);
      }
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
        },
      });

      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filtered docs based on search
  const filteredOwned = ownedDocs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShared = sharedDocs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Banner / Info */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ajaia India Workspace</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Namaste, {currentUser.name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 font-normal leading-relaxed">
              Acting as <strong className="text-white underline decoration-amber-300">{currentUser.name}</strong> ({currentUser.email}).
              Use the top-right user switcher to test real-time server-side access permissions between Owner, Editor, and Viewer roles.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import (.txt, .md, .docx)
            </button>

            <button
              onClick={handleCreateDocument}
              disabled={creating}
              className="flex-1 sm:flex-none bg-white text-brand-700 hover:bg-brand-50 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              ) : (
                <Plus className="w-4 h-4 text-brand-600" />
              )}
              New Document
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded-xl shadow-2xs focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition">
        <Search className="w-5 h-5 text-gray-400 ml-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents by title or collaborator name..."
          className="w-full text-sm text-gray-800 focus:outline-none bg-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 bg-gray-100 rounded-lg transition shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 flex items-center justify-center gap-2 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" /> Loading your workspace documents...
        </div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: My Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                My Documents ({filteredOwned.length})
              </h3>
            </div>

            {filteredOwned.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center space-y-2">
                <p className="text-sm font-medium text-gray-600">No documents found.</p>
                <p className="text-xs text-gray-400">
                  {searchQuery ? 'Try clearing your search query.' : 'Create a new document or import a file to get started.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreateDocument}
                    className="mt-2 text-xs font-bold text-brand-600 hover:underline"
                  >
                    + Create your first document
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOwned.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-400 hover:shadow-lg transition duration-200 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition line-clamp-1">
                          {doc.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full shrink-0">
                          Owner
                        </span>
                      </div>
                      <p
                        className="text-xs text-gray-500 line-clamp-2 mb-4 font-normal leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: doc.content.replace(/<[^>]*>?/gm, '').slice(0, 110) || 'Empty document...',
                        }}
                      />
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Shared With Me */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                Shared with me ({filteredShared.length})
              </h3>
            </div>

            {filteredShared.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-400">
                {searchQuery ? 'No shared documents match your search.' : `No documents have been shared with ${currentUser.name} yet.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShared.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="group bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-lg transition duration-200 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition line-clamp-1">
                          {doc.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                            doc.currentUserRole === 'EDITOR'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-blue-700 bg-blue-50 border border-blue-200'
                          }`}
                        >
                          {doc.currentUserRole === 'EDITOR' ? (
                            <>
                              <Edit3 className="w-3 h-3" /> Editor
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" /> Viewer
                            </>
                          )}
                        </span>
                      </div>
                      <p
                        className="text-xs text-gray-500 line-clamp-2 mb-4 font-normal leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: doc.content.replace(/<[^>]*>?/gm, '').slice(0, 110) || 'Empty document...',
                        }}
                      />
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={doc.owner.avatar || 'https://via.placeholder.com/40'}
                          alt={doc.owner.name}
                          className="w-5 h-5 rounded-full object-cover border border-gray-200"
                        />
                        <span className="text-xs text-gray-700 font-semibold truncate max-w-[120px]">
                          {doc.owner.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
