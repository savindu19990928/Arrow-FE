import React, { useId } from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const inputClasses =
'h-11 w-full rounded-md border border-line bg-surface px-3.5 text-sm text-fg placeholder:text-subtle transition-colors duration-150 ease-out focus:border-fg/60 focus:outline-none focus:ring-1 focus:ring-fg/40 disabled:opacity-60';

export function TextField({ label, error, hint, id, className = '', ...props }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error || hint ? `${fieldId}-desc` : undefined;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-fg/90">
        {label}
        {props.required && <span className="ml-0.5 text-subtle">*</span>}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputClasses} ${error ? 'border-danger/60' : ''}`}
        {...props} />
      
      {error ?
      <p id={describedBy} className="mt-1.5 text-xs text-danger">
          {error}
        </p> :
      hint ?
      <p id={describedBy} className="mt-1.5 text-xs text-subtle">
          {hint}
        </p> :
      null}
    </div>);

}