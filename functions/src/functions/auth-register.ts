import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';

interface RegisterRequestBody {
  fullName?: string;
  email?: string;
  enrollmentNumber?: string;
  department?: string;
  year?: string;
  password?: string;
}

export async function authRegisterHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as RegisterRequestBody;
    const { fullName, email, enrollmentNumber, department, year, password } = body;

    if (!fullName || !email || !password) {
      return errorResponse('Full name, email, and password are required.');
    }

    const studentIdNumber = Math.floor(10000 + Math.random() * 90000);
    const studentId = `MCC-2026-${studentIdNumber}`;

    const newUser = {
      id: `usr_${Date.now()}`,
      userId: `usr_${Date.now()}`,
      studentId,
      fullName,
      email,
      enrollmentNumber: enrollmentNumber || '',
      college: 'Marwadi University',
      department: department || 'Computer Engineering',
      year: year || '1st Year',
      skills: [],
      communityPoints: 50,
      currentRank: 99,
      attendancePercentage: 100,
      roleId: 'role_student',
      roleName: 'Student',
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await memoryStore.save('users', newUser);
    context.log(`Student registered successfully: ${studentId}`);

    return successResponse(newUser);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to register student';
    context.error('Error registering student:', error);
    return errorResponse(msg);
  }
}

app.http('auth-register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: authRegisterHandler
});
