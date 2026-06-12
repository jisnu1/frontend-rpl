import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
  borderAccent?: 'none' | 'primary' | 'success' | 'danger';
}

export default function Card({
  children,
  className = '',
  hoverLift = true,
  borderAccent = 'none',
  ...props
}: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] relative overflow-hidden flex flex-col';
  
  const liftStyles = hoverLift 
    ? 'transition-all duration-200 hover:translate-y-[-3px] hover:shadow-[0px_12px_28px_rgba(15,23,42,0.08)]' 
    : '';

  const borderAccents = {
    none: '',
    primary: 'border-l-4 border-l-primary',
    success: 'border-l-4 border-l-emerald-500',
    danger: 'border-l-4 border-l-error',
  };

  return (
    <div
      className={`${baseStyles} ${liftStyles} ${borderAccents[borderAccent]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
