'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DynamicFormRenderer } from '@/features/registration/components/DynamicFormRenderer';
import { Event } from '@/types';
import { toast } from 'sonner';
import { Sparkles, CheckCircle } from 'lucide-react';

interface EventRegistrationModalProps {
  event: Event;
}

export function EventRegistrationModal({ event }: EventRegistrationModalProps) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  const handleRegistrationSubmit = (data: Record<string, unknown>) => {
    setHasRegistered(true);
    setRegisterModalOpen(false);
    toast.success('Registration submitted! Unique QR Pass generated in your Student Dashboard.');
  };

  return (
    <>
      {hasRegistered ? (
        <Link href="/dashboard/registrations">
          <Button variant="secondary" size="lg" className="border-emerald-500/40 text-emerald-400">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> Registered (View Pass)
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
        description="Fill out the dynamic registration form below to receive your instant QR Pass."
        maxWidth="2xl"
      >
        <DynamicFormRenderer event={event} onSubmit={handleRegistrationSubmit} />
      </Modal>
    </>
  );
}
