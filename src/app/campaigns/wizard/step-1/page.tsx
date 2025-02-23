// Pure server component - no client-side hooks
export default function Page() {
  return (
    <div className="min-h-screen">
      <StepOneWrapper />
    </div>
  );
}

import StepOneWrapper from './Step1Content';