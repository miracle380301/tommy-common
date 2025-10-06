import React, { useState } from 'react';
import { Card } from '../../level1/Card';
import { Form } from '../../level1/Form';
import { FormField } from '../../level1/FormField';
import { Button } from '../../level1/Button';
import { Flex } from '../../level1/Flex';
import { EmptyState } from '../../level1/EmptyState';
import type { Theme } from '../../utils/types';
import './ForgotPasswordForm.css';

export interface ForgotPasswordFormProps {
  onSubmit: (data: { email: string }) => Promise<void>;
  onBack?: () => void;
  theme?: Theme;
  loading?: boolean;
  success?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onBack,
  theme = 'minimal',
  loading = false,
  success = false,
  error,
  title = '비밀번호 찾기',
  subtitle,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = {
    email: {
      required: '이메일을 입력하세요',
      email: true,
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

  return (
    <Card theme={theme} className="forgot-password-form">
      <Card.Header>
        <h2>{title}</h2>
        {subtitle || (
          <p className="forgot-password-form__subtitle">
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        )}
      </Card.Header>

      <Card.Body>
        {success ? (
          <EmptyState
            icon={
              <div className="forgot-password-form__success-icon">✓</div>
            }
            title="이메일을 전송했습니다"
            description="입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다."
            action={
              onBack && (
                <Button onClick={onBack}>로그인으로 돌아가기</Button>
              )
            }
          />
        ) : (
          <Form
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            theme={theme}
          >
            {error && (
              <div className="forgot-password-form__error" role="alert">
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

            <Flex direction="column" gap="sm">
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting || loading}
              >
                재설정 링크 전송
              </Button>

              {onBack && (
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={onBack}
                  type="button"
                >
                  로그인으로 돌아가기
                </Button>
              )}
            </Flex>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

ForgotPasswordForm.displayName = 'ForgotPasswordForm';
