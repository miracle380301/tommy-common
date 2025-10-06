import React, { useState } from 'react';
import { Card } from '../../level1/Card';
import { Form } from '../../level1/Form';
import { FormField } from '../../level1/FormField';
import { Button } from '../../level1/Button';
import { Divider } from '../../level1/Divider';
import { Flex } from '../../level1/Flex';
import type { Theme } from '../../utils/types';
import type { ValidationSchema } from '../../utils/validation';
import './RegisterForm.css';

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  validation?: ValidationSchema[string];
  options?: Array<{ value: any; label: string }>;
}

export interface RegisterFormProps {
  onSubmit: (data: any) => Promise<void>;
  onLogin?: () => void;
  theme?: Theme;
  fields?: FieldConfig[];
  requireTermsAcceptance?: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
  initialValues?: Record<string, any>;
}

const defaultFields: FieldConfig[] = [
  {
    name: 'username',
    label: '사용자명',
    type: 'text',
    placeholder: 'username',
    required: true,
  },
  {
    name: 'email',
    label: '이메일',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  {
    name: 'password',
    label: '비밀번호',
    type: 'password',
    required: true,
    helperText: '8자 이상, 대소문자와 숫자 포함',
  },
  {
    name: 'confirmPassword',
    label: '비밀번호 확인',
    type: 'password',
    required: true,
  },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onLogin,
  theme = 'minimal',
  fields = defaultFields,
  requireTermsAcceptance = true,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  loading = false,
  error,
  title = '회원가입',
  subtitle,
  initialValues,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema: ValidationSchema = fields.reduce((schema, field) => {
    if (field.validation) {
      schema[field.name] = field.validation;
    } else if (field.required) {
      const fieldSchema: any = {
        required: `${field.label}을(를) 입력하세요`,
      };

      if (field.type === 'email') {
        fieldSchema.email = true;
      }

      if (field.name === 'password') {
        fieldSchema.minLength = { value: 8, message: '8자 이상' };
      }

      if (field.name === 'confirmPassword') {
        fieldSchema.validate = (value: any, values: any) => {
          if (value !== values.password) {
            return '비밀번호가 일치하지 않습니다';
          }
        };
      }

      schema[field.name] = fieldSchema;
    }
    return schema;
  }, {} as ValidationSchema);

  if (requireTermsAcceptance) {
    validationSchema.agreedToTerms = {
      required: '이용약관에 동의해주세요',
    };
  }

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card theme={theme} className="register-form">
      <Card.Header>
        <h2>{title}</h2>
        {subtitle && <p className="register-form__subtitle">{subtitle}</p>}
      </Card.Header>

      <Card.Body>
        <Form
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          theme={theme}
          initialValues={initialValues}
        >
          {error && (
            <div className="register-form__error" role="alert">
              {error}
            </div>
          )}

          <Flex direction="column" gap="md">
            {fields.map((field) => (
              <FormField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                helperText={field.helperText}
                required={field.required}
                component={field.type === 'select' ? 'select' : 'input'}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormField>
            ))}
          </Flex>

          {requireTermsAcceptance && (
            <>
              <Divider spacing="lg" />
              <FormField name="agreedToTerms" component="checkbox">
                <span>
                  <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                    이용약관
                  </a>
                  과{' '}
                  <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                    개인정보처리방침
                  </a>
                  에 동의합니다
                </span>
              </FormField>
            </>
          )}

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting || loading}
          >
            가입하기
          </Button>
        </Form>
      </Card.Body>

      {onLogin && (
        <Card.Footer>
          <Flex justify="center" gap="xs">
            <span>이미 계정이 있으신가요?</span>
            <Button variant="ghost" onClick={onLogin} type="button">
              로그인
            </Button>
          </Flex>
        </Card.Footer>
      )}
    </Card>
  );
};

RegisterForm.displayName = 'RegisterForm';
