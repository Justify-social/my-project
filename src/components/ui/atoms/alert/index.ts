// Re-export the alert component from the molecules directory
// This maintains backward compatibility while we implement a proper Alert.tsx
export { default } from '../../molecules/feedback/alert';
export * from '../../molecules/feedback/alert';

import Alert from './Alert';

export default Alert;
