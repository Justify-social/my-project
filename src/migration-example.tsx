// MIGRATION EXAMPLE FILE
// This file demonstrates how to migrate from direct Heroicon imports to the migrateHeroIcon helper

// BEFORE: Direct imports from Heroicons
import { 
  UserIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

// AFTER: Import the helper function
import { migrateHeroIcon } from "@/lib/icon-helpers";

export function BeforeExample() {
  return (
    <div>
      {/* BEFORE: Direct usage of Heroicons */}
      <UserIcon className="h-6 w-6" />
      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      <ChevronDownIcon className="h-4 w-4 ml-2" />
    </div>
  );
}

export function AfterExample() {
  return (
    <div>
      {/* AFTER: Using the migrateHeroIcon helper */}
      {migrateHeroIcon('UserIcon', { className: 'h-6 w-6' })}
      {migrateHeroIcon('MagnifyingGlassIcon', { className: 'h-5 w-5 text-gray-400' })}
      {migrateHeroIcon('ChevronDownIcon', { className: 'h-4 w-4 ml-2' })}
    </div>
  );
}

// Important notes:
// 1. Remove direct imports from @heroicons/react
// 2. Add import for migrateHeroIcon
// 3. Replace direct component usage with helper function
// 4. Pass the icon name as string (first parameter)
// 5. Pass all props as an object (second parameter) 