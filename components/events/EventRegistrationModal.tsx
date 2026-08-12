'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DynamicFormRenderer } from '@/features/registration/components/DynamicFormRenderer';
import { toast } from 'sonner';
import { Sparkles, QrCode } from 'lucide-react';
import type { Event } from '@/types';

interface EventRegistrationModalProps {
  event: Event;
}

export function EventRegistrationModal({ event }: EventRegistrationModalProps) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [createdRegId, setCreatedRegId] = useState<string>('');

  const handleRegistrationSubmit = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id || event.eventId,
          formId: 'form_default',
          responses: data,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const regId = json.data?.registration?.id || `reg_${Date.now()}`;
        setCreatedRegId(regId);
        setHasRegistered(true);
        setRegisterModalOpen(false);
        toast.success('Registration Confirmed! Your unique QR Entry Pass is ready in Student Dashboard.');
      } else {
        toast.error(json.error || 'Registration failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
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
          disabled={(event.remainingSeats ?? 0) <= 0 && !(event.waitlistEnabled ?? false)}
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
