import React, { useId } from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, id, className = '', rows = 4, ...props }: TextAreaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-fg/90">
        {label}
        {props.required && <span className="ml-0.5 text-subtle">*</span>}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-subtle transition-colors duration-150 ease-out focus:border-fg/60 focus:outline-none focus:ring-1 focus:ring-fg/40 ${
        error ? 'border-danger/60' : 'border-line'}`
        }
        {...props} />
      
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>);

}