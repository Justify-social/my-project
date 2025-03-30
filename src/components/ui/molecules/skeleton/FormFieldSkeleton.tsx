import React from 'react';
import { FormFieldSkeleton as LoadingFormFieldSkeleton } from './LoadingSkeleton';

// Form field skeleton for different field types
export interface FormFieldSkeletonProps {
  type?: 'text' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'datepicker' | 'upload';
  label?: boolean;
  labelWidth?: string;
}

const FormFieldSkeleton: React.FC<FormFieldSkeletonProps> = (props) => {
  return <LoadingFormFieldSkeleton {...props} />;
};

export default FormFieldSkeleton; 