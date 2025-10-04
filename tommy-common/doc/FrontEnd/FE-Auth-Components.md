# Day 7 상세 설계서 - 인증 Composite 컴포넌트

## 목차
1. [LoginForm](#1-loginform)
2. [RegisterForm](#2-registerform)
3. [ForgotPasswordForm](#3-forgotpasswordform)
4. [공통 인증 패턴](#4-공통-인증-패턴)

---

## 1. LoginForm

### 1.1 개요
이메일/비밀번호 기반 로그인 폼으로, Level 1 컴포넌트들을 조합하여 만든 완성된 로그인 인터페이스

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSubmit | function | Yes | - | 로그인 제출 핸들러 (email, password) => Promise |
| onForgotPassword | function | No | - | 비밀번호 찾기 클릭 핸들러 |
| onSignUp | function | No | - | 회원가입 클릭 핸들러 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| showRememberMe | boolean | No | true | Remember Me 체크박스 표시 |
| showSocialLogin | boolean | No | false | 소셜 로그인 버튼 표시 |
| socialProviders | Array<'google'\|'facebook'\|'github'> | No | [] | 소셜 로그인 제공자 |
| loading | boolean | No | false | 외부 로딩 상태 |
| error | string | No | - | 외부 에러 메시지 |
| title | string | No | '로그인' | 폼 제목 |
| subtitle | string | No | - | 부제목 |

### 1.3 내부 상태
- Form의 내부 상태 활용 (useForm)
- `rememberMe`: Remember Me 체크 상태

### 1.4 구조

```jsx
<Card theme={theme}>
  <Card.Header>
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </Card.Header>

  <Card.Body>
    <Form onSubmit={handleSubmit} validationSchema={validationSchema}>
      {/* 에러 메시지 */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* 이메일 */}
      <FormField 
        name="email" 
        label="이메일" 
        type="email"
        placeholder="email@example.com"
        required
      />

      {/* 비밀번호 */}
      <FormField 
        name="password" 
        label="비밀번호" 
        type="password"
        required
      />

      {/* Remember Me */}
      {showRememberMe && (
        <FormField 
          name="rememberMe" 
          label="로그인 상태 유지"
          component="checkbox"
        />
      )}

      {/* 로그인 버튼 */}
      <Button type="submit" fullWidth loading={loading}>
        로그인
      </Button>

      {/* 비밀번호 찾기 */}
      {onForgotPassword && (
        <Button 
          variant="ghost" 
          fullWidth
          onClick={onForgotPassword}
        >
          비밀번호를 잊으셨나요?
        </Button>
      )}
    </Form>

    {/* 소셜 로그인 */}
    {showSocialLogin && (
      <>
        <Divider label="또는" />
        <Flex direction="column" gap="sm">
          {socialProviders.map(provider => (
            <SocialLoginButton key={provider} provider={provider} />
          ))}
        </Flex>
      </>
    )}
  </Card.Body>

  {/* 회원가입 링크 */}
  {onSignUp && (
    <Card.Footer>
      <Flex justify="center" gap="xs">
        <span>계정이 없으신가요?</span>
        <Button variant="ghost" onClick={onSignUp}>
          회원가입
        </Button>
      </Flex>
    </Card.Footer>
  )}
</Card>
```

### 1.5 Validation Schema

```javascript
const validationSchema = {
  email: {
    required: '이메일을 입력하세요',
    email: true
  },
  password: {
    required: '비밀번호를 입력하세요'
  }
};
```

### 1.6 사용 예시

```jsx
// 기본 사용
<LoginForm
  onSubmit={async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    navigate('/dashboard');
  }}
  onForgotPassword={() => navigate('/forgot-password')}
  onSignUp={() => navigate('/register')}
/>

// 소셜 로그인 포함
<LoginForm
  onSubmit={handleLogin}
  showSocialLogin
  socialProviders={['google', 'facebook', 'github']}
  onSocialLogin={(provider) => {
    window.location.href = `/auth/${provider}`;
  }}
/>

// 에러 처리
function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      loading={loading}
      error={error}
    />
  );
}

// 중앙 정렬 레이아웃
<Flex 
  justify="center" 
  align="center" 
  style={{ minHeight: '100vh' }}
>
  <Container maxWidth="sm">
    <LoginForm
      theme="glassmorphism"
      title="환영합니다"
      subtitle="계속하려면 로그인하세요"
      onSubmit={handleLogin}
    />
  </Container>
</Flex>
```

---

## 2. RegisterForm

### 2.1 개요
회원가입 폼으로, 사용자 정보 입력 및 유효성 검사를 포함한 완성된 회원가입 인터페이스

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSubmit | function | Yes | - | 회원가입 제출 핸들러 (data) => Promise |
| onLogin | function | No | - | 로그인 페이지 이동 핸들러 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| fields | Array<FieldConfig> | No | 기본 필드 | 커스터마이징 가능한 필드 설정 |
| requireTermsAcceptance | boolean | No | true | 이용약관 동의 필수 |
| termsUrl | string | No | '/terms' | 이용약관 URL |
| privacyUrl | string | No | '/privacy' | 개인정보처리방침 URL |
| loading | boolean | No | false | 로딩 상태 |
| error | string | No | - | 에러 메시지 |
| title | string | No | '회원가입' | 폼 제목 |
| subtitle | string | No | - | 부제목 |

### 2.3 기본 필드 구성

```javascript
const defaultFields = [
  {
    name: 'username',
    label: '사용자명',
    type: 'text',
    placeholder: 'username',
    required: true,
    validation: {
      required: '사용자명을 입력하세요',
      minLength: { value: 3, message: '3자 이상' },
      pattern: {
        value: /^[a-zA-Z0-9_]+$/,
        message: '영문자, 숫자, 언더스코어만 사용 가능'
      }
    }
  },
  {
    name: 'email',
    label: '이메일',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
    validation: {
      required: '이메일을 입력하세요',
      email: true
    }
  },
  {
    name: 'password',
    label: '비밀번호',
    type: 'password',
    required: true,
    helperText: '8자 이상, 대소문자와 숫자 포함',
    validation: {
      required: '비밀번호를 입력하세요',
      minLength: { value: 8, message: '8자 이상' },
      validate: (value) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return '대소문자와 숫자를 포함해야 합니다';
        }
      }
    }
  },
  {
    name: 'confirmPassword',
    label: '비밀번호 확인',
    type: 'password',
    required: true,
    validation: {
      required: '비밀번호 확인을 입력하세요',
      validate: (value, values) => {
        if (value !== values.password) {
          return '비밀번호가 일치하지 않습니다';
        }
      }
    }
  }
];
```

### 2.4 구조

```jsx
<Card theme={theme}>
  <Card.Header>
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </Card.Header>

  <Card.Body>
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="error">{error}</Alert>}

      {/* 동적 필드 렌더링 */}
      <Flex direction="column" gap="md">
        {fields.map(field => (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            helperText={field.helperText}
            required={field.required}
          />
        ))}
      </Flex>

      {/* 이용약관 동의 */}
      {requireTermsAcceptance && (
        <>
          <Divider spacing="lg" />
          <FormField 
            name="agreedToTerms" 
            component="checkbox"
          >
            <span>
              <a href={termsUrl} target="_blank">이용약관</a>과{' '}
              <a href={privacyUrl} target="_blank">개인정보처리방침</a>에 
              동의합니다
            </span>
          </FormField>
        </>
      )}

      {/* 회원가입 버튼 */}
      <Button type="submit" fullWidth loading={loading}>
        가입하기
      </Button>
    </Form>
  </Card.Body>

  {/* 로그인 링크 */}
  {onLogin && (
    <Card.Footer>
      <Flex justify="center" gap="xs">
        <span>이미 계정이 있으신가요?</span>
        <Button variant="ghost" onClick={onLogin}>
          로그인
        </Button>
      </Flex>
    </Card.Footer>
  )}
</Card>
```

### 2.5 사용 예시

```jsx
// 기본 사용
<RegisterForm
  onSubmit={async (data) => {
    await api.post('/auth/register', data);
    toast.success('회원가입이 완료되었습니다');
    navigate('/login');
  }}
  onLogin={() => navigate('/login')}
/>

// 커스텀 필드
<RegisterForm
  fields={[
    { name: 'name', label: '이름', type: 'text', required: true },
    { name: 'email', label: '이메일', type: 'email', required: true },
    { name: 'phone', label: '전화번호', type: 'tel', required: true },
    { name: 'password', label: '비밀번호', type: 'password', required: true },
    { 
      name: 'role', 
      label: '역할', 
      type: 'select',
      options: [
        { value: 'user', label: '일반 사용자' },
        { value: 'developer', label: '개발자' }
      ],
      required: true
    }
  ]}
  onSubmit={handleRegister}
/>

// 비동기 검증 (사용자명 중복 확인)
<RegisterForm
  fields={[
    ...defaultFields.map(field => 
      field.name === 'username' 
        ? {
            ...field,
            validation: {
              ...field.validation,
              validate: async (value) => {
                const { data } = await api.get(`/check-username?username=${value}`);
                if (data.exists) {
                  return '이미 사용 중인 사용자명입니다';
                }
              }
            }
          }
        : field
    )
  ]}
  onSubmit={handleRegister}
/>
```

---

## 3. ForgotPasswordForm

### 3.1 개요
비밀번호 찾기/재설정 요청 폼

### 3.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSubmit | function | Yes | - | 이메일 제출 핸들러 (email) => Promise |
| onBack | function | No | - | 뒤로가기 핸들러 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| loading | boolean | No | false | 로딩 상태 |
| success | boolean | No | false | 성공 상태 |
| error | string | No | - | 에러 메시지 |
| title | string | No | '비밀번호 찾기' | 폼 제목 |
| subtitle | string | No | - | 부제목 |

### 3.3 구조

```jsx
<Card theme={theme}>
  <Card.Header>
    <h2>{title}</h2>
    {subtitle || (
      <p>
        가입하신 이메일 주소를 입력하시면 
        비밀번호 재설정 링크를 보내드립니다.
      </p>
    )}
  </Card.Header>

  <Card.Body>
    {success ? (
      // 성공 메시지
      <EmptyState
        icon={<CheckCircleIcon />}
        title="이메일을 전송했습니다"
        description="입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다."
        action={
          onBack && (
            <Button onClick={onBack}>
              로그인으로 돌아가기
            </Button>
          )
        }
      />
    ) : (
      // 폼
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}

        <FormField 
          name="email" 
          label="이메일" 
          type="email"
          placeholder="email@example.com"
          required
        />

        <Flex direction="column" gap="sm">
          <Button type="submit" fullWidth loading={loading}>
            재설정 링크 전송
          </Button>

          {onBack && (
            <Button 
              variant="ghost" 
              fullWidth
              onClick={onBack}
            >
              로그인으로 돌아가기
            </Button>
          )}
        </Flex>
      </Form>
    )}
  </Card.Body>
</Card>
```

### 3.4 사용 예시

```jsx
// 기본 사용
function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async ({ email }) => {
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        onBack={() => navigate('/login')}
        loading={loading}
        success={success}
        error={error}
      />
    </Container>
  );
}
```

---

## 4. 공통 인증 패턴

### 4.1 완전한 인증 플로우

```jsx
function AuthFlow() {
  const [view, setView] = useState('login'); // login, register, forgot

  return (
    <Flex 
      justify="center" 
      align="center" 
      style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}
    >
      <Container maxWidth="sm">
        {view === 'login' && (
          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => setView('forgot')}
            onSignUp={() => setView('register')}
            theme="glassmorphism"
          />
        )}

        {view === 'register' && (
          <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => setView('login')}
            theme="glassmorphism"
          />
        )}

        {view === 'forgot' && (
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBack={() => setView('login')}
            theme="glassmorphism"
          />
        )}
      </Container>
    </Flex>
  );
}
```

### 4.2 소셜 로그인 버튼

```jsx
function SocialLoginButton({ provider, onClick }) {
  const config = {
    google: {
      label: 'Google로 계속하기',
      icon: <GoogleIcon />,
      color: '#4285f4'
    },
    facebook: {
      label: 'Facebook으로 계속하기',
      icon: <FacebookIcon />,
      color: '#1877f2'
    },
    github: {
      label: 'GitHub로 계속하기',
      icon: <GithubIcon />,
      color: '#333'
    }
  };

  const { label, icon, color } = config[provider];

  return (
    <Button
      variant="outline"
      fullWidth
      onClick={onClick}
      icon={icon}
      style={{ borderColor: color, color }}
    >
      {label}
    </Button>
  );
}
```

### 4.3 인증 Context & Hook

```jsx
// AuthContext.js
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 인증 상태 확인
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        setUser(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 4.4 Protected Route

```jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <Loading type="spinner" fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

// 사용
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

---

## 5. 스타일 가이드

### 5.1 인증 페이지 레이아웃

```css
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
}

.auth-page__container {
  width: 100%;
  max-width: 450px;
}

.auth-page__logo {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}
```

### 5.2 폼 간격

```css
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.auth-form__divider {
  margin: var(--spacing-lg) 0;
}
```

---

## 6. 테스트 시나리오

### 6.1 LoginForm
- [ ] 이메일/비밀번호 입력 및 제출
- [ ] 유효성 검사 (빈 값, 이메일 형식)
- [ ] Remember Me 체크
- [ ] 비밀번호 찾기 클릭
- [ ] 회원가입 클릭
- [ ] 소셜 로그인 버튼
- [ ] 로딩 상태
- [ ] 에러 메시지 표시

### 6.2 RegisterForm
- [ ] 모든 필드 입력 및 제출
- [ ] 유효성 검사
- [ ] 비밀번호 일치 확인
- [ ] 이용약관 동의 필수
- [ ] 비동기 검증 (중복 확인)
- [ ] 로그인 링크 클릭

### 6.3 ForgotPasswordForm
- [ ] 이메일 입력 및 제출
- [ ] 성공 메시지 표시
- [ ] 뒤로가기 버튼

---

## 7. 구현 우선순위

1. **LoginForm** - 가장 기본
2. **RegisterForm** - 필수 기능
3. **ForgotPasswordForm** - 보조 기능

---

## 8. 완료 체크리스트

- [ ] LoginForm 구현
- [ ] RegisterForm 구현
- [ ] ForgotPasswordForm 구현
- [ ] 소셜 로그인 버튼
- [ ] AuthContext & useAuth
- [ ] ProtectedRoute
- [ ] 3가지 테마 적용
- [ ] 반응형 확인
- [ ] 접근성 검증