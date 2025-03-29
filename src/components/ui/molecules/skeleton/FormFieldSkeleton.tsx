import React from 'react';

// Form field skeleton for different field types
export interface FormFieldSkeletonProps {
  type?: 'text' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'datepicker' | 'upload';
  label?: boolean;
  labelWidth?: string;
}

export const FormFieldSkeleton: React.FC<FormFieldSkeletonProps> = ({
  type = 'text',
  label = true,
  labelWidth = 'w-1/4'
}) => {
  return (
    <div className="mb-4 font-work-sans">
      {label &&
      <div className={`h-4 md:h-5 bg-gray-200 rounded ${labelWidth} mb-2 font-work-sans`} />
      }
      
      {type === 'text' &&
      <div className="h-8 md:h-10 bg-gray-200 rounded w-full font-work-sans" />
      }
      
      {type === 'textarea' &&
      <div className="h-24 md:h-32 bg-gray-200 rounded w-full font-work-sans" />
      }
      
      {type === 'select' &&
      <div className="h-8 md:h-10 bg-gray-200 rounded w-full font-work-sans" />
      }
      
      {type === 'datepicker' &&
      <div className="h-8 md:h-10 bg-gray-200 rounded w-full font-work-sans" />
      }
      
      {type === 'checkbox' &&
      <div className="flex items-center font-work-sans">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2 font-work-sans" />
          <div className="h-4 bg-gray-200 rounded w-32 font-work-sans" />
        </div>
      }
      
      {type === 'radio' &&
      <div className="space-y-2 font-work-sans">
          {[...Array(3)].map((_, i) =>
        <div key={i} className="flex items-center font-work-sans">
              <div className="h-4 w-4 bg-gray-200 rounded-full mr-2 font-work-sans" />
              <div className="h-4 bg-gray-200 rounded w-24 font-work-sans" />
            </div>
        )}
        </div>
      }
      
      {type === 'upload' &&
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center font-work-sans">
          <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-3 font-work-sans" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2 font-work-sans" />
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto font-work-sans" />
        </div>
      }
    </div>);
};

export default FormFieldSkeleton; 