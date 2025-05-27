/**
 * @component DateTimePicker
 * @category molecule
 * @subcategory input
 * @description Simple and reliable datetime picker using existing Shadcn components
 * @status active
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';

interface DateTimePickerProps {
  id?: string;
  value?: string | Date; // ISO string, datetime-local format, or Date object
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  disabled = false,
  className,
  label,
  description,
  required = false,
  placeholder = 'Pick a date and time',
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeValue, setTimeValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial value
  useEffect(() => {
    if (value) {
      try {
        const date = typeof value === 'string' ? new Date(value) : value;
        if (isValid(date)) {
          setSelectedDate(date);
          setTimeValue(format(date, 'HH:mm'));
        }
      } catch (error) {
        console.warn('Invalid date value provided:', value, error);
      }
    } else {
      setSelectedDate(undefined);
      setTimeValue('');
    }
  }, [value]);

  // Combine date and time and notify parent
  const updateDateTime = (newDate?: Date, newTime?: string) => {
    const dateToUse = newDate !== undefined ? newDate : selectedDate;
    const timeToUse = newTime !== undefined ? newTime : timeValue;

    if (dateToUse && timeToUse) {
      try {
        // Parse time (HH:mm format)
        const [hours, minutes] = timeToUse.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const combined = new Date(dateToUse);
          combined.setHours(hours, minutes, 0, 0);

          // Return in datetime-local format for compatibility
          const isoString = combined.toISOString();
          const datetimeLocal = isoString.slice(0, 16); // YYYY-MM-DDTHH:mm
          onChange?.(datetimeLocal);
        }
      } catch (error) {
        console.warn('Error combining date and time:', error);
      }
    } else if (!dateToUse && !timeToUse) {
      onChange?.('');
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    updateDateTime(date, undefined);
    if (date && !timeValue) {
      // Set default time to current time when date is selected
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      setTimeValue(currentTime);
      updateDateTime(date, currentTime);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    updateDateTime(undefined, newTime);
  };

  const clearDateTime = () => {
    setSelectedDate(undefined);
    setTimeValue('');
    onChange?.('');
    setIsOpen(false);
  };

  const setToNow = () => {
    const now = new Date();
    setSelectedDate(now);
    setTimeValue(format(now, 'HH:mm'));
    updateDateTime(now, format(now, 'HH:mm'));
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (selectedDate && timeValue) {
      return `${format(selectedDate, 'PPP')} at ${timeValue}`;
    }
    return '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <Icon iconId="faCalendarLight" className="mr-2 h-4 w-4" />
            {getDisplayValue() || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-3 p-3">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={disabled}
                initialFocus
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2 border-t pt-3">
              <Label className="text-sm font-medium">Time</Label>
              <div className="relative">
                <Icon
                  iconId="faClockLight"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  disabled={disabled || !selectedDate}
                  className="pl-10"
                  placeholder="HH:MM"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setToNow}
                disabled={disabled}
                className="flex items-center gap-1 flex-1"
              >
                <Icon iconId="faClockLight" className="h-3 w-3" />
                Now
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearDateTime}
                disabled={disabled || (!selectedDate && !timeValue)}
                className="flex items-center gap-1 flex-1"
              >
                <Icon iconId="faXmarkLight" className="h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
