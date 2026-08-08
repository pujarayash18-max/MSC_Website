'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_SPEAKERS } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { Mic, Plus, Trash2, Edit3 } from 'lucide-react';

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState(INITIAL_SPEAKERS);

  const handleAddMock = () => {
    const newSpk = {
      id: `spk_${Date.now()}`,
      speakerId: `spk_${Date.now()}`,
      name: 'Dr. Sanjay Gupta',
      organization: 'Microsoft MVP',
      designation: 'Principal Architect',
      bio: 'Cloud and AI Solution Architect with 12+ years experience.',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      expertise: ['Azure AI', 'Generative AI', 'Cosmos DB'],
      eventIds: [],
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active' as const
    };
    setSpeakers([...speakers, newSpk]);
    toast.success('Speaker profile added!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Mic className="w-7 h-7 text-sky-400" /> Speaker Management (§72)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Add guest speakers, manage biography profiles, social links, and session mapping.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={handleAddMock}>
          <Plus className="w-4 h-4" /> Add Speaker Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {speakers.map((spk) => (
          <Card key={spk.id} className="p-6 space-y-4 border-slate-800">
            <div className="flex items-center gap-4">
              <img src={spk.photo} alt={spk.name} className="w-16 h-16 rounded-xl object-cover border border-sky-400" />
              <div>
                <h3 className="text-base font-bold text-white">{spk.name}</h3>
                <p className="text-xs text-sky-400 font-medium">{spk.designation}</p>
                <p className="text-[11px] text-slate-400">{spk.organization}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {spk.expertise.map((exp) => (
                <Badge key={exp} variant="purple" size="sm">{exp}</Badge>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => toast.info(`Editing speaker ${spk.name}`)}>
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
