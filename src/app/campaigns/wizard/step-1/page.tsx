// This is a pure server component
export default function Page() {
  return (
    <div className="min-h-screen">
      <ClientSideContent />
    </div>
  );
}

// Import the client-side wrapper
import ClientSideContent from './Step1Content';