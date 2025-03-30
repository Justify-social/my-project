// Re-export components from their respective directories
// This file serves as the main entry point for all UI components

// Atoms (Basic building blocks)
export * from './atoms/button';
export * from './atoms/input';
export * from './atoms/label';
export * from './atoms/spinner';
export * from './atoms/switch';
export * from './atoms/badge';
export * from './atoms/slider';
export * from './atoms/card';

// Molecules (Combinations of atoms)
export * from './molecules/accordion';
export * from './molecules/tabs';
export * from './molecules/select';
export * from './molecules/scroll-area';
export * from './molecules/feedback/alert';

// Organisms (Complex UI components)
export * from './organisms/Calendar';

// Utils (Context providers, etc.)
export * from './utils';

// Legacy support (for backward compatibility)
export { Spinner as LoadingSpinner } from './atoms/spinner';

// Backward compatibility exports (direct component exports)
export { default as Accordion } from './molecules/accordion';
export { default as Alert } from './molecules/feedback/alert';
export { default as Badge } from './atoms/badge';
export { default as Button } from './atoms/button';
export { default as Card } from './atoms/card';
export { default as Input } from './atoms/input';
export { default as Label } from './atoms/label';
export { default as ScrollArea } from './molecules/scroll-area';
export { default as Select } from './molecules/select';
export { default as Slider } from './atoms/slider';
export { default as Spinner } from './atoms/spinner';
export { default as Switch } from './atoms/switch';
export { default as Tabs } from './molecules/tabs';

// For backward compatibility with direct imports (e.g., from '@/components/ui/accordion')
// This replicates the structure that the application is expecting
export * as accordion from './molecules/accordion';
export * as alert from './molecules/feedback/alert';
export * as badge from './atoms/badge';
export * as button from './atoms/button';
export * as card from './atoms/card';
export * as input from './atoms/input';
export * as label from './atoms/label';
export * as scrollArea from './molecules/scroll-area';
export * as select from './molecules/select';
export * as slider from './atoms/slider';
export * as spinner from './atoms/spinner';
export * as switch from './atoms/switch';
export * as tabs from './molecules/tabs';

// This allows multiple import patterns to work:
// 1. import { Button } from '@/components/ui';             (backward compatibility)
// 2. import { Button } from '@/components/ui/atoms/button'; (new atomic design)
// 3. import { ... } from '@/components/ui/button';         (direct path import)
