'use client';

import { FormField } from '@/types';

interface FieldProps {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
  error?: string;
}

export function FieldTypeRegistry({ field, value, onChange, error: _error }: FieldProps) {
  const commonClasses =
    'w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none placeholder-slate-400 shadow-sm transition-all';

  switch (field.type) {
    case 'Long Text':
      return (
        <textarea
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={commonClasses}
        />
      );

    case 'Dropdown':
      return (
        <select value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} className={commonClasses}>
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
            <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
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
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
          <input
            type="checkbox"
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
              <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
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
          value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label}`}
          className={commonClasses}
        />
      );
  }
}
