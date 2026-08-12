'use client';

import { FormField } from '@/types';

interface FieldProps {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled?: boolean;
}

export function FieldTypeRegistry({ field, value, onChange, disabled }: FieldProps) {
  const commonClasses = `w-full p-2.5 text-xs rounded-xl text-slate-900 dark:text-white transition-all ${
    disabled
      ? 'bg-slate-100 dark:bg-[#11161D] border border-slate-300 dark:border-[#2A323D] text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium opacity-90'
      : 'bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm'
  }`;

  switch (field.type) {
    case 'Long Text':
      return (
        <textarea
          rows={3}
          disabled={disabled}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={commonClasses}
        />
      );

    case 'Dropdown':
      return (
        <select disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} className={commonClasses}>
          <option value="">-- Select {field.label} --</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'Radio':
      return (
        <div className="space-y-1.5 pt-1">
          {field.options?.map((opt) => (
            <label key={opt} className={`flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
              <input
                type="radio"
                disabled={disabled}
                name={field.fieldId}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="text-[#00A4EF] focus:ring-[#00A4EF]"
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case 'Checkbox':
      return (
        <label className={`flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 pt-1 ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            disabled={disabled}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded text-[#00A4EF] focus:ring-[#00A4EF]"
          />
          {field.label}
        </label>
      );

    case 'Multi-select':
      return (
        <div className="space-y-1.5 pt-1">
          {field.options?.map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            const checked = arr.includes(opt);
            return (
              <label key={opt} className={`flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...arr, opt]);
                    else onChange(arr.filter((item: string) => item !== opt));
                  }}
                  className="rounded text-[#00A4EF] focus:ring-[#00A4EF]"
                />
                {opt}
              </label>
            );
          })}
        </div>
      );

    case 'File Upload':
    case 'Resume Upload':
    case 'Image Upload':
      return (
        <div className="p-3 bg-slate-50 dark:bg-[#0B0F14] border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-1">
          <input
            type="file"
            disabled={disabled}
            onChange={(e) => onChange(e.target.files?.[0]?.name || 'uploaded-file.pdf')}
            className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0078D4] file:text-white hover:file:bg-[#00A4EF] cursor-pointer"
          />
          {typeof value === 'string' && value ? (
            <p className="text-[11px] text-[#7FBA00] font-medium">File selected: {value}</p>
          ) : null}
        </div>
      );

    default:
      return (
        <input
          type={field.type === 'Number' ? 'number' : field.type === 'Email' ? 'email' : 'text'}
          disabled={disabled}
          readOnly={disabled}
          value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label}`}
          className={commonClasses}
        />
      );
  }
}
