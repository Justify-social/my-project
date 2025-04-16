/**
 * @component GenderSelector
 * @category organism
 * @description Reusable gender selection component using checkboxes, integrated with RHF.
 * Uses Shadcn UI Checkbox and RHF Controller.
 * @status 10th April
 */

'use client';

import React from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormLabel, FormItem, FormDescription, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface GenderSelectorProps<TFieldValues extends FieldValues = FieldValues> {
  /** React Hook Form name prop */
  name: FieldPath<TFieldValues>;
  /** React Hook Form control prop */
  control: Control<TFieldValues>;
  /** Optional label for the form item */
  label?: string;
  /** Optional description text */
  description?: string;
  /** Optional array of gender strings to display as options */
  options?: string[];
}

export function GenderSelector<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  // Update default options
  options = ['Male', 'Female', 'Other'],
}: GenderSelectorProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      // @ts-ignore // TODO: Investigate defaultValue type mismatch
      defaultValue={[] as string[]} // Explicitly type as string[], ignore error
      render={({ field, fieldState }) => {
        // Ensure field.value is always treated as an array for selection logic
        const currentSelection: string[] = Array.isArray(field.value) ? field.value : [];

        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription className="pt-1">{description}</FormDescription>}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {options.map(genderOption => {
                const isSelected = currentSelection.includes(genderOption);
                const checkboxId = `${name}-${genderOption}`.replace(/\./g, '-'); // Create unique ID

                return (
                  // Use a Label associated with the Checkbox
                  <FormLabel
                    key={genderOption}
                    htmlFor={checkboxId} // Link label to checkbox
                    className={cn(
                      'flex flex-row items-center space-x-2 space-y-0 border rounded-md px-3 py-2 transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-accent text-accent-foreground border-accent/50'
                        : 'hover:bg-muted/50'
                    )}
                    // No onClick needed here, label click triggers checkbox
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={isSelected}
                      onCheckedChange={checked => {
                        // Keep the RHF update logic here
                        let updatedSelection;
                        if (checked) {
                          updatedSelection = [...currentSelection, genderOption];
                        } else {
                          updatedSelection = currentSelection.filter(g => g !== genderOption);
                        }
                        field.onChange(updatedSelection);
                      }}
                      aria-label={genderOption}
                      className={cn(
                        isSelected && 'border-accent-foreground [&>span]:bg-accent-foreground'
                      )}
                    />
                    {/* Text part of the label */}
                    <span className="font-normal">{genderOption}</span>
                  </FormLabel>
                );
              })}
            </div>
            {fieldState.error && (
              <FormMessage className="pt-1">{fieldState.error.message}</FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
}
