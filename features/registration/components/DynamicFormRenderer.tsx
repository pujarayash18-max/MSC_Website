'use client';
import { useState } from 'react';
import { Event, FormSection, FormField } from '@/types';
import { FieldTypeRegistry } from './FieldTypeRegistry';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const DEFAULT_SECTIONS: FormSection[] = [
  {
    sectionId: 'sec_personal',
    title: 'Personal & Academic Information',
    displayOrder: 1,
    fields: [
      { fieldId: 'f_name', label: 'Full Name', type: 'Short Text', required: true, displayOrder: 1, placeholder: 'Rahul Sharma' },
      { fieldId: 'f_email', label: 'College Email Address', type: 'Email', required: true, displayOrder: 2, placeholder: 'student@marwadiuniversity.ac.in' },
      { fieldId: 'f_enroll', label: 'Enrollment Number', type: 'Enrollment Number', required: true, displayOrder: 3, placeholder: '92100103045' },
      { fieldId: 'f_dept', label: 'Department / Branch', type: 'Dropdown', required: true, displayOrder: 4, options: ['Computer Engineering', 'Information Technology', 'AI & ML', 'Data Science', 'Electronics & Communication', 'Mechanical'] },
      { fieldId: 'f_year', label: 'Academic Year', type: 'Dropdown', required: true, displayOrder: 5, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] }
    ]
  },
  {
    sectionId: 'sec_additional',
    title: 'Additional Questions & Swag Info',
    displayOrder: 2,
    fields: [
      { fieldId: 'f_tshirt', label: 'T-Shirt Size (for Swag Pack)', type: 'Dropdown', required: false, displayOrder: 1, options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { fieldId: 'f_github', label: 'GitHub Profile URL', type: 'GitHub Profile', required: false, displayOrder: 2, placeholder: 'https://github.com/username' },
      { fieldId: 'f_experience', label: 'Prior Azure Experience Level', type: 'Radio', required: true, displayOrder: 3, options: ['Beginner (No experience)', 'Intermediate (Used Azure Portal)', 'Advanced (Certified / Professional)'] }
    ]
  }
];

export interface DynamicFormRendererProps {
  event: Event;
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function DynamicFormRenderer({ event, onSubmit }: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (fieldId: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate required fields
    DEFAULT_SECTIONS.forEach((sec) => {
      sec.fields.forEach((f) => {
        if (f.required && (!formData[f.fieldId] || formData[f.fieldId] === '')) {
          newErrors[f.fieldId] = `${f.label} is required`;
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmit) onSubmit(formData);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {DEFAULT_SECTIONS.map((section) => (
        <Card key={section.sectionId} className="p-6 space-y-4 border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 text-sky-400">
            {section.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.fieldId} className={field.type === 'Long Text' ? 'md:col-span-2' : ''}>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>

                <FieldTypeRegistry
                  field={field}
                  value={formData[field.fieldId]}
                  onChange={(val) => handleChange(field.fieldId, val)}
                  error={errors[field.fieldId]}
                />

                {errors[field.fieldId] && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors[field.fieldId]}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          Submitting generates a unique QR Pass linked to your enrollment number.
        </p>

        <Button type="submit" variant="fluent" size="lg" isLoading={isSubmitting}>
          <CheckCircle2 className="w-4 h-4" /> Confirm Registration
        </Button>
      </div>
    </form>
  );
}
