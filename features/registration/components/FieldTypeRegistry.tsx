'use client';
import { FormField } from '@/types';

interface FieldProps {
  field: FormField;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export function FieldTypeRegistry({ field, value, onChange, error }: FieldProps) {
  const commonClasses =
    'w-full p-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-500 transition-all';

  switch (field.type) {
    case 'Long Text':
      return (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={commonClasses}
        />
      );

    case 'Dropdown':
      return (
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses}>
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
            <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="radio"
                name={field.fieldId}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="text-sky-500 focus:ring-sky-500"
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case 'Checkbox':
      return (
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded text-sky-500 focus:ring-sky-500"
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
              <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...arr, opt]);
                    else onChange(arr.filter((item: string) => item !== opt));
                  }}
                  className="rounded text-sky-500 focus:ring-sky-500"
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
        <div className="p-3 bg-slate-900 border border-dashed border-slate-700 rounded-xl text-center space-y-1">
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0]?.name || 'uploaded-file.pdf')}
            className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
          />
          {value && <p className="text-[11px] text-emerald-400 font-medium">File selected: {value}</p>}
        </div>
      );

    default:
      // Short Text, Email, Phone, Enrollment Number, College Name, Department, Year, Division, Team Name, Number, URL, GitHub, LinkedIn, etc.
      return (
        <input
          type={field.type === 'Number' ? 'number' : field.type === 'Email' ? 'email' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label}`}
          className={commonClasses}
        />
      );
  }
}
