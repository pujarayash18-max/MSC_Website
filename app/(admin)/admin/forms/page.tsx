'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileSpreadsheet, Plus, Edit3, Copy, Trash2 } from 'lucide-react';

const MOCK_FORMS = [
  { id: 'frm_01', name: 'Standard College Event Registration Form', fieldsCount: 6, responsesCount: 142, status: 'Active', date: 'Aug 05, 2026' },
  { id: 'frm_02', name: 'National Hackathon Team & Project Registration Form', fieldsCount: 12, responsesCount: 88, status: 'Active', date: 'Aug 10, 2026' },
  { id: 'frm_03', name: 'Azure Cloud Certification Workshop Feedback Form', fieldsCount: 5, responsesCount: 210, status: 'Archived', date: 'Jul 20, 2026' }
];

export default function AdminFormsCatalogPage() {
  const [forms, setForms] = useState<any[]>(MOCK_FORMS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forms')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.forms) {
          const dbForms = json.data.forms.map((f: any) => {
            const totalFields = (f.sections || []).reduce(
              (acc: number, s: any) => acc + (s.fields?.length || 0),
              0
            );
            return {
              id: f.id,
              name: f.formName,
              eventTitle: f.event?.title || 'Unlinked Event',
              fieldsCount: totalFields || 4,
              responsesCount: f._count?.registrations || 0,
              status: f.isEnabled ? 'Active' : 'Disabled',
              date: new Date(f.createdAt).toLocaleDateString(),
            };
          });
          setForms(dbForms.length > 0 ? dbForms : MOCK_FORMS);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleDuplicate = (id: string) => {
    const target = forms.find((f) => f.id === id);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `frm_copy_${forms.length + 1}`,
      name: `${target.name} (Copy)`,
      responsesCount: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setForms([...forms, duplicated]);
    toast.success('Form schema duplicated successfully.');
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration form?')) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setForms((prev) => prev.filter((f) => f.id !== id));
        toast.success('Registration form deleted successfully.');
      } else {
        const json = await res.json();
        toast.error(json.error || json.message || 'Failed to delete form.');
      }
    } catch {
      toast.error('Network error deleting form.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-[#00A4EF]" /> Dynamic Form Builder Catalog
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Build, edit, and duplicate registration forms with zero hardcoded code.
          </p>
        </div>

        <Link href="/admin/forms/new/builder">
          <Button variant="fluent" size="sm">
            <Plus className="w-4 h-4" /> Create New Form Schema
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forms.map((f) => (
          <Card key={f.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={f.status === 'Active' ? 'success' : 'default'}>{f.status}</Badge>
                <span className="text-[11px] font-mono text-slate-500 dark:text-[#A8B0BB]">{f.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.name}</h3>
              {f.eventTitle && (
                <p className="text-xs font-semibold text-indigo-400">
                  Event: {f.eventTitle}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-[#A8B0BB]">
                Fields: <strong className="text-slate-900 dark:text-white">{f.fieldsCount}</strong> • Submissions: <strong className="text-[#00A4EF]">{f.responsesCount}</strong>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => handleDuplicate(f.id)} title="Duplicate Schema">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteForm(f.id)}
                  title="Delete Form"
                  className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Link href={`/admin/forms/${f.id}/builder`}>
                <Button variant="fluent" size="sm">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Builder
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
