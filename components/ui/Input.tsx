import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        className={`px-3 py-2 bg-white text-slate-900 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
        {...props}
      />
      {helperText && <span className="text-xs text-slate-500">{helperText}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};