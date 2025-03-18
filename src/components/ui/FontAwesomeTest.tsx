'use client';

import React from 'react';
import { Icon } from './icon';
import { migrateHeroIcon } from '@/lib/icon-helpers';

export const FontAwesomeTest = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Font Awesome Migration Test</h2>
        <p className="text-gray-600 mb-6">This component tests both the new Font Awesome implementation and backward compatibility.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic UI Icons</h3>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Icon name="search" size="lg" />
            <span className="text-sm mt-2">search</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="plus" size="lg" />
            <span className="text-sm mt-2">plus</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="check" size="lg" />
            <span className="text-sm mt-2">check</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="trash" size="lg" />
            <span className="text-sm mt-2">trash</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="user" size="lg" />
            <span className="text-sm mt-2">user</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Solid vs Outline</h3>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Icon name="heart" size="lg" />
            <span className="text-sm mt-2">heart (outline)</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="heart" size="lg" solid />
            <span className="text-sm mt-2">heart (solid)</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="star" size="lg" />
            <span className="text-sm mt-2">star (outline)</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="star" size="lg" solid />
            <span className="text-sm mt-2">star (solid)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Platform Icons</h3>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Icon platformName="instagram" size="lg" />
            <span className="text-sm mt-2">instagram</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon platformName="youtube" size="lg" />
            <span className="text-sm mt-2">youtube</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon platformName="facebook" size="lg" />
            <span className="text-sm mt-2">facebook</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon platformName="linkedin" size="lg" />
            <span className="text-sm mt-2">linkedin</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Backward Compatibility</h3>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Icon fontAwesome="fa-solid fa-user" size="lg" />
            <span className="text-sm mt-2">fontAwesome prop</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="user" size="lg" solid />
            <span className="text-sm mt-2">name prop (solid)</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="trash" size="lg" />
            <span className="text-sm mt-2">name prop (outline)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Icon Sizes</h3>
        <div className="flex flex-wrap items-end gap-8">
          <div className="flex flex-col items-center">
            <Icon name="bell" size="xs" />
            <span className="text-sm mt-2">xs</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="bell" size="sm" />
            <span className="text-sm mt-2">sm</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="bell" size="md" />
            <span className="text-sm mt-2">md</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="bell" size="lg" />
            <span className="text-sm mt-2">lg</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="bell" size="xl" />
            <span className="text-sm mt-2">xl</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Colors</h3>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Icon name="info" size="lg" color="blue" />
            <span className="text-sm mt-2">blue</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="warning" size="lg" color="orange" />
            <span className="text-sm mt-2">orange</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="check" size="lg" color="green" />
            <span className="text-sm mt-2">green</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="trash" size="lg" color="red" />
            <span className="text-sm mt-2">red</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Migration Helpers</h3>
        <div className="p-4 border border-blue-200 bg-blue-50 rounded-md mb-4">
          <p className="text-sm text-blue-800 mb-2">
            These examples demonstrate the migration from Hero Icons to Font Awesome:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-white p-1 rounded">{`<Icon heroSolid="UserIcon" />`}</code>
              <span>→</span>
              <code className="text-xs bg-white p-1 rounded">{`<Icon name="user" solid />`}</code>
            </div>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-white p-1 rounded">{`<Icon heroOutline="TrashIcon" />`}</code>
              <span>→</span>
              <code className="text-xs bg-white p-1 rounded">{`<Icon name="trash" />`}</code>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            {/* Using migrateHeroIcon for UserIcon */}
            {migrateHeroIcon("UserIcon", { size: "lg" })}
            <span className="text-sm mt-2">migrateHeroIcon("UserIcon")</span>
          </div>
          <div className="flex flex-col items-center">
            {/* Using migrateHeroIcon for OutlineTrashIcon */}
            {migrateHeroIcon("TrashOutlineIcon", { size: "lg" })}
            <span className="text-sm mt-2">migrateHeroIcon("TrashOutlineIcon")</span>
          </div>
          <div className="flex flex-col items-center">
            {/* Using migrateHeroIcon for CheckIcon */}
            {migrateHeroIcon("CheckIcon", { size: "lg" })}
            <span className="text-sm mt-2">migrateHeroIcon("CheckIcon")</span>
          </div>
          <div className="flex flex-col items-center">
            {/* Using migrateHeroIcon for CogIcon */}
            {migrateHeroIcon("Cog6ToothIcon", { size: "lg" })}
            <span className="text-sm mt-2">migrateHeroIcon("Cog6ToothIcon")</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontAwesomeTest; 