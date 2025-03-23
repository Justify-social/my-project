'use client';

/**
 * This file contains examples of how to use the UI components.
 * It's meant for documentation and testing purposes only.
 */
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, MetricCard, Spinner, LoadingSpinner, Button, Input, Heading, Text, Paragraph, Avatar, Badge, StatusBadge, Calendar, Progress, CircularProgress, Tabs, TabList, Tab, TabPanels, TabPanel } from './';

// Import from the new icons structure
import { Icon, IconName, KpiIconName, AppIconName, PlatformName, UI_ICON_MAP, UI_OUTLINE_ICON_MAP, PLATFORM_ICON_MAP, PLATFORM_COLORS, KPI_ICON_URLS, APP_ICON_URLS } from './icons';
import { Container } from './container';
import { Grid } from './grid';
import { Alert } from './alert';
import { useToast, ToastProvider } from './toast';
import { ComponentNav } from './ComponentNav';
import { FormField } from './forms/form-controls';
import { Select } from './select';
import { Checkbox } from './checkbox';
import { Radio, RadioGroup } from './radio';
import { Table, TableExample } from './table';
import { List, ListExample } from './list';
import { Skeleton, TextSkeleton, AvatarSkeleton, TableRowSkeleton, CardSkeleton } from './skeleton';
import { CustomIconDisplay } from './custom-icon-display';
import { cn } from '@/lib/utils';

