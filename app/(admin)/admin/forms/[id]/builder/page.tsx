'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldType } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Save, Trash2, GripVertical, Eye } from 'lucide-react';

const SUPPORTED_FIELD_TYPES: FieldType[] = [
  'Short Text',
  'Long Text',
  'Email',
  'Phone',
  'Enrollment Number',
  'College Name',
  'Department',
  'Year',
  'Division',
  'Team Name',
  'Dropdown',
  'Radio',
  'Checkbox',
  'Multi-select',
  'Date',
  'Time',
  'Number',
  'URL',
  'GitHub Profile',
  'LinkedIn Profile',
  'Portfolio',
  'Resume Upload',
  'File Upload'
];

export default function FormBuilderEditorPage() {
  const [formName, setFormName] = useState('Standard College Event Registration Form');
  const [fields, setFields] = useState<Array<{ id: string; label: string; type: FieldType; required: boolean }>>([
    { id: '1', label: 'Full Name', type: 'Short Text', required: true },
    { id: '2', label: 'College Email', type: 'Email', required: true },
    { id: '3', label: 'Enrollment Number', type: 'Enrollment Number', required: true },
    { id: '4', label: 'Department / Branch', type: 'Dropdown', required: true }
  ]);

  const addField = (type: FieldType) => {
    const newField = {
      id: Date.now().toString(),
      label: `New ${type} Field`,
      type,
      required: false
    };
    setFields([...fields, newField]);
    toast.info(`Added ${type} field to form canvas.`);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    toast.success('Dynamic registration form saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/forms">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Back to Forms
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Previewing form...')}>
            <Eye className="w-4 h-4" /> Preview Form
          </Button>
          <Button variant="fluent" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4" /> Save Form Schema
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Palette of 20+ Field Types */}
        <Card className="p-6 space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Field Type Palette (§43)</h3>
          <p className="text-xs text-slate-400">Click any field type to add it to your registration form canvas.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {SUPPORTED_FIELD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center justify-between transition-all"
              >
                <span>{type}</span>
                <Plus className="w-3.5 h-3.5 text-sky-400" />
              </button>
            ))}
          </div>
        </Card>

        {/* Right: Form Canvas */}
        <Card className="p-6 space-y-6 lg:col-span-2">
          <div className="border-b border-slate-800 pb-4">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Form Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="text-lg font-extrabold bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white w-full focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canvas Fields ({fields.length})</h4>

            {fields.map((f, idx) => (
              <div key={f.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 group hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{f.label}</span>
                      <Badge variant="primary" size="sm">{f.type}</Badge>
                      {f.required && <Badge variant="danger" size="sm">Required</Badge>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = [...fields];
                      updated[idx].required = !updated[idx].required;
                      setFields(updated);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg"
                  >
                    Toggle Required
                  </button>
                  <button
                    onClick={() => removeField(f.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
