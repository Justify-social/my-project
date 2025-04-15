'use client';

import React, { useMemo, useCallback } from 'react';
import { Control, FieldPath, FieldValues, useWatch, UseFormSetValue } from 'react-hook-form';
import { Slider } from "@/components/ui/slider";
import { FormLabel, FormItem, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { logger } from '@/utils/logger';

const AGE_BRACKETS = [
    { key: 'age18_24', label: '18-24' },
    { key: 'age25_34', label: '25-34' },
    { key: 'age35_44', label: '35-44' },
    { key: 'age45_54', label: '45-54' },
    { key: 'age55_64', label: '55-64' },
    { key: 'age65plus', label: '65+' },
] as const;

type AgeBracketKey = typeof AGE_BRACKETS[number]['key'];

// Define color sequence for summary boxes using CSS variables (preferred) or hex
const SUMMARY_COLORS = [
    "bg-accent/10 border-accent", // Deep Sky Blue
    "bg-secondary/10 border-secondary", // Payne's Grey
    "bg-primary/10 border-primary", // Jet
    "bg-french-grey/10 border-french-grey", // French Grey (Use var(--french-grey) if defined)
    // Repeat or add more colors if needed
];

interface AgeDistributionSliderGroupProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
    label?: string;
    description?: string;
    errors: any; // Keep for potential other errors
}

