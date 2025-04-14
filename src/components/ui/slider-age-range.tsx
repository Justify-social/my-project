/**
 * @component AgeRangeSlider
 * @category organism
 * @description Reusable slider component for selecting an age range, integrated with RHF.
 * Uses Shadcn UI Slider and RHF Controller.
 * @status 10th April
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Slider } from "@/components/ui/slider";
import { FormLabel, FormItem, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

interface AgeRangeSliderProps<TFieldValues extends FieldValues = FieldValues> {
    /** React Hook Form name prop */
    name: FieldPath<TFieldValues>;
    /** React Hook Form control prop */
    control: Control<TFieldValues>;
    /** Optional label for the form item */
    label?: string;
    /** Optional description text */
    description?: string;
    /** Minimum selectable age (default: 13) */
    min?: number;
    /** Maximum selectable age (default: 65) */
    max?: number;
    /** Step interval for the slider (default: 1) */
    step?: number;
    /** Minimum steps between thumbs (default: 1) */
    minStepsBetweenThumbs?: number;
}

export function AgeRangeSlider<TFieldValues extends FieldValues = FieldValues>(
    {
        name,
        control,
        label,
        description,
        min = 13,
        max = 65,
        step = 1,
        minStepsBetweenThumbs = 1
    }: AgeRangeSliderProps<TFieldValues>
) {
    // Determine default range based on min/max props
    const componentDefaultValue: [number, number] = [min, max > 64 ? 65 : max]; // Ensure max display logic aligns

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={componentDefaultValue as any} // Set RHF initial default
            render={({ field, fieldState }) => {
                // Local state manages slider value during interaction for smoother UX
                const [localValue, setLocalValue] = useState<[number, number]>(field.value || componentDefaultValue);

                // Update local state if RHF value changes externally (e.g., form reset)
                useEffect(() => {
                    // Prevent infinite loop by checking if values actually differ
                    if (JSON.stringify(field.value) !== JSON.stringify(localValue)) {
                        setLocalValue(field.value || componentDefaultValue);
                    }
                    // Only depend on field.value and componentDefaultValue (stable)
                }, [field.value, componentDefaultValue]);

                // Update local state while dragging
                const handleValueChange = (newValue: [number, number]) => {
                    setLocalValue(newValue);
                };

                // Update RHF state only when the user finishes interaction
                const handleCommit = (committedValue: [number, number]) => {
                    field.onChange(committedValue);
                };

                // Display '+' if the max value selected is the component's max prop and > 64
                const maxDisplay = localValue[1] === max && max > 64 ? `${max}+` : `${localValue[1]}`;

                return (
                    <FormItem>
                        {label && <FormLabel>{label}</FormLabel>}
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between text-sm text-muted-foreground px-1">
                                <span>Age: {localValue[0]}</span>
                                <span>{maxDisplay}</span>
                            </div>
                            <FormControl>
                                <Slider
                                    value={localValue} // Slider is controlled by local state
                                    onValueChange={handleValueChange} // Update local state during slide
                                    onValueCommit={handleCommit} // Update RHF on commit
                                    min={min}
                                    max={max}
                                    step={step}
                                    minStepsBetweenThumbs={minStepsBetweenThumbs}
                                    className="py-1" // Padding helps prevent thumb clipping
                                />
                            </FormControl>
                            {description && <FormDescription>{description}</FormDescription>}
                            {/* Display RHF validation error */}
                            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        </div>
                    </FormItem>
                );
            }}
        />
    );
}