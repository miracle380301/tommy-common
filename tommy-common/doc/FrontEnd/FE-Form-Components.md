# Day 5 상세 설계서 - 폼 시스템

## 목차
1. [Form](#1-form)
2. [FormField](#2-formfield)
3. [useForm Hook](#3-useform-hook)
4. [Validation 시스템](#4-validation-시스템)
5. [폼 패턴 및 예제](#5-폼-패턴-및-예제)

---

## 1. Form

### 1.1 개요
폼 전체를 관리하는 컨테이너 컴포넌트로, 제출, 초기화, 유효성 검사를 통합 관리한다.

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSubmit | function | Yes | - | 폼 제출 핸들러 (values) => void \| Promise |
| initialValues | object | No | {} | 초기값 |
| validationSchema | object | No | - | 유효성 검사 스키마 |
| validateOnChange | boolean | No | true | 변경 시 검증 |
| validateOnBlur | boolean | No | true | blur 시 검증 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| children | ReactNode \| function | Yes | - | 폼 필드들 또는 render prop |

### 1.3 내부 구조

Form 컴포넌트는 useForm hook을 내부적으로 사용하고, FormContext로 상태를 하위 컴포넌트에 전달한다.

```javascript
const FormContext = createContext(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within Form');
  }
  return context;
}
```

### 1.4 동작 방식

#### 1.4.1 기본 구조
```javascript
function Form({ 
  onSubmit, 
  initialValues, 
  validationSchema,
  validateOnChange,
  validateOnBlur,
  children,
  ...props 
}) {
  const formMethods = useForm({
    initialValues,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    onSubmit
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await formMethods.handleSubmit();
  };

  return (
    <FormContext.Provider value={formMethods}>
      <form onSubmit={handleSubmit} {...props}>
        {typeof children === 'function' ? children(formMethods) : children}
      </form>
    </FormContext.Provider>
  );
}
```

#### 1.4.2 Render Props 패턴
```jsx
<Form onSubmit={handleSubmit}>
  {({ values, errors, isSubmitting }) => (
    <>
      <Input name="email" label="이메일" />
      {errors.email && <span>{errors.email}</span>}
      <Button type="submit" loading={isSubmitting}>
        제출
      </Button>
    </>
  )}
</Form>
```

### 1.5 스타일 명세

```css
.form {
  width: 100%;
}

.form__group {
  margin-bottom: var(--spacing-md);
}

.form__error {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: var(--spacing-xs);
}

.form__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}
```

### 1.6 사용 예시

```jsx
// 기본 사용
<Form
  initialValues={{ name: '', email: '' }}
  onSubmit={async (values) => {
    await api.post('/users', values);
  }}
>
  <FormField name="name" label="이름" required />
  <FormField name="email" label="이메일" type="email" required />
  <Button type="submit">제출</Button>
</Form>

// Validation Schema
<Form
  initialValues={{ email: '', password: '' }}
  validationSchema={{
    email: {
      required: '이메일을 입력하세요',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: '올바른 이메일 형식이 아닙니다'
      }
    },
    password: {
      required: '비밀번호를 입력하세요',
      minLength: {
        value: 8,
        message: '8자 이상 입력하세요'
      }
    }
  }}
  onSubmit={handleLogin}
>
  <FormField name="email" label="이메일" />
  <FormField name="password" label="비밀번호" type="password" />
  <Button type="submit">로그인</Button>
</Form>

// Render Props
<Form
  initialValues={initialValues}
  onSubmit={handleSubmit}
>
  {({ values, errors, touched, isSubmitting, resetForm }) => (
    <Flex direction="column" gap="md">
      <FormField name="username" label="사용자명" />
      
      {touched.username && errors.username && (
        <Alert variant="error">{errors.username}</Alert>
      )}
      
      <FormField name="email" label="이메일" />
      
      <Flex gap="sm">
        <Button 
          type="submit" 
          loading={isSubmitting}
          disabled={Object.keys(errors).length > 0}
        >
          저장
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={resetForm}
        >
          초기화
        </Button>
      </Flex>
      
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </Flex>
  )}
</Form>
```

---

## 2. FormField

### 2.1 개요
Form 내에서 사용되는 필드 래퍼로, Input, Select, Textarea 등을 자동으로 Form과 연결한다.

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| name | string | Yes | - | 필드 이름 (values 객체의 키) |
| label | string | No | - | 레이블 |
| component | 'input' \| 'select' \| 'textarea' \| 'checkbox' \| Component | No | 'input' | 사용할 컴포넌트 |
| type | string | No | 'text' | input type |
| placeholder | string | No | - | placeholder |
| helperText | string | No | - | 도움말 텍스트 |
| required | boolean | No | false | 필수 입력 |
| disabled | boolean | No | false | 비활성화 |
| options | Array | No | - | Select용 옵션 목록 |
| validate | function | No | - | 커스텀 검증 함수 |
| ...rest | any | No | - | 나머지 props는 컴포넌트로 전달 |

### 2.3 내부 동작

```javascript
function FormField({ 
  name, 
  label, 
  component = 'input',
  validate,
  required,
  ...props 
}) {
  const { 
    values, 
    errors, 
    touched,
    setFieldValue, 
    setFieldTouched,
    validateField
  } = useFormContext();

  const value = values[name] || '';
  const error = touched[name] ? errors[name] : '';
  const hasError = Boolean(error);

  const handleChange = (e) => {
    const newValue = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.value;
    
    setFieldValue(name, newValue);
    
    if (validate) {
      validateField(name, newValue, validate);
    }
  };

  const handleBlur = () => {
    setFieldTouched(name, true);
  };

  // 컴포넌트 렌더링
  const Component = typeof component === 'string' 
    ? componentMap[component] 
    : component;

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={name} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <Component
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error}
        {...props}
      />
      
      {hasError && (
        <span className="form-field__error">{error}</span>
      )}
    </div>
  );
}
```

### 2.4 컴포넌트 매핑

```javascript
const componentMap = {
  input: Input,
  select: Select,
  textarea: Textarea,
  checkbox: Checkbox,
  radio: Radio,
  toggle: Toggle
};
```

### 2.5 사용 예시

```jsx
// 기본 Input
<FormField 
  name="username" 
  label="사용자명" 
  placeholder="사용자명을 입력하세요"
  required
/>

// Select
<FormField 
  name="country" 
  label="국가" 
  component="select"
  options={[
    { value: 'kr', label: '한국' },
    { value: 'us', label: '미국' }
  ]}
/>

// Textarea
<FormField 
  name="description" 
  label="설명" 
  component="textarea"
  rows={5}
/>

// Checkbox
<FormField 
  name="agreed" 
  label="이용약관에 동의합니다" 
  component="checkbox"
/>

// 커스텀 컴포넌트
<FormField 
  name="avatar" 
  label="프로필 이미지"
  component={ImageUpload}
/>

// 커스텀 검증
<FormField 
  name="username"
  label="사용자명"
  validate={(value) => {
    if (value.length < 3) {
      return '3자 이상 입력하세요';
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return '영문자와 숫자만 사용 가능합니다';
    }
  }}
/>
```

---

## 3. useForm Hook

### 3.1 개요
폼 상태와 로직을 관리하는 커스텀 훅

### 3.2 Parameters

```typescript
{
  initialValues?: object;
  validationSchema?: object;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values) => void | Promise<void>;
}
```

### 3.3 Return Values

```typescript
{
  // 상태
  values: object;
  errors: object;
  touched: object;
  isSubmitting: boolean;
  isValid: boolean;
  
  // 값 변경
  setFieldValue: (name, value) => void;
  setFieldTouched: (name, touched) => void;
  setValues: (values) => void;
  setErrors: (errors) => void;
  
  // 검증
  validateField: (name, value?, customValidator?) => Promise<string | undefined>;
  validateForm: () => Promise<object>;
  
  // 제출
  handleSubmit: () => Promise<void>;
  
  // 초기화
  resetForm: () => void;
  
  // 유틸리티
  getFieldProps: (name) => object;
  getFieldMeta: (name) => object;
}
```

### 3.4 구현

```javascript
export function useForm(options = {}) {
  const {
    initialValues = {},
    validationSchema = {},
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit
  } = options;

  // 상태
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 값 변경
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange) {
      validateField(name, value);
    }
  }, [validateOnChange]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
    
    if (validateOnBlur && isTouched) {
      validateField(name, values[name]);
    }
  }, [validateOnBlur, values]);

  // 검증
  const validateField = useCallback(async (name, value, customValidator) => {
    const fieldValue = value !== undefined ? value : values[name];
    const fieldSchema = validationSchema[name];
    const validator = customValidator || fieldSchema;

    if (!validator) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      return undefined;
    }

    let error;

    // 커스텀 함수 검증
    if (typeof validator === 'function') {
      error = validator(fieldValue, values);
    } 
    // 스키마 기반 검증
    else {
      error = await validateWithSchema(fieldValue, validator);
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    return error;
  }, [values, validationSchema]);

  const validateForm = useCallback(async () => {
    const validationPromises = Object.keys(validationSchema).map(
      name => validateField(name, values[name])
    );

    const results = await Promise.all(validationPromises);
    const newErrors = {};
    
    Object.keys(validationSchema).forEach((name, index) => {
      if (results[index]) {
        newErrors[name] = results[index];
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [values, validationSchema, validateField]);

  // 제출
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    // 모든 필드를 touched로 설정
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // 유효성 검사
    const validationErrors = await validateForm();

    if (Object.keys(validationErrors).length === 0) {
      try {
        await onSubmit?.(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [values, validateForm, onSubmit]);

  // 초기화
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 유틸리티
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => setFieldValue(name, e.target.value),
    onBlur: () => setFieldTouched(name, true)
  }), [values, setFieldValue, setFieldTouched]);

  const getFieldMeta = useCallback((name) => ({
    error: errors[name],
    touched: touched[name],
    value: values[name]
  }), [values, errors, touched]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setFieldValue,
    setFieldTouched,
    setValues,
    setErrors,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    getFieldProps,
    getFieldMeta
  };
}
```

### 3.5 사용 예시

```jsx
// 독립적으로 사용
function MyForm() {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validationSchema: {
      email: {
        required: '이메일을 입력하세요',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: '올바른 이메일 형식이 아닙니다'
        }
      },
      password: {
        required: '비밀번호를 입력하세요',
        minLength: {
          value: 8,
          message: '8자 이상 입력하세요'
        }
      }
    },
    onSubmit: async (values) => {
      await loginUser(values);
    }
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <Input
        {...form.getFieldProps('email')}
        label="이메일"
        error={form.touched.email && form.errors.email}
      />
      
      <Input
        {...form.getFieldProps('password')}
        type="password"
        label="비밀번호"
        error={form.touched.password && form.errors.password}
      />
      
      <Button 
        type="submit" 
        loading={form.isSubmitting}
        disabled={!form.isValid}
      >
        로그인
      </Button>
    </form>
  );
}
```

---

## 4. Validation 시스템

### 4.1 Validation Schema 구조

```javascript
const validationSchema = {
  fieldName: {
    required: string | boolean,
    minLength: { value: number, message: string },
    maxLength: { value: number, message: string },
    min: { value: number, message: string },
    max: { value: number, message: string },
    pattern: { value: RegExp, message: string },
    validate: (value, allValues) => string | undefined,
    // 또는 커스텀 함수
    // (value, allValues) => string | undefined
  }
};
```

### 4.2 내장 Validators

```javascript
const validators = {
  required: (value, message = '필수 입력 항목입니다') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
  },

  minLength: (value, { value: min, message }) => {
    if (value && value.length < min) {
      return message || `최소 ${min}자 이상 입력하세요`;
    }
  },

  maxLength: (value, { value: max, message }) => {
    if (value && value.length > max) {
      return message || `최대 ${max}자까지 입력 가능합니다`;
    }
  },

  min: (value, { value: min, message }) => {
    if (value != null && Number(value) < min) {
      return message || `${min} 이상이어야 합니다`;
    }
  },

  max: (value, { value: max, message }) => {
    if (value != null && Number(value) > max) {
      return message || `${max} 이하여야 합니다`;
    }
  },

  pattern: (value, { value: regex, message }) => {
    if (value && !regex.test(value)) {
      return message || '형식이 올바르지 않습니다';
    }
  },

  email: (value, message) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (value && !emailRegex.test(value)) {
      return message || '올바른 이메일 주소를 입력하세요';
    }
  },

  url: (value, message) => {
    try {
      new URL(value);
    } catch {
      return message || '올바른 URL을 입력하세요';
    }
  },

  phone: (value, message) => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (value && !phoneRegex.test(value)) {
      return message || '올바른 전화번호를 입력하세요';
    }
  }
};
```

### 4.3 validateWithSchema 함수

```javascript
async function validateWithSchema(value, schema) {
  // required 체크
  if (schema.required) {
    const message = typeof schema.required === 'string' 
      ? schema.required 
      : '필수 입력 항목입니다';
    const error = validators.required(value, message);
    if (error) return error;
  }

  // 값이 없으면 나머지 검증 스킵
  if (!value && value !== 0) return;

  // minLength
  if (schema.minLength) {
    const error = validators.minLength(value, schema.minLength);
    if (error) return error;
  }

  // maxLength
  if (schema.maxLength) {
    const error = validators.maxLength(value, schema.maxLength);
    if (error) return error;
  }

  // min
  if (schema.min) {
    const error = validators.min(value, schema.min);
    if (error) return error;
  }

  // max
  if (schema.max) {
    const error = validators.max(value, schema.max);
    if (error) return error;
  }

  // pattern
  if (schema.pattern) {
    const error = validators.pattern(value, schema.pattern);
    if (error) return error;
  }

  // email (shorthand)
  if (schema.email) {
    const message = typeof schema.email === 'string' ? schema.email : undefined;
    const error = validators.email(value, message);
    if (error) return error;
  }

  // url (shorthand)
  if (schema.url) {
    const message = typeof schema.url === 'string' ? schema.url : undefined;
    const error = validators.url(value, message);
    if (error) return error;
  }

  // phone (shorthand)
  if (schema.phone) {
    const message = typeof schema.phone === 'string' ? schema.phone : undefined;
    const error = validators.phone(value, message);
    if (error) return error;
  }

  // 커스텀 validate 함수
  if (schema.validate) {
    const error = await schema.validate(value);
    if (error) return error;
  }

  return undefined;
}
```

### 4.4 Validation 예시

```javascript
// 간단한 검증
const schema = {
  email: {
    required: true,
    email: true
  }
};

// 상세한 검증
const schema = {
  username: {
    required: '사용자명을 입력하세요',
    minLength: {
      value: 3,
      message: '3자 이상 입력하세요'
    },
    maxLength: {
      value: 20,
      message: '20자 이하로 입력하세요'
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: '영문자, 숫자, 언더스코어만 사용 가능합니다'
    }
  },
  age: {
    required: true,
    min: { value: 18, message: '18세 이상이어야 합니다' },
    max: { value: 120, message: '120세 이하여야 합니다' }
  },
  password: {
    required: true,
    minLength: { value: 8, message: '8자 이상' },
    validate: (value) => {
      if (!/[A-Z]/.test(value)) {
        return '대문자를 포함해야 합니다';
      }
      if (!/[a-z]/.test(value)) {
        return '소문자를 포함해야 합니다';
      }
      if (!/[0-9]/.test(value)) {
        return '숫자를 포함해야 합니다';
      }
    }
  },
  confirmPassword: {
    required: true,
    validate: (value, allValues) => {
      if (value !== allValues.password) {
        return '비밀번호가 일치하지 않습니다';
      }
    }
  }
};
```

---

## 5. 폼 패턴 및 예제

### 5.1 로그인 폼

```jsx
function LoginForm() {
  const navigate = useNavigate();

  return (
    <Form
      initialValues={{ email: '', password: '', remember: false }}
      validationSchema={{
        email: {
          required: '이메일을 입력하세요',
          email: true
        },
        password: {
          required: '비밀번호를 입력하세요'
        }
      }}
      onSubmit={async (values) => {
        const { data } = await api.post('/auth/login', values);
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Flex direction="column" gap="md">
          <FormField 
            name="email" 
            label="이메일" 
            type="email"
            placeholder="email@example.com"
          />
          
          <FormField 
            name="password" 
            label="비밀번호" 
            type="password"
          />
          
          <FormField 
            name="remember" 
            label="로그인 상태 유지"
            component="checkbox"
          />
          
          <Flex direction="column" gap="sm">
            <Button 
              type="submit" 
              loading={isSubmitting}
              fullWidth
            >
              로그인
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/forgot-password')}
              fullWidth
            >
              비밀번호를 잊으셨나요?
            </Button>
          </Flex>
        </Flex>
      )}
    </Form>
  );
}
```

### 5.2 회원가입 폼

```jsx
function RegisterForm() {
  return (
    <Form
      initialValues={{
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreed: false
      }}
      validationSchema={{
        username: {
          required: '사용자명을 입력하세요',
          minLength: { value: 3, message: '3자 이상' },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: '영문자, 숫자, 언더스코어만 가능'
          }
        },
        email: {
          required: '이메일을 입력하세요',
          email: true
        },
        password: {
          required: '비밀번호를 입력하세요',
          minLength: { value: 8, message: '8자 이상' },
          validate: (value) => {
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
              return '대소문자와 숫자를 포함해야 합니다';
            }
          }
        },
        confirmPassword: {
          required: '비밀번호 확인을 입력하세요',
          validate: (value, values) => {
            if (value !== values.password) {
              return '비밀번호가 일치하지 않습니다';
            }
          }
        },
        agreed: {
          validate: (value) => {
            if (!value) {
              return '이용약관에 동의해야 합니다';
            }
          }
        }
      }}
      onSubmit={async (values) => {
        await api.post('/auth/register', values);
        toast.success('회원가입이 완료되었습니다');
      }}
    >
      <Flex direction="column" gap="md">
        <FormField 
          name="username" 
          label="사용자명"
          placeholder="username"
        />
        
        <FormField 
          name="email" 
          label="이메일"
          type="email"
          placeholder="email@example.com"
        />
        
        <FormField 
          name="password" 
          label="비밀번호"
          type="password"
          helperText="8자 이상, 대소문자와 숫자 포함"
        />
        
        <FormField 
          name="confirmPassword" 
          label="비밀번호 확인"
          type="password"
        />
        
        <Divider spacing="lg" />
        
        <FormField 
          name="agreed" 
          component="checkbox"
        >
          <span>
            <a href="/terms" target="_blank">이용약관</a>과{' '}
            <a href="/privacy" target="_blank">개인정보처리방침</a>에 동의합니다
          </span>
        </FormField>
        
        <Button type="submit" fullWidth>
          가입하기
        </Button>
      </Flex>
    </Form>
  );
}
```

### 5.3 프로필 수정 폼

```jsx
function ProfileEditForm({ user }) {
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);

  return (
    <Form
      initialValues={{
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        avatar: null
      }}
      validationSchema={{
        name: {
          required: '이름을 입력하세요',
          minLength: { value: 2, message: '2자 이상' }
        },
        email: {
          required: '이메일을 입력하세요',
          email: true
        },
        website: {
          url: '올바른 URL을 입력하세요'
        },
        bio: {
          maxLength: { value: 500, message: '500자 이하' }
        }
      }}
      onSubmit={async (values) => {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (values[key]) formData.append(key, values[key]);
        });
        
        await api.patch('/users/me', formData);
        toast.success('프로필이 업데이트되었습니다');
      }}
    >
      {({ setFieldValue }) => (
        <Card variant="elevated">
          <Card.Header title="프로필 설정" />
          
          <Card.Body>
            <Flex direction="column" gap="lg">
              {/* 아바타 업로드 */}
              <Flex align="center" gap="md">
                <Avatar src={avatarPreview} size="xl" />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFieldValue('avatar', file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ display: 'none' }}
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button as="span" variant="outline">
                      사진 변경
                    </Button>
                  </label>
                </div>
              </Flex>

              <Divider />

              {/* 기본 정보 */}
              <Grid columns={{ md: 2 }} gap="md">
                <FormField 
                  name="name" 
                  label="이름"
                  required
                />
                
                <FormField 
                  name="email" 
                  label="이메일"
                  type="email"
                  required
                />
              </Grid>

              <FormField 
                name="bio" 
                label="소개"
                component="textarea"
                rows={4}
                helperText="자신을 소개하는 글을 작성하세요"
              />

              <Grid columns={{ md: 2 }} gap="md">
                <FormField 
                  name="website" 
                  label="웹사이트"
                  placeholder="https://example.com"
                />
                
                <FormField 
                  name="location" 
                  label="위치"
                  placeholder="서울, 대한민국"
                />
              </Grid>
            </Flex>
          </Card.Body>

          <Card.Footer>
            <Flex justify="end" gap="sm">
              <Button variant="outline" type="button">
                취소
              </Button>
              <Button type="submit">
                저장
              </Button>
            </Flex>
          </Card.Footer>
        </Card>
      )}
    </Form>
  );
}
```

### 5.4 다단계 폼 (Multi-Step Form)

```jsx
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: '기본 정보', fields: ['name', 'email', 'phone'] },
    { title: '주소 정보', fields: ['address', 'city', 'zipCode'] },
    { title: '추가 정보', fields: ['company', 'position'] },
    { title: '확인', fields: [] }
  ];

  return (
    <Form
      initialValues={{
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        company: '',
        position: ''
      }}
      validationSchema={{
        name: { required: true },
        email: { required: true, email: true },
        phone: { required: true, phone: true },
        address: { required: true },
        city: { required: true },
        zipCode: { required: true },
        company: { required: true },
        position: { required: true }
      }}
      onSubmit={async (values) => {
        await api.post('/submit', values);
        toast.success('제출되었습니다');
      }}
    >
      {({ values, errors, touched, validateForm }) => (
        <Card>
          <Card.Header>
            <Flex direction="column" gap="sm">
              <h2>{steps[currentStep].title}</h2>
              <ProgressBar 
                value={(currentStep / (steps.length - 1)) * 100} 
              />
            </Flex>
          </Card.Header>

          <Card.Body>
            {/* Step 0: 기본 정보 */}
            {currentStep === 0 && (
              <Flex direction="column" gap="md">
                <FormField name="name" label="이름" required />
                <FormField name="email" label="이메일" type="email" required />
                <FormField name="phone" label="전화번호" required />
              </Flex>
            )}

            {/* Step 1: 주소 정보 */}
            {currentStep === 1 && (
              <Flex direction="column" gap="md">
                <FormField name="address" label="주소" required />
                <Grid columns={2} gap="md">
                  <FormField name="city" label="도시" required />
                  <FormField name="zipCode" label="우편번호" required />
                </Grid>
              </Flex>
            )}

            {/* Step 2: 추가 정보 */}
            {currentStep === 2 && (
              <Flex direction="column" gap="md">
                <FormField name="company" label="회사명" required />
                <FormField name="position" label="직책" required />
              </Flex>
            )}

            {/* Step 3: 확인 */}
            {currentStep === 3 && (
              <Flex direction="column" gap="md">
                <h3>입력하신 정보를 확인해주세요</h3>
                <Divider />
                
                <div>
                  <strong>기본 정보</strong>
                  <p>이름: {values.name}</p>
                  <p>이메일: {values.email}</p>
                  <p>전화번호: {values.phone}</p>
                </div>

                <Divider />

                <div>
                  <strong>주소 정보</strong>
                  <p>주소: {values.address}</p>
                  <p>도시: {values.city}</p>
                  <p>우편번호: {values.zipCode}</p>
                </div>

                <Divider />

                <div>
                  <strong>추가 정보</strong>
                  <p>회사: {values.company}</p>
                  <p>직책: {values.position}</p>
                </div>
              </Flex>
            )}
          </Card.Body>

          <Card.Footer>
            <Flex justify="between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                이전
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={async () => {
                    // 현재 단계의 필드만 검증
                    const currentFields = steps[currentStep].fields;
                    const errors = await validateForm();
                    const hasErrors = currentFields.some(field => errors[field]);

                    if (!hasErrors) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      toast.error('필수 항목을 입력해주세요');
                    }
                  }}
                >
                  다음
                </Button>
              ) : (
                <Button type="submit">
                  제출
                </Button>
              )}
            </Flex>
          </Card.Footer>
        </Card>
      )}
    </Form>
  );
}
```

### 5.5 동적 폼 필드 (배열)

```jsx
function DynamicFieldsForm() {
  return (
    <Form
      initialValues={{
        teamName: '',
        members: [{ name: '', email: '', role: '' }]
      }}
      validationSchema={{
        teamName: { required: '팀 이름을 입력하세요' },
        members: {
          validate: (members) => {
            if (!members || members.length === 0) {
              return '최소 1명의 멤버를 추가하세요';
            }
            for (let i = 0; i < members.length; i++) {
              if (!members[i].name) {
                return `멤버 ${i + 1}의 이름을 입력하세요`;
              }
              if (!members[i].email) {
                return `멤버 ${i + 1}의 이메일을 입력하세요`;
              }
            }
          }
        }
      }}
      onSubmit={async (values) => {
        await api.post('/teams', values);
        toast.success('팀이 생성되었습니다');
      }}
    >
      {({ values, setFieldValue }) => (
        <Flex direction="column" gap="lg">
          <FormField 
            name="teamName" 
            label="팀 이름" 
            required
          />

          <Divider label="팀 멤버" />

          {values.members.map((member, index) => (
            <Card key={index} variant="bordered">
              <Card.Header>
                <Flex justify="between" align="center">
                  <h4>멤버 {index + 1}</h4>
                  {values.members.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newMembers = values.members.filter((_, i) => i !== index);
                        setFieldValue('members', newMembers);
                      }}
                    >
                      삭제
                    </Button>
                  )}
                </Flex>
              </Card.Header>

              <Card.Body>
                <Flex direction="column" gap="md">
                  <Input
                    label="이름"
                    value={member.name}
                    onChange={(e) => {
                      const newMembers = [...values.members];
                      newMembers[index].name = e.target.value;
                      setFieldValue('members', newMembers);
                    }}
                  />

                  <Input
                    label="이메일"
                    type="email"
                    value={member.email}
                    onChange={(e) => {
                      const newMembers = [...values.members];
                      newMembers[index].email = e.target.value;
                      setFieldValue('members', newMembers);
                    }}
                  />

                  <Select
                    label="역할"
                    value={member.role}
                    onChange={(e) => {
                      const newMembers = [...values.members];
                      newMembers[index].role = e.target.value;
                      setFieldValue('members', newMembers);
                    }}
                    options={[
                      { value: '', label: '선택하세요' },
                      { value: 'admin', label: '관리자' },
                      { value: 'member', label: '멤버' },
                      { value: 'viewer', label: '뷰어' }
                    ]}
                  />
                </Flex>
              </Card.Body>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={() => {
              setFieldValue('members', [
                ...values.members,
                { name: '', email: '', role: '' }
              ]);
            }}
            icon={<PlusIcon />}
          >
            멤버 추가
          </Button>

          <Button type="submit">
            팀 생성
          </Button>
        </Flex>
      )}
    </Form>
  );
}
```

### 5.6 조건부 필드

```jsx
function ConditionalFieldsForm() {
  return (
    <Form
      initialValues={{
        accountType: 'personal',
        name: '',
        email: '',
        companyName: '',
        businessNumber: '',
        agreeMarketing: false
      }}
      validationSchema={{
        accountType: { required: true },
        name: { required: '이름을 입력하세요' },
        email: { required: '이메일을 입력하세요', email: true },
        companyName: {
          validate: (value, allValues) => {
            if (allValues.accountType === 'business' && !value) {
              return '회사명을 입력하세요';
            }
          }
        },
        businessNumber: {
          validate: (value, allValues) => {
            if (allValues.accountType === 'business' && !value) {
              return '사업자번호를 입력하세요';
            }
          }
        }
      }}
      onSubmit={async (values) => {
        await api.post('/accounts', values);
      }}
    >
      {({ values }) => (
        <Flex direction="column" gap="md">
          <FormField
            name="accountType"
            label="계정 유형"
            component="select"
            options={[
              { value: 'personal', label: '개인' },
              { value: 'business', label: '사업자' }
            ]}
          />

          <Divider />

          <FormField name="name" label="이름" required />
          <FormField name="email" label="이메일" type="email" required />

          {/* 조건부 필드 */}
          {values.accountType === 'business' && (
            <>
              <Divider label="사업자 정보" />
              
              <FormField 
                name="companyName" 
                label="회사명" 
                required
              />
              
              <FormField 
                name="businessNumber" 
                label="사업자번호" 
                placeholder="000-00-00000"
                required
              />
            </>
          )}

          <Divider />

          <FormField
            name="agreeMarketing"
            component="checkbox"
            label="마케팅 정보 수신에 동의합니다 (선택)"
          />

          <Button type="submit">
            가입하기
          </Button>
        </Flex>
      )}
    </Form>
  );
}
```

### 5.7 비동기 검증 (중복 확인)

```jsx
function AsyncValidationForm() {
  const [checkingUsername, setCheckingUsername] = useState(false);

  return (
    <Form
      initialValues={{ username: '', email: '', password: '' }}
      validationSchema={{
        username: {
          required: '사용자명을 입력하세요',
          minLength: { value: 3, message: '3자 이상' },
          validate: async (value) => {
            setCheckingUsername(true);
            try {
              const { data } = await api.get(`/check-username?username=${value}`);
              if (data.exists) {
                return '이미 사용 중인 사용자명입니다';
              }
            } catch (error) {
              return '사용자명 확인 중 오류가 발생했습니다';
            } finally {
              setCheckingUsername(false);
            }
          }
        },
        email: {
          required: '이메일을 입력하세요',
          email: true,
          validate: async (value) => {
            const { data } = await api.get(`/check-email?email=${value}`);
            if (data.exists) {
              return '이미 사용 중인 이메일입니다';
            }
          }
        },
        password: {
          required: true,
          minLength: { value: 8, message: '8자 이상' }
        }
      }}
      onSubmit={async (values) => {
        await api.post('/register', values);
      }}
    >
      {({ errors, touched }) => (
        <Flex direction="column" gap="md">
          <div>
            <FormField 
              name="username" 
              label="사용자명"
              helperText="고유한 사용자명을 입력하세요"
            />
            {checkingUsername && (
              <small>사용 가능 여부 확인 중...</small>
            )}
            {touched.username && !errors.username && !checkingUsername && (
              <small style={{ color: 'var(--success)' }}>
                ✓ 사용 가능한 사용자명입니다
              </small>
            )}
          </div>

          <FormField 
            name="email" 
            label="이메일"
            type="email"
          />

          <FormField 
            name="password" 
            label="비밀번호"
            type="password"
          />

          <Button type="submit">
            가입하기
          </Button>
        </Flex>
      )}
    </Form>
  );
}
```

---

## 6. 스타일 명세

### 6.1 Form 스타일

```css
.form {
  width: 100%;
}

.form--theme-minimal {
  /* 기본 스타일 */
}

.form--theme-glassmorphism {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.form--theme-neon {
  background: var(--bg-secondary);
  border: 2px solid var(--primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}
```

### 6.2 FormField 스타일

```css
.form-field {
  margin-bottom: var(--spacing-md);
}

.form-field__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-field__required {
  color: var(--error);
  margin-left: 2px;
}

.form-field__error {
  display: block;
  color: var(--error);
  font-size: 0.75rem;
  margin-top: var(--spacing-xs);
}

.form-field__helper {
  display: block;
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-top: var(--spacing-xs);
}

/* 에러 상태일 때 입력 필드 스타일 */
.form-field--error input,
.form-field--error textarea,
.form-field--error select {
  border-color: var(--error);
}

.form-field--error input:focus,
.form-field--error textarea:focus,
.form-field--error select:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}
```

---

## 7. 구현 우선순위

### 7.1 Phase 1 (핵심)
1. **useForm Hook** - 모든 것의 기반
2. **Form Component** - 기본 컨테이너
3. **Validation 시스템** - 검증 로직

### 7.2 Phase 2 (중요)
4. **FormField** - 편의성 컴포넌트

---

## 8. 파일 구조

```
components/
└── level1/
    ├── Form/
    │   ├── Form.jsx
    │   ├── FormContext.js
    │   ├── Form.css
    │   └── index.js
    └── FormField/
        ├── FormField.jsx
        ├── FormField.css
        └── index.js

hooks/
├── useForm.js
└── index.js

utils/
├── validation.js
└── index.js
```

---

## 9. 테스트 시나리오

### 9.1 Form 테스트
- [ ] 초기값 설정
- [ ] 폼 제출
- [ ] 제출 중 상태
- [ ] 유효성 검사 (제출 시)
- [ ] 초기화

### 9.2 FormField 테스트
- [ ] 다양한 컴포넌트 (input, select, textarea, checkbox)
- [ ] 값 변경
- [ ] 에러 표시
- [ ] required 마크

### 9.3 useForm Hook 테스트
- [ ] 값 설정/변경
- [ ] 필드별 검증
- [ ] 폼 전체 검증
- [ ] touched 상태 관리
- [ ] 에러 상태 관리
- [ ] 제출 핸들링

### 9.4 Validation 테스트
- [ ] required
- [ ] minLength, maxLength
- [ ] min, max
- [ ] pattern
- [ ] email, url, phone
- [ ] 커스텀 검증
- [ ] 비동기 검증
- [ ] 다른 필드 참조 검증

---

## 10. 구현 시 주의사항

### 10.1 성능
- useMemo, useCallback 적절히 사용
- 불필요한 리렌더링 방지
- 디바운스 적용 (비동기 검증)

### 10.2 접근성
- label과 input 연결
- 에러 메시지 aria-describedby 연결
- required 필드 표시
- 포커스 관리

### 10.3 사용성
- 실시간 피드백 (에러, 성공)
- 명확한 에러 메시지
- 로딩 상태 표시
- 제출 중 중복 클릭 방지

### 10.4 유연성
- 제어/비제어 모드 지원
- 커스텀 컴포넌트 지원
- 커스텀 검증 함수 지원
- Render props 패턴 지원

---

## 11. 다음 단계

Day 5 컴포넌트 완성 후:
1. 실제 API와 연동 테스트
2. 다양한 폼 패턴 테스트
3. 비동기 검증 테스트
4. Day 6 상세 설계서 작성 (시각화 & 피드백 컴포넌트)

---

## 12. 참고 자료

### 12.1 폼 라이브러리 참고
- Formik: https://formik.org/
- React Hook Form: https://react-hook-form.com/
- Final Form: https://final-form.org/

### 12.2 Validation 참고
- Yup: https://github.com/jquense/yup
- Zod: https://github.com/colinhacks/zod
- Joi: https://joi.dev/

### 12.3 패턴 참고
- Compound Components: https://kentcdodds.com/blog/compound-components-with-react-hooks
- Render Props: https://reactjs.org/docs/render-props.html

---

## 13. 보너스: 고급 기능

### 13.1 필드 의존성

```javascript
// 한 필드가 다른 필드에 의존하는 경우
const validationSchema = {
  password: { required: true, minLength: { value: 8 } },
  confirmPassword: {
    required: true,
    validate: (value, allValues) => {
      if (value !== allValues.password) {
        return '비밀번호가 일치하지 않습니다';
      }
    }
  }
};
```

### 13.2 필드 감시 (watch)

```javascript
function useFormWithWatch(options) {
  const formMethods = useForm(options);
  
  const watch = (fieldName) => {
    return formMethods.values[fieldName];
  };
  
  const watchAll = () => {
    return formMethods.values;
  };
  
  return {
    ...formMethods,
    watch,
    watchAll
  };
}
```

### 13.3 Dirty 상태

```javascript
// 폼이 수정되었는지 확인
const [isDirty, setIsDirty] = useState(false);

useEffect(() => {
  const hasChanges = JSON.stringify(values) !== JSON.stringify(initialValues);
  setIsDirty(hasChanges);
}, [values, initialValues]);
```

### 13.4 자동 저장

```javascript
function useAutoSave(values, saveFunction, delay = 2000) {
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFunction(values);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [values, delay, saveFunction]);
}
```

---

## 14. 완료 체크리스트

### 14.1 기능 구현
- [ ] useForm Hook
- [ ] Form Component
- [ ] FormField Component
- [ ] FormContext
- [ ] Validation 시스템
- [ ] 내장 validators
- [ ] validateWithSchema 함수

### 14.2 검증 기능
- [ ] required
- [ ] minLength, maxLength
- [ ] min, max  
- [ ] pattern
- [ ] email, url, phone (shorthand)
- [ ] 커스텀 검증 함수
- [ ] 비동기 검증
- [ ] 필드 간 의존성 검증

### 14.3 사용성
- [ ] 제어/비제어 모드
- [ ] Render props 패턴
- [ ] getFieldProps 유틸
- [ ] 초기화 기능
- [ ] 제출 중 상태
- [ ] 에러 메시지 표시

### 14.4 테스트
- [ ] 기본 폼 동작
- [ ] 유효성 검사
- [ ] 비동기 검증
- [ ] 다단계 폼
- [ ] 동적 필드
- [ ] 조건부 필드