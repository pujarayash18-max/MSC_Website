'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DynamicFormRenderer } from '@/features/registration/components/DynamicFormRenderer';
import { Event } from '@/types';
import { dynamicDb } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, QrCode } from 'lucide-react';

interface EventRegistrationModalProps {
  event: Event;
}

export function EventRegistrationModal({ event }: EventRegistrationModalProps) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [createdRegId, setCreatedRegId] = useState<string>('');

  const handleRegistrationSubmit = (data: Record<string, unknown>) => {
    const regId = `reg_${Date.now()}`;
    const qrPassCode = `MCC-PASS-${Date.now().toString().slice(-6)}`;
    
    const newReg = {
      registrationId: regId,
      eventId: event.eventId || event.id,
      eventTitle: event.title,
      studentName: String(data.f_name || 'Rahul Sharma'),
      studentEmail: String(data.f_email || 'student@marwadiuniversity.ac.in'),
      enrollmentNumber: String(data.f_enroll || '92100103045'),
      department: String(data.f_dept || 'Computer Engineering'),
      academicYear: String(data.f_year || '3rd Year'),
      status: 'Approved',
      qrPassCode: qrPassCode,
      createdAt: new Date().toISOString()
    };

    dynamicDb.saveRegistration(newReg);
    setCreatedRegId(regId);
    setHasRegistered(true);
    setRegisterModalOpen(false);
    toast.success('Registration Confirmed! Your unique QR Entry Pass is ready in Student Dashboard.');
  };

  return (
    <>
      {hasRegistered ? (
        <Link href={`/dashboard/registrations/${createdRegId || 'reg_az_8801'}`}>
          <Button variant="fluent" size="lg" className="bg-[#7FBA00] hover:bg-[#7FBA00]/90 text-white font-bold">
            <QrCode className="w-5 h-5" /> View Instant QR Entry Pass
          </Button>
        </Link>
      ) : (
        <Button
          variant="fluent"
          size="lg"
          onClick={() => setRegisterModalOpen(true)}
          disabled={event.remainingSeats <= 0 && !event.waitlistEnabled}
        >
          <Sparkles className="w-5 h-5" /> Register Now
        </Button>
      )}

      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title={`Register for ${event.title}`}
        description="Fill out the registration form below to receive your instant QR Pass & entry ticket."
        maxWidth="2xl"
      >
        <DynamicFormRenderer event={event} onSubmit={handleRegistrationSubmit} />
      </Modal>
    </>
  );
}
