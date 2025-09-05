'use client';
import React from 'react';
import './tiptap.css';

import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, type EditorEvents, type Extension, useEditor } from '@tiptap/react';
import EditorToolbar from './toolbars/editor-toolbar';
import { FloatingToolbar } from './extensions/floating-toolbar';
import { TipTapFloatingMenu } from './extensions/floating-menu';

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal',
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc',
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: 'is-editor-empty',
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading':
          return `Heading ${node.attrs.level}`;
        case 'detailsSummary':
          return 'Section title';
        case 'codeBlock':
          // never show the placeholder when editing code
          return '';
        default:
          return "Write, type '/' for commands";
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    defaultAlignment: 'justify',
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  // ImageExtension,
  // ImagePlaceholder,
  Typography,
];

interface EditorProps {
  onUpdate: (props: EditorEvents['update']) => void;
  content?: string;
  linkBase?: string;
}

export default function Editor({ onUpdate, linkBase, content = '<p>Start writing...</p>' }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content,
    editorProps: {
      attributes: {
        class: 'max-w-full focus:outline-none',
        style: 'font-family: "Times New Roman", serif; font-size: 16px;',
      },
    },
    onUpdate,
  });

  if (!editor) return null;

  return (
    <div className='relative max-h-[calc(100dvh-6rem)]  w-full overflow-hidden overflow-y-scroll border bg-card pb-[60px] sm:pb-0'>
      <EditorToolbar editor={editor} linkBase={linkBase} />
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />
      <EditorContent editor={editor} className='min-h-[600px] w-full min-w-full cursor-text sm:p-6' />
    </div>
  );
}
