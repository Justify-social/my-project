/**
 * @component DatePicker
 * @category molecule
 * @subcategory input
 * @description A date picker component with calendar integration.
 * @status stable
 * @since 2023-07-15
 */
'use client'

import * as React from "react"
import { format } from "date-fns"
import { Icon } from "@/components/ui/icon/icon"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Update props interface
interface DatePickerProps {
    id?: string; // Keep id if needed for external labels
    value?: Date | null; // Make value optional for uncontrolled state
    onChange?: (date: Date | undefined) => void; // Change signature slightly for DayPicker
    placeholder?: string;
    // minDate?: Date; // Pass disabled logic directly to Calendar
    disabled?: boolean | ((date: Date) => boolean); // Use Calendar's disabled prop
    className?: string; // Allow styling the trigger button
}

export function DatePicker({
    id,
    value,
    onChange,
    placeholder = "Pick a date",
    disabled,
    className,
}: DatePickerProps) {
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    // Use controlled or uncontrolled state
    const [date, setDate] = React.useState<Date | undefined>(value ?? undefined);

    // Update internal state if controlled value changes
    React.useEffect(() => {
        setDate(value ?? undefined);
    }, [value]);

    const handleSelect = (selectedDate: Date | undefined) => {
        if (!value) { // If uncontrolled, update internal state
            setDate(selectedDate);
        }
        onChange?.(selectedDate); // Call handler prop
        setPopoverOpen(false); // Close popover on select
    }

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground", // Style placeholder text
                        className
                    )}
                    id={id} // Apply id to the button
                    // Disable the button if the entire picker is disabled (if disabled is boolean)
                    disabled={typeof disabled === 'boolean' ? disabled : false}
                >
                    <Icon iconId="faCalendarDaysLight" className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    disabled={disabled} // Pass disabled prop directly
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

// Remove default export if not standard pattern
// export default DatePicker;