export function AgeDistributionSliderGroup<TFieldValues extends FieldValues>(
    {
        name,
        control,
        setValue,
        label = "Age Distribution",
        description = "Allocate percentages to each age range", // Simplified description
        errors // Can be used for non-sum errors if needed
    }: AgeDistributionSliderGroupProps<TFieldValues>
) {
    const demographicsData = useWatch({ control, name });

    // Memoize current values for easier access
    const currentValues = useMemo(() => {
        const values: Record<AgeBracketKey, number> = {} as any;
        AGE_BRACKETS.forEach(bracket => {
            values[bracket.key] = demographicsData?.[bracket.key] || 0;
        });
        return values;
    }, [demographicsData]);

    const handleValueChange = useCallback((changedBracketKey: AgeBracketKey, newValue: number) => {
        const currentValue = currentValues[changedBracketKey];
        let delta = newValue - currentValue;

        if (Math.abs(delta) < 0.01) return; // Ignore tiny changes

        const otherKeys = AGE_BRACKETS.map(b => b.key).filter(k => k !== changedBracketKey);
        const sumOthers = otherKeys.reduce((sum, k) => sum + currentValues[k], 0);

        const updates: Record<string, number> = {};

        if (delta > 0) { // Increasing
            const availableToDecrease = sumOthers;
            if (delta > availableToDecrease) {
                newValue = currentValue + availableToDecrease; // Clamp increase
                delta = newValue - currentValue; // Recalculate delta
            }
            updates[changedBracketKey] = newValue; // Set the target slider first
            const remainingDelta = -delta;

            otherKeys.forEach(key => {
                if (currentValues[key] > 0 && sumOthers > 0) {
                    const proportion = currentValues[key] / sumOthers;
                    const decrease = remainingDelta * proportion;
                    updates[key] = currentValues[key] + decrease;
                } else {
                    updates[key] = currentValues[key]; // Keep as is if 0 or sumOthers is 0
                }
            });

        } else { // Decreasing (delta is negative)
            updates[changedBracketKey] = newValue; // Set the target slider first
            const remainingDelta = -delta; // Amount to distribute positively

            // Distribute based on proportion of current values (simple approach)
            if (sumOthers > 0) {
                otherKeys.forEach(key => {
                    const proportion = currentValues[key] / sumOthers;
                    const increase = remainingDelta * proportion;
                    updates[key] = currentValues[key] + increase;
                });
            } else { // If all others are 0, distribute equally
                const numOthers = otherKeys.length;
                if (numOthers > 0) {
                    const increasePerSlider = remainingDelta / numOthers;
                    otherKeys.forEach(key => {
                        updates[key] = currentValues[key] + increasePerSlider;
                    });
                }
            }
        }

        // Round all values and enforce 100% sum
        let roundedSum = 0;
        const finalUpdates: Record<string, number> = {};
        AGE_BRACKETS.forEach(bracket => {
            const key = bracket.key;
            // Use the initially calculated update value if available, else the original
            const valueToRound = updates[key] !== undefined ? updates[key] : currentValues[key];
            const rounded = Math.round(valueToRound);
            finalUpdates[key] = rounded;
            roundedSum += rounded;
        });

        // Adjust rounding differences - apply to the slider that was changed, or the largest if needed
        const diff = 100 - roundedSum;
        if (diff !== 0) {
            // Prioritize adjusting the slider that was interacted with, within bounds
            const currentSliderRounded = finalUpdates[changedBracketKey];
            const adjustedVal = currentSliderRounded + diff;
            if (adjustedVal >= 0 && adjustedVal <= 100) {
                finalUpdates[changedBracketKey] = adjustedVal;
            } else {
                // Fallback: adjust the largest value slider (that isn't the current one if possible)
                let largestKey = otherKeys.length > 0 ? otherKeys[0] : changedBracketKey;
                let largestVal = -1;
                AGE_BRACKETS.forEach(bracket => {
                    if (finalUpdates[bracket.key] > largestVal) {
                        largestVal = finalUpdates[bracket.key];
                        largestKey = bracket.key;
                    }
                });
                // Ensure adjustment doesn't violate bounds
                finalUpdates[largestKey] = Math.min(100, Math.max(0, finalUpdates[largestKey] + diff));
            }
            // Recalculate final sum for verification (optional)
            roundedSum = AGE_BRACKETS.reduce((sum, b) => sum + finalUpdates[b.key], 0);
            if (Math.abs(100 - roundedSum) > 0.1) { // If still significantly off, log error
                logger.error("Age distribution sum recalc failed:", { finalUpdates, diff });
            }
        }

        // Batch update RHF state
        AGE_BRACKETS.forEach(bracket => {
            // Only call setValue if the value actually changed to avoid unnecessary re-renders
            if (Math.abs(currentValues[bracket.key] - finalUpdates[bracket.key]) > 0.01) {
                setValue(`${name}.${bracket.key}` as FieldPath<TFieldValues>, finalUpdates[bracket.key] as any, { shouldValidate: true, shouldDirty: true });
            }
        });

    }, [currentValues, setValue, name]);

    // Calculate the final sum based on potentially updated RHF state
    const finalSum = useMemo(() => AGE_BRACKETS.reduce((sum, b) => sum + (currentValues[b.key] || 0), 0), [currentValues]);
    const finalSumError = Math.abs(finalSum - 100) >= 0.01 && finalSum !== 0;

    return (
        <FormItem className="space-y-4">
            <div className="flex justify-between items-baseline mb-1">
                <div>
                    <FormLabel className="text-base font-semibold">{label}</FormLabel>
                    {description && <FormDescription className="mt-1 text-muted-foreground">{description}</FormDescription>} {/* Use muted color */}
                </div>
                <span className={cn(
                    "text-sm font-medium",
                    finalSumError ? "text-destructive" : "text-muted-foreground"
                )}>
                    Total: {finalSum.toFixed(0)}% {finalSumError ? "(Must be 100%)" : ""}
                </span>
            </div>

            <div className="space-y-3 pr-1">
                {AGE_BRACKETS.map((bracket) => (
                    <div key={bracket.key} className="grid grid-cols-12 gap-x-2 items-center">
                        <FormLabel className="col-span-2 text-sm text-muted-foreground text-right pr-1">{bracket.label}</FormLabel>
                        <div className="col-span-8">
                            <Slider
                                value={[currentValues[bracket.key]]}
                                onValueChange={(value) => handleValueChange(bracket.key, value[0])}
                                max={100}
                                step={1}
                                // Simplified Styling: Only style range and thumb with accent
                                className={cn(
                                    "relative flex items-center select-none touch-none w-full h-5", // Base styles + increased height
                                    "[&>span:first-child]:absolute [&>span:first-child]:h-full [&>span:first-child]:rounded-full [&>span:first-child]:bg-accent",
                                    // Track styling (REMOVED - Use default muted background)
                                    // "[&>span:nth-child(2)]:h-1.5 [&>span:nth-child(2)]:w-full [&>span:nth-child(2)]:rounded-full [&>span:nth-child(2)]:bg-[#D1D5DB]", 
                                    // Thumb styling (Keep Accent border, make background white/bg)
                                    "[&>span:nth-child(2)>span]:h-5 [&>span:nth-child(2)>span]:w-5 [&>span:nth-child(2)>span]:block [&>span:nth-child(2)>span]:rounded-full [&>span:nth-child(2)>span]:border-2 [&>span:nth-child(2)>span]:border-accent [&>span:nth-child(2)>span]:bg-background [&>span:nth-child(2)>span]:shadow [&>span:nth-child(2)>span]:transition-colors [&>span:nth-child(2)>span]:focus-visible:outline-none [&>span:nth-child(2)>span]:focus-visible:ring-1 [&>span:nth-child(2)>span]:focus-visible:ring-ring [&>span:nth-child(2)>span]:disabled:pointer-events-none [&>span:nth-child(2)>span]:disabled:opacity-50"
                                )}
                            />
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                            <span className="text-sm font-medium w-8 text-right text-foreground tabular-nums">{currentValues[bracket.key].toFixed(0)}</span>
                            <span className="text-sm text-muted-foreground pl-0.5">%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Age Distribution Summary - Colored Rounded Rectangles */}
            <div className="mt-6">
                {/* <FormLabel className="text-sm font-medium text-muted-foreground">Age Distribution Summary</FormLabel> */}
                <div className="mt-2 flex justify-center">
                    <div className="flex flex-wrap gap-2 justify-start items-center max-w-xl">
                        {AGE_BRACKETS.map((bracket) => { // Remove index dependency for color
                            const percentage = currentValues[bracket.key];
                            // Determine color class based on percentage value
                            const colorClass = percentage > 10
                                ? "bg-accent/10 border-accent" // High %
                                : percentage > 0
                                    ? "bg-secondary/10 border-secondary" // Low/Mid %
                                    : "border-input bg-transparent opacity-60"; // Zero %

                            // Ensure the return statement is always reached
                            return (
                                <div
                                    key={`${bracket.key}-summary`}
                                    className={cn(
                                        "relative h-12 w-16 rounded-md border-2 flex flex-col items-center justify-center p-1 transition-colors duration-200",
                                        percentage > 0
                                            ? colorClass // Apply dynamic color class
                                            : "border-input bg-transparent opacity-60" // Style for 0%
                                    )}
                                    title={`${bracket.label}: ${percentage.toFixed(0)}%`}
                                >
                                    <span className={cn(
                                        "text-xs font-semibold",
                                        percentage > 0 ? "text-foreground" : "text-muted-foreground" // Adjust text color based on percentage
                                    )}>{percentage.toFixed(0)}%</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">{bracket.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </FormItem>
    );
}

// Helper utility class (add to globals.css or similar if needed)
/*
.hide-arrows::-webkit-outer-spin-button,
.hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.hide-arrows[type=number] {
  -moz-appearance: textfield;
}
*/ 