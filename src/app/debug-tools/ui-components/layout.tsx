import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UI Components Debug Page',
  description: 'Debug and test UI components centralized in the component library',
};

export default function UIComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 