import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';

export async function authLoginHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as any;
    const { loginIdentifier, password } = body;

    if (!loginIdentifier || !password) {
      return errorResponse('Student ID or Email and password are required.');
    }

    const mockUser = {
      userId: `usr_${Date.now()}`,
      studentId: loginIdentifier.startsWith('MCC') ? loginIdentifier : 'MCC-2026-00042',
      fullName: 'MCC Student User',
      email: loginIdentifier.includes('@') ? loginIdentifier : 'student@marwadiuniversity.ac.in',
      college: 'Marwadi University',
      department: 'Computer Engineering',
      year: '3rd Year',
      communityPoints: 100,
      roleName: 'Student'
    };

    return successResponse({
      user: mockUser,
      token: `mcc_jwt_${Date.now()}`
    });
  } catch (error: any) {
    context.error('Error logging in student:', error);
    return errorResponse(error.message || 'Login failed');
  }
}

app.http('auth-login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: authLoginHandler
});
