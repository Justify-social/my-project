import React, { useState } from 'react';
import { CommandMenu, CommandGroup, Command } from '../';

/**
 * Examples of the CommandMenu component
 */
export default function CommandMenuExamples() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Sample command groups for the examples
  const commandGroups: CommandGroup[] = [
    {
      title: 'Navigation',
      commands: [
        {
          id: 'dashboard',
          name: 'Go to Dashboard',
          icon: <span>🏠</span>,
          description: 'Navigate to the main dashboard',
          onSelect: () => console.log('Navigating to dashboard')
        },
        {
          id: 'campaigns',
          name: 'View Campaigns',
          icon: <span>📊</span>,
          description: 'Browse all marketing campaigns',
          onSelect: () => console.log('Viewing campaigns')
        },
        {
          id: 'settings',
          name: 'Open Settings',
          icon: <span>⚙️</span>,
          description: 'Manage your account settings',
          shortcut: '⌘,',
          onSelect: () => console.log('Opening settings')
        }
      ]
    },
    {
      title: 'Actions',
      commands: [
        {
          id: 'new-campaign',
          name: 'Create Campaign',
          icon: <span>➕</span>,
          description: 'Start creating a new campaign',
          shortcut: '⌘N',
          onSelect: () => console.log('Creating new campaign')
        },
        {
          id: 'export',
          name: 'Export Data',
          icon: <span>📤</span>,
          description: 'Export your data as CSV or PDF',
          onSelect: () => console.log('Exporting data')
        },
        {
          id: 'invite',
          name: 'Invite Team Member',
          icon: <span>👥</span>,
          description: 'Send an invitation to join your team',
          onSelect: () => console.log('Inviting team member')
        }
      ]
    },
    {
      title: 'Help',
      commands: [
        {
          id: 'docs',
          name: 'Documentation',
          icon: <span>📚</span>,
          description: 'Read the full documentation',
          onSelect: () => console.log('Opening documentation')
        },
        {
          id: 'support',
          name: 'Contact Support',
          icon: <span>🛟</span>,
          description: 'Get help from our support team',
          onSelect: () => console.log('Contacting support')
        },
        {
          id: 'shortcuts',
          name: 'Keyboard Shortcuts',
          icon: <span>⌨️</span>,
          description: 'View all keyboard shortcuts',
          onSelect: () => console.log('Viewing shortcuts')
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Command Menu Examples</h2>
        <p>The command menu provides keyboard-driven navigation. Press ⌘K (Mac) or Ctrl+K (Windows) to open.</p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-fit"
          >
            Open Command Menu
          </button>
          
          <div className="flex items-center space-x-2 w-full max-w-lg border border-gray-300 rounded px-3 py-2 text-gray-500 cursor-pointer"
              onClick={() => setIsOpen(true)}>
            <svg 
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <span className="flex-grow">Search commands...</span>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">⌘K</kbd>
          </div>
        </div>
      </div>
      
      {/* Basic usage */}
      <div className="mt-8 p-4 border border-gray-200 rounded-md">
        <h3 className="text-lg font-medium mb-2">Basic Usage</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { useState } from 'react';
import { CommandMenu } from '@/components/ui/molecules/command-menu';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  const commandGroups = [
    {
      title: 'Navigation',
      commands: [
        {
          id: 'dashboard',
          name: 'Go to Dashboard',
          icon: <span>🏠</span>,
          description: 'Navigate to the main dashboard',
          onSelect: () => console.log('Navigating to dashboard')
        },
        // More commands...
      ]
    },
    // More groups...
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Command Menu
      </button>
      
      <CommandMenu
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        commandGroups={commandGroups}
      />
    </>
  );
}`}
        </pre>
      </div>

      {/* The actual command menu */}
      <CommandMenu
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        commandGroups={commandGroups}
      />
    </div>
  );
} 