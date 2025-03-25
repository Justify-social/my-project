'use client';

/**
 * This file contains examples of how to use the UI components.
 * It's meant for documentation and testing purposes only.
 */
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, MetricCard, Button, Input, Heading, Text, Paragraph, Avatar, Badge, StatusBadge, Calendar, Progress, CircularProgress, Tabs, TabList, Tab, TabPanels, TabPanel } from './';

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
import { Skeleton, TextSkeleton, AvatarSkeleton, TableRowSkeleton, CardSkeleton } from './loading-skeleton/skeleton';
import { Spinner, AuthSpinner, ButtonSpinner, InlineSpinner, DotsSpinner, FullscreenSpinner } from './spinner';
import {
  CampaignDetailSkeleton,
  WizardSkeleton,
  TableSkeleton,
  FormSkeleton,
  AuthSkeleton,
  FormFieldSkeleton,
  SkeletonSection,
  DashboardSkeleton } from
'./loading-skeleton';
import { CustomIconDisplay } from './icons/custom-icon-display';
import { cn } from '@/lib/utils';

export function ButtonExamples() {
  return <div className="space-y-8 font-work-sans" id="buttons">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Button Variants</h2>
        <div className="flex flex-wrap gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Primary (default)</p>
            <Button className="font-work-sans">Primary Button</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Secondary</p>
            <Button variant="secondary" className="font-work-sans">Secondary Button</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Outline</p>
            <Button variant="outline" className="font-work-sans">Outline Button</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Ghost</p>
            <Button variant="ghost" className="font-work-sans">Ghost Button</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Link</p>
            <Button variant="link" className="font-work-sans">Link Button</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Danger</p>
            <Button variant="danger" className="font-work-sans">Danger Button</Button>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Button Sizes</h2>
        <div className="flex flex-wrap gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">XS</p>
            <Button size="xs" className="font-work-sans">Extra Small</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">SM</p>
            <Button size="sm" className="font-work-sans">Small</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">MD (default)</p>
            <Button size="md" className="font-work-sans">Medium</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">LG</p>
            <Button size="lg" className="font-work-sans">Large</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">XL</p>
            <Button size="xl" className="font-work-sans">Extra Large</Button>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Button States</h2>
        <div className="flex flex-wrap gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Default</p>
            <Button className="font-work-sans">Default</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Disabled</p>
            <Button disabled className="font-work-sans">Disabled</Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Loading</p>
            <Button loading className="font-work-sans">Loading</Button>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Button with Icons</h2>
        <div className="flex flex-wrap gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Left Icon</p>
            <Button leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>} className="font-work-sans">

              Add Item
            </Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Right Icon</p>
            <Button rightIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>} className="font-work-sans">

              Next
            </Button>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Both Icons</p>
            <Button leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                </svg>} rightIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>} className="font-work-sans">

              Options
            </Button>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Full Width Button</h2>
        <Button fullWidth className="font-work-sans">Full Width Button</Button>
      </div>
    </div>;
}
export function InputExamples() {
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  return <div className="space-y-8 font-work-sans" id="inputs">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Input Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Text Input (default)</p>
            <Input label="Full Name" placeholder="Enter your full name" value={value} onChange={(e) => setValue(e.target.value)} className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Email Input</p>
            <Input type="email" label="Email Address" placeholder="you@example.com" helpText="We'll never share your email." className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Password Input</p>
            <Input type="password" label="Password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Number Input</p>
            <Input type="number" label="Age" placeholder="Enter your age" min={0} max={120} className="font-work-sans" />

          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Input States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Default</p>
            <Input label="Username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Disabled</p>
            <Input label="Disabled Input" placeholder="This input is disabled" disabled className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">With Help Text</p>
            <Input label="Username" placeholder="Choose a username" helpText="Username must be between 3-20 characters." className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">With Error</p>
            <Input label="Email" placeholder="you@example.com" error="Please enter a valid email address." className="font-work-sans" />

          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Input Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Small</p>
            <Input inputSize="sm" placeholder="Small input" className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Medium (default)</p>
            <Input inputSize="md" placeholder="Medium input" className="font-work-sans" />

          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Large</p>
            <Input inputSize="lg" placeholder="Large input" className="font-work-sans" />

          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Input with Icons</h2>
        <div className="flex flex-col space-y-4 w-64 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Left Icon</p>
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faMagnifyingGlass" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
              <Input type="text" placeholder="Search..." className="pl-10 font-work-sans" />

            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Right Icon</p>
            <div className="relative font-work-sans">
              <Input type="email" placeholder="Enter your email" className="pr-10 font-work-sans" />

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faGear" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Both Icons</p>
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faLock" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
              <Input type="password" placeholder="Enter your password" className="pl-10 pr-10 font-work-sans" />

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faQuestion" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Full Width Input</h2>
        <Input fullWidth label="Address" placeholder="Enter your full address" className="font-work-sans" />

      </div>
    </div>;
}
export const IconExamples = () => {
  // General UI Icons (FontAwesome)
  const uiIconNames = Object.keys(UI_ICON_MAP).sort().filter((icon) => typeof icon === 'string' && icon.trim() !== '' && typeof UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== 'undefined' && UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== undefined && UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== null && (
  // Make sure the icon is not an empty object
  typeof UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== 'object' || Object.keys(UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] as any).length > 0));

  // KPI icons
  const kpiIconNames = Object.keys(KPI_ICON_URLS).sort().filter((icon) => typeof icon === 'string' && icon.trim() !== '' && typeof KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] !== 'undefined' && KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] !== undefined && KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] !== null &&
  // Make sure the URL is a non-empty string
  typeof KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] === 'string' && (KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS] as string).trim() !== '');

  // App icons (navigation, special)
  const appIconNames = Object.keys(APP_ICON_URLS).sort().filter((icon) => typeof icon === 'string' && icon.trim() !== '' && typeof APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] !== 'undefined' && APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] !== undefined && APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] !== null &&
  // Make sure the URL is a non-empty string
  typeof APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] === 'string' && (APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS] as string).trim() !== '');

  // Platform icons
  const platformIconNames = Object.keys(PLATFORM_ICON_MAP).sort().filter((icon) => typeof icon === 'string' && icon.trim() !== '' && typeof PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== 'undefined' && PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== undefined && PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== null && (
  // Make sure the icon is not an empty object
  typeof PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== 'object' || Object.keys(PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] as any).length > 0));

  // State for tracking hovered icons
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // Ensure all icons in the categories exist in the maps
  const essentialIcons = ['bell', 'calendar', 'check', 'xmark', 'trashCan', 'info', 'envelope', 'menu', 'minus', 'plus', 'magnifyingGlass', 'gear', 'user', 'triangleExclamation'].filter((icon) => icon in UI_ICON_MAP);
  const navigationIcons = ['chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight', 'home', 'menu'].filter((icon) => icon in UI_ICON_MAP);
  const actionIcons = ['eye', 'penToSquare', 'copy', 'trashCan', 'download', 'upload', 'share'].filter((icon) => icon in UI_ICON_MAP);
  const objectIcons = ['heart', 'star', 'bookmark', 'file', 'tag', 'filter', 'paperclip'].filter((icon) => icon in UI_ICON_MAP);
  const layoutIcons = ['grid', 'list', 'table'].filter((icon) => icon in UI_ICON_MAP);
  const securityIcons = ['lock', 'unlock', 'key'].filter((icon) => icon in UI_ICON_MAP);

  // Render sections for different icon types
  return <div className="space-y-12 font-work-sans" id="icons">
      <div className="space-y-6 font-work-sans">
        <h2 className="text-lg font-semibold font-sora">Icons</h2>
        
        {/* Icon Size Variations */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Icon Sizes</h3>
          <div className="flex items-end space-x-8 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faMagnifyingGlass" size="xs" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">XS</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faMagnifyingGlass" size="sm" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">SM</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faMagnifyingGlass" size="md" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">MD (default)</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faMagnifyingGlass" size="lg" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">LG</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faMagnifyingGlass" size="xl" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">XL</span>
            </div>
          </div>
        </div>
        
        {/* Icon Style Variations */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Icon Styles</h3>
          <div className="flex space-x-8 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faBell" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">Outline (default)</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faBell" solid className="mb-2" />
              <span className="text-xs text-gray-500 font-work-sans">Solid</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faBell" color="blue" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">Custom Color</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faBell" className="mb-2 text-teal-500 font-work-sans" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">Custom Class</span>
            </div>
          </div>
        </div>
        
        {/* Essential UI Icons */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Essential UI Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 font-work-sans">
            {essentialIcons.map((name) => <div key={name} className="flex flex-col items-center font-work-sans">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500 font-work-sans">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* Navigation Icons */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Navigation Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 font-work-sans">
            {navigationIcons.map((name) => <div key={name} className="flex flex-col items-center font-work-sans">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500 font-work-sans">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* Action Icons */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Action Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6 font-work-sans">
            {actionIcons.map((name) => <div key={name} className="flex flex-col items-center font-work-sans">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500 font-work-sans">{name}</span>
              </div>)}
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faEye" solid className="mb-2" />
              <span className="text-xs text-gray-500 font-work-sans">view (solid)</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faPenToSquare" solid className="mb-2" />
              <span className="text-xs text-gray-500 font-work-sans">edit (solid)</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faCopy" solid className="mb-2" />
              <span className="text-xs text-gray-500 font-work-sans">copy (solid)</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faTrashCan" solid className="mb-2" />
              <span className="text-xs text-gray-500 font-work-sans">delete (solid)</span>
            </div>
          </div>
        </div>
        
        {/* Object Icons */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Object Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6 font-work-sans">
            {objectIcons.map((name) => <div key={name} className="flex flex-col items-center font-work-sans">
                <Icon name={name as IconName} className="mb-2" solid={false} />
                <span className="text-xs text-gray-500 font-work-sans">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* App Icons */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">App Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 font-work-sans">
            {appIconNames.map((name) => <div key={name} className="flex flex-col items-center group cursor-pointer font-work-sans">
                <div className="relative mb-2 font-work-sans" style={{
              width: '32px',
              height: '32px'
            }}>
                  <Icon name="faInfo" appName={name as AppIconName} size="xl" className="absolute" solid={false} />

                </div>
                <span className="text-xs text-gray-500 font-work-sans">{name}</span>
              </div>)}
          </div>
        </div>
        
        {/* KPI Icons */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">KPI Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 font-work-sans">
            {kpiIconNames.map((name) => <div key={name} className="flex flex-col items-center font-work-sans" onMouseEnter={() => setHoveredIcon(name)} onMouseLeave={() => setHoveredIcon(null)}>

                <div className={`${cn("flex items-center justify-center p-2 rounded-md", hoveredIcon === name ? "bg-gray-100" : "")} font-work-sans`}>
                  {/* Use the name prop instead of directly passing kpiName as a DOM prop */}
                  <Icon name={UI_ICON_MAP[name] || "faQuestion"} size="lg" solid={false} className="text-[var(--secondary-color)] font-work-sans" />
                </div>
                <span className="text-xs mt-1 text-center break-all font-work-sans">
                  {name}
                </span>
              </div>)}
          </div>
        </div>
        
        {/* Platform Icons */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Platform Icons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 font-work-sans">
            {platformIconNames.map((name) => <div key={name} className="flex flex-col items-center font-work-sans" onMouseEnter={() => setHoveredIcon(name)} onMouseLeave={() => setHoveredIcon(null)}>

                <div className={`${cn("flex items-center justify-center p-2 rounded-md", hoveredIcon === name ? "bg-gray-100" : "")} font-work-sans`}>
                  {/* Use the name prop with PLATFORM_ICON_MAP instead of directly passing platformName as a DOM prop */}
                  <Icon name={PLATFORM_ICON_MAP[name as keyof typeof PLATFORM_ICON_MAP] || "faQuestion"} size="lg" solid={false} className="text-[var(--secondary-color)] font-work-sans" />

                </div>
                <span className="text-xs mt-1 text-center break-all font-work-sans">
                  {name}
                </span>
              </div>)}
          </div>
        </div>
        
        {/* Icons with Button */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Icons with Button</h3>
          <div className="flex flex-wrap gap-4 font-work-sans">
            <Button leftIcon={<Icon name="faMagnifyingGlass" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              Search
            </Button>
            <Button rightIcon={<Icon name="faChevronRight" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              Next
            </Button>
            <Button leftIcon={<Icon name="faPlus" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} variant="secondary" className="font-work-sans">

              Add Item
            </Button>
            <Button leftIcon={<Icon appName="home" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} variant="outline" className="font-work-sans">

              Home
            </Button>
            <Button leftIcon={<Icon name="faTrashCan" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} variant="danger" className="font-work-sans">

              Delete
            </Button>
            <Button leftIcon={<Icon name="faCalendar" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} variant="ghost" className="font-work-sans">

              Budget
            </Button>
            <Button leftIcon={<Icon platformName="instagram" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              Instagram
            </Button>
            <Button leftIcon={<Icon platformName="youtube" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              YouTube
            </Button>
            <Button leftIcon={<Icon platformName="facebook" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              Facebook
            </Button>
            <Button leftIcon={<Icon platformName="x" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              X
            </Button>
            <Button leftIcon={<Icon platformName="linkedin" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              LinkedIn
            </Button>
            <Button leftIcon={<Icon platformName="tiktok" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} className="font-work-sans">

              TikTok
            </Button>
            <Button leftIcon={<Icon appName="profile" size="sm" solid={false} className="text-[var(--secondary-color)] font-work-sans" />} variant="link" className="font-work-sans">

              Profile
            </Button>
          </div>
        </div>
        
        {/* Icons with Input */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Icons with Input</h3>
          <div className="space-y-4 max-w-md font-work-sans">
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faMagnifyingGlass" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
              <Input placeholder="Search..." className="pl-10 font-work-sans" />

            </div>
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faEnvelope" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
              <Input placeholder="Enter your email" className="pl-10 font-work-sans" />

            </div>
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon appName="campaigns" className="h-5 w-5" solid={false} />
              </div>
              <Input placeholder="Campaign ID..." className="pl-10 font-work-sans" />

            </div>
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faUpload" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
              <Input placeholder="Upload document..." className="pl-10 font-work-sans" />

            </div>
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon name="faCalendar" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />
              </div>
              <Input placeholder="Enter amount..." className="pl-10 font-work-sans" />

            </div>
            <div className="relative font-work-sans">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
                <Icon platformName="youtube" className="h-5 w-5" solid={false} />
              </div>
              <Input placeholder="YouTube channel..." className="pl-10 font-work-sans" />

            </div>
          </div>
        </div>
        
        {/* Custom Path Icon */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Custom SVG Path Icons</h3>
          <p className="text-sm text-gray-500 font-work-sans">The Icon component can render custom SVG paths directly.</p>
          <div className="flex space-x-12 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faInfo" path="M12 4v16m8-8H4" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">Custom Plus Icon</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faInfo" path="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">Custom Eye Icon</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon name="faInfo" path="M8 2v4M12 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" className="mb-2" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">Custom Calendar Icon</span>
            </div>
          </div>
        </div>
        
        {/* Font Awesome Direct Usage */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Font Awesome Usage</h3>
          <p className="text-sm text-gray-500 font-work-sans">Font Awesome icons can be used directly with the fontAwesome prop.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <Icon fontAwesome="fa-solid fa-user" className="w-8 h-8 mb-2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">fa-solid fa-user</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon fontAwesome="fa-solid fa-envelope" className="w-8 h-8 mb-2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">fa-solid fa-envelope</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon fontAwesome="fa-solid fa-check" className="w-8 h-8 mb-2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">fa-solid fa-check</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon fontAwesome="fa-brands fa-x-twitter" className="w-8 h-8 mb-2" color="#000000" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">fa-brands fa-x-twitter</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon fontAwesome="fa-brands fa-facebook" className="w-8 h-8 mb-2" color="#1877F2" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">fa-brands fa-facebook</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <Icon fontAwesome="fa-brands fa-instagram" className="w-8 h-8 mb-2" color="#E4405F" name="faExamples" solid={false} />
              <span className="text-xs text-gray-500 font-work-sans">fa-brands fa-instagram</span>
            </div>
          </div>
        </div>
        
        {/* Migration Reference */}
        <div className="space-y-4 font-work-sans">
          <h3 className="text-md font-medium font-sora">Icon Migration Reference</h3>
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-md font-work-sans">
            <p className="text-sm text-blue-800 mb-2 font-work-sans">
              Font Awesome Icon Examples:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-work-sans">
              <div className="flex items-center space-x-2 font-work-sans">
                <code className="text-xs bg-white p-1 rounded font-work-sans">{`<Icon name="user" />`}</code>
                <span className="font-work-sans">→</span>
                <code className="text-xs bg-white p-1 rounded font-work-sans">{`<Icon name="user" solid />`}</code>
              </div>
              <div className="flex items-center space-x-2 font-work-sans">
                <code className="text-xs bg-white p-1 rounded font-work-sans">{`<Icon name="trash" />`}</code>
                <span className="font-work-sans">→</span>
                <code className="text-xs bg-white p-1 rounded font-work-sans">{`<Icon name="delete" />`}</code>
              </div>
              <div className="flex items-center space-x-2 font-work-sans">
                <code className="text-xs bg-white p-1 rounded font-work-sans">{`<Icon name="user" />`}</code>
                <span className="font-work-sans">→</span>
                <Icon name="faUser" solid size="md" className="text-[var(--secondary-color)] font-work-sans" />
              </div>
              <div className="flex items-center space-x-2 font-work-sans">
                <code className="text-xs bg-white p-1 rounded font-work-sans">{`<Icon name="delete" />`}</code>
                <span className="font-work-sans">→</span>
                <Icon name="faDelete" size="md" solid={false} className="text-[var(--secondary-color)] font-work-sans" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FontAwesome comparison section - make sure this doesn't pass fontAwesome as a DOM property */}
      <div className="space-y-4 font-work-sans">
        <h3 className="text-md font-medium font-sora">SVG vs FontAwesome Comparison</h3>
        <div className="grid grid-cols-2 gap-4 font-work-sans">
          <div className="border p-4 rounded-md font-work-sans">
            <h4 className="text-sm font-medium mb-2 font-sora">SVG Icon (Our Implementation)</h4>
            <div className="flex items-center space-x-4 font-work-sans">
              <Icon name="faUser" size="lg" solid={false} className="text-[var(--secondary-color)] font-work-sans" />
              <div className="font-work-sans">
                <p className="text-sm font-work-sans">Advantages:</p>
                <ul className="text-xs text-gray-600 list-disc pl-4 font-work-sans">
                  <li className="font-work-sans">Faster loading - no external libraries</li>
                  <li className="font-work-sans">Reduced bundle size</li>
                  <li className="font-work-sans">More consistent styling</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border p-4 rounded-md font-work-sans">
            <h4 className="text-sm font-medium mb-2 font-sora">FontAwesome (Legacy)</h4>
            <div className="flex items-center space-x-4 font-work-sans">
              {/* Add a data- attribute instead of fontAwesome prop */}
              <Icon name="faUser" size="lg" data-source="fontawesome" solid={false} className="text-[var(--secondary-color)] font-work-sans" />
              <div className="font-work-sans">
                <p className="text-sm font-work-sans">Used only for:</p>
                <ul className="text-xs text-gray-600 list-disc pl-4 font-work-sans">
                  <li className="font-work-sans">Debug/development tools</li>
                  <li className="font-work-sans">Icon scripts for downloading</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export function CardExamples() {
  return <div className="space-y-8 font-work-sans" id="cards">
      <h2 className="text-lg font-semibold mb-4 font-sora">Card Component</h2>
      
      {/* Basic Card Structure */}
      <div className="space-y-4 font-work-sans">
        <h3 className="text-md font-medium font-sora">Basic Card with Header, Content, and Footer</h3>
        <div className="max-w-md font-work-sans">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium font-sora">Card Title</h3>
            </CardHeader>
            <CardContent>
              <p className="font-work-sans">This is the main content of the card.</p>
              <p className="mt-2 font-work-sans">You can add any elements here.</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" className="font-work-sans">Action Button</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Card Variants */}
      <div className="space-y-4 font-work-sans">
        <h3 className="text-md font-medium font-sora">Card Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Default</p>
            <Card variant="default">
              <CardContent>
                <p className="font-work-sans">Default card with shadow and border</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Interactive</p>
            <Card variant="interactive" hoverable>
              <CardContent>
                <p className="font-work-sans">Interactive card with hover effects</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Outline</p>
            <Card variant="outline">
              <CardContent>
                <p className="font-work-sans">Outline card with border only</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Raised</p>
            <Card variant="raised">
              <CardContent>
                <p className="font-work-sans">Raised card with more prominent shadow</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* CardHeader with Icon and Actions */}
      <div className="space-y-4 font-work-sans">
        <h3 className="text-md font-medium font-sora">Card Header with Icon and Actions</h3>
        <div className="max-w-md font-work-sans">
          <Card>
            <CardHeader icon={<Icon name="faCircleInfo" className="w-5 h-5 text-[#3182CE] font-work-sans" solid={false} />} actions={<Button variant="ghost" size="sm" className="font-work-sans">
                  <Icon name="faGear" className="w-4 h-4" solid={false} />
                </Button>}>

              <h3 className="text-lg font-medium font-sora">Card with Icon</h3>
            </CardHeader>
            <CardContent>
              <p className="font-work-sans">This card header includes an icon and action button.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* CardFooter Alignment */}
      <div className="space-y-4 font-work-sans">
        <h3 className="text-md font-medium font-sora">Card Footer Alignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Right Aligned (Default)</p>
            <Card>
              <CardContent>
                <p className="font-work-sans">Card with right-aligned footer.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="mr-2 font-work-sans">Cancel</Button>
                <Button variant="primary" size="sm" className="font-work-sans">Save</Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Space Between</p>
            <Card>
              <CardContent>
                <p className="font-work-sans">Card with space-between footer.</p>
              </CardContent>
              <CardFooter align="between">
                <Button variant="outline" size="sm" className="font-work-sans">Back</Button>
                <Button variant="primary" size="sm" className="font-work-sans">Next</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}
export function TypographyExamples() {
  return <div className="space-y-8 font-work-sans" id="typography">
      <div className="font-work-sans">
        <h1 className="text-2xl font-bold mb-4 font-sora">Typography System</h1>
        <div className="p-4 border rounded bg-gray-50 mb-6 font-work-sans">
          <h2 className="text-lg font-semibold mb-2 font-sora">About the Typography System</h2>
          <p className="text-sm text-gray-700 mb-2 font-work-sans">
            The Typography system uses two primary font families from Google Fonts:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4 font-work-sans">
            <div className="p-3 border rounded bg-white font-work-sans">
              <h3 className="text-base font-semibold mb-1 font-sora" style={{
              fontFamily: 'Sora'
            }}>Sora</h3>
              <p className="text-sm mb-2 font-work-sans">Primary font used for headings and emphasis text.</p>
              <div className="space-y-1 font-work-sans">
                <p className="text-sm font-work-sans" style={{
                fontFamily: 'Sora',
                fontWeight: 400
              }}>Regular (400): Primary headings</p>
                <p className="text-sm font-work-sans" style={{
                fontFamily: 'Sora',
                fontWeight: 700
              }}>Bold (700): Emphasis, buttons</p>
              </div>
            </div>
            <div className="p-3 border rounded bg-white font-work-sans">
              <h3 className="text-base font-semibold mb-1 font-sora" style={{
              fontFamily: 'Work Sans'
            }}>Work Sans</h3>
              <p className="text-sm mb-2 font-work-sans">Secondary font used for body text and UI elements.</p>
              <div className="space-y-1 font-work-sans">
                <p className="text-sm font-work-sans" style={{
                fontFamily: 'Work Sans',
                fontWeight: 400
              }}>Regular (400): Body text</p>
                <p className="text-sm font-work-sans" style={{
                fontFamily: 'Work Sans',
                fontWeight: 500
              }}>Medium (500): Labels</p>
                <p className="text-sm font-work-sans" style={{
                fontFamily: 'Work Sans',
                fontWeight: 600
              }}>Semibold (600): Navigation</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-2 font-work-sans">
            Font weights and sizes are applied using Tailwind CSS utility classes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-work-sans">
            <div className="font-work-sans">
              <h3 className="text-sm font-semibold mb-1 font-sora">Font Weights Available:</h3>
              <ul className="text-sm list-disc pl-5 font-work-sans">
                <li className="font-work-sans">Light (font-light)</li>
                <li className="font-work-sans">Normal (font-normal)</li>
                <li className="font-work-sans">Medium (font-medium)</li>
                <li className="font-work-sans">Semibold (font-semibold)</li>
                <li className="font-work-sans">Bold (font-bold)</li>
                <li className="font-work-sans">Extrabold (font-extrabold)</li>
              </ul>
            </div>
            <div className="font-work-sans">
              <h3 className="text-sm font-semibold mb-1 font-sora">Text Sizes Available:</h3>
              <ul className="text-sm list-disc pl-5 font-work-sans">
                <li className="font-work-sans">xs (0.75rem)</li>
                <li className="font-work-sans">sm (0.875rem)</li>
                <li className="font-work-sans">base (1rem)</li>
                <li className="font-work-sans">lg (1.125rem)</li>
                <li className="font-work-sans">xl (1.25rem)</li>
                <li className="font-work-sans">2xl (1.5rem)</li>
                <li className="font-work-sans">3xl (1.875rem)</li>
                <li className="font-work-sans">4xl (2.25rem)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Heading Levels (h1-h6)</h2>
        <div className="space-y-4 font-work-sans">
          <Heading level={1} className="font-sora">Heading 1</Heading>
          <Heading level={2} className="font-sora">Heading 2</Heading>
          <Heading level={3} className="font-sora">Heading 3</Heading>
          <Heading level={4} className="font-sora">Heading 4</Heading>
          <Heading level={5} className="font-sora">Heading 5</Heading>
          <Heading level={6} className="font-sora">Heading 6</Heading>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Heading Sizes</h2>
        <div className="space-y-4 font-work-sans">
          <Heading size="4xl" className="font-sora">4XL Heading</Heading>
          <Heading size="3xl" className="font-sora">3XL Heading</Heading>
          <Heading size="2xl" className="font-sora">2XL Heading</Heading>
          <Heading size="xl" className="font-sora">XL Heading</Heading>
          <Heading size="lg" className="font-sora">LG Heading</Heading>
          <Heading size="md" className="font-sora">MD Heading</Heading>
          <Heading size="sm" className="font-sora">SM Heading</Heading>
          <Heading size="xs" className="font-sora">XS Heading</Heading>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Heading Weights</h2>
        <div className="space-y-4 font-work-sans">
          <Heading weight="extrabold" className="font-sora">Extrabold Heading</Heading>
          <Heading weight="bold" className="font-sora">Bold Heading</Heading>
          <Heading weight="semibold" className="font-sora">Semibold Heading</Heading>
          <Heading weight="medium" className="font-sora">Medium Heading</Heading>
          <Heading weight="normal" className="font-sora">Normal Heading</Heading>
          <Heading weight="light" className="font-sora">Light Heading</Heading>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Text Sizes</h2>
        <div className="space-y-2 font-work-sans">
          <Text size="xl">XL Text Size</Text>
          <Text size="lg">LG Text Size</Text>
          <Text size="base">Base Text Size (default)</Text>
          <Text size="sm">SM Text Size</Text>
          <Text size="xs">XS Text Size</Text>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Text Weights</h2>
        <div className="space-y-2 font-work-sans">
          <Text weight="bold">Bold Text</Text>
          <Text weight="semibold">Semibold Text</Text>
          <Text weight="medium">Medium Text</Text>
          <Text weight="normal">Normal Text (default)</Text>
          <Text weight="light">Light Text</Text>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Text Colors</h2>
        <div className="space-y-2 font-work-sans">
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

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Text With Truncation</h2>
        <div className="max-w-md overflow-hidden font-work-sans">
          <Text truncate className="w-full inline-block">
            This is a very long text that will be truncated with an ellipsis if it overflows its container.
            This is additional text to make sure it overflows so you can see the truncation in action.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Paragraph Sizes</h2>
        <div className="space-y-4 font-work-sans">
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

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Paragraph Colors</h2>
        <div className="space-y-4 font-work-sans">
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

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Paragraph Spacing</h2>
        <div className="font-work-sans">
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

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Typography in Context</h2>
        <div className="max-w-2xl border border-gray-200 rounded-lg p-6 shadow-sm font-work-sans">
          <Heading level={2} size="2xl" className="mb-4 font-sora">Article Title</Heading>
          <div className="flex items-center mb-6 font-work-sans">
            <Text size="sm" color="muted">Published: June 12, 2023</Text>
            <Text size="sm" color="muted" className="mx-2">•</Text>
            <Text size="sm" color="muted">5 min read</Text>
          </div>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam condimentum dignissim nisi, 
            id eleifend nunc mattis ac. Phasellus vestibulum aliquam urna, nec laoreet sem facilisis vel.
          </Paragraph>
          <Heading level={3} size="lg" className="mt-6 mb-3 font-sora">Section Heading</Heading>
          <Paragraph>
            Cras sagittis orci vel libero interdum, eget commodo lectus mattis. Donec sed urna vel nisl 
            semper aliquet. Fusce lobortis diam sed justo tincidunt, at facilisis neque convallis.
          </Paragraph>
          <div className="mt-6 p-4 bg-gray-50 rounded font-work-sans">
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
  return <div className="space-y-8 font-work-sans" id="container">
      <h2 className="text-lg font-semibold mb-4 font-sora">Container Component</h2>
      
      <div className="space-y-8 border-2 border-dashed border-gray-200 p-4 font-work-sans">
        <div className="space-y-2 font-work-sans">
          <p className="text-sm text-gray-500 font-work-sans">Default (lg) container</p>
          <Container className="bg-gray-100 p-4 text-center font-work-sans">
            <p className="font-work-sans">This is a default container (centered, lg width, with padding)</p>
          </Container>
        </div>
        
        <div className="space-y-2 font-work-sans">
          <p className="text-sm text-gray-500 font-work-sans">Small container</p>
          <Container size="sm" className="bg-gray-100 p-4 text-center font-work-sans">
            <p className="font-work-sans">Small container</p>
          </Container>
        </div>
        
        <div className="space-y-2 font-work-sans">
          <p className="text-sm text-gray-500 font-work-sans">Full width container (with gray background to show edges)</p>
          <Container size="full" className="bg-gray-100 p-4 text-center font-work-sans">
            <p className="font-work-sans">Full width container</p>
          </Container>
        </div>
        
        <div className="space-y-2 font-work-sans">
          <p className="text-sm text-gray-500 font-work-sans">Container without padding</p>
          <Container withPadding={false} className="bg-gray-100 p-4 text-center font-work-sans">
            <p className="font-work-sans">Container without padding (p-4 added separately for visibility)</p>
          </Container>
        </div>
      </div>
    </div>;
}
export function GridExamples() {
  return <div className="space-y-8 font-work-sans" id="grid">
      <h2 className="text-lg font-semibold mb-4 font-sora">Grid Component</h2>
      
      <div className="space-y-6 font-work-sans">
        <div className="font-work-sans">
          <p className="text-sm text-gray-500 mb-2 font-work-sans">1 column grid (default)</p>
          <Grid className="mb-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-[#00BFFF]/10 p-4 text-center rounded font-work-sans">Item {i}</div>)}
          </Grid>
        </div>
        
        <div className="font-work-sans">
          <p className="text-sm text-gray-500 mb-2 font-work-sans">2 column grid</p>
          <Grid cols={2} className="mb-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="bg-green-100 p-4 text-center rounded font-work-sans">Item {i}</div>)}
          </Grid>
        </div>
        
        <div className="font-work-sans">
          <p className="text-sm text-gray-500 mb-2 font-work-sans">Responsive grid (1→2→3→4 columns)</p>
          <Grid cols={1} colsSm={2} colsMd={3} colsLg={4} className="mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="bg-purple-100 p-4 text-center rounded font-work-sans">Item {i}</div>)}
          </Grid>
        </div>
        
        <div className="font-work-sans">
          <p className="text-sm text-gray-500 mb-2 font-work-sans">Custom gap sizes</p>
          <div className="space-y-4 font-work-sans">
            <p className="text-xs text-gray-500 font-work-sans">Small gap (sm)</p>
            <Grid cols={3} gap="sm" className="mb-4">
              {[1, 2, 3].map((i) => <div key={i} className="bg-yellow-100 p-4 text-center rounded font-work-sans">Item {i}</div>)}
            </Grid>
            
            <p className="text-xs text-gray-500 font-work-sans">Large gap (lg)</p>
            <Grid cols={3} gap="lg" className="mb-4">
              {[1, 2, 3].map((i) => <div key={i} className="bg-yellow-100 p-4 text-center rounded font-work-sans">Item {i}</div>)}
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
  return <div className="space-y-8 font-work-sans" id="alerts">
      <h2 className="text-lg font-semibold mb-4 font-sora">Alert Styles</h2>
      
      <div className="space-y-6 max-w-2xl font-work-sans">
        <div className="font-work-sans">
          <h3 className="text-md font-medium mb-3 font-sora">Default Alerts</h3>
          <div className="space-y-4 font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Success Alert</p>
              <Alert variant="success" title="Success!">
                Your changes have been saved successfully.
              </Alert>
            </div>
            
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Error Alert</p>
              <Alert variant="error">
                There was a problem processing your request.
              </Alert>
            </div>
            
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Info Alert</p>
              <Alert>
                This is an informational alert.
              </Alert>
            </div>
            
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Warning Alert</p>
              <Alert variant="warning">
                Please review your information before continuing.
              </Alert>
            </div>
          </div>
        </div>
        
        <div className="font-work-sans">
          <h3 className="text-md font-medium mb-3 font-sora">Dismissible Alerts</h3>
          {showInfo && <div className="mb-3 font-work-sans">
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
        }} className="font-work-sans">

              Reset Dismissible Alerts
            </Button>}
        </div>
        
        <div className="font-work-sans">
          <h3 className="text-md font-medium mb-3 font-sora">Compare with Toasts</h3>
          <div className="space-y-4 font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Alert (Success)</p>
              <Alert variant="success">
                Campaign data loaded
              </Alert>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Toast (Success)</p>
              <div className="shadow-md rounded-lg p-3 bg-white border border-gray-200 flex items-center gap-2 max-w-sm font-work-sans">
                <div className="rounded-full bg-green-500 p-1 flex-shrink-0 font-work-sans">
                  <Icon name="faCircleCheck" solid className="h-3 w-3 text-white font-work-sans" />
                </div>
                <span className="text-sm text-gray-800 font-work-sans">Campaign data loaded</span>
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
  return <div className="space-y-8 font-work-sans" id="toasts">
      <h2 className="text-lg font-semibold mb-4 font-sora">Toast Styles</h2>
      <div className="space-y-6 font-work-sans">
        {/* Compact Toasts */}
        <div className="font-work-sans">
          <h3 className="text-md font-medium mb-3 font-sora">Compact Style</h3>
          <div className="flex flex-wrap gap-4 font-work-sans">
            <Button variant="primary" onClick={showCompactSuccessToast} className="font-work-sans">
              Success Toast
            </Button>
            <Button variant="danger" onClick={showCompactErrorToast} className="font-work-sans">
              Error Toast
            </Button>
            <Button variant="secondary" onClick={showCompactInfoToast} className="font-work-sans">
              Info Toast
            </Button>
            <Button variant="outline" onClick={showCompactWarningToast} className="font-work-sans">
              Warning Toast
            </Button>
          </div>
        </div>
        
        {/* Banner Toasts */}
        <div className="font-work-sans">
          <h3 className="text-md font-medium mb-3 font-sora">Banner Style</h3>
          <div className="flex flex-wrap gap-4 font-work-sans">
            <Button variant="primary" onClick={showBannerSuccessToast} className="font-work-sans">
              Success Toast
            </Button>
            <Button variant="danger" onClick={showBannerErrorToast} className="font-work-sans">
              Error Toast
            </Button>
            <Button variant="secondary" onClick={showBannerInfoToast} className="font-work-sans">
              Info Toast
            </Button>
            <Button variant="outline" onClick={showBannerWarningToast} className="font-work-sans">
              Warning Toast
            </Button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4 font-sora">Toast Positions</h2>
      <div className="flex flex-wrap gap-4 font-work-sans">
        <Button variant="secondary" onClick={showTopRightToast} className="font-work-sans">
          Top Right
        </Button>
        <Button variant="secondary" onClick={showTopLeftToast} className="font-work-sans">
          Top Left
        </Button>
        <Button variant="secondary" onClick={showBottomLeftToast} className="font-work-sans">
          Bottom Left
        </Button>
        <Button variant="secondary" onClick={showPersistentToast} className="font-work-sans">
          Top Center
        </Button>
      </div>

      <h2 className="text-lg font-semibold mb-4 font-sora">Toast Durations</h2>
      <div className="flex flex-wrap gap-4 font-work-sans">
        <Button variant="outline" onClick={showShortToast} className="font-work-sans">
          Short (2s)
        </Button>
        <Button variant="outline" onClick={showLongToast} className="font-work-sans">
          Long (10s)
        </Button>
        <Button variant="outline" onClick={showPersistentToast} className="font-work-sans">
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
  return <div className="space-y-8 font-work-sans" id="form-components">
      {/* FormField Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 font-sora">Form Field</h2>
        <div className="space-y-6 font-work-sans">
          <FormField label="Basic Input" id="basic-input" helperText="This is a basic form field with helper text" className="font-work-sans">

            <Input placeholder="Enter your name" className="font-work-sans" />
          </FormField>
          
          <FormField label="Required Field" id="required-input" required helperText="This field is required" className="font-work-sans">

            <Input placeholder="Required field" className="font-work-sans" />
          </FormField>
          
          <FormField label="With Error" id="error-input" error="This field has an error message" className="font-work-sans">

            <Input placeholder="Error state" className="font-work-sans" />
          </FormField>
          
          <FormField label="With Icons" id="icon-input" startIcon={<Icon name="faUser" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />} endIcon={<Icon name="faInfo" className="h-5 w-5 text-gray-400 font-work-sans" solid={false} />} className="font-work-sans">

            <Input placeholder="Enter username" className="font-work-sans" />
          </FormField>
          
          <FormField label="Horizontal Layout" id="horizontal-input" layout="horizontal" helperText="This field uses a horizontal layout" className="font-work-sans">

            <Input placeholder="Horizontal form field" className="font-work-sans" />
          </FormField>
          
          <FormField label="Disabled Field" id="disabled-input" disabled helperText="This field is disabled" className="font-work-sans">

            <Input placeholder="Disabled field" disabled className="font-work-sans" />
          </FormField>
        </div>
      </section>
      
      {/* Select Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 font-sora">Select</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Basic Select</h3>
            <Select placeholder="Select an option" options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} className="font-work-sans" />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Select with Error</h3>
            <Select placeholder="Select an option" error options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} className="font-work-sans" />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Select Sizes</h3>
            <div className="space-y-2 font-work-sans">
              <Select size="sm" placeholder="Small" options={[{
              value: 'option1',
              label: 'Option 1'
            }, {
              value: 'option2',
              label: 'Option 2'
            }]} className="font-work-sans" />

              <Select size="md" placeholder="Medium" options={[{
              value: 'option1',
              label: 'Option 1'
            }, {
              value: 'option2',
              label: 'Option 2'
            }]} className="font-work-sans" />

              <Select size="lg" placeholder="Large" options={[{
              value: 'option1',
              label: 'Option 1'
            }, {
              value: 'option2',
              label: 'Option 2'
            }]} className="font-work-sans" />

            </div>
          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Disabled Select</h3>
            <Select placeholder="Select an option" disabled options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} className="font-work-sans" />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Without Chevron</h3>
            <Select placeholder="No chevron icon" showChevron={false} options={[{
            value: 'option1',
            label: 'Option 1'
          }, {
            value: 'option2',
            label: 'Option 2'
          }, {
            value: 'option3',
            label: 'Option 3'
          }]} className="font-work-sans" />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">With Form Field</h3>
            <FormField label="Country" id="country-select" helperText="Select your country" className="font-work-sans">

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
            }]} className="font-work-sans" />

            </FormField>
          </div>
        </div>
      </section>
      
      {/* Checkbox Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 font-sora">Checkbox</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Basic Checkbox</h3>
            <Checkbox id="basic-checkbox" checked={checkboxState.basic} onChange={(e) => setCheckboxState({
            ...checkboxState,
            basic: e.target.checked
          })} />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">With Label</h3>
            <Checkbox id="label-checkbox" label="Checkbox with label" checked={checkboxState.withLabel} onChange={(e) => setCheckboxState({
            ...checkboxState,
            withLabel: e.target.checked
          })} />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Indeterminate</h3>
            <Checkbox id="indeterminate-checkbox" label="Indeterminate state" indeterminate checked={checkboxState.indeterminate} onChange={(e) => setCheckboxState({
            ...checkboxState,
            indeterminate: e.target.checked
          })} />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Disabled</h3>
            <Checkbox id="disabled-checkbox" label="Disabled checkbox" disabled checked={checkboxState.disabled} onChange={(e) => setCheckboxState({
            ...checkboxState,
            disabled: e.target.checked
          })} />

          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Label Position</h3>
            <div className="space-y-2 font-work-sans">
              <Checkbox id="right-label" label="Label on right (default)" labelPosition="right" />

              <Checkbox id="left-label" label="Label on left" labelPosition="left" />

            </div>
          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Sizes</h3>
            <div className="space-y-2 font-work-sans">
              <Checkbox id="small-checkbox" label="Small size" size="sm" />

              <Checkbox id="medium-checkbox" label="Medium size (default)" size="md" />

              <Checkbox id="large-checkbox" label="Large size" size="lg" />

            </div>
          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">With Form Field</h3>
            <FormField label="Terms and Conditions" id="terms-checkbox-field" helperText="Please read and accept the terms" className="font-work-sans">

              <Checkbox id="terms-checkbox" label="I accept the terms and conditions" />

            </FormField>
          </div>
        </div>
      </section>
      
      {/* Radio Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 font-sora">Radio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Basic Radio</h3>
            <div className="space-y-2 font-work-sans">
              <Radio id="radio-1" name="basic-radio" value="option1" label="Option 1" checked={selectedValue === 'option1'} onChange={(e) => e.target.checked && setSelectedValue(e.target.value)} />

              <Radio id="radio-2" name="basic-radio" value="option2" label="Option 2" checked={selectedValue === 'option2'} onChange={(e) => e.target.checked && setSelectedValue(e.target.value)} />

            </div>
          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Radio Group</h3>
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
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Horizontal Radio Group</h3>
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
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Disabled Radio</h3>
            <div className="space-y-2 font-work-sans">
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
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">Radio Sizes</h3>
            <div className="space-y-2 font-work-sans">
              <Radio id="small-radio" name="radio-sizes" value="small" label="Small radio" size="sm" />

              <Radio id="medium-radio" name="radio-sizes" value="medium" label="Medium radio (default)" size="md" />

              <Radio id="large-radio" name="radio-sizes" value="large" label="Large radio" size="lg" />

            </div>
          </div>
          
          <div className="font-work-sans">
            <h3 className="text-md font-medium mb-2 font-sora">With Form Field</h3>
            <FormField label="Subscription Plan" id="plan-field" helperText="Choose your subscription plan" className="font-work-sans">

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
  return <div className="space-y-8 font-work-sans">
      {/* Color Palette */}
      <div className="font-work-sans">
        <h3 className="text-md font-medium mb-4 font-sora">Brand Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-work-sans">
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#333333] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Primary Color - Jet</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#333333</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--primary-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#4A5568] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Secondary Color - Payne's Grey</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#4A5568</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--secondary-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#00BFFF] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Accent Color - Deep Sky Blue</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#00BFFF</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--accent-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#FFFFFF] border rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Background Color - White</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#FFFFFF</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--background-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#D1D5DB] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Divider Color - French Grey</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#D1D5DB</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--divider-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#3182CE] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Interactive Color - Medium Blue</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#3182CE</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--interactive-color</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logos */}
      <div className="font-work-sans">
        <h3 className="text-md font-medium mb-4 font-sora">Logos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          <div className="p-4 border rounded-md flex items-center justify-center font-work-sans">
            <img src="/logo.png" alt="Justify Logo" className="h-16" />
            <p className="ml-4 font-medium font-work-sans">Primary Logo</p>
          </div>
          <div className="p-4 border rounded-md flex items-center justify-center bg-[#333333] font-work-sans">
            <img src="/logo.png" alt="Justify Logo on Dark Background" className="h-16" />
            <p className="ml-4 font-medium text-white font-work-sans">Logo on Dark</p>
          </div>
          <div className="p-4 border rounded-md flex flex-col items-center font-work-sans">
            <img src="/favicon.ico" alt="Justify Favicon" className="h-12 w-12 mb-2" />
            <p className="font-medium font-work-sans">Favicon</p>
          </div>
          <div className="p-4 border rounded-md flex flex-col items-center font-work-sans">
            <div className="flex items-center font-work-sans">
              <img src="/logo.png" alt="Justify Logo Small" className="h-10" />
              <span className="ml-2 text-xl font-bold font-work-sans">Justify</span>
            </div>
            <p className="mt-2 font-medium font-work-sans">Logo with Text</p>
          </div>
        </div>
      </div>
    </div>;
}
export function AvatarExamples() {
  return <div className="space-y-8 font-work-sans" id="avatars">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Avatar Sizes</h2>
        <div className="flex gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">XS</p>
            <Avatar size="xs" src="/profile-image.svg" alt="User" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">SM</p>
            <Avatar size="sm" src="/profile-image.svg" alt="User" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">MD (default)</p>
            <Avatar size="md" src="/profile-image.svg" alt="User" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">LG</p>
            <Avatar size="lg" src="/profile-image.svg" alt="User" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">XL</p>
            <Avatar size="xl" src="/profile-image.svg" alt="User" />
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Avatar with Fallback</h2>
        <div className="flex gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Initials</p>
            <Avatar alt="John Doe" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Custom Initials</p>
            <Avatar initials="AB" />
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Avatar with Status</h2>
        <div className="flex gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Online</p>
            <Avatar src="/profile-image.svg" alt="User" status="online" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Offline</p>
            <Avatar src="/profile-image.svg" alt="User" status="offline" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Away</p>
            <Avatar src="/profile-image.svg" alt="User" status="away" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Busy</p>
            <Avatar src="/profile-image.svg" alt="User" status="busy" />
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Bordered Avatar</h2>
        <div className="flex gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">With Border</p>
            <Avatar src="/profile-image.svg" alt="User" bordered />
          </div>
        </div>
      </div>
    </div>;
}
export function BadgeExamples() {
  return <div className="space-y-8 font-work-sans" id="badges">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Badge Variants</h2>
        <div className="flex flex-wrap gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Default</p>
            <Badge>Default</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Primary</p>
            <Badge variant="primary">Primary</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Secondary</p>
            <Badge variant="secondary">Secondary</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Accent</p>
            <Badge variant="accent">Accent</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Outline</p>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Badge Sizes</h2>
        <div className="flex gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Small</p>
            <Badge size="sm">Small</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Medium (default)</p>
            <Badge size="md">Medium</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Large</p>
            <Badge size="lg">Large</Badge>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Status Badges</h2>
        <div className="flex flex-wrap gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Live</p>
            <StatusBadge status="live">Live</StatusBadge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Paused</p>
            <StatusBadge status="paused">Paused</StatusBadge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Completed</p>
            <StatusBadge status="completed">Completed</StatusBadge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Draft</p>
            <StatusBadge status="draft">Draft</StatusBadge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Scheduled</p>
            <StatusBadge status="scheduled">Scheduled</StatusBadge>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Badge with Count</h2>
        <div className="flex gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Notification</p>
            <Badge variant="accent" count={5}>Notifications</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Messages</p>
            <Badge variant="primary" count={12}>Messages</Badge>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Rounded Badge</h2>
        <div className="flex gap-4 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Rounded</p>
            <Badge rounded>Rounded</Badge>
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Rounded with Count</p>
            <Badge variant="accent" rounded count={9}>New</Badge>
          </div>
        </div>
      </div>
    </div>;
}
export function CalendarExamples() {
  return <div className="space-y-8 font-work-sans" id="calendar">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Basic Calendar</h2>
        <div className="border rounded-md w-full max-w-md font-work-sans">
          <Calendar />
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Calendar with Events</h2>
        <div className="border rounded-md w-full max-w-md font-work-sans">
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
  return <div className="space-y-8 font-work-sans" id="charts">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Chart Placeholder</h2>
        <div className="border rounded-md p-4 w-full max-w-3xl font-work-sans">
          <div className="text-center font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Charts would be implemented with Chart.js, Recharts, or similar libraries</p>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded font-work-sans">
              <span className="text-gray-400 font-work-sans">Chart Placeholder</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-work-sans">This is just a placeholder. In a real implementation, charts would be rendered using a dedicated charting library.</p>
          </div>
        </div>
      </div>
    </div>;
}
export function ProgressExamples() {
  return <div className="space-y-8 font-work-sans" id="progress">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Linear Progress Variants</h2>
        <div className="space-y-4 max-w-md font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Default</p>
            <Progress value={45} showValue />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Primary</p>
            <Progress value={60} variant="primary" showValue />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Secondary</p>
            <Progress value={75} variant="secondary" showValue />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Accent</p>
            <Progress value={85} variant="accent" showValue />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Success</p>
            <Progress value={90} variant="success" showValue />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Warning</p>
            <Progress value={30} variant="warning" showValue />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Danger</p>
            <Progress value={15} variant="danger" showValue />
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Linear Progress Sizes</h2>
        <div className="space-y-4 max-w-md font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">XS</p>
            <Progress value={45} size="xs" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">SM</p>
            <Progress value={60} size="sm" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">MD (default)</p>
            <Progress value={75} size="md" />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">LG</p>
            <Progress value={85} size="lg" />
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Progress with Label</h2>
        <div className="space-y-4 max-w-md font-work-sans">
          <Progress value={66} label="Processing Upload" showValue />
          <Progress value={32} label="Download Status" variant="accent" showValue />
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Animated Progress</h2>
        <div className="space-y-4 max-w-md font-work-sans">
          <Progress value={45} label="Loading..." animated />
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Circular Progress</h2>
        <div className="flex flex-wrap gap-8 items-center font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Default</p>
            <CircularProgress value={45} showPercentage />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Primary</p>
            <CircularProgress value={60} variant="primary" showPercentage />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Accent</p>
            <CircularProgress value={75} variant="accent" showPercentage />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Success</p>
            <CircularProgress value={90} variant="success" showPercentage />
          </div>
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Large</p>
            <CircularProgress value={30} size={64} strokeWidth={6} showPercentage />
          </div>
        </div>
      </div>
    </div>;
}
export function TabsExamples() {
  return <div className="space-y-12 font-work-sans" id="tabs">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Underline Tabs (Default)</h2>
        <div className="border rounded-md p-4 font-work-sans">
          <Tabs defaultTab="home">
            <TabList>
              <Tab id="home">Home</Tab>
              <Tab id="profile">Profile</Tab>
              <Tab id="settings">Settings</Tab>
              <Tab id="disabled" disabled>Disabled</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="home">
                <div className="py-4 font-work-sans">Home tab content</div>
              </TabPanel>
              <TabPanel id="profile">
                <div className="py-4 font-work-sans">Profile tab content</div>
              </TabPanel>
              <TabPanel id="settings">
                <div className="py-4 font-work-sans">Settings tab content</div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Pills Tabs</h2>
        <div className="border rounded-md p-4 font-work-sans">
          <Tabs defaultTab="overview" variant="pills">
            <TabList>
              <Tab id="overview">Overview</Tab>
              <Tab id="analytics">Analytics</Tab>
              <Tab id="reports">Reports</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="overview">
                <div className="py-4 font-work-sans">Overview tab content</div>
              </TabPanel>
              <TabPanel id="analytics">
                <div className="py-4 font-work-sans">Analytics tab content</div>
              </TabPanel>
              <TabPanel id="reports">
                <div className="py-4 font-work-sans">Reports tab content</div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Enclosed Tabs</h2>
        <div className="border rounded-md p-4 font-work-sans">
          <Tabs defaultTab="files" variant="enclosed">
            <TabList>
              <Tab id="files">Files</Tab>
              <Tab id="documents">Documents</Tab>
              <Tab id="media">Media</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="files">
                <div className="py-4 font-work-sans">Files tab content</div>
              </TabPanel>
              <TabPanel id="documents">
                <div className="py-4 font-work-sans">Documents tab content</div>
              </TabPanel>
              <TabPanel id="media">
                <div className="py-4 font-work-sans">Media tab content</div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </div>;
}
export function LoadingExamples() {
  return <div className="space-y-8 font-work-sans" id="loading">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Spinner Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Base Spinner Variants</p>
            <div className="flex gap-4 items-center font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Default</p>
                <Spinner />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Primary</p>
                <Spinner variant="primary" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Secondary</p>
                <Spinner variant="secondary" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Accent</p>
                <Spinner variant="accent" />
              </div>
            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Spinner Sizes</p>
            <div className="flex gap-4 items-center font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">XS</p>
                <Spinner size="xs" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">SM</p>
                <Spinner size="sm" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">MD</p>
                <Spinner size="md" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">LG</p>
                <Spinner size="lg" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">XL</p>
                <Spinner size="xl" />
              </div>
            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Spinner with Label</p>
            <div className="space-y-4 font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Bottom (default)</p>
                <Spinner label="Loading..." />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Right</p>
                <div className="flex items-center font-work-sans">
                  <Spinner />
                  <span className="ml-2 font-work-sans">Loading...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Specialized Spinners</p>
            <div className="space-y-4 font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Button Spinner</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center font-work-sans">
                  <ButtonSpinner className="mr-2" /> Loading...
                </button>
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Inline Spinner</p>
                <div className="text-sm font-work-sans">Loading your data <InlineSpinner /></div>
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Dots Loading</p>
                <DotsSpinner />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Authentication Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-work-sans">
          <div className="p-6 border rounded-lg bg-white shadow-sm font-work-sans">
            <p className="text-sm text-gray-500 mb-4 font-work-sans">AuthSpinner Component</p>
            <div className="flex flex-col items-center justify-center h-40 font-work-sans">
              <div className="scale-50 font-work-sans">
                <AuthSpinner label="Loading Justify..." />
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded border font-work-sans">
              <pre className="text-xs overflow-x-auto font-work-sans">
                {`import { AuthSpinner } from '@/components/ui/spinner';

// In your component
return <AuthSpinner label="Loading Justify..." />;`}
              </pre>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-white shadow-sm font-work-sans">
            <p className="text-sm text-gray-500 mb-4 font-work-sans">Auth Skeleton Component</p>
            <div className="flex flex-col items-center justify-center h-40 font-work-sans">
              <div className="scale-75 font-work-sans">
                <AuthSkeleton variant="loading" showLogo={true} />
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded border font-work-sans">
              <pre className="text-xs overflow-x-auto font-work-sans">
                {`import { AuthSkeleton } from '@/components/ui/loading-skeleton';

// In your component
return <AuthSkeleton variant="loading" />;`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Basic Skeleton Components</h2>
        <div className="space-y-6 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Basic Skeletons</p>
            <div className="flex flex-wrap gap-4 font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Rectangular</p>
                <Skeleton width={120} height={40} />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Circular</p>
                <Skeleton variant="circular" width={40} height={40} />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Text</p>
                <Skeleton variant="text" width={200} />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Card</p>
                <Skeleton variant="card" width={120} height={80} />
              </div>
            </div>
          </div>

          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Animation Types</p>
            <div className="flex flex-wrap gap-4 font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Pulse (default)</p>
                <Skeleton width={120} height={40} animation="pulse" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Wave</p>
                <Skeleton width={120} height={40} animation="wave" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">None</p>
                <Skeleton width={120} height={40} animation="none" />
              </div>
            </div>
          </div>

          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Predefined Skeletons</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Text (Multi-line)</p>
                <TextSkeleton lines={3} />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Avatar</p>
                <div className="flex items-center gap-4 font-work-sans">
                  <AvatarSkeleton size="sm" />
                  <AvatarSkeleton size="md" />
                  <AvatarSkeleton size="lg" />
                </div>
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Card</p>
                <CardSkeleton />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Table Rows</p>
                <div className="space-y-2 font-work-sans">
                  <TableRowSkeleton cols={4} />
                  <TableRowSkeleton cols={4} />
                  <TableRowSkeleton cols={4} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Contextual Skeleton Components</h2>
        <div className="space-y-6 font-work-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Wizard Skeleton (Step 3)</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.6] origin-top-left font-work-sans">
                  <WizardSkeleton step={3} />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Form Field Skeleton Variants</p>
              <div className="border rounded-lg p-4 overflow-hidden space-y-4 font-work-sans">
                <div className="flex flex-wrap gap-4 font-work-sans">
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Text Input</p>
                    <FormFieldSkeleton type="text" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Select</p>
                    <FormFieldSkeleton type="select" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Checkbox</p>
                    <FormFieldSkeleton type="checkbox" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 font-work-sans">
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Radio</p>
                    <FormFieldSkeleton type="radio" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Datepicker</p>
                    <FormFieldSkeleton type="datepicker" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Upload</p>
                    <FormFieldSkeleton type="upload" />
                  </div>
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Table Skeleton with Filter</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans">
                <TableSkeleton rows={3} cols={4} hasFilter={true} />
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Form Skeleton Grid Layout</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans">
                <FormSkeleton
                fields={4}
                layout="grid"
                fieldTypes={['text', 'select', 'datepicker', 'textarea']} />

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Advanced Page Skeletons</h2>
        <div className="space-y-6 font-work-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Campaign Detail Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.5] origin-top-left font-work-sans">
                  <CampaignDetailSkeleton />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Dashboard Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.5] origin-top-left font-work-sans">
                  <DashboardSkeleton />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Auth Sign-in Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.7] origin-top-left font-work-sans">
                  <AuthSkeleton variant="signin" />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Auth Sign-up Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.7] origin-top-left font-work-sans">
                  <AuthSkeleton variant="signup" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border font-work-sans">
        <h2 className="text-lg font-semibold mb-2 font-sora">Migration Guide</h2>
        <p className="text-sm text-gray-600 mb-4 font-work-sans">We're standardizing loading states across the application. Please update your code to use these new contextual skeleton components.</p>
        
        <div className="space-y-4 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm font-medium font-work-sans">Instead of:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              {`if (loading) {
  return <LoadingSpinner />;
}`}
            </pre>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm font-medium font-work-sans">Use the appropriate contextual skeleton:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              {`import { WizardSkeleton } from '@/components/ui/loading-skeleton';

if (loading) {
  return <WizardSkeleton step={currentStep} />;
}`}
            </pre>
          </div>
          
          <div className="pt-2 font-work-sans">
            <p className="text-sm font-medium font-work-sans">For Suspense boundaries:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              {`import { TableSkeleton } from '@/components/ui/loading-skeleton';

<Suspense fallback={<TableSkeleton rows={5} hasFilter={true} />}>
  <Component />
</Suspense>`}
            </pre>
          </div>
          
          <div className="pt-2 font-work-sans">
            <p className="text-sm font-medium font-work-sans">For complete customization:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              {`import { WizardSkeleton, SkeletonSection, FormFieldSkeleton } from '@/components/ui/loading-skeleton';

<WizardSkeleton
  step={3}
  stepContent={
    <>
      <SkeletonSection title={true} titleWidth="w-1/3" lines={2} />
      <SkeletonSection title={true} titleWidth="w-1/4" lines={0}>
        <div className="space-y-4">
          <FormFieldSkeleton type="text" />
          <FormFieldSkeleton type="select" />
        </div>
      </SkeletonSection>
    </>
  }
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>;
}
export default function ComponentExamples() {
  return <div className="space-y-6 overflow-x-hidden font-work-sans">
      <style jsx global>{`
        html {
          scroll-padding-top: 10rem;
        }
      `}</style>
      <ComponentNav />
      <div className="p-8 pt-12 space-y-16 font-work-sans">
        <h1 className="text-2xl font-bold mb-8 font-sora">UI Component Examples</h1>
        
        {/* Sections in alphabetical order */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="alerts">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Alerts</h2>
          <AlertExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="avatars">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Avatars</h2>
          <AvatarExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="badges">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Badges</h2>
          <BadgeExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="buttons">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Buttons</h2>
          <ButtonExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="calendar">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Calendar</h2>
          <CalendarExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="cards">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Cards</h2>
          <CardExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="charts">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Charts</h2>
          <ChartExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="colour-palette-logos">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Colour Palette + Logos</h2>
          <ColorPaletteLogosExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="container">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Container</h2>
          <ContainerExamples />
        </section>
        
        {/* Form Components Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="form-components">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Form Components</h2>
          <FormComponentsExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="icons">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Icons</h2>
          <div className="space-y-12 font-work-sans">
            <div className="font-work-sans">
              <h2 className="text-xl font-bold mb-4 font-sora">Comprehensive Icon Library</h2>
              <p className="text-gray-600 mb-6 font-work-sans">This component displays all available Font Awesome icons in the system. Font Awesome Classic includes Solid, Light, and Brands icon sets.</p>
              
              {/* Removed the SOLID/REGULAR/BRANDS boxes as requested */}
            </div>
            
            <CustomIconDisplay />
            
            {/* Removed duplicated icon usage examples */}
          </div>
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="grid">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Grid</h2>
          <GridExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="inputs">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Inputs</h2>
          <InputExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="loading">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Loading</h2>
          <LoadingExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="progress">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Progress</h2>
          <ProgressExamples />
        </section>
        
        {/* Tables Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="tables">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Tables</h2>
          <div className="space-y-12 font-work-sans">
            <TableExample />
            <ListExample />
          </div>
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="tabs">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Tabs</h2>
          <TabsExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="toasts">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Toasts</h2>
          <ToastExamples />
        </section>
        
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="typography">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Typography</h2>
          <TypographyExamples />
        </section>
      </div>
    </div>;
}