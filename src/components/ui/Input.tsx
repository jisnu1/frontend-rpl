import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon: LeftIcon, rightIcon: RightIcon, className = '', type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    
    // Switch between text and password type
    const actualType = isPasswordType 
      ? (showPassword ? 'text' : 'password') 
      : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        
        <div className="relative w-full group">
          {LeftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <LeftIcon className="w-4 h-4" />
            </span>
          )}
          
          <input
            ref={ref}
            type={actualType}
            className={`w-full bg-[#F1F5F9] border-none rounded-full py-2.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none ${
              LeftIcon ? 'pl-11' : 'pl-4'
            } ${
              (RightIcon || isPasswordType) ? 'pr-11' : 'pr-4'
            } ${
              error ? 'ring-2 ring-error/50 focus:ring-error' : ''
            } ${className}`}
            {...props}
          />
          
          {/* Toggle Password Visibility for password type */}
          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : (
            RightIcon && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <RightIcon className="w-4 h-4" />
              </span>
            )
          )}
        </div>
        
        {error && (
          <span className="text-[10px] font-bold text-error mt-0.5 px-2">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

