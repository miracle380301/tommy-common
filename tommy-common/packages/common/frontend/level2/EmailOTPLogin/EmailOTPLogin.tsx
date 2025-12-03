import React, { useState, useEffect } from 'react';
import { Card } from '../../level1/Card';
import { Input } from '../../level1/Input';
import { Button } from '../../level1/Button';
import type { Theme } from '../../utils/types';
import './EmailOTPLogin.css';

export interface EmailOTPLoginProps {
  onSendOTP: (email: string) => Promise<{ expiresIn: number }>;
  onVerifyOTP: (email: string, code: string) => Promise<void>;
  onBack?: () => void;
  theme?: Theme;
  title?: string;
  subtitle?: string;
  otpLength?: number;
  initialEmail?: string;
  fieldProps?: {
    email?: React.ComponentProps<typeof Input>;
    otp?: React.ComponentProps<typeof Input>;
  };
}

export const EmailOTPLogin: React.FC<EmailOTPLoginProps> = ({
  onSendOTP,
  onVerifyOTP,
  onBack,
  theme = 'minimal',
  title = '이메일로 로그인',
  subtitle,
  otpLength = 6,
  initialEmail = '',
  fieldProps,
}) => {
  // Step 1: Email 입력
  const [email, setEmail] = useState(initialEmail);
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
      const response = await onSendOTP(email);
      setSuccess(`인증 코드가 ${email}로 전송되었습니다.`);
      setTimer(response.expiresIn);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || '인증 코드 전송에 실패했습니다.');
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
      const response = await onSendOTP(email);
      setSuccess('인증 코드가 재전송되었습니다.');
      setTimer(response.expiresIn);
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || '인증 코드 재전송에 실패했습니다.');
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

    if (otpCode.length !== otpLength) {
      setError(`인증 코드는 ${otpLength}자리 숫자입니다.`);
      return;
    }

    setLoading(true);

    try {
      await onVerifyOTP(email, otpCode);
      setSuccess('로그인 성공!');
    } catch (err: any) {
      setError(err.message || 'OTP 검증에 실패했습니다.');
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
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <Card theme={theme} className="email-otp-login">
      <Card.Header style={{ display: 'block' }}>
        <h2>{title}</h2>
        {subtitle ? (
          <p className="email-otp-login__subtitle">{subtitle}</p>
        ) : (
          <p className="email-otp-login__subtitle">
            {step === 'email'
              ? '이메일 주소를 입력하고 인증 코드를 받으세요'
              : `이메일로 받은 ${otpLength}자리 인증 코드를 입력하세요`}
          </p>
        )}
      </Card.Header>

      <Card.Body>
        {/* Error/Success Messages */}
        {error && (
          <div className="email-otp-login__error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="email-otp-login__success" role="alert">
            {success}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <div className="email-otp-login__step">
            <Input
              type="email"
              label="이메일 주소"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === 'Enter' && handleSendOTP()
              }
              fullWidth
              disabled={loading}
              {...fieldProps?.email}
            />

            <Button
              onClick={handleSendOTP}
              disabled={loading || !email}
              fullWidth
            >
              {loading ? '전송 중...' : '인증 코드 전송'}
            </Button>
          </div>
        )}

        {/* Step 2: OTP Input */}
        {step === 'otp' && (
          <div className="email-otp-login__step">
            {/* Timer */}
            <div className="email-otp-login__timer">
              <span className="email-otp-login__timer-label">남은 시간:</span>
              <span
                className={`email-otp-login__timer-value ${
                  timer < 60 ? 'email-otp-login__timer-value--warning' : ''
                }`}
              >
                {formatTime(timer)}
              </span>
            </div>

            <Input
              type="text"
              label={`인증 코드 (${otpLength}자리)`}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, otpLength);
                setOtpCode(value);
              }}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === 'Enter' && handleVerifyOTP()
              }
              fullWidth
              disabled={loading || timer === 0}
              maxLength={otpLength}
              {...fieldProps?.otp}
            />

            <Button
              onClick={handleVerifyOTP}
              disabled={loading || !otpCode || timer === 0}
              fullWidth
            >
              {loading ? '확인 중...' : '로그인'}
            </Button>

            {/* Resend Button */}
            {timer === 0 ? (
              <Button onClick={handleResendOTP} disabled={loading} fullWidth variant="outline">
                {loading ? '재전송 중...' : '인증 코드 재전송'}
              </Button>
            ) : (
              <Button
                onClick={handleResendOTP}
                disabled={loading}
                variant="ghost"
                fullWidth
              >
                인증 코드를 받지 못하셨나요?
              </Button>
            )}
          </div>
        )}

        {/* Back Button */}
        <Button onClick={handleBack} variant="ghost" fullWidth>
          ← 뒤로가기
        </Button>
      </Card.Body>
    </Card>
  );
};

EmailOTPLogin.displayName = 'EmailOTPLogin';
