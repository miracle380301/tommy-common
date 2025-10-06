# @miracle380301/common - 사용 가이드

## 📦 설치

```bash
npm install @miracle380301/common
```

## 🎨 테마 시스템

3가지 테마를 지원합니다:
- `minimal` (기본값): 미니멀한 디자인
- `glassmorphism`: 유리 느낌의 반투명 디자인
- `neon`: 네온 스타일의 화려한 디자인

대부분의 컴포넌트에서 `theme` prop으로 테마를 지정할 수 있습니다.

## 📚 Level1 컴포넌트 (기본 컴포넌트)

### 🔘 Button
버튼 컴포넌트

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: 로딩 상태 표시
- `icon`: 아이콘 엘리먼트
- `iconPosition`: 'left' | 'right'
- `fullWidth`: 전체 너비 사용

```tsx
import { Button } from '@miracle380301/common';

<Button variant="primary" size="md" theme="minimal">
  클릭하세요
</Button>

<Button loading icon={<Icon />} iconPosition="left">
  로딩중...
</Button>
```

### 📝 Input
입력 필드 컴포넌트

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `label`: 레이블 텍스트
- `error`: 에러 메시지
- `helperText`: 도움말 텍스트
- `icon`: 아이콘
- `iconPosition`: 'left' | 'right'

```tsx
import { Input } from '@miracle380301/common';

<Input
  label="이메일"
  type="email"
  placeholder="email@example.com"
  error="유효한 이메일을 입력하세요"
  icon={<MailIcon />}
  required
/>
```

### 🃏 Card
카드 컨테이너 컴포넌트 (Compound Component)

**Props:**
- `variant`: 'default' | 'bordered' | 'elevated' | 'flat'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hoverable`: 호버 효과
- `clickable`: 클릭 가능

```tsx
import { Card } from '@miracle380301/common';

<Card variant="elevated" hoverable>
  <Card.Header title="제목" subtitle="부제목" action={<button>액션</button>} />
  <Card.Body>
    내용...
  </Card.Body>
  <Card.Footer>
    푸터 내용
  </Card.Footer>
</Card>
```

### 🪟 Modal
모달 대화상자 컴포넌트 (Compound Component)

**Props:**
- `isOpen`: 모달 열림 상태
- `onClose`: 닫기 핸들러
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlay`: 오버레이 클릭시 닫기
- `closeOnEsc`: ESC 키로 닫기

```tsx
import { Modal } from '@miracle380301/common';

<Modal isOpen={isOpen} onClose={handleClose} size="md">
  <Modal.Header title="모달 제목" />
  <Modal.Body>
    모달 내용...
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>닫기</Button>
  </Modal.Footer>
</Modal>
```

### ☑️ Checkbox
체크박스 컴포넌트

```tsx
import { Checkbox } from '@miracle380301/common';

<Checkbox
  label="동의합니다"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
/>
```

### 🔘 Radio & RadioGroup
라디오 버튼 컴포넌트

```tsx
import { Radio, RadioGroup } from '@miracle380301/common';

<RadioGroup
  value={selected}
  onChange={setSelected}
  direction="horizontal"
>
  <Radio value="option1" label="옵션 1" />
  <Radio value="option2" label="옵션 2" />
</RadioGroup>
```

### 📋 Select
선택 드롭다운 컴포넌트

```tsx
import { Select } from '@miracle380301/common';

<Select
  options={[
    { value: '1', label: '옵션 1' },
    { value: '2', label: '옵션 2' }
  ]}
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  placeholder="선택하세요"
/>
```

### 📄 Textarea
다중 라인 입력 컴포넌트

```tsx
import { Textarea } from '@miracle380301/common';

<Textarea
  label="설명"
  rows={5}
  resize="vertical"
  placeholder="내용을 입력하세요"
/>
```

### 🔀 Toggle
토글 스위치 컴포넌트

```tsx
import { Toggle } from '@miracle380301/common';

<Toggle
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
  label="기능 활성화"
/>
```

### 📊 Table
테이블 컴포넌트

```tsx
import { Table } from '@miracle380301/common';

const columns = [
  { key: 'name', label: '이름' },
  { key: 'age', label: '나이' },
];

<Table
  columns={columns}
  data={data}
  sortable
  onRowClick={(row) => console.log(row)}
/>
```

### 📄 Pagination
페이지네이션 컴포넌트

```tsx
import { Pagination } from '@miracle380301/common';

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  showPageSize
/>
```

### 🎨 Layout 컴포넌트

#### Grid
그리드 레이아웃

```tsx
import { Grid } from '@miracle380301/common';

<Grid columns={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

#### Flex
플렉스 레이아웃

```tsx
import { Flex } from '@miracle380301/common';

<Flex direction="row" justify="between" align="center" gap="md">
  <div>Left</div>
  <div>Right</div>
</Flex>
```

#### Container
컨테이너 (최대 너비 제한)

```tsx
import { Container } from '@miracle380301/common';

<Container maxWidth="lg">
  내용...
</Container>
```

### 🎯 기타 컴포넌트

#### Badge
배지 컴포넌트

```tsx
import { Badge } from '@miracle380301/common';

