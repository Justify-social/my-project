/**
 * @component RichTextEditor
 * @category molecule
 * @subcategory input
 * @description Production-ready rich text editor optimized for email content using react-quill-new
 * @status active
 */
'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  height?: string;
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = 'Enter your email content...',
  label,
  description,
  disabled = false,
  className,
  height = '200px',
}: RichTextEditorProps) {
  // Email-safe toolbar configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, false] }], // Only h2, h3, and normal text for email safety
        ['bold', 'italic', 'underline'], // Basic formatting
        [{ list: 'ordered' }, { list: 'bullet' }], // Lists
        ['link'], // Links only (images can break in emails)
        [{ color: [] }], // Text color
        ['clean'], // Remove formatting
      ],
      clipboard: {
        // Strip unsupported formatting when pasting
        matchVisual: false,
      },
    }),
    []
  );

  // Email-safe formats only (note: 'bullet' is part of 'list', not separate)
  const formats = ['header', 'bold', 'italic', 'underline', 'list', 'link', 'color'];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}

      <div className="relative">
        <ReactQuill
          id={id}
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{
            height,
            marginBottom: '50px', // Space for toolbar
          }}
          className={cn(
            'bg-white border border-input rounded-md',
            disabled && 'opacity-50 cursor-not-allowed',
            // Custom styles for email-appropriate appearance
            '[&_.ql-toolbar]:border-b-input [&_.ql-container]:border-t-0',
            '[&_.ql-editor]:min-h-[120px] [&_.ql-editor]:font-sans'
          )}
        />
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
