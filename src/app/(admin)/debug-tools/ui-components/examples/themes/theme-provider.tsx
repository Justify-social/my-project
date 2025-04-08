/**
 * Theme Provider Test Page
 * 
 * This page tests the functionality of the theme provider and theme toggle components.
 */
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ThemeToggle } from "@/components/uiheme-toggle"

export default function ThemeProviderTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Theme Provider Test</h1>
      
      <div className="grid gap-8">
        <section className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Current Theme</h2>
          <p className="mb-4">
            This page demonstrates the functionality of the ThemeProvider component.
            The current theme is applied to the entire page, and you can toggle between
            light and dark modes using the button below.
          </p>
          <div className="flex items-center gap-2">
            <span>Toggle theme:</span>
            <ThemeToggle />
          </div>
        </section>
        
        <section className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Theme Colors Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background border rounded">
              <p className="font-medium">Background</p>
              <code className="text-sm">bg-background</code>
            </div>
            <div className="p-4 bg-foreground text-background border rounded">
              <p className="font-medium">Foreground</p>
              <code className="text-sm">bg-foreground</code>
            </div>
            <div className="p-4 bg-primary text-primary-foreground border rounded">
              <p className="font-medium">Primary</p>
              <code className="text-sm">bg-primary</code>
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground border rounded">
              <p className="font-medium">Secondary</p>
              <code className="text-sm">bg-secondary</code>
            </div>
            <div className="p-4 bg-accent text-accent-foreground border rounded">
              <p className="font-medium">Accent</p>
              <code className="text-sm">bg-accent</code>
            </div>
            <div className="p-4 bg-muted text-muted-foreground border rounded">
              <p className="font-medium">Muted</p>
              <code className="text-sm">bg-muted</code>
            </div>
            <div className="p-4 bg-card text-card-foreground border rounded">
              <p className="font-medium">Card</p>
              <code className="text-sm">bg-card</code>
            </div>
            <div className="p-4 bg-destructive text-destructive-foreground border rounded">
              <p className="font-medium">Destructive</p>
              <code className="text-sm">bg-destructive</code>
            </div>
            <div className="p-4 bg-success text-success-foreground border rounded">
              <p className="font-medium">Success</p>
              <code className="text-sm">bg-success</code>
            </div>
            <div className="p-4 bg-warning text-warning-foreground border rounded">
              <p className="font-medium">Warning</p>
              <code className="text-sm">bg-warning</code>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 