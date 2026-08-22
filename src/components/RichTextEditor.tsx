'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  readOnly?: boolean;
}

export function RichTextEditor({ initialContent, onSave, readOnly = false }: RichTextEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'readonly'>(
    readOnly ? 'readonly' : 'saved'
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
    ],
    content: initialContent || '<p></p>',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (readOnly) return;
      setSaveStatus('unsaved');

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          const html = editor.getHTML();
          await onSave(html);
          setSaveStatus('saved');
        } catch (error) {
          console.error('Auto-save error:', error);
          setSaveStatus('unsaved');
        }
      }, 1000);
    },
  });

  useEffect(() => {
    if (editor && readOnly !== !editor.isEditable) {
      editor.setEditable(!readOnly);
      setSaveStatus(readOnly ? 'readonly' : 'saved');
    }
  }, [readOnly, editor]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 gap-2 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> Loading editor surface...
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col transition hover:shadow-md">
      {/* Editor Toolbar & Status Bar */}
      <div className="border-b border-gray-200 px-3 sm:px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sticky top-16 z-20">
        {/* Formatting Buttons - Scrollable on Mobile */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 shrink-0 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={readOnly}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition ${
                editor.isActive('bold') ? 'bg-brand-50 text-brand-600 font-bold' : 'text-gray-600'
              } disabled:opacity-30`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={readOnly}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition ${
                editor.isActive('italic') ? 'bg-brand-50 text-brand-600' : 'text-gray-600'
              } disabled:opacity-30`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={readOnly}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition ${
                editor.isActive('underline') ? 'bg-brand-50 text-brand-600' : 'text-gray-600'
              } disabled:opacity-30`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 mx-0.5 shrink-0" />

          <div className="flex items-center gap-1 shrink-0 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={readOnly}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition ${
                editor.isActive('heading', { level: 1 }) ? 'bg-brand-50 text-brand-600 font-bold' : 'text-gray-600'
              } disabled:opacity-30`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={readOnly}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition ${
                editor.isActive('heading', { level: 2 }) ? 'bg-brand-50 text-brand-600 font-bold' : 'text-gray-600'
              } disabled:opacity-30`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 mx-0.5 shrink-0" />

          <div className="flex items-center gap-1 shrink-0 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={readOnly}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition ${
                editor.isActive('bulletList') ? 'bg-brand-50 text-brand-600' : 'text-gray-600'
              } disabled:opacity-30`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={readOnly}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition ${
                editor.isActive('orderedList') ? 'bg-brand-50 text-brand-600' : 'text-gray-600'
              } disabled:opacity-30`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 mx-0.5 shrink-0" />

          <div className="flex items-center gap-1 shrink-0 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={readOnly || !editor.can().undo()}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 disabled:opacity-20"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={readOnly || !editor.can().redo()}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 disabled:opacity-20"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Status Badge */}
        <div className="shrink-0 self-end sm:self-center">
          {saveStatus === 'saved' && (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> All changes saved
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-blue-700 bg-blue-50 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-amber-700 bg-amber-50 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
            </span>
          )}
          {saveStatus === 'readonly' && (
            <span className="text-gray-700 bg-gray-100 border border-gray-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Viewer Mode (Read-Only)
            </span>
          )}
        </div>
      </div>

      {/* Editor Content Surface */}
      <div className="p-4 sm:p-8 flex-1 min-h-[450px] sm:min-h-[550px] prose prose-slate max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
