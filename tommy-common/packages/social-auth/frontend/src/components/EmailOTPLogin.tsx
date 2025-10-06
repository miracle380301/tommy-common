import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '@miracle380301/common';
import { authService } from '../services/auth.service';
import '@miracle380301/common/dist/styles/variables.css';

export const EmailOTPLogin: React.FC = () => {
  const navigate = useNavigate();

  // Step 1: Email 입력
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  // Step 2: OTP 입력
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(0);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 타이머 카운트다운
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  // 타이머 포맷 (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 이메일 검증
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // OTP 전송
  const handleSendOTP = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.sendOTP(email);
      setSuccess(`인증 코드가 ${email}로 전송되었습니다.`);
      setTimer(response.expiresIn);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || '인증 코드 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // OTP 재전송
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.resendOTP(email);
      setSuccess('인증 코드가 재전송되었습니다.');
      setTimer(response.expiresIn);
      setOtpCode('');
    } catch (err: any) {
      setError(err.response?.data?.error || '인증 코드 재전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // OTP 검증 및 로그인
  const handleVerifyOTP = async () => {
    setError('');
    setSuccess('');

    if (!otpCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    if (otpCode.length !== 6) {
      setError('인증 코드는 6자리 숫자입니다.');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyOTP(email, otpCode);
      setSuccess('로그인 성공!');

      // 프로필 페이지로 이동
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP 검증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtpCode('');
      setTimer(0);
      setError('');
      setSuccess('');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <Card>
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">이메일로 로그인</h2>
              <p className="mt-2 text-sm text-gray-600">
                {step === 'email'
                  ? '이메일 주소를 입력하고 인증 코드를 받으세요'
                  : '이메일로 받은 6자리 인증 코드를 입력하세요'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
                {success}
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 'email' && (
              <div className="space-y-4">
                <Input
                  type="email"
                  label="이메일 주소"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                  fullWidth
                  disabled={loading}
                />

                <Button
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  fullWidth
                  variant="primary"
                >
                  {loading ? '전송 중...' : '인증 코드 전송'}
                </Button>
              </div>
            )}

            {/* Step 2: OTP Input */}
            {step === 'otp' && (
              <div className="space-y-4">
                {/* Timer */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">남은 시간:</span>
                    <span className={`text-lg font-bold ${timer < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>

                <Input
                  type="text"
                  label="인증 코드 (6자리)"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(value);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  fullWidth
                  disabled={loading || timer === 0}
                  maxLength={6}
                />

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || !otpCode || timer === 0}
                  fullWidth
                  variant="primary"
                >
                  {loading ? '확인 중...' : '로그인'}
                </Button>

                {/* Resend Button */}
                {timer === 0 ? (
                  <Button onClick={handleResendOTP} disabled={loading} fullWidth variant="secondary">
                    {loading ? '재전송 중...' : '인증 코드 재전송'}
                  </Button>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                  >
                    인증 코드를 받지 못하셨나요?
                  </button>
                )}
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              ← 뒤로가기
            </button>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>tommy-common 모듈 기반 • Email OTP 인증</p>
        </div>
      </div>
    </div>
  );
};
