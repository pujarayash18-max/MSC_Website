'use client';

import { useState, useEffect } from 'react';
import { Event, FormSection } from '@/types';
import { FieldTypeRegistry } from './FieldTypeRegistry';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, UserCheck, Loader2, Lock } from 'lucide-react';

const DEFAULT_SECTIONS: FormSection[] = [
  {
    sectionId: 'sec_personal',
    title: 'Personal & Academic Information',
    displayOrder: 1,
    fields: [
      { fieldId: 'full_name', label: 'Full Name', type: 'Short Text', required: true, displayOrder: 1, placeholder: 'Rahul Sharma' },
      { fieldId: 'college_email', label: 'College Email Address', type: 'Email', required: true, displayOrder: 2, placeholder: 'student@marwadiuniversity.ac.in' },
      { fieldId: 'enrollment_number', label: 'Enrollment Number', type: 'Enrollment Number', required: true, displayOrder: 3, placeholder: '92100103045' },
      { fieldId: 'department_branch', label: 'Department / Branch', type: 'Dropdown', required: true, displayOrder: 4, options: ['Computer Engineering', 'Information Technology', 'AI & ML', 'Data Science', 'Electronics & Communication', 'Mechanical'] },
      { fieldId: 'academic_year', label: 'Academic Year', type: 'Dropdown', required: true, displayOrder: 5, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] }
    ]
  },
  {
    sectionId: 'sec_additional',
    title: 'Additional Information',
    displayOrder: 2,
    fields: [
      { fieldId: 'github_profile_url', label: 'GitHub Profile URL', type: 'GitHub Profile', required: false, displayOrder: 1, placeholder: 'https://github.com/username' },
      { fieldId: 'prior_azure_experience_level', label: 'Prior Azure Experience Level', type: 'Radio', required: true, displayOrder: 2, options: ['Beginner (No experience)', 'Intermediate (Used Azure Portal)', 'Advanced (Certified / Professional)'] }
    ]
  }
];

export interface DynamicFormRendererProps {
  event: Event;
  onSubmit?: (data: Record<string, unknown>) => void;
}

const isProfileField = (fieldId: string, label: string) => {
  const k = fieldId.toLowerCase();
  const l = label.toLowerCase();
  return (
    k.includes('name') || l.includes('name') ||
    k.includes('email') || l.includes('email') ||
    k.includes('enroll') || l.includes('enroll') ||
    k.includes('dept') || l.includes('branch') || l.includes('department') ||
    k.includes('year') || l.includes('academic year')
  );
};

export function DynamicFormRenderer({ event, onSubmit }: DynamicFormRendererProps) {
  const { user } = useAuth();
  const [formSections, setFormSections] = useState<FormSection[] | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch custom registration form linked to this specific event
  useEffect(() => {
    const targetEventId = event?.id || (event as any)?.eventId || (event as any)?.slug;
    if (!targetEventId) {
      setFormSections(DEFAULT_SECTIONS);
      setIsLoadingForm(false);
      return;
    }

    setIsLoadingForm(true);
    fetch(`/api/forms?eventId=${encodeURIComponent(targetEventId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.forms && json.data.forms.length > 0) {
          const dbForm = json.data.forms[0];
          if (dbForm.sections && dbForm.sections.length > 0) {
            const mappedSections: FormSection[] = dbForm.sections.map((sec: any) => ({
              sectionId: sec.id,
              title: sec.title,
              displayOrder: sec.displayOrder,
              fields: (sec.fields || []).map((f: any) => {
                const cleanId = f.label
                  ? f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
                  : f.id;
                return {
                  fieldId: cleanId || f.id,
                  label: f.label,
                  type: f.type,
                  required: f.required,
                  placeholder: f.placeholder,
                  options: f.options,
                };
              }),
            }));
            setFormSections(mappedSections);
          } else {
            setFormSections(DEFAULT_SECTIONS);
          }
        } else {
          setFormSections(DEFAULT_SECTIONS);
        }
      })
      .catch(() => {
        setFormSections(DEFAULT_SECTIONS);
      })
      .finally(() => {
        setIsLoadingForm(false);
      });
  }, [event?.id, (event as any)?.eventId, (event as any)?.slug]);

  // Auto-fill from user profile when available
  useEffect(() => {
    if (user && formSections) {
      const u = user as any;
      setFormData((prev) => {
        const next = { ...prev };
        formSections.forEach((sec) => {
          sec.fields.forEach((f) => {
            const k = f.fieldId;
            const l = f.label.toLowerCase();
            if (k.includes('name') || l.includes('name')) next[k] = u.fullName || u.name || '';
            else if (k.includes('email') || l.includes('email')) next[k] = u.email || '';
            else if (k.includes('enroll') || l.includes('enroll')) next[k] = u.enrollmentNumber || u.enrollment || '';
            else if (k.includes('dept') || l.includes('branch') || l.includes('department')) next[k] = u.department || 'Computer Engineering';
            else if (k.includes('year') || l.includes('year')) next[k] = u.year || u.academicYear || '3rd Year';
            else if (k.includes('github') || l.includes('github')) next[k] = u.githubUrl || u.github || next[k] || '';
          });
        });
        return next;
      });
    }
  }, [user, formSections]);

  const handleChange = (fieldId: string, val: unknown) => {
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

    (formSections || DEFAULT_SECTIONS).forEach((sec) => {
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

  if (isLoadingForm || !formSections) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
        <p className="text-xs font-semibold">Loading registration form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {user && (
        <div className="flex items-center gap-2 p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-xs text-sky-400 font-medium">
          <UserCheck className="w-4 h-4 shrink-0 text-[#00A4EF]" />
          <span>Profile verified ({user.fullName || user.email}). Profile details are pre-filled and locked.</span>
        </div>
      )}
      {formSections.map((section) => (
        <Card key={section.sectionId} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-xs font-extrabold text-[#00A4EF] uppercase tracking-wider border-b border-slate-200 dark:border-[#2A323D] pb-2">
            {section.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => {
              const isDisabled = Boolean(user && isProfileField(field.fieldId, field.label));
              return (
                <div key={field.fieldId} className={field.type === 'Long Text' ? 'md:col-span-2' : ''}>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {field.label} {field.required && <span className="text-[#F25022]">*</span>}
                    {isDisabled && (
                      <span className="ml-1.5 text-[10px] text-sky-400 font-normal inline-flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> (Locked)
                      </span>
                    )}
                  </label>

                  <FieldTypeRegistry
                    field={field}
                    value={formData[field.fieldId]}
                    disabled={isDisabled}
                    onChange={(val) => handleChange(field.fieldId, val)}
                  />

                  {errors[field.fieldId] && (
                    <p className="text-[11px] text-[#F25022] mt-1">{errors[field.fieldId]}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">
          Submitting for <strong className="text-slate-900 dark:text-white">{event.title}</strong> generates a unique QR Pass.
        </p>

        <Button type="submit" variant="fluent" size="lg" disabled={isSubmitting}>
          <CheckCircle2 className="w-4 h-4" /> Confirm Registration
        </Button>
      </div>
    </form>
  );
}
