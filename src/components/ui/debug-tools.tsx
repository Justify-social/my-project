'use client';

import { ToastProvider } from './toast';
import ComponentExamples from './examples';

export default function DebugTools() {
  return (
    <ToastProvider>
      <ComponentExamples />
    </ToastProvider>
  );
} 