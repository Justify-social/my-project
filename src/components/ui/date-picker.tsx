/**
 * @component DatePicker
 * @category atom
 * @renderType client
 * @description A date picker component for selecting dates
 * @since 2023-07-15
 */

'use client';
import React from 'react';

interface DatePickerProps {
    id?: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    minDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => {
    return (
        <input
            type="date"
            id={props.id}
            value={props.value ? props.value.toISOString().split('T')[0] : ''}
            onChange={(e) => props.onChange(e.target.value ? new Date(e.target.value) : null)}
            placeholder={props.placeholder}
            min={props.minDate ? props.minDate.toISOString().split('T')[0] : undefined}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00BFFF] focus:ring-[#00BFFF] font-work-sans p-2"
        />
    );
};

export default DatePicker;

