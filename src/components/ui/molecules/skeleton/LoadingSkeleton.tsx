import React from 'react';
import { Skeleton } from './Skeleton';

// Original LoadingSkeleton for Campaign Details
export const UICampaignDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-5 animate-pulse font-work-sans">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 font-work-sans" />
      
      {/* Campaign Details Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 font-work-sans">
        <div className="flex justify-between items-start mb-6 font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-1/4 font-work-sans" />
          <div className="h-6 bg-gray-200 rounded w-16 font-work-sans" />
        </div>
        <div className="space-y-4 font-work-sans">
          {[...Array(3)].map((_, i) =>
          <div key={i} className="h-4 bg-gray-200 rounded w-full font-work-sans" />
          )}
        </div>
      </div>

      {/* Objectives Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 font-work-sans">
        <div className="flex justify-between items-start mb-6 font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-1/3 font-work-sans" />
          <div className="h-6 bg-gray-200 rounded w-16 font-work-sans" />
        </div>
        <div className="space-y-4 font-work-sans">
          {[...Array(4)].map((_, i) =>
          <div key={i} className="h-4 bg-gray-200 rounded w-full font-work-sans" />
          )}
        </div>
      </div>

      {/* Audience Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 font-work-sans">
        <div className="flex justify-between items-start mb-6 font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-1/4 font-work-sans" />
          <div className="h-6 bg-gray-200 rounded w-16 font-work-sans" />
        </div>
        <div className="space-y-4 font-work-sans">
          {[...Array(3)].map((_, i) =>
          <div key={i} className="h-4 bg-gray-200 rounded w-full font-work-sans" />
          )}
        </div>
      </div>

      {/* Creative Assets Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 font-work-sans">
        <div className="flex justify-between items-start mb-6 font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-1/3 font-work-sans" />
          <div className="h-6 bg-gray-200 rounded w-16 font-work-sans" />
        </div>
        {[...Array(2)].map((_, i) =>
        <div key={i} className="border rounded-lg p-4 mb-4 font-work-sans">
            <div className="h-48 bg-gray-200 rounded mb-4 font-work-sans" />
            <div className="grid grid-cols-2 gap-4 font-work-sans">
              {[...Array(4)].map((_, j) =>
            <div key={j} className="h-4 bg-gray-200 rounded font-work-sans" />
            )}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mt-8 font-work-sans">
        <div className="h-10 bg-gray-200 rounded font-work-sans" />
      </div>
    </div>);

};

// More dynamic and contextual skeleton structure
interface SkeletonSectionProps {
  title?: boolean;
  titleWidth?: string;
  actionButton?: boolean;
  lines?: number;
  lineHeight?: string;
  children?: React.ReactNode;
  className?: string;
}

export const SkeletonSection: React.FC<SkeletonSectionProps> = ({
  title = true,
  titleWidth = 'w-1/4',
  actionButton = true,
  lines = 3,
  lineHeight = 'h-4',
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6 ${className} font-work-sans`}>
      {title &&
      <div className="flex justify-between items-start mb-4 md:mb-6 font-work-sans">
          <div className={`h-5 md:h-6 bg-gray-200 rounded ${titleWidth} md:${titleWidth} font-work-sans`} />
          {actionButton && <div className="h-5 md:h-6 bg-gray-200 rounded w-10 md:w-16 font-work-sans" />}
        </div>
      }
      {lines > 0 &&
      <div className="space-y-3 md:space-y-4 font-work-sans">
          {[...Array(lines)].map((_, i) =>
        <div key={i} className={`${lineHeight} bg-gray-200 rounded w-full font-work-sans`} />
        )}
        </div>
      }
      {children}
    </div>);

};

// Form field skeleton for different field types
interface FormFieldSkeletonProps {
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

// Improved Wizard Skeleton with contextual step content
export const WizardSkeleton: React.FC<{
  step?: number;
  hasProgressBar?: boolean;
  hasHeader?: boolean;
  maxWidth?: string;
  stepContent?: React.ReactNode;
}> = ({
  step = 1,
  hasProgressBar = true,
  hasHeader = true,
  maxWidth = "max-w-6xl",
  stepContent
}) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto p-4 md:p-5 animate-pulse font-work-sans`}>
      {/* Header Skeleton */}
      {hasHeader &&
      <div className="h-8 bg-gray-200 rounded w-full md:w-1/3 mb-6 md:mb-8 font-work-sans" />
      }
      
      {/* Progress Bar */}
      {hasProgressBar &&
      <div className="mb-6 md:mb-8 font-work-sans">
          <div className="h-2 bg-gray-200 rounded-full w-full mb-4 font-work-sans" />
          <div className="flex justify-between font-work-sans">
            {[1, 2, 3, 4, 5].map((s) =>
          <div
            key={s}
            className={`h-6 bg-gray-200 rounded ${s === step ? 'w-14 md:w-24' : 'w-10 md:w-16'} font-work-sans`} />

          )}
          </div>
        </div>
      }
      
      {/* Custom Step Content if provided, otherwise generate default for the step */}
      {stepContent ?
      stepContent :

      <>
          {/* Basic Description Section */}
          <SkeletonSection lines={3} titleWidth="w-1/2 md:w-1/3" />
          
          {/* Form Fields Section - Different for each step */}
          <SkeletonSection
          title={true}
          titleWidth="w-1/2 md:w-1/3"
          lines={0}>

            <div className="space-y-4 md:space-y-6 font-work-sans">
              {/* Step 1: Campaign Details */}
              {step === 1 &&
            <>
                  <FormFieldSkeleton type="text" labelWidth="w-1/3 md:w-1/4" />
                  <FormFieldSkeleton type="textarea" labelWidth="w-1/3 md:w-1/4" />
                  <FormFieldSkeleton type="select" labelWidth="w-1/3 md:w-1/4" />
                  <FormFieldSkeleton type="datepicker" labelWidth="w-1/3 md:w-1/4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-work-sans">
                    <FormFieldSkeleton type="text" labelWidth="w-1/2 md:w-1/3" />
                    <FormFieldSkeleton type="text" labelWidth="w-1/2 md:w-1/3" />
                  </div>
                </>
            }
              
              {/* Step 2: Campaign Objectives */}
              {step === 2 &&
            <>
                  <FormFieldSkeleton type="radio" labelWidth="w-1/3 md:w-1/4" />
                  <FormFieldSkeleton type="checkbox" labelWidth="w-1/3 md:w-1/4" />
                  <FormFieldSkeleton type="text" labelWidth="w-1/3 md:w-1/4" />
                  <FormFieldSkeleton type="textarea" labelWidth="w-1/3 md:w-1/4" />
                </>
            }
              
              {/* Step 3: Audience */}
              {step === 3 &&
            <>
                  <FormFieldSkeleton type="select" labelWidth="w-1/3 md:w-1/4" />
                  <div className="mb-6 font-work-sans">
                    <div className="h-4 md:h-5 bg-gray-200 rounded w-1/3 md:w-1/4 mb-2 font-work-sans" />
                    <div className="h-8 bg-gray-200 rounded-full w-full font-work-sans" />
                    <div className="flex justify-between mt-2 font-work-sans">
                      {[...Array(6)].map((_, i) =>
                  <div key={i} className="h-3 bg-gray-200 rounded w-8 font-work-sans" />
                  )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-work-sans">
                    <FormFieldSkeleton type="checkbox" labelWidth="w-1/2 md:w-1/3" />
                    <FormFieldSkeleton type="checkbox" labelWidth="w-1/2 md:w-1/3" />
                  </div>
                </>
            }
              
              {/* Step 4: Creative Assets */}
              {step === 4 &&
            <>
                  <FormFieldSkeleton type="upload" labelWidth="w-1/3 md:w-1/4" />
                  <div className="space-y-4 font-work-sans">
                    {[...Array(2)].map((_, i) =>
                <div key={i} className="border rounded-lg p-3 md:p-4 font-work-sans">
                        <div className="flex justify-between mb-3 font-work-sans">
                          <div className="h-5 bg-gray-200 rounded w-1/4 font-work-sans" />
                          <div className="h-5 bg-gray-200 rounded w-8 font-work-sans" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 font-work-sans">
                          <div className="h-32 md:h-40 bg-gray-200 rounded font-work-sans" />
                          <div className="md:col-span-2 space-y-3 font-work-sans">
                            <FormFieldSkeleton type="text" labelWidth="w-1/3" />
                            <FormFieldSkeleton type="select" labelWidth="w-1/3" />
                            <FormFieldSkeleton type="text" labelWidth="w-1/3" />
                          </div>
                        </div>
                      </div>
                )}
                  </div>
                </>
            }
              
              {/* Step 5: Review & Submit */}
              {step === 5 &&
            <>
                  <SkeletonSection lines={2} title={true} titleWidth="w-1/2 md:w-1/4" className="mb-6" />
                  <SkeletonSection lines={3} title={true} titleWidth="w-1/2 md:w-1/4" className="mb-6" />
                  <SkeletonSection lines={2} title={true} titleWidth="w-1/2 md:w-1/4" className="mb-6" />
                  <SkeletonSection title={true} titleWidth="w-1/2 md:w-1/4" lines={0}>
                    <div className="space-y-4 font-work-sans">
                      {[...Array(2)].map((_, i) =>
                  <div key={i} className="border rounded-lg p-3 md:p-4 font-work-sans">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-work-sans">
                            <div className="h-24 md:h-32 bg-gray-200 rounded font-work-sans" />
                            <div className="md:col-span-2 space-y-3 font-work-sans">
                              {[...Array(3)].map((_, j) =>
                        <div key={j} className="h-4 bg-gray-200 rounded w-full font-work-sans" />
                        )}
                            </div>
                          </div>
                        </div>
                  )}
                    </div>
                  </SkeletonSection>
                </>
            }
            </div>
          </SkeletonSection>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 md:mt-8 font-work-sans">
            <div className="h-8 md:h-10 bg-gray-200 rounded w-20 md:w-24 font-work-sans" />
            <div className="flex space-x-2 md:space-x-3 font-work-sans">
              <div className="h-8 md:h-10 bg-gray-200 rounded w-24 md:w-32 font-work-sans" />
              <div className="h-8 md:h-10 bg-gray-200 rounded w-20 md:w-24 font-work-sans" />
            </div>
          </div>
        </>
      }
    </div>);

};

