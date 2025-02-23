'use client';

export default function NotFound() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-red-50 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-600">Pricing Page Not Found</h1>
          <p>Debug Info:</p>
          <p>URL: {window.location.href}</p>
          <p>Pathname: {window.location.pathname}</p>
        </div>
      </div>
    </div>
  );
} 