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
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel, FormItem, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

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

export function GenderSelector<TFieldValues extends FieldValues = FieldValues>(
    {
        name,
        control,
        label,
        description,
        // Default options if not provided
        options = ["Male", "Female", "Non-binary", "Prefer not to say"]
    }: GenderSelectorProps<TFieldValues>
) {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={[] as any} // RHF default for a checkbox group (array of strings)
            render={({ field, fieldState }) => {
                // Ensure field.value is always an array
                const currentSelection: string[] = Array.isArray(field.value) ? field.value : [];

                return (
                    <FormItem>
                        {label && <FormLabel>{label}</FormLabel>}
                        <div className="space-y-2 pt-2">
                            {options.map(genderOption => (
                                <FormItem key={genderOption} className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={currentSelection.includes(genderOption)}
                                            onCheckedChange={(checked) => {
                                                let updatedSelection;
                                                if (checked) {
                                                    updatedSelection = [...currentSelection, genderOption];
                                                } else {
                                                    updatedSelection = currentSelection.filter(g => g !== genderOption);
                                                }
                                                field.onChange(updatedSelection);
                                            }}
                                            aria-label={`Select gender ${genderOption}`}
                                        />
                                    </FormControl>
                                    {/* Standard FormLabel makes the text clickable */}
                                    <FormLabel className="font-normal cursor-pointer">{genderOption}</FormLabel>
                                </FormItem>
                            ))}
                        </div>
                        {description && <FormDescription>{description}</FormDescription>}
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                    </FormItem>
                )
            }}
        />
    );
}