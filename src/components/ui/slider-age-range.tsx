/**
 * @component AgeRangeSlider
 * @category organism
 * @description Reusable slider component for selecting an age range, integrated with RHF.
 * Uses Shadcn UI Slider and RHF Controller.
 * @status 10th April
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Controller,
  Control,
  FieldPath,
  FieldValues,
  ControllerRenderProps,
  ControllerFieldState,
  RegisterOptions,
} from 'react-hook-form';
import { Slider } from '@/components/ui/slider';
import {
  FormLabel,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

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
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
}

// --- Internal Slider Input Component ---
interface SliderInputProps<TFieldValues extends FieldValues = FieldValues> {
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  fieldState: ControllerFieldState;
  minVal: number;
  maxVal: number;
  step: number;
  minStepsBetweenThumbs: number;
  description?: string;
  defaultValue: [number, number];
}

const SliderInput = <TFieldValues extends FieldValues = FieldValues>({
  field,
  fieldState,
  minVal,
  maxVal,
  step,
  minStepsBetweenThumbs,
  description,
  defaultValue,
}: SliderInputProps<TFieldValues>) => {
  // Local state manages slider value during interaction for smoother UX
  const [localValue, setLocalValue] = useState<[number, number]>(
    Array.isArray(field.value) && field.value.length === 2
      ? (field.value as [number, number])
      : defaultValue
  );

  // Sync RHF field value to local state if it changes externally
  useEffect(() => {
    const currentFieldValue = field.value as [number, number] | undefined;
    if (
      currentFieldValue &&
      (currentFieldValue[0] !== localValue[0] || currentFieldValue[1] !== localValue[1])
    ) {
      setLocalValue(currentFieldValue);
    } else if (
      !currentFieldValue &&
      (localValue[0] !== defaultValue[0] || localValue[1] !== defaultValue[1])
    ) {
      setLocalValue(defaultValue);
    }
  }, [field.value, defaultValue, localValue]); // Added localValue dependency as it's used in the check

  // Display '+' if the max value selected is the component's max prop and > 64
  const maxDisplay = localValue[1] === maxVal && maxVal > 64 ? `${maxVal}+` : `${localValue[1]}`;

  // Update local state while dragging
  const handleValueChange = (newValue: number[]) => {
    // Ensure the value is always a tuple [number, number]
    if (Array.isArray(newValue) && newValue.length === 2) {
      setLocalValue(newValue as [number, number]);
    }
  };

  // Update RHF state only when the user finishes interaction
  const handleCommit = (committedValue: number[]) => {
    const currentFieldValue = field.value as [number, number] | undefined;
    // Ensure the value is always a tuple [number, number]
    if (Array.isArray(committedValue) && committedValue.length === 2) {
      const finalValue = committedValue as [number, number];
      if (
        !currentFieldValue ||
        finalValue[0] !== currentFieldValue[0] ||
        finalValue[1] !== currentFieldValue[1]
      ) {
        field.onChange(finalValue);
      }
    }
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
};
// --- End Internal Slider Input Component ---

export function AgeRangeSlider<TFieldValues extends FieldValues = FieldValues>({
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
  rules,
}: AgeRangeSliderProps<TFieldValues>) {
  const minVal = Math.max(18, min || 18);
  const maxVal = Math.min(120, max || 120);
  const componentDefaultValue: [number, number] = [minVal, maxVal > 64 ? 65 : maxVal];

  return (
    <FormItem className={cn('w-full', className)}>
      {label && <FormLabel>{label}</FormLabel>}
      <Controller
        name={name}
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValue={defaultValue || (componentDefaultValue as any)}
        rules={rules}
        render={({ field, fieldState }) => (
          <SliderInput
            field={field}
            fieldState={fieldState}
            minVal={minVal}
            maxVal={maxVal}
            step={step}
            minStepsBetweenThumbs={minStepsBetweenThumbs}
            description={description}
            defaultValue={componentDefaultValue}
          />
        )}
      />
    </FormItem>
  );
}
