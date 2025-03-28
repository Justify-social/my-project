import React from 'react';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  title?: string;
}

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`px-6 py-4 border-b border-[var(--divider-color)] ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

const Card: React.FC<CardProps> = ({
  className = '',
  children,
  title,
}) => {
  return (
    <div className={`bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] shadow-sm mb-6 ${className}`}>
      {title && (
        <CardHeader>
          <h3 className="text-xl font-semibold text-[var(--primary-color)]">{title}</h3>
        </CardHeader>
      )}
      {children}
    </div>
  );
};

export default Card; 