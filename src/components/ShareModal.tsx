'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Document, DocumentShare, User } from '@/types';
import { X, UserPlus, Trash2, Shield, Eye, Edit3 } from 'lucide-react';

interface ShareModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onShareUpdated: () => void;
}

export function ShareModal({ document, isOpen, onClose, onShareUpdated }: ShareModalProps) {
  const { currentUser, users } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = document.currentUserRole === 'OWNER';

  // Available users to share with (exclude owner & existing collaborators)
  const existingSharedUserIds = new Set(document.shares?.map((s) => s.userId) || []);
  const availableUsers = users.filter(
    (u) => u.id !== document.ownerId && !existingSharedUserIds.has(u.id)
  );

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          targetUserId: selectedUserId,
          role: selectedRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to share document');
      }

      setSelectedUserId('');
      onShareUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (targetUserId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to revoke access');
      }

      onShareUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Share "{document.title}"</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Add collaborator form (Owners only) */}
          {isOwner ? (
            <form onSubmit={handleShare} className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Add People
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a team member...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'EDITOR' | 'VIEWER')}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="EDITOR">Editor</option>
                </select>

                <button
                  type="submit"
                  disabled={!selectedUserId || loading}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Share
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
              Only the document owner (<strong>{document.owner.name}</strong>) can modify sharing permissions.
            </div>
          )}

          {/* Active Access List */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              People with access
            </label>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
              {/* Owner */}
              <div className="p-3 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <img
                    src={document.owner.avatar || 'https://via.placeholder.com/40'}
                    alt={document.owner.name}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{document.owner.name}</p>
                    <p className="text-xs text-gray-500">{document.owner.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                  Owner
                </span>
              </div>

              {/* Shared users */}
              {document.shares && document.shares.length > 0 ? (
                document.shares.map((share) => (
                  <div key={share.id} className="p-3 flex items-center justify-between hover:bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <img
                        src={share.user.avatar || 'https://via.placeholder.com/40'}
                        alt={share.user.name}
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{share.user.name}</p>
                        <p className="text-xs text-gray-500">{share.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        {share.role === 'EDITOR' ? (
                          <>
                            <Edit3 className="w-3 h-3 text-emerald-600" /> Editor
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-blue-600" /> Viewer
                          </>
                        )}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleRevoke(share.userId)}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Revoke access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">
                  Not shared with anyone else yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
