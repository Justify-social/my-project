"use client"

import { ThemeToggle } from "@/components/uiheme-toggle"

export default function ThemeTestPage() {
  return (
    <div className="p-8 min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Theme Test Page</h1>
        <ThemeToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Base Colors</h2>
          
          <div className="p-4 rounded-md bg-background text-foreground border">
            Background / Foreground
          </div>
          
          <div className="p-4 rounded-md bg-card text-card-foreground border">
            Card / Card Foreground
          </div>
          
          <div className="p-4 rounded-md bg-popover text-popover-foreground border">
            Popover / Popover Foreground
          </div>
          
          <div className="p-4 rounded-md bg-muted text-muted-foreground">
            Muted / Muted Foreground
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Brand Colors</h2>
          
          <div className="p-4 rounded-md bg-primary text-primary-foreground">
            Primary (Jet #333333)
          </div>
          
          <div className="p-4 rounded-md bg-secondary text-secondary-foreground">
            Secondary (Payne's Grey #4A5568)
          </div>
          
          <div className="p-4 rounded-md bg-accent text-accent-foreground">
            Accent (Deep Sky Blue #00BFFF)
          </div>
          
          <div className="p-4 rounded-md bg-interactive text-interactive-foreground">
            Interactive (Medium Blue #3182CE)
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Status Colors</h2>
          
          <div className="p-4 rounded-md bg-destructive text-destructive-foreground">
            Destructive (Red)
          </div>
          
          <div className="p-4 rounded-md bg-success text-success-foreground">
            Success (Green)
          </div>
          
          <div className="p-4 rounded-md bg-warning text-warning-foreground">
            Warning (Amber)
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Other Elements</h2>
          
          <div className="p-4 rounded-md border">
            Border Color
          </div>
          
          <div className="p-4 rounded-md border-2 border-ring">
            Ring Color
          </div>
          
          <div className="p-4 rounded-md bg-input border">
            Input Background
          </div>
          
          <div className="p-4 rounded-md" style={{ borderRadius: 'var(--radius)' }}>
            Border Radius (--radius)
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-muted-foreground">
          Toggle the theme button in the top right to switch between light and dark modes.
          This page demonstrates all the CSS variables defined in globals.css and processed by Tailwind.
        </p>
      </div>
    </div>
  );
} 