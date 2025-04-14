/**
 * @component LanguageSelector
 * @category organism
 * @description Reusable language selection component using Command (multi/single select), integrated with RHF.
 * Uses Shadcn UI Popover, Command, Button and RHF Controller.
 * @status 10th April
 */

'use client';

import React, { useState } from 'react';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FormLabel, FormItem, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon/icon";
import { cn } from "@/lib/utils";

// Define structure for language options
interface LanguageOption {
    value: string;
    label: string;
}

// Mock data (can be replaced by props or fetched data)
const MOCK_LANGUAGES: LanguageOption[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
];

interface LanguageSelectorProps<TFieldValues extends FieldValues = FieldValues> {
    /** React Hook Form name prop */
    name: FieldPath<TFieldValues>;
    /** React Hook Form control prop */
    control: Control<TFieldValues>;
    /** Optional label for the form item */
    label?: string;
    /** Optional description text */
    description?: string;
    /** Placeholder text for the trigger button */
    placeholder?: string;
    /** Array of language options { value: string, label: string } */
    options?: LanguageOption[];
    /** Allow selecting multiple languages (default: true) */
    allowMultiple?: boolean;
}

export function LanguageSelector<TFieldValues extends FieldValues = FieldValues>(
    {
        name,
        control,
        label,
        description,
        placeholder = "Select language(s)...",
        options = MOCK_LANGUAGES,
        allowMultiple = true,
    }: LanguageSelectorProps<TFieldValues>
) {
    const [open, setOpen] = useState(false);

    return (
        <Controller
            name={name}
            control={control}
            // Set RHF default based on allowMultiple
            defaultValue={allowMultiple ? ([] as any) : (undefined as any)}
            render={({ field, fieldState }) => {
                // Ensure field.value is handled correctly for single/multi select
                const selectedValues: string[] = allowMultiple
                    ? (Array.isArray(field.value) ? field.value : [])
                    : (field.value ? [field.value] : []);

                // Handle selection logic for both single and multi-select
                const handleSelect = (value: string) => {
                    if (allowMultiple) {
                        const updated = selectedValues.includes(value)
                            ? selectedValues.filter(v => v !== value)
                            : [...selectedValues, value];
                        field.onChange(updated);
                    } else {
                        field.onChange(value === field.value ? undefined : value); // Toggle single select or set
                        setOpen(false); // Close popover on single select
                    }
                };

                // Generate display text for the trigger button
                const displayText = selectedValues.length > 0
                    ? selectedValues.map(val => options.find(opt => opt.value === val)?.label).filter(Boolean).join(", ")
                    : placeholder;

                return (
                    <FormItem>
                        {label && <FormLabel>{label}</FormLabel>}
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
                                        <span className="truncate">{displayText}</span>
                                        {/* Chevron Icon */}
                                        <Icon
                                            iconId="faChevronDownLight" // Using FontAwesome
                                            className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                        />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search language..." />
                                    <CommandList>
                                        <CommandEmpty>No language found.</CommandEmpty>
                                        <CommandGroup>
                                            {options.map((language) => (
                                                <CommandItem
                                                    key={language.value}
                                                    value={language.label} // Use label for Command search functionality
                                                    onSelect={() => {
                                                        handleSelect(language.value);
                                                    }}
                                                >
                                                    {/* Icon indicating selection state */}
                                                    <Icon
                                                        iconId={selectedValues.includes(language.value)
                                                            ? (allowMultiple ? "faCheckSquareSolid" : "faCircleDotLight") // Check square for multi, dot for single
                                                            : "faSquareLight"}
                                                        className={cn("mr-2 h-4 w-4", selectedValues.includes(language.value) ? "opacity-100" : "opacity-50")}
                                                        aria-hidden="true"
                                                    />
                                                    {language.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {description && <FormDescription>{description}</FormDescription>}
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                    </FormItem>
                );
            }}
        />
    );
}