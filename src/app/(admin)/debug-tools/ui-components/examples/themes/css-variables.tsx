export default function CssVariablesTestPage() {
  return (
    <div className="p-8 min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-6">CSS Variables Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 rounded-md bg-primary text-primary-foreground">
          Primary Color
        </div>
        
        <div className="p-4 rounded-md bg-secondary text-secondary-foreground">
          Secondary Color
        </div>
        
        <div className="p-4 rounded-md bg-accent text-accent-foreground">
          Accent Color
        </div>
        
        <div className="p-4 rounded-md bg-muted text-muted-foreground">
          Muted Color
        </div>
        
        <div className="p-4 rounded-md bg-card text-card-foreground border">
          Card with Border
        </div>
        
        <div className="p-4 rounded-md bg-destructive text-destructive-foreground">
          Destructive Color
        </div>
        
        <div className="p-4 rounded-md bg-success text-success-foreground">
          Success Color
        </div>
        
        <div className="p-4 rounded-md bg-warning text-warning-foreground">
          Warning Color
        </div>
        
        <div className="p-4 rounded-md bg-interactive text-interactive-foreground">
          Interactive Color
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-muted-foreground">
          This page tests if Tailwind CSS correctly processes our color variables.
        </p>
      </div>
    </div>
  );
} 