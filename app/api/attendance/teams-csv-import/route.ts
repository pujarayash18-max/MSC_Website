import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

function parseDurationMinutes(str: string): number {
  if (!str) return 0;
  const s = str.trim().toLowerCase();

  // Format: 1h 45m or 2h 10m
  const hoursMatch = s.match(/(\d+)\s*h/);
  const minsMatch = s.match(/(\d+)\s*m/);
  if (hoursMatch || minsMatch) {
    const h = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const m = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    return h * 60 + m;
  }

  // Format: hh:mm:ss or mm:ss
  if (s.includes(':')) {
    const parts = s.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
    if (parts.length === 2) return parts[0] + Math.round(parts[1] / 60);
  }

  // Format: 6300s
  if (s.endsWith('s')) {
    const secs = parseInt(s.replace('s', ''), 10);
    return Math.round(secs / 60);
  }

  // Plain number
  const num = parseInt(s, 10);
  return isNaN(num) ? 0 : num;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const formData = await req.formData();
    const eventId = formData.get('eventId') as string;
    const file = formData.get('file') as File;

    if (!eventId || !file) {
      return ERR.VALIDATION('eventId and CSV file are required.');
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return ERR.NOT_FOUND('Event');

    const mode = String(event.mode || '').toUpperCase();
    const venue = String(event.venue || '').toLowerCase();
    const isOnlineEvent = mode === 'ONLINE' || mode === 'HYBRID' || venue.startsWith('http') || venue.includes('teams') || venue.includes('zoom') || venue.includes('meet');

    if (!isOnlineEvent) {
      return ERR.VALIDATION('MS Teams CSV attendance verification is only available for Online or Hybrid events.');
    }

    const csvText = await file.text();
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

    // 1. Determine Total Meeting Duration (in Minutes)
    let meetingDurationMinutes = 0;

    // Check summary lines in CSV
    for (const line of lines) {
      if (line.toLowerCase().includes('meeting duration') || line.toLowerCase().includes('total duration')) {
        const parts = line.split(',');
        const durationStr = parts[1] || parts[parts.length - 1];
        meetingDurationMinutes = parseDurationMinutes(durationStr);
        if (meetingDurationMinutes > 0) break;
      }
    }

    // Fallback to event scheduled start/end duration from database
    if (meetingDurationMinutes <= 0 && event.startDate && event.endDate) {
      const diffMs = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
      meetingDurationMinutes = Math.max(30, Math.round(diffMs / (1000 * 60)));
    }

    if (meetingDurationMinutes <= 0) {
      meetingDurationMinutes = 60; // Default 1 hour fallback
    }

    // 50% Threshold Requirement
    const requiredThresholdMinutes = Math.ceil(meetingDurationMinutes / 2);

    // 2. Aggregate Duration Per Student Email
    const studentDurationMap = new Map<string, number>();

    for (const line of lines) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (!emailMatch) continue;

      const email = emailMatch[0].toLowerCase().trim();
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

      // Try to find duration column
      let durationMinutes = 0;
      for (const col of cols) {
        if (col === email) continue;
        const d = parseDurationMinutes(col);
        if (d > 0 && d <= 720) { // realistic session duration limit
          durationMinutes = d;
          break;
        }
      }

      // Default fallback if duration column wasn't explicitly found
      if (durationMinutes === 0) {
        durationMinutes = meetingDurationMinutes; // fallback assume full presence if listed
      }

      const currentTotal = studentDurationMap.get(email) || 0;
      studentDurationMap.set(email, currentTotal + durationMinutes);
    }

    // 3. Evaluate Attendance based on >= 50% Threshold
    const passedStudents: { email: string; fullName: string; duration: number }[] = [];
    const disqualifiedStudents: { email: string; fullName: string; duration: number }[] = [];

    let newlyApprovedCount = 0;

    for (const [email, totalDuration] of studentDurationMap.entries()) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) continue;

      const registration = await prisma.registration.findFirst({
        where: { eventId, userId: user.id, isDeleted: false },
      });
      if (!registration) continue;

      if (totalDuration >= requiredThresholdMinutes) {
        passedStudents.push({ email, fullName: user.fullName, duration: totalDuration });

        // Record or Update Attendance as PRESENT
        const existing = await prisma.attendance.findFirst({
          where: { registrationId: registration.id },
        });

        if (!existing) {
          await prisma.attendance.create({
            data: {
              registrationId: registration.id,
              eventId,
              userId: user.id,
              checkInTime: new Date(),
              status: 'PRESENT',
              verifiedBy: `MS_TEAMS_CSV_50%_VERIFIED (${totalDuration}m/${meetingDurationMinutes}m)`,
            },
          });

          await prisma.registration.update({
            where: { id: registration.id },
            data: { attendanceStatus: 'PRESENT' },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { communityPoints: { increment: 50 } },
          });

          newlyApprovedCount++;
        }
      } else {
        disqualifiedStudents.push({ email, fullName: user.fullName, duration: totalDuration });
      }
    }

    return ok({
      meetingDurationMinutes,
      requiredThresholdMinutes,
      totalEvaluated: studentDurationMap.size,
      passedCount: passedStudents.length,
      disqualifiedCount: disqualifiedStudents.length,
      newlyApprovedCount,
      passedStudents,
      disqualifiedStudents,
      message: `MS Teams Attendance Verified (50% Threshold = ${requiredThresholdMinutes}m / ${meetingDurationMinutes}m). ${passedStudents.length} students passed (>=50% time), ${disqualifiedStudents.length} disqualified (<50% time). ${newlyApprovedCount} newly marked PRESENT (+50 Points).`,
    });
  } catch (e) {
    console.error('[POST /api/attendance/teams-csv-import]', e);
    return ERR.INTERNAL();
  }
}
