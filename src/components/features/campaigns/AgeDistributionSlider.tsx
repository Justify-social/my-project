'use client';

import React from 'react';
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface AgeDistributionSliderProps {
  values: number[];
  onChange: (newValues: number[]) => void;
}

export default function AgeDistributionSlider({
  values,
  onChange
}: AgeDistributionSliderProps) {
  const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

  const handleSliderChange = (index: number, newValue: number) => {
    let newValues = [...values];
    const oldValue = newValues[index];

    // Ensure newValue is between 0 and 100
    newValue = Math.max(0, Math.min(100, newValue));

    // Calculate the difference to distribute
    const diff = newValue - oldValue;

    // If increasing one value, decrease others proportionally
    if (diff > 0) {
      const availableToDecrease = newValues.reduce((sum, val, i) =>
      i !== index ? sum + val : sum, 0);

      if (availableToDecrease > 0) {
        newValues = newValues.map((val, i) => {
          if (i === index) return newValue;
          const decrease = val / availableToDecrease * diff;
          return Math.max(0, val - decrease);
        });
      }
    }
    // If decreasing one value, increase others proportionally
    else if (diff < 0) {
      const availableToIncrease = 100 - newValues.reduce((sum, val, i) =>
      i !== index ? sum + val : sum, 0);

      if (availableToIncrease > 0) {
        const totalOthers = newValues.reduce((sum, val, i) =>
        i !== index ? sum + val : sum, 0);

        newValues = newValues.map((val, i) => {
          if (i === index) return newValue;
          const increase = val / totalOthers * Math.abs(diff);
          return val + increase;
        });
      }
    }

    // Round all values and ensure they sum to 100
    newValues = newValues.map((v) => Math.round(v));
    const total = newValues.reduce((sum, v) => sum + v, 0);

    if (total !== 100) {
      const difference = 100 - total;
      // Find largest value that's not the current index
      const maxIndex = newValues.
      map((v, i) => i !== index ? v : -1).
      reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

      if (maxIndex >= 0) {
        newValues[maxIndex] += difference;
      }
    }

    onChange(newValues);
  };

  return (
    <div className="mb-6 font-work-sans">
      <p className="text-sm text-gray-600 mb-4 font-work-sans">
        Adjust the sliders to allocate percentages across age groups. The total must equal 100%.
      </p>
      
      <div className="space-y-4 font-work-sans">
        {ageGroups.map((group, index) =>
        <div key={group} className="flex items-center gap-4 font-work-sans">
            <span className="w-16 text-sm font-medium font-work-sans">{group}</span>
            <div className="flex-grow font-work-sans">
              <Slider
              min={0}
              max={100}
              step={1}
              value={values[index]}
              onChange={(value) => handleSliderChange(index, typeof value === 'number' ? value : value[0])}
              className="slider-blue"
              trackStyle={{
                backgroundColor: '#2563EB',
                height: 4,
                transition: 'all 0.3s ease'
              }}
              handleStyle={{
                borderColor: '#2563EB',
                backgroundColor: '#2563EB',
                opacity: 1,
                boxShadow: '0 0 0 5px rgba(37, 99, 235, 0.1)',
                width: 16,
                height: 16,
                marginTop: -6,
                transition: 'all 0.3s ease'
              }}
              railStyle={{
                backgroundColor: '#E5E7EB',
                height: 4
              }} />

            </div>
            <span className="w-12 text-right text-sm font-medium font-work-sans">
              {Math.round(values[index])}%
            </span>
          </div>
        )}
      </div>
    </div>);

}