// Table Skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  cols?: number;
  hasHeader?: boolean;
  hasFilter?: boolean;
  colWidths?: string[];
}> = ({
  rows = 5,
  cols = 4,
  hasHeader = true,
  hasFilter = false,
  colWidths
}) => {
  return (
    <div className="w-full animate-pulse font-work-sans">
      {/* Search and Filter Bar */}
      {hasFilter &&
      <div className="flex justify-between items-center mb-6 font-work-sans">
          <div className="h-8 md:h-10 bg-gray-200 rounded w-64 md:w-80 font-work-sans" />
          <div className="flex space-x-2 md:space-x-3 font-work-sans">
            <div className="h-8 md:h-10 bg-gray-200 rounded w-24 font-work-sans" />
            <div className="h-8 md:h-10 bg-gray-200 rounded w-24 font-work-sans" />
          </div>
        </div>
      }

      {/* Header */}
      {hasHeader &&
      <div className="flex border-b pb-4 mb-4 font-work-sans">
          {[...Array(cols)].map((_, i) =>
        <div
          key={i}
          className="h-6 bg-gray-200 rounded flex-1 mr-4 last:mr-0 font-work-sans"
          style={{
            maxWidth: colWidths ? colWidths[i] :
            i === 0 ? '30%' : i === cols - 1 ? '15%' : 'auto'
          }} />

        )}
        </div>
      }
      
      {/* Rows */}
      {[...Array(rows)].map((_, i) =>
      <div key={i} className="flex py-4 border-b font-work-sans">
          {[...Array(cols)].map((_, j) =>
        <div
          key={j}
          className="h-5 bg-gray-200 rounded flex-1 mr-4 last:mr-0 font-work-sans"
          style={{
            maxWidth: colWidths ? colWidths[j] :
            j === 0 ? '30%' : j === cols - 1 ? '15%' : 'auto'
          }} />

        )}
        </div>
      )}
    </div>);

};