<Badge variant="success">New</Badge>
```

#### Tag
태그 컴포넌트 (닫기 가능)

```tsx
import { Tag } from '@miracle380301/common';

<Tag variant="info" onClose={() => console.log('closed')}>
  태그
</Tag>
```

#### Chip
칩 컴포넌트

```tsx
import { Chip } from '@miracle380301/common';

<Chip color="primary" size="md">
  Chip
</Chip>
```

#### Loading
로딩 스피너

```tsx
import { Loading } from '@miracle380301/common';

<Loading size="md" text="로딩 중..." />
```

#### ProgressBar
진행률 표시

```tsx
import { ProgressBar } from '@miracle380301/common';

<ProgressBar value={75} max={100} showLabel />
```

#### Divider
구분선

```tsx
import { Divider } from '@miracle380301/common';

<Divider label="또는" />
```

#### EmptyState
빈 상태 표시

```tsx
import { EmptyState } from '@miracle380301/common';

<EmptyState
  title="데이터가 없습니다"
  description="새로운 항목을 추가해보세요"
  icon={<EmptyIcon />}
  action={<Button>추가하기</Button>}
/>
```

#### SearchBar
검색 바

```tsx
import { SearchBar } from '@miracle380301/common';

<SearchBar
  value={query}
  onSearch={setQuery}
  placeholder="검색..."
/>
```

#### Tabs
탭 컴포넌트

```tsx
import { Tabs } from '@miracle380301/common';

<Tabs
  tabs={[
    { key: 'tab1', label: '탭 1', content: <div>내용 1</div> },
    { key: 'tab2', label: '탭 2', content: <div>내용 2</div> }
  ]}
  defaultActiveKey="tab1"
/>
```

#### Accordion
아코디언 컴포넌트

```tsx
import { Accordion } from '@miracle380301/common';

<Accordion
  items={[
    { key: '1', title: '제목 1', content: '내용 1' },
    { key: '2', title: '제목 2', content: '내용 2' }
  ]}
/>
```

### 📝 Form 컴포넌트

#### Form
폼 컨테이너 (검증 기능 포함)

```tsx
import { Form, FormField } from '@miracle380301/common';

const validationSchema = {
  email: {
    required: '이메일을 입력하세요',
    email: true,
  },
  password: {
    required: true,
    minLength: { value: 6, message: '최소 6자 이상' }
  }
};

<Form
  onSubmit={(values) => console.log(values)}
  validationSchema={validationSchema}
>
  <FormField
    name="email"
    label="이메일"
    type="email"
    required
  />
  <FormField
    name="password"
    label="비밀번호"
    type="password"
    required
  />
  <Button type="submit">제출</Button>
</Form>
```

## 🏗️ Level2 컴포넌트 (복합 컴포넌트)

### 🔐 인증 컴포넌트

#### LoginForm
로그인 폼 (소셜 로그인 포함)

```tsx
import { LoginForm } from '@miracle380301/common';

<LoginForm
  onSubmit={async (credentials) => {
    // 로그인 처리
  }}
  onForgotPassword={() => navigate('/forgot-password')}
  onSignUp={() => navigate('/signup')}
  showSocialLogin
  socialProviders={['kakao', 'apple', 'google']}
  onSocialLogin={(provider) => console.log(provider)}
/>
```

#### RegisterForm
회원가입 폼

```tsx
import { RegisterForm } from '@miracle380301/common';

<RegisterForm
  onSubmit={async (data) => {
    // 회원가입 처리
  }}
  onLogin={() => navigate('/login')}
/>
```

#### ForgotPasswordForm
비밀번호 찾기 폼

```tsx
import { ForgotPasswordForm } from '@miracle380301/common';

<ForgotPasswordForm
  onSubmit={async (email) => {
    // 비밀번호 재설정 이메일 발송
  }}
  onBack={() => navigate('/login')}
/>
```

### 📊 대시보드 컴포넌트

#### DataTable
고급 데이터 테이블 (검색, 필터, 정렬, 페이지네이션)

```tsx
import { DataTable } from '@miracle380301/common';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'status', label: '상태' },
];

const filterConfig = [
  {
    key: 'status',
    label: '상태',
    type: 'select',
    options: [
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' }
    ]
  }
];

<DataTable
  columns={columns}
  data={data}
  searchable
  filterable
  filterConfig={filterConfig}
  pagination
  pageSize={10}
  exportable
  selectable
  onSelectionChange={(rows) => console.log(rows)}
/>
```

#### StatCard
통계 카드

```tsx
import { StatCard } from '@miracle380301/common';

<StatCard
  title="총 사용자"
  value="1,234"
  trend="up"
  trendValue="+12%"
  icon={<UserIcon />}
/>
```

#### DashboardCard
대시보드용 카드

```tsx
import { DashboardCard } from '@miracle380301/common';

<DashboardCard
  title="최근 활동"
  subtitle="지난 7일간"
  action={<Button>더보기</Button>}
>
  내용...
