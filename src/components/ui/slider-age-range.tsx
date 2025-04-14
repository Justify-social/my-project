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
import { isEqual } from 'lodash';
import { cn } from "@/lib/utils";

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
    /** Additional class names for the form item */
    className?: string;
    /** Default value for the form field */
    defaultValue?: [number, number];
    /** Validation rules for the form field */
    rules?: any;
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
        minStepsBetweenThumbs = 1,
        className,
        defaultValue,
        rules
    }: AgeRangeSliderProps<TFieldValues>
) {
    const minVal = Math.max(18, min || 18);
    const maxVal = Math.min(120, max || 120);

    return (
        <FormItem className={cn('w-full', className)}>
            {label && <FormLabel>{label}</FormLabel>}
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue || [minVal, maxVal > 64 ? 65 : maxVal] as any}
                rules={rules}
                render={({ field, fieldState }) => {
                    // Default value for the component, ensuring it respects min/max props
                    const componentDefaultValue: [number, number] = [minVal, maxVal > 64 ? 65 : maxVal]; // Ensure max display logic aligns

                    // Local state manages slider value during interaction for smoother UX
                    const [localValue, setLocalValue] = useState<number[]>(field.value || componentDefaultValue);

                    useEffect(() => {
                        if (field.value && !isEqual(field.value, localValue)) {
                            setLocalValue(field.value);
                        }
                    }, [field.value, localValue]);

                    // Display '+' if the max value selected is the component's max prop and > 64
                    const maxDisplay = localValue[1] === maxVal && maxVal > 64 ? `${maxVal}+` : `${localValue[1]}`;

                    // Update local state while dragging
                    const handleValueChange = (newValue: [number, number]) => {
                        setLocalValue(newValue);
                    };

                    // Update RHF state only when the user finishes interaction
                    const handleCommit = (committedValue: [number, number]) => {
                        field.onChange(committedValue);
                    };

                    return (
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
                                    min={minVal}
                                    max={maxVal}
                                    step={step}
                                    minStepsBetweenThumbs={minStepsBetweenThumbs}
                                    className="py-1" // Padding helps prevent thumb clipping
                                />
                            </FormControl>
                            {description && <FormDescription>{description}</FormDescription>}
                            {/* Display RHF validation error */}
                            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        </div>
                    );
                }}
            />
        </FormItem>
    );
}