/**
 * @component ColorPicker
 * @category organism
 * @description A color picker component using react-colorful.
 * @status 15th April
 */

'use client';

import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  className?: string;
}

export const ColorPicker = React.forwardRef<
  HTMLInputElement, // Forwarding ref to the hidden input for potential form integration
  ColorPickerProps
>(({ value, onChange, label, id, className }, ref) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {label && <Label htmlFor={id || label}>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id || label}
            variant="outline"
            className="w-[140px] justify-start text-left font-normal h-10 px-3"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border border-input"
                style={{ backgroundColor: value }}
              />
              <span className="flex-1 truncate text-xs uppercase">{value || 'Select color'}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none">
          {/* Hidden input to potentially hold the value for form libraries */}
          <input type="hidden" ref={ref} value={value} />
          <HexColorPicker color={value} onChange={onChange} />
          {/* Optional: Add an Input field within the popover for direct hex entry */}
          <div className="p-2 border-t border-border bg-background">
            <Input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full h-8 text-xs"
              placeholder="#FFFFFF"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';