</DashboardCard>
```

#### ActivityFeed
활동 피드

```tsx
import { ActivityFeed } from '@miracle380301/common';

<ActivityFeed
  activities={[
    {
      id: '1',
      type: 'user_joined',
      user: { name: '홍길동', avatar: '/avatar.jpg' },
      timestamp: new Date(),
      description: '새로운 사용자가 가입했습니다'
    }
  ]}
/>
```

#### FilterPanel
필터 패널

```tsx
import { FilterPanel } from '@miracle380301/common';

<FilterPanel
  filters={[
    {
      key: 'category',
      label: '카테고리',
      type: 'select',
      options: [...]
    },
    {
      key: 'dateRange',
      label: '기간',
      type: 'dateRange'
    }
  ]}
  values={filterValues}
  onChange={(key, value) => setFilterValues({...filterValues, [key]: value})}
  onReset={() => setFilterValues({})}
/>
```

### 📁 파일 및 미디어

#### FileUploader
파일 업로드

```tsx
import { FileUploader } from '@miracle380301/common';

<FileUploader
  onUpload={(files) => console.log(files)}
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
  multiple
/>
```

#### ImageGallery
이미지 갤러리

```tsx
import { ImageGallery } from '@miracle380301/common';

<ImageGallery
  images={[
    { id: '1', url: '/image1.jpg', alt: '이미지 1' },
    { id: '2', url: '/image2.jpg', alt: '이미지 2' }
  ]}
  columns={3}
  onImageClick={(image) => console.log(image)}
/>
```

## 🎣 Hooks

### useForm
폼 상태 및 검증 관리

```tsx
import { useForm } from '@miracle380301/common';

const { values, errors, handleSubmit, getFieldProps } = useForm({
  initialValues: { email: '', password: '' },
  validationSchema: {
    email: { required: true, email: true },
    password: { required: true, minLength: { value: 6 } }
  },
  onSubmit: async (values) => {
    // 제출 처리
  }
});

<input {...getFieldProps('email')} />
{errors.email && <span>{errors.email}</span>}
```

### useToggle
토글 상태 관리

```tsx
import { useToggle } from '@miracle380301/common';

const [isOpen, toggleOpen] = useToggle(false);

<button onClick={toggleOpen}>토글</button>
```

### useDebounce
디바운스 처리

```tsx
import { useDebounce } from '@miracle380301/common';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  // API 호출
}, [debouncedSearch]);
```

### useLocalStorage
로컬 스토리지 동기화

```tsx
import { useLocalStorage } from '@miracle380301/common';

const [user, setUser] = useLocalStorage('user', null);
```

### useClickOutside
외부 클릭 감지

```tsx
import { useClickOutside } from '@miracle380301/common';

const ref = useRef(null);
useClickOutside(ref, () => setIsOpen(false));

<div ref={ref}>내용</div>
```

### useEscapeKey
ESC 키 감지

```tsx
import { useEscapeKey } from '@miracle380301/common';

useEscapeKey(() => setIsOpen(false), isOpen);
```

### useLockBodyScroll
바디 스크롤 잠금

```tsx
import { useLockBodyScroll } from '@miracle380301/common';

useLockBodyScroll(isModalOpen);
```

## 🛠️ Utils

### 클래스명 유틸리티

```tsx
import { cn } from '@miracle380301/common';

<div className={cn('base-class', isActive && 'active', className)}>
  내용
</div>
```

### 검증 유틸리티

```tsx
import { validators, validateWithSchema } from '@miracle380301/common';

// 개별 검증
const error = validators.email('test@example.com');
const phoneError = validators.phone('010-1234-5678');

// 스키마 검증
const schema = {
  email: { required: true, email: true },
  age: { min: { value: 18, message: '18세 이상만 가능' } }
};

const error = await validateWithSchema(value, schema.email);
```

### 포맷 유틸리티

```tsx
import {
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatFileSize
} from '@miracle380301/common';

formatDate(new Date(), 'YYYY-MM-DD HH:mm'); // "2024-10-07 15:30"
formatRelativeTime(new Date(Date.now() - 3600000)); // "1시간 전"
formatNumber(1234567, { decimals: 2 }); // "1,234,567.00"
formatCurrency(50000, 'KRW'); // "₩50,000"
formatFileSize(1024 * 1024); // "1 MB"
```

## 🎨 스타일 커스터마이징

CSS 변수를 import하여 사용:

```tsx
import '@miracle380301/common/dist/styles/variables.css';
```

또는 개별 컴포넌트 스타일:

```tsx
import '@miracle380301/common/dist/frontend/level1/Button/Button.css';
```

## 📝 TypeScript 지원

모든 컴포넌트와 유틸리티는 TypeScript로 작성되어 완전한 타입 지원을 제공합니다.

```tsx
import type {
  Theme,
  Size,
  ButtonVariant,
  ValidationSchema
} from '@miracle380301/common';
```

## 🔗 추가 정보

- **패키지 이름**: `@miracle380301/common`
- **레지스트리**: GitHub Packages
- **리포지토리**: [https://github.com/miracle380301/tommy-common](https://github.com/miracle380301/tommy-common)
