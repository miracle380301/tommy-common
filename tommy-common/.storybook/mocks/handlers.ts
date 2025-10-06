import { http, HttpResponse, delay } from 'msw';

const API_URL = 'http://localhost:3000';

export const handlers = [
  // Email OTP - Send OTP
  http.post(`${API_URL}/api/auth/email/send-otp`, async ({ request }) => {
    await delay(800); // 실제 API 호출처럼 지연

    const body = await request.json() as { email: string };

    console.log('[MSW] Send OTP to:', body.email);

    return HttpResponse.json({
      message: 'OTP sent successfully',
      expiresIn: 300
    });
  }),

  // Email OTP - Verify OTP
  http.post(`${API_URL}/api/auth/email/verify-otp`, async ({ request }) => {
    await delay(600);

    const body = await request.json() as { email: string; code: string };

    console.log('[MSW] Verify OTP:', body.email, body.code);

    // Mock: 123456이면 성공, 아니면 실패
    if (body.code === '123456') {
      return HttpResponse.json({
        message: 'Login successful',
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: body.email,
          email: body.email,
          name: body.email.split('@')[0],
          provider: 'email'
        }
      });
    } else {
      return HttpResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }
  }),

  // Email OTP - Resend OTP
  http.post(`${API_URL}/api/auth/email/resend-otp`, async ({ request }) => {
    await delay(800);

    const body = await request.json() as { email: string };

    console.log('[MSW] Resend OTP to:', body.email);

    return HttpResponse.json({
      message: 'OTP resent successfully',
      expiresIn: 300
    });
  }),

  // Get User Profile
  http.get(`${API_URL}/api/auth/me`, async ({ request }) => {
    await delay(400);

    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('[MSW] Get user profile');

    return HttpResponse.json({
      user: {
        id: 'user@example.com',
        email: 'user@example.com',
        name: 'Mock User',
        picture: 'https://via.placeholder.com/150',
        provider: 'email'
      }
    });
  }),

  // Logout
  http.post(`${API_URL}/api/auth/logout`, async () => {
    await delay(300);

    console.log('[MSW] Logout');

    return HttpResponse.json({
      message: 'Logged out successfully'
    });
  }),
];