export function ButtonExamples() {
  return <div className="space-y-8" id="buttons">
      <div>
        <h2 className="text-lg font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Primary (default)</p>
            <Button>Primary Button</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Secondary</p>
            <Button variant="secondary">Secondary Button</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Outline</p>
            <Button variant="outline">Outline Button</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Ghost</p>
            <Button variant="ghost">Ghost Button</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Link</p>
            <Button variant="link">Link Button</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Danger</p>
            <Button variant="danger">Danger Button</Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">XS</p>
            <Button size="xs">Extra Small</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">SM</p>
            <Button size="sm">Small</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">MD (default)</p>
            <Button size="md">Medium</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">LG</p>
            <Button size="lg">Large</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">XL</p>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Default</p>
            <Button>Default</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Disabled</p>
            <Button disabled>Disabled</Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Loading</p>
            <Button loading>Loading</Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Button with Icons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Left Icon</p>
            <Button leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>}>

              Add Item
            </Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Right Icon</p>
            <Button rightIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>}>

              Next
            </Button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Both Icons</p>
            <Button leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                </svg>} rightIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>}>

              Options
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Full Width Button</h2>
        <Button fullWidth>Full Width Button</Button>
      </div>
    </div>;
}
export function InputExamples() {
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  return <div className="space-y-8" id="inputs">
      <div>
        <h2 className="text-lg font-semibold mb-4">Input Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Text Input (default)</p>
            <Input label="Full Name" placeholder="Enter your full name" value={value} onChange={e => setValue(e.target.value)} />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Email Input</p>
            <Input type="email" label="Email Address" placeholder="you@example.com" helpText="We'll never share your email." />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Password Input</p>
            <Input type="password" label="Password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Number Input</p>
            <Input type="number" label="Age" placeholder="Enter your age" min={0} max={120} />

          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Input States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Default</p>
            <Input label="Username" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Disabled</p>
            <Input label="Disabled Input" placeholder="This input is disabled" disabled />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">With Help Text</p>
            <Input label="Username" placeholder="Choose a username" helpText="Username must be between 3-20 characters." />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">With Error</p>
            <Input label="Email" placeholder="you@example.com" error="Please enter a valid email address." />

          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Input Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Small</p>
            <Input inputSize="sm" placeholder="Small input" />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Medium (default)</p>
            <Input inputSize="md" placeholder="Medium input" />

          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Large</p>
            <Input inputSize="lg" placeholder="Large input" />

          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Input with Icons</h2>
        <div className="flex flex-col space-y-4 w-64">
          <div>
            <p className="text-sm text-gray-500 mb-2">Left Icon</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="faMagnifyingGlass" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
              <Input type="text" placeholder="Search..." className="pl-10" />

            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Right Icon</p>
            <div className="relative">
              <Input type="email" placeholder="Enter your email" className="pr-10" />

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Icon name="faGear" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Both Icons</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="faLock" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
              <Input type="password" placeholder="Enter your password" className="pl-10 pr-10" />

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Icon name="faQuestion" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Full Width Input</h2>
        <Input fullWidth label="Address" placeholder="Enter your full address" />

      </div>
    </div>;
}
export const IconExamples = () => {
  // General UI Icons (FontAwesome)
  const uiIconNames = Object.keys(UI_ICON_MAP).sort().filter(icon => typeof icon === 'string' && icon.trim() !== '' && typeof UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== 'undefined' && UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== undefined && UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== null && (
  // Make sure the icon is not an empty object
  typeof UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== 'object' || Object.keys(UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] as any).length > 0));

  // KPI icons
  const kpiIconNames = Object.keys(KPI_ICON_URLS).sort().filter(icon => typeof icon === 'string' && icon.trim() !== '' && typeof KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] !== 'undefined' && KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] !== undefined && KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] !== null &&
  // Make sure the URL is a non-empty string
  typeof KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] === 'string' && (KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] as string).trim() !== '');

  // App icons (navigation, special)
  const appIconNames = Object.keys(APP_ICON_URLS).sort().filter(icon => typeof icon === 'string' && icon.trim() !== '' && typeof APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] !== 'undefined' && APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] !== undefined && APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] !== null &&
  // Make sure the URL is a non-empty string
  typeof APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] === 'string' && (APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] as string).trim() !== '');

  // Platform icons
  const platformIconNames = Object.keys(PLATFORM_ICON_MAP).sort().filter(icon => typeof icon === 'string' && icon.trim() !== '' && typeof PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== 'undefined' && PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== undefined && PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== null && (
  // Make sure the icon is not an empty object
  typeof PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== 'object' || Object.keys(PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] as any).length > 0));

  // State for tracking hovered icons
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // Ensure all icons in the categories exist in the maps
  const essentialIcons = ['bell', 'calendar', 'check', 'xmark', 'trashCan', 'info', 'envelope', 'menu', 'minus', 'plus', 'magnifyingGlass', 'gear', 'user', 'triangleExclamation'].filter(icon => icon in UI_ICON_MAP);
  const navigationIcons = ['chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight', 'home', 'menu'].filter(icon => icon in UI_ICON_MAP);
  const actionIcons = ['eye', 'penToSquare', 'copy', 'trashCan', 'download', 'upload', 'share'].filter(icon => icon in UI_ICON_MAP);
  const objectIcons = ['heart', 'star', 'bookmark', 'file', 'tag', 'filter', 'paperclip'].filter(icon => icon in UI_ICON_MAP);
  const layoutIcons = ['grid', 'list', 'table'].filter(icon => icon in UI_ICON_MAP);
  const securityIcons = ['lock', 'unlock', 'key'].filter(icon => icon in UI_ICON_MAP);

  // Render sections for different icon types
  return <div className="space-y-12" id="icons">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Icons</h2>
        
        {/* Icon Size Variations */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Icon Sizes</h3>
          <div className="flex items-end space-x-8">
            <div className="flex flex-col items-center">
              <Icon name="faMagnifyingGlass" size="xs" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">XS</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faMagnifyingGlass" size="sm" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">SM</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faMagnifyingGlass" size="md" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">MD (default)</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faMagnifyingGlass" size="lg" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">LG</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faMagnifyingGlass" size="xl" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">XL</span>
            </div>
          </div>
        </div>
        
        {/* Icon Style Variations */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Icon Styles</h3>
          <div className="flex space-x-8">
            <div className="flex flex-col items-center">
              <Icon name="faBell" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">Outline (default)</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faBell" solid className="mb-2" />
              <span className="text-xs text-gray-500">Solid</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faBell" color="blue" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">Custom Color</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faBell" className="mb-2 text-teal-500" solid={false} />
              <span className="text-xs text-gray-500">Custom Class</span>
            </div>
          </div>
        </div>
        
        {/* Essential UI Icons */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Essential UI Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {essentialIcons.map(name => <div key={name} className="flex flex-col items-center">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* Navigation Icons */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Navigation Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {navigationIcons.map(name => <div key={name} className="flex flex-col items-center">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* Action Icons */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Action Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6">
            {actionIcons.map(name => <div key={name} className="flex flex-col items-center">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500">{name}</span>
              </div>)}
            <div className="flex flex-col items-center">
              <Icon name="faEye" solid className="mb-2" />
              <span className="text-xs text-gray-500">view (solid)</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faPenToSquare" solid className="mb-2" />
              <span className="text-xs text-gray-500">edit (solid)</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faCopy" solid className="mb-2" />
              <span className="text-xs text-gray-500">copy (solid)</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faTrashCan" solid className="mb-2" />
              <span className="text-xs text-gray-500">delete (solid)</span>
            </div>
          </div>
        </div>
        
        {/* Object Icons */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Object Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6">
            {objectIcons.map(name => <div key={name} className="flex flex-col items-center">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* App Icons */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">App Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {appIconNames.map(name => <div key={name} className="flex flex-col items-center group cursor-pointer">
                <div className="relative mb-2" style={{
              width: '32px',
              height: '32px'
            }}>
                  <Icon name="faInfo" appName={name as AppIconName} size="xl" className="absolute" solid={false} />

                </div>
                <span className="text-xs text-gray-500">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* KPI Icons */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">KPI Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {kpiIconNames.map(name => <div key={name} className="flex flex-col items-center" onMouseEnter={() => setHoveredIcon(name)} onMouseLeave={() => setHoveredIcon(null)}>

                <div className={cn("flex items-center justify-center p-2 rounded-md", hoveredIcon === name ? "bg-gray-100" : "")}>
                  {/* Use the name prop instead of directly passing kpiName as a DOM prop */}
                  <Icon name={UI_ICON_MAP[name] || "faQuestion"} size="lg" solid={false} className="text-[var(--secondary-color)]" />
                </div>
                <span className="text-xs mt-1 text-center break-all">
                  {name}
                </span>
              </div>)}
          </div>
        </div>
        
        {/* Platform Icons */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Platform Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {platformIconNames.map(name => <div key={name} className="flex flex-col items-center" onMouseEnter={() => setHoveredIcon(name)} onMouseLeave={() => setHoveredIcon(null)}>

                <div className={cn("flex items-center justify-center p-2 rounded-md", hoveredIcon === name ? "bg-gray-100" : "")}>
                  {/* Use the name prop with PLATFORM_ICON_MAP instead of directly passing platformName as a DOM prop */}
                  <Icon name={PLATFORM_ICON_MAP[name as keyof typeof PLATFORM_ICON_MAP] || "faQuestion"} size="lg" solid={false} className="text-[var(--secondary-color)]" />

                </div>
                <span className="text-xs mt-1 text-center break-all">
                  {name}
                </span>
              </div>)}
          </div>
        </div>
        
        {/* Icons with Button */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Icons with Button</h3>
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={<Icon name="faMagnifyingGlass" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              Search
            </Button>
            <Button rightIcon={<Icon name="faChevronRight" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              Next
            </Button>
            <Button leftIcon={<Icon name="faPlus" size="sm" solid={false} className="text-[var(--secondary-color)]" />} variant="secondary">

              Add Item
            </Button>
            <Button leftIcon={<Icon appName="home" size="sm" solid={false} className="text-[var(--secondary-color)]" />} variant="outline">

              Home
            </Button>
            <Button leftIcon={<Icon name="faTrashCan" size="sm" solid={false} className="text-[var(--secondary-color)]" />} variant="danger">

              Delete
            </Button>
            <Button leftIcon={<Icon name="faCalendar" size="sm" solid={false} className="text-[var(--secondary-color)]" />} variant="ghost">

              Budget
            </Button>
            <Button leftIcon={<Icon platformName="instagram" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              Instagram
            </Button>
            <Button leftIcon={<Icon platformName="youtube" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              YouTube
            </Button>
            <Button leftIcon={<Icon platformName="facebook" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              Facebook
            </Button>
            <Button leftIcon={<Icon platformName="x" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              X
            </Button>
            <Button leftIcon={<Icon platformName="linkedin" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              LinkedIn
            </Button>
            <Button leftIcon={<Icon platformName="tiktok" size="sm" solid={false} className="text-[var(--secondary-color)]" />}>

              TikTok
            </Button>
            <Button leftIcon={<Icon appName="profile" size="sm" solid={false} className="text-[var(--secondary-color)]" />} variant="link">

              Profile
            </Button>
          </div>
        </div>
        
        {/* Icons with Input */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Icons with Input</h3>
          <div className="space-y-4 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="faMagnifyingGlass" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
              <Input placeholder="Search..." className="pl-10" />

            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="faEnvelope" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
              <Input placeholder="Enter your email" className="pl-10" />

            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon appName="campaigns" className="h-5 w-5" solid={false} />
              </div>
              <Input placeholder="Campaign ID..." className="pl-10" />

            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="faUpload" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
              <Input placeholder="Upload document..." className="pl-10" />

            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="faCalendar" className="h-5 w-5 text-gray-400" solid={false} />
              </div>
              <Input placeholder="Enter amount..." className="pl-10" />

            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon platformName="youtube" className="h-5 w-5" solid={false} />
              </div>
              <Input placeholder="YouTube channel..." className="pl-10" />

            </div>
          </div>
        </div>
        
        {/* Custom Path Icon */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Custom SVG Path Icons</h3>
          <p className="text-sm text-gray-500">The Icon component can render custom SVG paths directly.</p>
          <div className="flex space-x-12">
            <div className="flex flex-col items-center">
              <Icon name="faInfo" path="M12 4v16m8-8H4" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">Custom Plus Icon</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faInfo" path="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">Custom Eye Icon</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="faInfo" path="M8 2v4M12 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500">Custom Calendar Icon</span>
            </div>
          </div>
        </div>
        
        {/* Font Awesome Direct Usage */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Font Awesome Usage</h3>
          <p className="text-sm text-gray-500">Font Awesome icons can be used directly with the fontAwesome prop.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            <div className="flex flex-col items-center">
              <Icon fontAwesome="fa-solid fa-user" className="w-8 h-8 mb-2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500">fa-solid fa-user</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon fontAwesome="fa-solid fa-envelope" className="w-8 h-8 mb-2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500">fa-solid fa-envelope</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon fontAwesome="fa-solid fa-check" className="w-8 h-8 mb-2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500">fa-solid fa-check</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon fontAwesome="fa-brands fa-x-twitter" className="w-8 h-8 mb-2" color="#000000" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500">fa-brands fa-x-twitter</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon fontAwesome="fa-brands fa-facebook" className="w-8 h-8 mb-2" color="#1877F2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500">fa-brands fa-facebook</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon fontAwesome="fa-brands fa-instagram" className="w-8 h-8 mb-2" color="#E4405F" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500">fa-brands fa-instagram</span>
            </div>
          </div>
        </div>
        
        {/* Migration Reference */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">Icon Migration Reference</h3>
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 mb-2">
              Font Awesome Icon Examples:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-white p-1 rounded">{`<Icon name="user" />`}</code>
                <span>→</span>
                <code className="text-xs bg-white p-1 rounded">{`<Icon name="user" solid />`}</code>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-white p-1 rounded">{`<Icon name="trash" />`}</code>
                <span>→</span>
                <code className="text-xs bg-white p-1 rounded">{`<Icon name="delete" />`}</code>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-white p-1 rounded">{`<Icon name="user" />`}</code>
                <span>→</span>
                <Icon name="faUser" solid size="md" className="text-[var(--secondary-color)]" />
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-white p-1 rounded">{`<Icon name="delete" />`}</code>
                <span>→</span>
                <Icon name="faDelete" size="md" solid={false} className="text-[var(--secondary-color)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FontAwesome comparison section - make sure this doesn't pass fontAwesome as a DOM property */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">SVG vs FontAwesome Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded-md">
            <h4 className="text-sm font-medium mb-2">SVG Icon (Our Implementation)</h4>
            <div className="flex items-center space-x-4">
              <Icon name="faUser" size="lg" solid={false} className="text-[var(--secondary-color)]" />
              <div>
                <p className="text-sm">Advantages:</p>
                <ul className="text-xs text-gray-600 list-disc pl-4">
                  <li>Faster loading - no external libraries</li>
                  <li>Reduced bundle size</li>
                  <li>More consistent styling</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border p-4 rounded-md">
            <h4 className="text-sm font-medium mb-2">FontAwesome (Legacy)</h4>
            <div className="flex items-center space-x-4">
              {/* Add a data- attribute instead of fontAwesome prop */}
              <Icon name="faUser" size="lg" data-source="fontawesome" solid={false} className="text-[var(--secondary-color)]" />
              <div>
                <p className="text-sm">Used only for:</p>
                <ul className="text-xs text-gray-600 list-disc pl-4">
                  <li>Debug/development tools</li>
                  <li>Icon scripts for downloading</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export function CardExamples() {
  return <div className="space-y-8" id="cards">
      <h2 className="text-lg font-semibold mb-4">Card Component</h2>
      
      {/* Basic Card Structure */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Basic Card with Header, Content, and Footer</h3>
        <div className="max-w-md">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Card Title</h3>
            </CardHeader>
            <CardContent>
              <p>This is the main content of the card.</p>
              <p className="mt-2">You can add any elements here.</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary">Action Button</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Card Variants */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Card Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Default</p>
            <Card variant="default">
              <CardContent>
                <p>Default card with shadow and border</p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Interactive</p>
            <Card variant="interactive" hoverable>
              <CardContent>
                <p>Interactive card with hover effects</p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Outline</p>
            <Card variant="outline">
              <CardContent>
                <p>Outline card with border only</p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Raised</p>
            <Card variant="raised">
              <CardContent>
                <p>Raised card with more prominent shadow</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* CardHeader with Icon and Actions */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Card Header with Icon and Actions</h3>
        <div className="max-w-md">
          <Card>
            <CardHeader icon={<Icon name="faCircleInfo" className="w-5 h-5 text-[#3182CE]" solid={false} />} actions={<Button variant="ghost" size="sm">
                  <Icon name="faGear" className="w-4 h-4" solid={false} />
                </Button>}>

              <h3 className="text-lg font-medium">Card with Icon</h3>
            </CardHeader>
            <CardContent>
              <p>This card header includes an icon and action button.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* CardFooter Alignment */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Card Footer Alignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Right Aligned (Default)</p>
            <Card>
              <CardContent>
                <p>Card with right-aligned footer.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="mr-2">Cancel</Button>
                <Button variant="primary" size="sm">Save</Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Space Between</p>
            <Card>
              <CardContent>
                <p>Card with space-between footer.</p>
              </CardContent>
              <CardFooter align="between">
                <Button variant="outline" size="sm">Back</Button>
                <Button variant="primary" size="sm">Next</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}
export function TypographyExamples() {
  return <div className="space-y-8" id="typography">
      <div>
        <h1 className="text-2xl font-bold mb-4">Typography System</h1>
        <div className="p-4 border rounded bg-gray-50 mb-6">
          <h2 className="text-lg font-semibold mb-2">About the Typography System</h2>
          <p className="text-sm text-gray-700 mb-2">
            The Typography system uses two primary font families from Google Fonts:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
            <div className="p-3 border rounded bg-white">
              <h3 className="text-base font-semibold mb-1" style={{
              fontFamily: 'Sora'
            }}>Sora</h3>
              <p className="text-sm mb-2">Primary font used for headings and emphasis text.</p>
              <div className="space-y-1">
                <p className="text-sm" style={{
                fontFamily: 'Sora',
                fontWeight: 400
              }}>Regular (400): Primary headings</p>
                <p className="text-sm" style={{
                fontFamily: 'Sora',
                fontWeight: 700
              }}>Bold (700): Emphasis, buttons</p>
              </div>
            </div>
            <div className="p-3 border rounded bg-white">
              <h3 className="text-base font-semibold mb-1" style={{
              fontFamily: 'Work Sans'
            }}>Work Sans</h3>
              <p className="text-sm mb-2">Secondary font used for body text and UI elements.</p>
              <div className="space-y-1">
                <p className="text-sm" style={{
                fontFamily: 'Work Sans',
                fontWeight: 400
              }}>Regular (400): Body text</p>
                <p className="text-sm" style={{
                fontFamily: 'Work Sans',
                fontWeight: 500
              }}>Medium (500): Labels</p>
                <p className="text-sm" style={{
                fontFamily: 'Work Sans',
                fontWeight: 600
              }}>Semibold (600): Navigation</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Font weights and sizes are applied using Tailwind CSS utility classes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">Font Weights Available:</h3>
              <ul className="text-sm list-disc pl-5">
                <li>Light (font-light)</li>
                <li>Normal (font-normal)</li>
                <li>Medium (font-medium)</li>
                <li>Semibold (font-semibold)</li>
                <li>Bold (font-bold)</li>
                <li>Extrabold (font-extrabold)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Text Sizes Available:</h3>
              <ul className="text-sm list-disc pl-5">
                <li>xs (0.75rem)</li>
                <li>sm (0.875rem)</li>
                <li>base (1rem)</li>
                <li>lg (1.125rem)</li>
                <li>xl (1.25rem)</li>
                <li>2xl (1.5rem)</li>
                <li>3xl (1.875rem)</li>
                <li>4xl (2.25rem)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Heading Levels (h1-h6)</h2>
        <div className="space-y-4">
          <Heading level={1}>Heading 1</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Heading level={4}>Heading 4</Heading>
          <Heading level={5}>Heading 5</Heading>
          <Heading level={6}>Heading 6</Heading>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Heading Sizes</h2>
        <div className="space-y-4">
          <Heading size="4xl">4XL Heading</Heading>
          <Heading size="3xl">3XL Heading</Heading>
          <Heading size="2xl">2XL Heading</Heading>
          <Heading size="xl">XL Heading</Heading>
          <Heading size="lg">LG Heading</Heading>
          <Heading size="md">MD Heading</Heading>
          <Heading size="sm">SM Heading</Heading>
          <Heading size="xs">XS Heading</Heading>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Heading Weights</h2>
        <div className="space-y-4">
          <Heading weight="extrabold">Extrabold Heading</Heading>
          <Heading weight="bold">Bold Heading</Heading>
          <Heading weight="semibold">Semibold Heading</Heading>
          <Heading weight="medium">Medium Heading</Heading>
          <Heading weight="normal">Normal Heading</Heading>
          <Heading weight="light">Light Heading</Heading>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Text Sizes</h2>
        <div className="space-y-2">
          <Text size="xl">XL Text Size</Text>
          <Text size="lg">LG Text Size</Text>
          <Text size="base">Base Text Size (default)</Text>
          <Text size="sm">SM Text Size</Text>
          <Text size="xs">XS Text Size</Text>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Text Weights</h2>
        <div className="space-y-2">
          <Text weight="bold">Bold Text</Text>
          <Text weight="semibold">Semibold Text</Text>
          <Text weight="medium">Medium Text</Text>
          <Text weight="normal">Normal Text (default)</Text>
          <Text weight="light">Light Text</Text>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Text Colors</h2>
        <div className="space-y-2">
          <Text color="default">Default Text Color</Text>
          <Text color="muted">Muted Text Color</Text>
          <Text color="primary">Primary Text Color</Text>
          <Text color="secondary">Secondary Text Color</Text>
          <Text color="accent">Accent Text Color</Text>
          <Text color="success">Success Text Color</Text>
          <Text color="warning">Warning Text Color</Text>
          <Text color="danger">Danger Text Color</Text>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Text With Truncation</h2>
        <div className="max-w-md overflow-hidden">
          <Text truncate className="w-full inline-block">
            This is a very long text that will be truncated with an ellipsis if it overflows its container.
            This is additional text to make sure it overflows so you can see the truncation in action.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Paragraph Sizes</h2>
        <div className="space-y-4">
          <Paragraph size="lg">
            This is a large paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Nullam condimentum dignissim nisi, id eleifend nunc mattis ac.
          </Paragraph>
          <Paragraph size="base">
            This is a base (default) paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Nullam condimentum dignissim nisi, id eleifend nunc mattis ac.
          </Paragraph>
          <Paragraph size="sm">
            This is a small paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Nullam condimentum dignissim nisi, id eleifend nunc mattis ac.
          </Paragraph>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Paragraph Colors</h2>
        <div className="space-y-4">
          <Paragraph color="default">
            This is a default color paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
          <Paragraph color="muted">
            This is a muted color paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
          <Paragraph color="primary">
            This is a primary color paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
          <Paragraph color="secondary">
            This is a secondary color paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Paragraph Spacing</h2>
        <div>
          <Paragraph>
            This paragraph has default spacing (margin-bottom). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
          <Paragraph>
            This paragraph also has default spacing. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
          <Paragraph spaced={false}>
            This paragraph has no spacing (no margin-bottom). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
          <Paragraph spaced={false}>
            This paragraph also has no spacing. They will be right next to each other. Lorem ipsum dolor sit amet.
          </Paragraph>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Typography in Context</h2>
        <div className="max-w-2xl border border-gray-200 rounded-lg p-6 shadow-sm">
          <Heading level={2} size="2xl" className="mb-4">Article Title</Heading>
          <div className="flex items-center mb-6">
            <Text size="sm" color="muted">Published: June 12, 2023</Text>
            <Text size="sm" color="muted" className="mx-2">•</Text>
            <Text size="sm" color="muted">5 min read</Text>
          </div>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam condimentum dignissim nisi, 
            id eleifend nunc mattis ac. Phasellus vestibulum aliquam urna, nec laoreet sem facilisis vel.
          </Paragraph>
          <Heading level={3} size="lg" className="mt-6 mb-3">Section Heading</Heading>
          <Paragraph>
            Cras sagittis orci vel libero interdum, eget commodo lectus mattis. Donec sed urna vel nisl 
            semper aliquet. Fusce lobortis diam sed justo tincidunt, at facilisis neque convallis.
          </Paragraph>
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <Text weight="medium" className="block mb-2">Note:</Text>
            <Text size="sm">
              This is a highlighted note with custom styling applied to the Text component.
              The Typography components can be easily customized with additional classes.
            </Text>
          </div>
        </div>
      </div>
    </div>;
}
export function ContainerExamples() {
  return <div className="space-y-8" id="container">
      <h2 className="text-lg font-semibold mb-4">Container Component</h2>
      
      <div className="space-y-8 border-2 border-dashed border-gray-200 p-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Default (lg) container</p>
          <Container className="bg-gray-100 p-4 text-center">
            <p>This is a default container (centered, lg width, with padding)</p>
          </Container>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Small container</p>
          <Container size="sm" className="bg-gray-100 p-4 text-center">
            <p>Small container</p>
          </Container>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Full width container (with gray background to show edges)</p>
          <Container size="full" className="bg-gray-100 p-4 text-center">
            <p>Full width container</p>
          </Container>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Container without padding</p>
          <Container withPadding={false} className="bg-gray-100 p-4 text-center">
            <p>Container without padding (p-4 added separately for visibility)</p>
          </Container>
        </div>
      </div>
    </div>;
}
export function GridExamples() {
  return <div className="space-y-8" id="grid">
      <h2 className="text-lg font-semibold mb-4">Grid Component</h2>
      
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-2">1 column grid (default)</p>
          <Grid className="mb-4">
            {[1, 2, 3].map(i => <div key={i} className="bg-[#00BFFF]/10 p-4 text-center rounded">Item {i}</div>)}
          </Grid>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">2 column grid</p>
          <Grid cols={2} className="mb-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-green-100 p-4 text-center rounded">Item {i}</div>)}
          </Grid>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">Responsive grid (1→2→3→4 columns)</p>
          <Grid cols={1} colsSm={2} colsMd={3} colsLg={4} className="mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="bg-purple-100 p-4 text-center rounded">Item {i}</div>)}
          </Grid>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">Custom gap sizes</p>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Small gap (sm)</p>
            <Grid cols={3} gap="sm" className="mb-4">
              {[1, 2, 3].map(i => <div key={i} className="bg-yellow-100 p-4 text-center rounded">Item {i}</div>)}
            </Grid>
            
            <p className="text-xs text-gray-500">Large gap (lg)</p>
            <Grid cols={3} gap="lg" className="mb-4">
              {[1, 2, 3].map(i => <div key={i} className="bg-yellow-100 p-4 text-center rounded">Item {i}</div>)}
            </Grid>
          </div>
        </div>
      </div>
    </div>;
}
export function AlertExamples() {
  // State for dismissible alerts
  const [showInfo, setShowInfo] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  return <div className="space-y-8" id="alerts">
      <h2 className="text-lg font-semibold mb-4">Alert Styles</h2>
      
      <div className="space-y-6 max-w-2xl">
        <div>
          <h3 className="text-md font-medium mb-3">Default Alerts</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Success Alert</p>
              <Alert variant="success" title="Success!">
                Your changes have been saved successfully.
              </Alert>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Error Alert</p>
              <Alert variant="error">
                There was a problem processing your request.
              </Alert>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Info Alert</p>
              <Alert>
                This is an informational alert.
              </Alert>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Warning Alert</p>
              <Alert variant="warning">
                Please review your information before continuing.
              </Alert>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-3">Dismissible Alerts</h3>
          {showInfo && <div className="mb-3">
              <Alert variant="info" dismissible onDismiss={() => setShowInfo(false)} title="Information">

                This alert can be dismissed by clicking the X button.
              </Alert>
            </div>}
          
          {showWarning && <Alert variant="warning" dismissible onDismiss={() => setShowWarning(false)}>

              This is a dismissible warning alert.
            </Alert>}
          
          {(!showInfo || !showWarning) && <Button variant="outline" onClick={() => {
          setShowInfo(true);
          setShowWarning(true);
        }}>

              Reset Dismissible Alerts
            </Button>}
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-3">Compare with Toasts</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Alert (Success)</p>
              <Alert variant="success">
                Campaign data loaded
              </Alert>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Toast (Success)</p>
              <div className="shadow-md rounded-lg p-3 bg-white border border-gray-200 flex items-center gap-2 max-w-sm">
                <div className="rounded-full bg-green-500 p-1 flex-shrink-0">
                  <Icon name="faCircleCheck" solid className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-800">Campaign data loaded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export function ToastExamples() {
  const {
    success,
    error,
    info,
    warning,
    custom
  } = useToast();
  const showCompactSuccessToast = () => {
    success('Campaign data loaded', {
      style: 'compact',
      position: 'top-right'
    });
  };
  const showCompactErrorToast = () => {
    error('Failed to load campaign data', {
      style: 'compact',
      position: 'top-right'
    });
  };
  const showCompactInfoToast = () => {
    info('New updates available', {
      style: 'compact',
      position: 'top-right'
    });
  };
  const showCompactWarningToast = () => {
    warning('Session expires soon', {
      style: 'compact',
      position: 'top-right'
    });
  };
  const showBannerSuccessToast = () => {
    success('Operation completed successfully!', {
      style: 'banner',
      position: 'top-center'
    });
  };
  const showBannerErrorToast = () => {
    error('An error occurred. Please try again.', {
      style: 'banner',
      position: 'top-center'
    });
  };
  const showBannerInfoToast = () => {
    info('This is an informational message.', {
      style: 'banner',
      position: 'top-center'
    });
  };
  const showBannerWarningToast = () => {
    warning('Warning: This action cannot be undone.', {
      style: 'banner',
      position: 'top-center'
    });
  };
  const showTopRightToast = () => {
    success('Positioned at the top-right corner', {
      position: 'top-right',
      style: 'compact'
    });
  };
  const showTopLeftToast = () => {
    info('Positioned at the top-left corner', {
      position: 'top-left',
      style: 'compact'
    });
  };
  const showBottomLeftToast = () => {
    warning('Positioned at the bottom-left corner', {
      position: 'bottom-left',
      style: 'compact'
    });
  };
  const showPersistentToast = () => {
    custom({
      message: 'This toast will not auto-dismiss',
      type: 'info',
      duration: 0,
      position: 'top-center',
      style: 'compact'
    });
  };
  const showShortToast = () => {
    success('This toast will dismiss quickly', {
      duration: 2000,
      style: 'compact'
    });
  };
  const showLongToast = () => {
    warning('This toast will stay longer', {
      duration: 10000,
      style: 'compact'
    });
  };
  return <div className="space-y-8" id="toasts">
      <h2 className="text-lg font-semibold mb-4">Toast Styles</h2>
      <div className="space-y-6">
        {/* Compact Toasts */}
        <div>
          <h3 className="text-md font-medium mb-3">Compact Style</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={showCompactSuccessToast}>
              Success Toast
            </Button>
            <Button variant="danger" onClick={showCompactErrorToast}>
              Error Toast
            </Button>
            <Button variant="secondary" onClick={showCompactInfoToast}>
              Info Toast
            </Button>
            <Button variant="outline" onClick={showCompactWarningToast}>
              Warning Toast
            </Button>
          </div>
        </div>
        
        {/* Banner Toasts */}
        <div>
          <h3 className="text-md font-medium mb-3">Banner Style</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={showBannerSuccessToast}>
              Success Toast
            </Button>
            <Button variant="danger" onClick={showBannerErrorToast}>
              Error Toast
            </Button>
            <Button variant="secondary" onClick={showBannerInfoToast}>
              Info Toast
            </Button>
            <Button variant="outline" onClick={showBannerWarningToast}>
              Warning Toast
            </Button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Toast Positions</h2>
      <div className="flex flex-wrap gap-4">
        <Button variant="secondary" onClick={showTopRightToast}>
          Top Right
        </Button>
        <Button variant="secondary" onClick={showTopLeftToast}>
          Top Left
        </Button>
        <Button variant="secondary" onClick={showBottomLeftToast}>
          Bottom Left
        </Button>
        <Button variant="secondary" onClick={showPersistentToast}>
          Top Center
        </Button>
      </div>

      <h2 className="text-lg font-semibold mb-4">Toast Durations</h2>
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" onClick={showShortToast}>
          Short (2s)
        </Button>
        <Button variant="outline" onClick={showLongToast}>
          Long (10s)
        </Button>
        <Button variant="outline" onClick={showPersistentToast}>
          Persistent
        </Button>
      </div>
    </div>;
}
export function FormComponentsExamples() {
  const [selectedValue, setSelectedValue] = useState<string>('option1');
  const [checkboxState, setCheckboxState] = useState({
    basic: false,
    indeterminate: false,
    withLabel: false,
    disabled: false
  });
  return <div className="space-y-8" id="form-components">
      {/* FormField Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Form Field</h2>
        <div className="space-y-6">
          <FormField label="Basic Input" id="basic-input" helperText="This is a basic form field with helper text">

            <Input placeholder="Enter your name" />
          </FormField>
          
          <FormField label="Required Field" id="required-input" required helperText="This field is required">

            <Input placeholder="Required field" />
          </FormField>
          
          <FormField label="With Error" id="error-input" error="This field has an error message">

            <Input placeholder="Error state" />
          </FormField>
          
          <FormField label="With Icons" id="icon-input" startIcon={<Icon name="faUser" className="h-5 w-5 text-gray-400" solid={false} />} endIcon={<Icon name="faInfo" className="h-5 w-5 text-gray-400" solid={false} />}>

            <Input placeholder="Enter username" />
          </FormField>
          
          <FormField label="Horizontal Layout" id="horizontal-input" layout="horizontal" helperText="This field uses a horizontal layout">

            <Input placeholder="Horizontal form field" />
          </FormField>
          
          <FormField label="Disabled Field" id="disabled-input" disabled helperText="This field is disabled">

            <Input placeholder="Disabled field" disabled />
          </FormField>
        </div>
      </section>
      
      {/* Select Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Select</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-2">Basic Select</h3>
            <Select placeholder="Select an option" options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Select with Error</h3>
            <Select placeholder="Select an option" error options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Select Sizes</h3>
            <div className="space-y-2">
              <Select size="sm" placeholder="Small" options={[{
              value: 'option1',
              label: 'Option 1'
            }, {
              value: 'option2',
              label: 'Option 2'
            }]} />

              <Select size="md" placeholder="Medium" options={[{
              value: 'option1',
              label: 'Option 1'
            }, {
              value: 'option2',
              label: 'Option 2'
            }]} />

              <Select size="lg" placeholder="Large" options={[{
              value: 'option1',
              label: 'Option 1'
            }, {
              value: 'option2',
              label: 'Option 2'
            }]} />

            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Disabled Select</h3>
            <Select placeholder="Select an option" disabled options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Without Chevron</h3>
            <Select placeholder="No chevron icon" showChevron={false} options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">With Form Field</h3>
            <FormField label="Country" id="country-select" helperText="Select your country">

              <Select placeholder="Select country" options={[{
              value: 'us',
              label: 'United States'
            }, {
              value: 'ca',
              label: 'Canada'
            }, {
              value: 'uk',
              label: 'United Kingdom'
            }, {
              value: 'au',
              label: 'Australia'
            }]} />

            </FormField>
          </div>
        </div>
      </section>
      
      {/* Checkbox Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Checkbox</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-2">Basic Checkbox</h3>
            <Checkbox id="basic-checkbox" checked={checkboxState.basic} onChange={e => setCheckboxState({
            ...checkboxState,
            basic: e.target.checked
          })} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">With Label</h3>
            <Checkbox id="label-checkbox" label="Checkbox with label" checked={checkboxState.withLabel} onChange={e => setCheckboxState({
            ...checkboxState,
            withLabel: e.target.checked
          })} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Indeterminate</h3>
            <Checkbox id="indeterminate-checkbox" label="Indeterminate state" indeterminate checked={checkboxState.indeterminate} onChange={e => setCheckboxState({
            ...checkboxState,
            indeterminate: e.target.checked
          })} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Disabled</h3>
            <Checkbox id="disabled-checkbox" label="Disabled checkbox" disabled checked={checkboxState.disabled} onChange={e => setCheckboxState({
            ...checkboxState,
            disabled: e.target.checked
          })} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Label Position</h3>
            <div className="space-y-2">
              <Checkbox id="right-label" label="Label on right (default)" labelPosition="right" />

              <Checkbox id="left-label" label="Label on left" labelPosition="left" />

            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Sizes</h3>
            <div className="space-y-2">
              <Checkbox id="small-checkbox" label="Small size" size="sm" />

              <Checkbox id="medium-checkbox" label="Medium size (default)" size="md" />

              <Checkbox id="large-checkbox" label="Large size" size="lg" />

            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">With Form Field</h3>
            <FormField label="Terms and Conditions" id="terms-checkbox-field" helperText="Please read and accept the terms">

              <Checkbox id="terms-checkbox" label="I accept the terms and conditions" />

            </FormField>
          </div>
        </div>
      </section>
      
      {/* Radio Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Radio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-2">Basic Radio</h3>
            <div className="space-y-2">
              <Radio id="radio-1" name="basic-radio" value="option1" label="Option 1" checked={selectedValue === 'option1'} onChange={e => e.target.checked && setSelectedValue(e.target.value)} />

              <Radio id="radio-2" name="basic-radio" value="option2" label="Option 2" checked={selectedValue === 'option2'} onChange={e => e.target.checked && setSelectedValue(e.target.value)} />

            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Radio Group</h3>
            <RadioGroup name="radio-group" value={selectedValue} onChange={setSelectedValue} options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Horizontal Radio Group</h3>
            <RadioGroup name="horizontal-radio-group" value={selectedValue} onChange={setSelectedValue} orientation="horizontal" options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} />

          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Disabled Radio</h3>
            <div className="space-y-2">
              <Radio id="disabled-radio" name="disabled-radio" value="disabled" label="Disabled radio" disabled />

              <RadioGroup name="disabled-radio-group" value={selectedValue} onChange={setSelectedValue} disabled options={[{
              value: 'option1',
              label: 'Disabled option 1'
            }, {
              value: 'option2',
              label: 'Disabled option 2'
            }]} />

            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Radio Sizes</h3>
            <div className="space-y-2">
              <Radio id="small-radio" name="radio-sizes" value="small" label="Small radio" size="sm" />

              <Radio id="medium-radio" name="radio-sizes" value="medium" label="Medium radio (default)" size="md" />

              <Radio id="large-radio" name="radio-sizes" value="large" label="Large radio" size="lg" />

            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">With Form Field</h3>
            <FormField label="Subscription Plan" id="plan-field" helperText="Choose your subscription plan">

              <RadioGroup name="subscription-plan" value={selectedValue} onChange={setSelectedValue} options={[{
              value: 'free',
              label: 'Free Plan'
            }, {
              value: 'pro',
              label: 'Pro Plan'
            }, {
              value: 'enterprise',
              label: 'Enterprise Plan'
            }]} />

            </FormField>
          </div>
        </div>
      </section>
    </div>;
}
export function ColorPaletteLogosExamples() {
  return <div className="space-y-8">
      {/* Color Palette */}
      <div>
        <h3 className="text-md font-medium mb-4">Brand Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md">
            <div className="h-16 bg-[#333333] rounded-md mb-2"></div>
            <div className="space-y-1">
              <p className="font-medium">Primary Color - Jet</p>
              <p className="text-sm text-gray-500 font-mono">#333333</p>
              <p className="text-sm text-gray-500 font-mono">--primary-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="h-16 bg-[#4A5568] rounded-md mb-2"></div>
            <div className="space-y-1">
              <p className="font-medium">Secondary Color - Payne's Grey</p>
              <p className="text-sm text-gray-500 font-mono">#4A5568</p>
              <p className="text-sm text-gray-500 font-mono">--secondary-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="h-16 bg-[#00BFFF] rounded-md mb-2"></div>
            <div className="space-y-1">
              <p className="font-medium">Accent Color - Deep Sky Blue</p>
              <p className="text-sm text-gray-500 font-mono">#00BFFF</p>
              <p className="text-sm text-gray-500 font-mono">--accent-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="h-16 bg-[#FFFFFF] border rounded-md mb-2"></div>
            <div className="space-y-1">
              <p className="font-medium">Background Color - White</p>
              <p className="text-sm text-gray-500 font-mono">#FFFFFF</p>
              <p className="text-sm text-gray-500 font-mono">--background-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="h-16 bg-[#D1D5DB] rounded-md mb-2"></div>
            <div className="space-y-1">
              <p className="font-medium">Divider Color - French Grey</p>
              <p className="text-sm text-gray-500 font-mono">#D1D5DB</p>
              <p className="text-sm text-gray-500 font-mono">--divider-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="h-16 bg-[#3182CE] rounded-md mb-2"></div>
            <div className="space-y-1">
              <p className="font-medium">Interactive Color - Medium Blue</p>
              <p className="text-sm text-gray-500 font-mono">#3182CE</p>
              <p className="text-sm text-gray-500 font-mono">--interactive-color</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logos */}
      <div>
        <h3 className="text-md font-medium mb-4">Logos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-md flex items-center justify-center">
            <img src="/logo.png" alt="Justify Logo" className="h-16" />
            <p className="ml-4 font-medium">Primary Logo</p>
          </div>
          <div className="p-4 border rounded-md flex items-center justify-center bg-[#333333]">
            <img src="/logo.png" alt="Justify Logo on Dark Background" className="h-16" />
            <p className="ml-4 font-medium text-white">Logo on Dark</p>
          </div>
          <div className="p-4 border rounded-md flex flex-col items-center">
            <img src="/favicon.ico" alt="Justify Favicon" className="h-12 w-12 mb-2" />
            <p className="font-medium">Favicon</p>
          </div>
          <div className="p-4 border rounded-md flex flex-col items-center">
            <div className="flex items-center">
              <img src="/logo.png" alt="Justify Logo Small" className="h-10" />
              <span className="ml-2 text-xl font-bold">Justify</span>
            </div>
            <p className="mt-2 font-medium">Logo with Text</p>
          </div>
        </div>
      </div>
    </div>;
}
export function AvatarExamples() {
  return <div className="space-y-8" id="avatars">
      <div>
        <h2 className="text-lg font-semibold mb-4">Avatar Sizes</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">XS</p>
            <Avatar size="xs" src="/profile-image.svg" alt="User" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">SM</p>
            <Avatar size="sm" src="/profile-image.svg" alt="User" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">MD (default)</p>
            <Avatar size="md" src="/profile-image.svg" alt="User" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">LG</p>
            <Avatar size="lg" src="/profile-image.svg" alt="User" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">XL</p>
            <Avatar size="xl" src="/profile-image.svg" alt="User" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Avatar with Fallback</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Initials</p>
            <Avatar alt="John Doe" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Custom Initials</p>
            <Avatar initials="AB" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Avatar with Status</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Online</p>
            <Avatar src="/profile-image.svg" alt="User" status="online" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Offline</p>
            <Avatar src="/profile-image.svg" alt="User" status="offline" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Away</p>
            <Avatar src="/profile-image.svg" alt="User" status="away" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Busy</p>
            <Avatar src="/profile-image.svg" alt="User" status="busy" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Bordered Avatar</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">With Border</p>
            <Avatar src="/profile-image.svg" alt="User" bordered />
          </div>
        </div>
      </div>
    </div>;
}
export function BadgeExamples() {
  return <div className="space-y-8" id="badges">
      <div>
        <h2 className="text-lg font-semibold mb-4">Badge Variants</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Default</p>
            <Badge>Default</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Primary</p>
            <Badge variant="primary">Primary</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Secondary</p>
            <Badge variant="secondary">Secondary</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Accent</p>
            <Badge variant="accent">Accent</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Outline</p>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Badge Sizes</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Small</p>
            <Badge size="sm">Small</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Medium (default)</p>
            <Badge size="md">Medium</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Large</p>
            <Badge size="lg">Large</Badge>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Live</p>
            <StatusBadge status="live">Live</StatusBadge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Paused</p>
            <StatusBadge status="paused">Paused</StatusBadge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Completed</p>
            <StatusBadge status="completed">Completed</StatusBadge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Draft</p>
            <StatusBadge status="draft">Draft</StatusBadge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Scheduled</p>
            <StatusBadge status="scheduled">Scheduled</StatusBadge>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Badge with Count</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Notification</p>
            <Badge variant="accent" count={5}>Notifications</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Messages</p>
            <Badge variant="primary" count={12}>Messages</Badge>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Rounded Badge</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Rounded</p>
            <Badge rounded>Rounded</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Rounded with Count</p>
            <Badge variant="accent" rounded count={9}>New</Badge>
          </div>
        </div>
      </div>
    </div>;
}
export function CalendarExamples() {
  return <div className="space-y-8" id="calendar">
      <div>
        <h2 className="text-lg font-semibold mb-4">Basic Calendar</h2>
        <div className="border rounded-md w-full max-w-md">
          <Calendar />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Calendar with Events</h2>
        <div className="border rounded-md w-full max-w-md">
          <Calendar events={[{
          id: 1,
          date: new Date(2025, 2, 15),
          title: 'Team Meeting'
        }, {
          id: 2,
          date: new Date(2025, 2, 18),
          title: 'Product Launch'
        }, {
          id: 3,
          date: new Date(2025, 2, 22),
          title: 'Client Call'
        }]} selectedDate={new Date(2025, 2, 18)} />

        </div>
      </div>
    </div>;
}
export function ChartExamples() {
  return <div className="space-y-8" id="charts">
      <div>
        <h2 className="text-lg font-semibold mb-4">Chart Placeholder</h2>
        <div className="border rounded-md p-4 w-full max-w-3xl">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Charts would be implemented with Chart.js, Recharts, or similar libraries</p>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded">
              <span className="text-gray-400">Chart Placeholder</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">This is just a placeholder. In a real implementation, charts would be rendered using a dedicated charting library.</p>
          </div>
        </div>
      </div>
    </div>;
}
export function ProgressExamples() {
  return <div className="space-y-8" id="progress">
      <div>
        <h2 className="text-lg font-semibold mb-4">Linear Progress Variants</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <p className="text-sm text-gray-500 mb-2">Default</p>
            <Progress value={45} showValue />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Primary</p>
            <Progress value={60} variant="primary" showValue />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Secondary</p>
            <Progress value={75} variant="secondary" showValue />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Accent</p>
            <Progress value={85} variant="accent" showValue />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Success</p>
            <Progress value={90} variant="success" showValue />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Warning</p>
            <Progress value={30} variant="warning" showValue />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Danger</p>
            <Progress value={15} variant="danger" showValue />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Linear Progress Sizes</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <p className="text-sm text-gray-500 mb-2">XS</p>
            <Progress value={45} size="xs" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">SM</p>
            <Progress value={60} size="sm" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">MD (default)</p>
            <Progress value={75} size="md" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">LG</p>
            <Progress value={85} size="lg" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Progress with Label</h2>
        <div className="space-y-4 max-w-md">
          <Progress value={66} label="Processing Upload" showValue />
          <Progress value={32} label="Download Status" variant="accent" showValue />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Animated Progress</h2>
        <div className="space-y-4 max-w-md">
          <Progress value={45} label="Loading..." animated />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Circular Progress</h2>
        <div className="flex flex-wrap gap-8 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Default</p>
            <CircularProgress value={45} showPercentage />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Primary</p>
            <CircularProgress value={60} variant="primary" showPercentage />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Accent</p>
            <CircularProgress value={75} variant="accent" showPercentage />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Success</p>
            <CircularProgress value={90} variant="success" showPercentage />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Large</p>
            <CircularProgress value={30} size={64} strokeWidth={6} showPercentage />
          </div>
        </div>
      </div>
    </div>;
}
export function TabsExamples() {
  return <div className="space-y-12" id="tabs">
      <div>
        <h2 className="text-lg font-semibold mb-4">Underline Tabs (Default)</h2>
        <div className="border rounded-md p-4">
          <Tabs defaultTab="home">
            <TabList>
              <Tab id="home">Home</Tab>
              <Tab id="profile">Profile</Tab>
              <Tab id="settings">Settings</Tab>
              <Tab id="disabled" disabled>Disabled</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="home">
                <div className="py-4">Home tab content</div>
              </TabPanel>
              <TabPanel id="profile">
                <div className="py-4">Profile tab content</div>
              </TabPanel>
              <TabPanel id="settings">
                <div className="py-4">Settings tab content</div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Pills Tabs</h2>
        <div className="border rounded-md p-4">
          <Tabs defaultTab="overview" variant="pills">
            <TabList>
              <Tab id="overview">Overview</Tab>
              <Tab id="analytics">Analytics</Tab>
              <Tab id="reports">Reports</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="overview">
                <div className="py-4">Overview tab content</div>
              </TabPanel>
              <TabPanel id="analytics">
                <div className="py-4">Analytics tab content</div>
              </TabPanel>
              <TabPanel id="reports">
                <div className="py-4">Reports tab content</div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Enclosed Tabs</h2>
        <div className="border rounded-md p-4">
          <Tabs defaultTab="files" variant="enclosed">
            <TabList>
              <Tab id="files">Files</Tab>
              <Tab id="documents">Documents</Tab>
              <Tab id="media">Media</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="files">
                <div className="py-4">Files tab content</div>
              </TabPanel>
              <TabPanel id="documents">
                <div className="py-4">Documents tab content</div>
              </TabPanel>
              <TabPanel id="media">
                <div className="py-4">Media tab content</div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </div>;
}
export function LoadingExamples() {
  return <div className="space-y-8" id="loading">
      <div>
        <h2 className="text-lg font-semibold mb-4">Spinner Variants</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Border (default)</p>
            <Spinner />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">SVG</p>
            <Spinner type="svg" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Spinner Sizes</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">XS</p>
            <Spinner size="xs" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">SM</p>
            <Spinner size="sm" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">MD (default)</p>
            <Spinner size="md" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">LG</p>
            <Spinner size="lg" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">XL</p>
            <Spinner size="xl" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Spinner Colors</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">Primary (default)</p>
            <Spinner variant="primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Secondary</p>
            <Spinner variant="secondary" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Accent</p>
            <Spinner variant="accent" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">White</p>
            <div className="bg-gray-800 p-2 rounded">
              <Spinner variant="white" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Current</p>
            <Spinner variant="current" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Legacy Spinner Components</h2>
        <div className="flex gap-4 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-2">loading-spinner.tsx</p>
            <LoadingSpinner />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Authentication Loading Spinner</h2>
        <div className="flex gap-8 items-start">
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-4">Used during Auth0 authentication</p>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Checking authentication...</p>
            </div>
          </div>
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-4">Standardized version</p>
            <div className="flex flex-col items-center justify-center">
              <Spinner size="lg" variant="primary" />
              <p className="mt-4 text-gray-600">Checking authentication...</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded border">
          <p className="text-sm text-gray-700 font-semibold mb-2">Implementation:</p>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
            {`<div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
    <p className="mt-4 text-gray-600">Checking authentication...</p>
  </div>
</div>`}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Skeleton Loading</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Basic Skeletons</p>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Rectangular</p>
                <Skeleton width={120} height={40} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Circular</p>
                <Skeleton variant="circular" width={40} height={40} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Text</p>
                <Skeleton variant="text" width={200} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Animation Types</p>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pulse (default)</p>
                <Skeleton width={120} height={40} animation="pulse" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Wave</p>
                <Skeleton width={120} height={40} animation="wave" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">None</p>
                <Skeleton width={120} height={40} animation="none" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Predefined Skeletons</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Text (Multi-line)</p>
                <TextSkeleton lines={3} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Avatar</p>
                <div className="flex items-center gap-4">
                  <AvatarSkeleton size="sm" />
                  <AvatarSkeleton size="md" />
                  <AvatarSkeleton size="lg" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Card</p>
                <CardSkeleton />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Table Rows</p>
                <div className="space-y-2">
                  <TableRowSkeleton cols={4} />
                  <TableRowSkeleton cols={4} />
                  <TableRowSkeleton cols={4} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Real-world Examples</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Profile Loading</p>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <AvatarSkeleton size="lg" />
                    <div className="space-y-2">
                      <Skeleton variant="text" width={150} className="h-5" />
                      <Skeleton variant="text" width={100} className="h-4" />
                    </div>
                  </div>
                  <TextSkeleton lines={3} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Dashboard Card Loading</p>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between mb-4">
                    <Skeleton variant="text" width={150} className="h-5" />
                    <Skeleton variant="circular" width={24} height={24} />
                  </div>
                  <div className="my-4">
                    <Skeleton height={80} className="rounded-md" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton variant="text" width={80} className="h-4" />
                    <Skeleton variant="text" width={50} className="h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export default function ComponentExamples() {
  return <div className="space-y-6 overflow-x-hidden">
      <style jsx global>{`
        html {
          scroll-padding-top: 10rem;
        }
      `}</style>
      <ComponentNav />
      <div className="p-8 pt-12 space-y-16">
        <h1 className="text-2xl font-bold mb-8">UI Component Examples</h1>
        
        {/* Sections in alphabetical order */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="alerts">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Alerts</h2>
          <AlertExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="avatars">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Avatars</h2>
          <AvatarExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="badges">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Badges</h2>
          <BadgeExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="buttons">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Buttons</h2>
          <ButtonExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="calendar">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Calendar</h2>
          <CalendarExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="cards">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Cards</h2>
          <CardExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="charts">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Charts</h2>
          <ChartExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="colour-palette-logos">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Colour Palette + Logos</h2>
          <ColorPaletteLogosExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="container">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Container</h2>
          <ContainerExamples />
        </section>
        
        {/* Form Components Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="form-components">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Form Components</h2>
          <FormComponentsExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="icons">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Icons</h2>
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-bold mb-4">Comprehensive Icon Library</h2>
              <p className="text-gray-600 mb-6">This component displays all available Font Awesome icons in the system. Font Awesome Classic includes Solid, Light, and Brands icon sets.</p>
              
              {/* Removed the SOLID/REGULAR/BRANDS boxes as requested */}
            </div>
            
            <CustomIconDisplay />
            
            {/* Removed duplicated icon usage examples */}
          </div>
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="grid">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Grid</h2>
          <GridExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="inputs">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Inputs</h2>
          <InputExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="loading">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Loading</h2>
          <LoadingExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="progress">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Progress</h2>
          <ProgressExamples />
        </section>
        
        {/* Tables Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="tables">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Tables</h2>
          <div className="space-y-12">
            <TableExample />
            <ListExample />
          </div>
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="tabs">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Tabs</h2>
          <TabsExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="toasts">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Toasts</h2>
          <ToastExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="typography">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB]">Typography</h2>
          <TypographyExamples />
        </section>
      </div>
    </div>;
}