// Form Skeleton with more customization
export const UIFormSkeleton: React.FC<{
  fields?: number;
  layout?: 'stack' | 'grid';
  hasSubmit?: boolean;
  fieldTypes?: ('text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'datepicker' | 'upload')[];
}> = ({
  fields = 6,
  layout = 'stack',
  hasSubmit = true,
  fieldTypes
}) => {
  // If specific field types aren't provided, use text fields
  const types = fieldTypes || Array(fields).fill('text');

  return (
    <div className="max-w-2xl animate-pulse font-work-sans">
      <div className={`${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6' : 'space-y-4 md:space-y-6'} font-work-sans`}>
        {[...Array(fields)].map((_, i) =>
        <FormFieldSkeleton key={i} type={types[i] || 'text'} />
        )}
      </div>
      
      {hasSubmit &&
      <div className="mt-8 flex justify-end font-work-sans">
          <div className="h-8 md:h-10 bg-gray-200 rounded w-24 md:w-32 font-work-sans" />
        </div>
      }
    </div>);

};

// Authentication Skeleton with more options
export const AuthSkeleton: React.FC<{
  variant?: 'signin' | 'signup' | 'loading';
  showLogo?: boolean;
  logoSize?: string;
}> = ({
  variant = 'loading',
  showLogo = true,
  logoSize = 'h-16 w-16'
}) => {
  return (
    <div className="animate-pulse font-work-sans">
      {showLogo &&
      <div className={`${logoSize} bg-gray-200 rounded-full mx-auto mb-6 font-work-sans`} />
      }
      
      {variant === 'loading' &&
      <>
          <div className="h-5 bg-gray-200 rounded w-48 mx-auto mb-4 font-work-sans" />
          <div className="h-5 bg-gray-200 rounded w-32 mx-auto font-work-sans" />
        </>
      }
      
      {variant === 'signin' &&
      <div className="max-w-sm mx-auto font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-40 mx-auto mb-8 font-work-sans" />
          <div className="space-y-4 font-work-sans">
            <FormFieldSkeleton type="text" />
            <FormFieldSkeleton type="text" />
            <div className="h-9 bg-gray-200 rounded w-full mt-6 font-work-sans" />
          </div>
        </div>
      }
      
      {variant === 'signup' &&
      <div className="max-w-sm mx-auto font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-40 mx-auto mb-8 font-work-sans" />
          <div className="space-y-4 font-work-sans">
            <FormFieldSkeleton type="text" />
            <FormFieldSkeleton type="text" />
            <FormFieldSkeleton type="text" />
            <FormFieldSkeleton type="text" />
            <div className="h-9 bg-gray-200 rounded w-full mt-6 font-work-sans" />
          </div>
        </div>
      }
    </div>);

};

// Dashboard Skeleton
export const UIDashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full animate-pulse font-work-sans">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-8 font-work-sans">
        <div className="h-8 bg-gray-200 rounded w-1/4 font-work-sans" />
        <div className="flex space-x-3 font-work-sans">
          <div className="h-8 bg-gray-200 rounded w-32 font-work-sans" />
          <div className="h-8 bg-gray-200 rounded w-8 font-work-sans" />
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 font-work-sans">
        {[...Array(3)].map((_, i) =>
        <div key={i} className="bg-white rounded-lg shadow p-4 md:p-6 font-work-sans">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2 font-work-sans" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4 font-work-sans" />
            <div className="h-2 bg-gray-200 rounded-full w-full font-work-sans" />
          </div>
        )}
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-work-sans">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 md:p-6 font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 font-work-sans" />
          <TableSkeleton rows={3} hasFilter={false} />
        </div>
        
        {/* Side Chart */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 font-work-sans">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 font-work-sans" />
          <div className="h-64 bg-gray-200 rounded mb-4 font-work-sans" />
          <div className="space-y-2 font-work-sans">
            {[...Array(3)].map((_, i) =>
            <div key={i} className="flex justify-between font-work-sans">
                <div className="h-4 bg-gray-200 rounded w-1/3 font-work-sans" />
                <div className="h-4 bg-gray-200 rounded w-1/5 font-work-sans" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

};

// Legacy LoadingSkeleton for backward compatibility
const LoadingSkeleton: React.FC = UICampaignDetailSkeleton;

export default LoadingSkeleton;

// Export all components for easy imports
export { Skeleton };