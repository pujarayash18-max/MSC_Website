'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DynamicFormRenderer } from '@/features/registration/components/DynamicFormRenderer';
import { toast } from 'sonner';
import { Sparkles, QrCode, Lock, Clock, XCircle, Video } from 'lucide-react';
import type { Event } from '@/types';

interface EventRegistrationModalProps {
  event: Event;
}

export function EventRegistrationModal({ event }: EventRegistrationModalProps) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [createdRegId, setCreatedRegId] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCheckingInOnline, setIsCheckingInOnline] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const evtId = event.id || event.eventId;
        if (!evtId) return;
        const res = await fetch(`/api/registrations?eventId=${evtId}`);
        const data = await res.json();
        if (res.ok && data.data?.registrations?.length > 0) {
          const reg = data.data.registrations[0];
          setHasRegistered(true);
          setCreatedRegId(reg.id);
        }
      } catch (e) {
        console.error('[checkRegistration Error]', e);
      }
    };
    checkRegistration();
  }, [event]);

  const isOnlineEvent =
    event.mode === 'Online' ||
    event.mode === 'Hybrid' ||
    (event as unknown as { mode?: string }).mode === 'ONLINE' ||
    (event as unknown as { mode?: string }).mode === 'HYBRID';

  const handleOnlineJoin = async () => {
    setIsCheckingInOnline(true);
    try {
      const res = await fetch('/api/attendance/online-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id || event.eventId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.data?.message || 'Attendance verified! Redirecting to Microsoft Teams...');
        const url = data.data?.meetingUrl || event.venue || 'https://teams.microsoft.com';
        setTimeout(() => {
          window.open(url, '_blank');
        }, 1000);
      } else {
        toast.error(data.message || data.error || 'Check-in failed.');
      }
    } catch {
      toast.error('Network error. Failed to process online check-in.');
    } finally {
      setIsCheckingInOnline(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!createdRegId) return;
    if (!confirm('Are you sure you want to cancel your event registration? This will release your seat.')) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/registrations/${createdRegId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHasRegistered(false);
        setCreatedRegId('');
        toast.success('Registration cancelled successfully. Your seat has been released.');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to cancel registration.');
      }
    } catch {
      toast.error('Network error. Failed to cancel registration.');
    } finally {
      setIsCancelling(false);
    }
  };

  const eventStatusStr = String(event.eventStatus || '').toUpperCase();
  const isOpenExplicitly =
    eventStatusStr === 'REGISTRATION_OPEN' ||
    (event.registrationStatus && event.registrationStatus.toLowerCase() === 'open');

  const isClosedStatus =
    !isOpenExplicitly &&
    (eventStatusStr === 'REGISTRATION_CLOSED' ||
      eventStatusStr === 'COMPLETED' ||
      eventStatusStr === 'CANCELLED' ||
      (event.registrationStatus && event.registrationStatus.toLowerCase().includes('closed')));

  const isPastDeadline =
    !isOpenExplicitly &&
    event.registrationEnd &&
    new Date() > new Date(event.registrationEnd);

  const isClosed = isClosedStatus || isPastDeadline;
  const isAtCapacity = (event.remainingSeats ?? 0) <= 0;

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
        const reg = json.data?.registration;
        const regId = reg?.id || `reg_${Date.now()}`;
        setCreatedRegId(regId);
        setHasRegistered(true);
        setRegisterModalOpen(false);

        if (reg?.registrationStatus === 'WAITLISTED' || json.data?.isWaitlisted) {
          toast.info('Added to Waitlist! Event capacity is full. We will notify you if a seat opens up.');
        } else {
          toast.success('Registration Confirmed! Your unique pass is ready.');
        }
      } else {
        toast.error(json.error || json.message || 'Registration failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <>
      {hasRegistered ? (
        <div className="space-y-2.5 w-full">
          {isOnlineEvent ? (
            <Button
              variant="fluent"
              size="lg"
              disabled={isCheckingInOnline}
              onClick={handleOnlineJoin}
              className="w-full bg-gradient-to-r from-[#5B5FC7] to-[#464775] hover:from-[#464775] hover:to-[#37385A] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-[#5B5FC7]/20 flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5 text-indigo-200" />
              {isCheckingInOnline ? 'Verifying & Opening Teams...' : 'Join MS Teams Session & Mark Attendance'}
            </Button>
          ) : (
            <Link href={`/dashboard/registrations/${createdRegId}`} className="block w-full">
              <Button variant="fluent" size="lg" className="w-full bg-[#7FBA00] hover:bg-[#7FBA00]/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" /> View Instant QR Entry Pass
              </Button>
            </Link>
          )}

          {isOnlineEvent && (
            <Link href={`/dashboard/registrations/${createdRegId}`} className="block w-full text-center">
              <span className="text-xs text-slate-400 hover:text-white underline">View Registration Details & Pass</span>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={isCancelling}
            onClick={handleCancelRegistration}
            className="w-full text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5 py-2"
          >
            <XCircle className="w-4 h-4" /> {isCancelling ? 'Cancelling...' : 'Cancel My Registration'}
          </Button>
        </div>
      ) : isClosed ? (
        <Button
          disabled
          className="w-full py-3.5 text-sm font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4 text-slate-500" /> Registration Closed
        </Button>
      ) : isAtCapacity ? (
        <Button
          variant="fluent"
          size="lg"
          className="w-full py-3.5 text-sm font-extrabold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 rounded-xl transition-all flex items-center justify-center gap-2"
          onClick={() => setRegisterModalOpen(true)}
        >
          <Clock className="w-5 h-5" /> Join Event Waitlist
        </Button>
      ) : (
        <Button
          variant="fluent"
          size="lg"
          className="w-full py-3.5 text-sm font-extrabold bg-gradient-to-r from-[#0078D4] to-[#00A4EF] hover:from-[#005A9E] hover:to-[#0078D4] text-white shadow-lg shadow-[#0078D4]/20 rounded-xl transition-all flex items-center justify-center gap-2"
          onClick={() => setRegisterModalOpen(true)}
        >
          <Sparkles className="w-5 h-5 text-amber-300" /> Register Now
        </Button>
      )}

      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title={isAtCapacity ? `Join Waitlist: ${event.title}` : `Register for ${event.title}`}
        description={
          isAtCapacity
            ? 'Event is currently at maximum capacity. Submit your details to be placed on the priority waitlist.'
            : 'Fill out the registration form below to receive your instant QR Pass & entry ticket.'
        }
        maxWidth="3xl"
      >
        <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-4">
          <DynamicFormRenderer event={event} onSubmit={handleRegistrationSubmit} />
        </div>
      </Modal>
    </>
  );
}
