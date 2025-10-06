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
    const icons: Record<string, React.ReactNode> = {
      google: (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_37_259)">
            <path d="M4.51589 6.99596C4.17001 7.97996 4.15765 9.03596 4.49118 10.02C4.49118 10.044 4.50354 10.08 4.51589 10.104C4.46648 10.176 4.39236 10.236 4.31824 10.272C3.52765 10.872 2.74942 11.46 1.95883 12.048C1.92177 12.072 1.89706 12.12 1.84765 12.108C1.76118 11.976 1.68707 11.844 1.6253 11.688C1.31648 11.004 1.10648 10.272 1.02001 9.52796C0.9953 9.37196 0.9953 9.20396 0.9953 9.04796C0.9953 9.01196 0.9953 8.98796 0.9953 8.95196V8.73596C1.00765 8.62796 1.02001 8.50796 0.9953 8.39996V8.20796C0.9953 8.20796 0.9953 8.14796 1.00765 8.11196C1.06942 7.04396 1.34118 5.99996 1.8353 5.02796C1.8353 5.00396 1.86001 4.99196 1.87236 4.96796C1.94648 4.99196 2.02059 5.02796 2.07001 5.08796C2.53942 5.44796 3.00883 5.79596 3.47824 6.14396C3.79942 6.38396 4.12059 6.62396 4.42942 6.86396C4.46648 6.89996 4.51589 6.92396 4.54059 6.97196" fill="#FFBB00"/>
            <path d="M8.91351 16.5C8.91351 16.5 8.95057 16.452 8.97528 16.452C9.11116 16.452 9.24704 16.452 9.38293 16.452C9.40763 16.452 9.43234 16.452 9.44469 16.476L8.91351 16.488V16.5Z" fill="#EDF6F0"/>
            <path d="M0.970581 8.41199C1.00764 8.51999 1.00764 8.63999 0.970581 8.75999V8.41199Z" fill="#FFB200"/>
            <path d="M0.982934 8.12396C0.982934 8.12396 0.995287 8.19596 0.970581 8.21996V8.12396H0.982934Z" fill="#FFEEC6"/>
            <path d="M4.51589 6.99595L3.7253 6.40795L2.2306 5.27995L1.84766 4.99195C2.29236 4.12795 2.8853 3.35995 3.61413 2.71195C4.7506 1.67995 6.15883 0.995945 7.67824 0.731945C8.37001 0.599945 9.08648 0.575945 9.77824 0.623945C10.9518 0.695945 12.1006 1.04395 13.1259 1.60795C13.6324 1.89595 14.1141 2.23195 14.5465 2.61595C14.5959 2.65195 14.5959 2.67595 14.5465 2.72395C13.8177 3.43195 13.0888 4.12795 12.36 4.84795C12.323 4.89595 12.2859 4.89595 12.2488 4.84795C11.6065 4.25995 10.7912 3.88795 9.91413 3.75595C9.72883 3.73195 9.53119 3.71995 9.34589 3.69595C9.21001 3.67195 9.07413 3.67195 8.93824 3.69595C8.77766 3.71995 8.61707 3.73195 8.46883 3.75595C7.66589 3.86395 6.91236 4.16395 6.27001 4.64395C5.45472 5.23195 4.83707 6.05995 4.51589 6.99595Z" fill="#FF2620"/>
            <path d="M9.44469 16.4879H8.91351C5.9241 16.3919 3.23116 14.7359 1.87234 12.1439C1.87234 12.1439 1.87234 12.1199 1.85999 12.1079L2.83587 11.3759L4.4294 10.1759C4.4294 10.1759 4.50351 10.1279 4.52822 10.1039C4.73822 10.7279 5.0841 11.2919 5.54116 11.7839C6.5541 12.9239 8.08587 13.5239 9.62999 13.3679C10.3217 13.3319 10.9888 13.1519 11.5941 12.8399C11.73 12.7679 11.8535 12.6959 11.9894 12.6239C12.0265 12.6239 12.0635 12.6479 12.0882 12.6719C12.7182 13.1519 13.3482 13.6199 13.9782 14.0999C14.1512 14.2319 14.3365 14.3639 14.5094 14.5079C14.5341 14.5319 14.5588 14.5439 14.5588 14.5799C14.2623 14.8439 13.9412 15.0959 13.6076 15.2999C12.7059 15.8639 11.6929 16.2239 10.6306 16.3799C10.3341 16.4279 10.0376 16.4639 9.74116 16.4639C9.69175 16.4519 9.62999 16.4519 9.58057 16.4639C9.53116 16.4879 9.48175 16.4639 9.44469 16.4879Z" fill="#00AD3C"/>
            <path d="M14.5588 14.568C14.4229 14.46 14.2623 14.352 14.1265 14.244C13.8918 14.064 13.6571 13.884 13.4223 13.704C13.1876 13.524 12.9529 13.344 12.7182 13.176C12.4835 13.008 12.2365 12.804 11.9894 12.612C12.36 12.36 12.6935 12.048 12.9653 11.688C13.2865 11.256 13.5088 10.752 13.6076 10.224C13.6323 10.14 13.5829 10.14 13.5212 10.14H9.32117C9.21411 10.14 9.16058 10.088 9.16058 9.98397V7.16397C9.16058 7.07997 9.18529 7.05597 9.27176 7.05597H16.7082C16.8565 7.05597 16.8565 7.05597 16.8812 7.18797C16.9923 7.83597 17.0418 8.50797 17.0047 9.16797C16.9676 10.416 16.6341 11.628 16.0412 12.732C15.6706 13.416 15.1765 14.04 14.5835 14.568" fill="#0084FF"/>
          </g>
          <defs>
            <clipPath id="clip0_37_259">
              <rect width="16.0218" height="15.9" fill="white" transform="translate(0.970581 0.599976)"/>
            </clipPath>
          </defs>
        </svg>
      ),
      kakao: (
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_37_238)">
            <mask id="mask0_37_238" maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="16">
              <path d="M17 0H0V15.9976H17V0Z" fill="white"/>
            </mask>
            <g mask="url(#mask0_37_238)">
              <path d="M8.49942 0.00125122C3.80518 0.00125122 0 3.07582 0 6.87945C0.134829 9.40388 1.6168 11.6299 3.82477 12.6252C3.55281 13.9578 2.851 15.1503 1.83863 16C3.78098 15.6197 5.63171 14.8349 7.28193 13.6903C7.68469 13.737 8.08975 13.7601 8.49481 13.7607C13.1879 13.7607 16.9942 10.6861 16.9942 6.88006C16.9942 3.074 13.1925 0.00125122 8.49942 0.00125122Z" fill="#3B1E1E"/>
            </g>
          </g>
          <defs>
            <clipPath id="clip0_37_238">
              <rect width="17" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      ),
      apple: (
        <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_37_249)">
            <path d="M16.4442 6.82706L16.3493 6.89208C15.4546 7.45124 14.7767 8.28349 14.4243 9.24578C14.2345 9.79195 14.1667 10.3771 14.2074 10.9493C14.248 11.5345 14.4107 12.1196 14.6954 12.6398C15.1834 13.5241 15.9562 14.2263 16.8916 14.6424L17 14.6944C17 14.6944 16.9865 14.7594 16.9729 14.7984C16.6476 15.7477 16.1866 16.645 15.6037 17.4773C15.3326 17.8804 15.0343 18.2705 14.7225 18.6346C14.4649 18.9467 14.1803 19.2198 13.8549 19.4668C13.5024 19.7269 13.0957 19.896 12.6619 19.961C12.2552 20.013 11.835 19.974 11.4418 19.857C11.1978 19.7789 10.9538 19.6879 10.7098 19.5839C10.4115 19.4538 10.0997 19.3498 9.77435 19.2718C9.01518 19.1157 8.22889 19.1678 7.51039 19.4278C7.23926 19.5189 6.98169 19.6359 6.72411 19.7399C6.37164 19.883 6.01917 19.961 5.63958 20C5.19221 20.039 4.7584 19.935 4.37881 19.7269C4.0399 19.5449 3.74165 19.3108 3.48408 19.0377C3.11805 18.6606 2.77913 18.2445 2.46733 17.8284C1.43703 16.4499 0.704971 14.9025 0.311829 13.251C0.0678099 12.3017 -0.0270864 11.3524 2.67862e-05 10.4161C0.02714 9.46685 0.271159 8.53057 0.704971 7.67231C1.26079 6.57998 2.1962 5.72172 3.36207 5.25358C3.98567 4.99351 4.6635 4.86347 5.35489 4.88947C5.72092 4.90248 6.08695 4.9675 6.43942 5.08453C6.80545 5.20157 7.17148 5.34461 7.53751 5.47465C7.78153 5.56568 8.0391 5.6437 8.28312 5.70872C8.51358 5.77374 8.77116 5.77374 9.00162 5.69572C9.28631 5.60469 9.55744 5.51366 9.84213 5.40963C10.2353 5.26659 10.6149 5.12354 11.0216 5.00651C11.5774 4.85046 12.1603 4.78544 12.7432 4.83746C13.4075 4.88947 14.0582 5.05853 14.6547 5.33161C15.3461 5.6567 15.9426 6.13785 16.39 6.73603C16.39 6.74903 16.4171 6.77504 16.4306 6.78804V6.81405L16.4442 6.82706Z" fill="white"/>
            <path d="M12.6484 0C12.6755 0.221066 12.689 0.429129 12.6619 0.650195C12.567 1.72952 12.0654 2.74382 11.2656 3.49805C10.764 3.9922 10.1268 4.3433 9.42188 4.52536C9.13719 4.60338 8.83895 4.62939 8.5407 4.61638C8.51359 4.61638 8.50003 4.61638 8.45936 4.61638C8.45936 4.57737 8.45936 4.55137 8.4458 4.51235C8.40513 4.05722 8.45936 3.58908 8.62204 3.15995C9.11008 1.63849 10.398 0.481144 11.9976 0.104031C12.1739 0.0650195 12.3637 0.0390117 12.5399 0.0130039C12.5806 0.0130039 12.6077 0.0130039 12.6484 0.0130039V0Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="clip0_37_249">
              <rect width="17" height="20" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      ),
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
        color: '#374151',
        border: '2px solid #D1D5DB',
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
