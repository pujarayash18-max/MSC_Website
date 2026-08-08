'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormInput, Plus, Edit3, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_FORMS = [
  {
    formId: 'frm_01',
    formName: 'Standard College Event Registration Form',
    formType: 'College Registration',
    eventId: 'evt_azure_01',
    isEnabled: true,
    sectionsCount: 2,
    fieldsCount: 8
  },
  {
    formId: 'frm_02',
    formName: 'National Hackathon Team Registration Form',
    formType: 'Hackathon Registration',
    eventId: 'evt_hack_01',
    isEnabled: true,
    sectionsCount: 3,
    fieldsCount: 12
  }
];

export default function AdminFormsPage() {
  const [forms, setForms] = useState(MOCK_FORMS);

  const handleDuplicate = (formName: string) => {
    toast.success(`Form "${formName}" cloned successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FormInput className="w-7 h-7 text-sky-400" /> Visual Form Builder (§43, §65)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, duplicate, and customize dynamic registration forms without writing code.
          </p>
        </div>

        <Link href="/admin/forms/new/builder">
          <Button variant="fluent" size="sm">
            <Plus className="w-4 h-4" /> Create New Form
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => (
          <Card key={form.formId} className="p-6 space-y-4 border-slate-800 hover:border-sky-500/50 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="primary" className="mb-2">{form.formType}</Badge>
                <h3 className="text-lg font-bold text-white">{form.formName}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {form.sectionsCount} Sections • {form.fieldsCount} Custom Fields
                </p>
              </div>
              <Badge variant={form.isEnabled ? 'success' : 'danger'}>
                {form.isEnabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-500 font-mono">ID: {form.formId}</span>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDuplicate(form.formName)}>
                  <Copy className="w-3.5 h-3.5" /> Clone
                </Button>

                <Link href={`/admin/forms/${form.formId}/builder`}>
                  <Button variant="fluent" size="sm">
                    <Edit3 className="w-3.5 h-3.5" /> Open Builder
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
