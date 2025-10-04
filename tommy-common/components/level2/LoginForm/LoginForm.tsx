import React, { useState } from 'react';
import { Card } from '../../level1/Card';
import { Form } from '../../level1/Form';
import { FormField } from '../../level1/FormField';
import { Button } from '../../level1/Button';
import { Divider } from '../../level1/Divider';
import { Flex } from '../../level1/Flex';
import type { Theme } from '../../utils/types';
import './LoginForm.css';

export interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  theme?: Theme;
  showRememberMe?: boolean;
  showSocialLogin?: boolean;
  socialProviders?: Array<'kakao' | 'apple' | 'google' | 'email'>;
  onSocialLogin?: (provider: string) => void;
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onSignUp,
  theme = 'minimal',
  showRememberMe = true,
  showSocialLogin = false,
  socialProviders = [],
  onSocialLogin,
  loading = false,
  error,
  title = '로그인',
  subtitle,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = {
    email: {
      required: '이메일을 입력하세요',
      email: true,
    },
    password: {
      required: '비밀번호를 입력하세요',
    },
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSocialIcon = (provider: string) => {
    const icons: Record<string, string> = {
      kakao: '💬',
      apple: '',
      google: 'G',
      email: '✉',
    };
    return icons[provider] || provider[0].toUpperCase();
  };

  const getSocialLabel = (provider: string) => {
    const labels: Record<string, string> = {
      kakao: 'Kakao로 계속하기',
      apple: 'Apple로 계속하기',
      google: 'Google로 계속하기',
      email: '이메일로 계속하기',
    };
    return labels[provider] || `${provider}로 로그인`;
  };

  const getSocialButtonStyle = (provider: string) => {
    const styles: Record<string, React.CSSProperties> = {
      kakao: {
        backgroundColor: '#FEE500',
        color: '#000000',
        border: 'none',
      },
      apple: {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        border: 'none',
      },
      google: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid #dadce0',
      },
      email: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid var(--border-color)',
      },
    };
    return styles[provider] || {};
  };

  return (
    <Card theme={theme} className="login-form">
      <Card.Header>
        <h2>{title}</h2>
        {subtitle && <p className="login-form__subtitle">{subtitle}</p>}
      </Card.Header>

      <Card.Body>
        <Form
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          theme={theme}
        >
          {error && (
            <div className="login-form__error" role="alert">
              {error}
            </div>
          )}

          <FormField
            name="email"
            label="이메일"
            type="email"
            placeholder="email@example.com"
            required
          />

          <FormField
            name="password"
            label="비밀번호"
            type="password"
            required
          />

          {showRememberMe && (
            <FormField
              name="rememberMe"
              label="로그인 상태 유지"
              component="checkbox"
            />
          )}

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting || loading}
          >
            로그인
          </Button>

          {onForgotPassword && (
            <Button
              variant="ghost"
              fullWidth
              onClick={onForgotPassword}
              type="button"
            >
              비밀번호를 잊으셨나요?
            </Button>
          )}
        </Form>

        {showSocialLogin && socialProviders.length > 0 && (
          <>
            <Divider label="또는" />
            <Flex direction="column" gap="sm">
              {socialProviders.map((provider) => (
                <Button
                  key={provider}
                  variant="outline"
                  fullWidth
                  onClick={() => onSocialLogin?.(provider)}
                  type="button"
                  style={getSocialButtonStyle(provider)}
                >
                  <span className="login-form__social-icon">
                    {getSocialIcon(provider)}
                  </span>
                  {getSocialLabel(provider)}
                </Button>
              ))}
            </Flex>
          </>
        )}
      </Card.Body>

      {onSignUp && (
        <Card.Footer>
          <Flex justify="center" gap="xs">
            <span>계정이 없으신가요?</span>
            <Button variant="ghost" onClick={onSignUp} type="button">
              회원가입
            </Button>
          </Flex>
        </Card.Footer>
      )}
    </Card>
  );
};

LoginForm.displayName = 'LoginForm';
