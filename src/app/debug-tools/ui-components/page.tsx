import { Metadata } from 'next';
import DebugTools from '@/components/ui/debug-tools';

export const metadata: Metadata = {
  title: 'UI Components Debug Page',
  description: 'Debug and test UI components centralized in the component library',
};

export default function UIComponentsPage() {
  return <DebugTools />;
} 