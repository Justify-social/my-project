import React, { useState } from 'react';
import CommandMenu from '..';
import { Command, CommandGroup } from '../types';

const CommandMenuExamples: React.FC = () => {
  // State for basic example
  const [isBasicOpen, setIsBasicOpen] = useState(false);
  
  // State for grouped example
  const [isGroupedOpen, setIsGroupedOpen] = useState(false);
  
  // State for themed example
  const [isThemedOpen, setIsThemedOpen] = useState(false);
  
  // State for custom rendering example
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  
  // Basic commands for the first example
  const basicCommands: Command[] = [
    {
      id: 'home',
      name: 'Go to Home',
      description: 'Navigate to the home page',
      icon: 'fa-home',
      action: () => alert('Navigating to Home'),
    },
    {
      id: 'settings',
      name: 'Open Settings',
      description: 'Open application settings',
      icon: 'fa-gear',
      action: () => alert('Opening Settings'),
    },
    {
      id: 'profile',
      name: 'View Profile',
      description: 'Go to your profile page',
      icon: 'fa-user',
      action: () => alert('Viewing Profile'),
    },
    {
      id: 'logout',
      name: 'Logout',
      description: 'Sign out of your account',
      icon: 'fa-sign-out',
      action: () => alert('Logging out'),
    },
    {
      id: 'help',
      name: 'Help Center',
      description: 'Get help with using the app',
      icon: 'fa-question-circle',
      action: () => alert('Opening Help Center'),
    },
  ];
  
  // Grouped commands for the second example
  const groupedCommands: CommandGroup[] = [
    {
      name: 'Navigation',
      commands: [
        {
          id: 'dashboard',
          name: 'Dashboard',
          description: 'Go to your dashboard',
          icon: 'fa-dashboard',
          shortcut: '⌘D',
          action: () => alert('Going to Dashboard'),
        },
        {
          id: 'projects',
          name: 'Projects',
          description: 'View your projects',
          icon: 'fa-folder',
          shortcut: '⌘P',
          action: () => alert('Viewing Projects'),
        },
        {
          id: 'calendar',
          name: 'Calendar',
          description: 'Open your calendar',
          icon: 'fa-calendar',
          shortcut: '⌘C',
          action: () => alert('Opening Calendar'),
        },
      ],
    },
    {
      name: 'Actions',
      commands: [
        {
          id: 'new-project',
          name: 'New Project',
          description: 'Create a new project',
          icon: 'fa-plus',
          shortcut: '⌘N',
          action: () => alert('Creating New Project'),
        },
        {
          id: 'invite',
          name: 'Invite Team Member',
          description: 'Send an invitation email',
          icon: 'fa-user-plus',
          shortcut: '⌘I',
          action: () => alert('Inviting Team Member'),
        },
        {
          id: 'export',
          name: 'Export Data',
          description: 'Export your data',
          icon: 'fa-download',
          shortcut: '⌘E',
          action: () => alert('Exporting Data'),
        },
      ],
    },
    {
      name: 'Account',
      commands: [
        {
          id: 'account-settings',
          name: 'Account Settings',
          description: 'Manage your account',
          icon: 'fa-user-gear',
          action: () => alert('Opening Account Settings'),
        },
        {
          id: 'change-password',
          name: 'Change Password',
          description: 'Update your password',
          icon: 'fa-key',
          action: () => alert('Changing Password'),
          disabled: true,
        },
        {
          id: 'subscription',
          name: 'Subscription',
          description: 'Manage your subscription',
          icon: 'fa-credit-card',
          action: () => alert('Managing Subscription'),
        },
      ],
    },
  ];
  
  // Create a flattened list of all commands for the grouped example
  const flattenedGroupedCommands = groupedCommands.flatMap(group => group.commands);
  
  // Commands with custom items for the third example
  const customCommands: Command[] = [
    {
      id: 'selected-item',
      name: 'Selected Item',
      description: 'This item shows a badge',
      icon: 'fa-star',
      action: () => alert('Selected item clicked'),
      renderItem: (command, active) => (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <i className={`fa-light ${command.icon}`} style={{ marginRight: '8px', color: '#00BFFF' }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{command.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{command.description}</div>
          </div>
          <div style={{ 
            backgroundColor: '#00BFFF', 
            color: 'white', 
            borderRadius: '9999px', 
            padding: '2px 8px', 
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            SELECTED
          </div>
        </div>
      ),
    },
    {
      id: 'status-item',
      name: 'Status Indicator',
      description: 'This item shows a status',
      icon: 'fa-circle-info',
      action: () => alert('Status item clicked'),
      renderItem: (command, active) => (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: '#22C55E',
            marginRight: '8px',
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{command.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{command.description}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'progress-item',
      name: 'Progress Indicator',
      description: 'This item shows progress',
      icon: 'fa-chart-simple',
      action: () => alert('Progress item clicked'),
      renderItem: (command, active) => (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <i className={`fa-light ${command.icon}`} style={{ marginRight: '8px' }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{command.name}</div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '4px' }}>
              <div style={{ width: '60%', height: '100%', backgroundColor: '#3182CE', borderRadius: '3px' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>60%</div>
        </div>
      ),
    },
  ];

  return (
    <div className="command-menu-examples" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Command Menu Examples</h2>
      
      <div className="example-section" style={{ marginBottom: '32px' }}>
        <h3>Basic Command Menu</h3>
        <p>A simple command menu with a flat list of commands.</p>
        <button 
          onClick={() => setIsBasicOpen(true)}
          style={{ padding: '8px 16px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Open Basic Command Menu
        </button>
        
        <CommandMenu
          isOpen={isBasicOpen}
          onClose={() => setIsBasicOpen(false)}
          commands={basicCommands}
          placeholder="Search commands..."
        />
      </div>
      
      <div className="example-section" style={{ marginBottom: '32px' }}>
        <h3>Grouped Command Menu with Shortcuts</h3>
        <p>A command menu with commands organized into groups and keyboard shortcuts displayed.</p>
        <button 
          onClick={() => setIsGroupedOpen(true)}
          style={{ padding: '8px 16px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Open Grouped Command Menu
        </button>
        
        <CommandMenu
          isOpen={isGroupedOpen}
          onClose={() => setIsGroupedOpen(false)}
          commands={flattenedGroupedCommands}
          commandGroups={groupedCommands}
          placeholder="Search actions..."
          appearance="floating"
          size="lg"
          headerContent={
            <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
              Command Palette
            </div>
          }
          footerContent={
            <div style={{ textAlign: 'center', fontSize: '12px' }}>
              Press <kbd>⌘K</kbd> anytime to open this menu
            </div>
          }
        />
      </div>
      
      <div className="example-section" style={{ marginBottom: '32px' }}>
        <h3>Dark Themed Command Menu</h3>
        <p>A command menu with a dark theme.</p>
        <button 
          onClick={() => setIsThemedOpen(true)}
          style={{ padding: '8px 16px', backgroundColor: '#1A202C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Open Dark Command Menu
        </button>
        
        <CommandMenu
          isOpen={isThemedOpen}
          onClose={() => setIsThemedOpen(false)}
          commands={basicCommands}
          placeholder="Search in dark mode..."
          isDarkTheme={true}
          position="top"
          appearance="minimal"
        />
      </div>
      
      <div className="example-section">
        <h3>Custom Rendered Command Items</h3>
        <p>A command menu with custom-rendered command items.</p>
        <button 
          onClick={() => setIsCustomOpen(true)}
          style={{ padding: '8px 16px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Open Custom Command Menu
        </button>
        
        <CommandMenu
          isOpen={isCustomOpen}
          onClose={() => setIsCustomOpen(false)}
          commands={customCommands}
          placeholder="Search custom items..."
          size="md"
        />
      </div>
    </div>
  );
};

export default CommandMenuExamples; 