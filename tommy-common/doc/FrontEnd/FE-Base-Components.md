# Day 1 상세 설계서 - 기본 입력 컴포넌트

## ✅ 구현 완료 (2025-10-03)

**상태**: 전체 완료 ✨
**구현 컴포넌트**: 7개 (Button, Input, Checkbox, Select, Textarea, Toggle, Radio/RadioGroup)
**테마**: 3가지 (Minimal, Glassmorphism, Neon)

### 📦 패키지 정보
- **이름**: `@miracle380301/tommy-common`
- **버전**: 1.0.4
- **경로**: `components/level1/`

### 🚀 실행 방법

#### 1. 테스트 페이지 실행
```bash
cd test/frontEnd
npm install  # 처음 한 번만
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

#### 2. 사용 가능한 페이지
- **📚 Component Docs**: 전체 컴포넌트 문서 (shadcn UI 스타일)
  - 각 컴포넌트 예시 및 사용법
  - Props 상세 명세
  - 코드 예제
  - 실시간 테마 전환

- **🧪 Test Page**: 간단한 테스트 페이지
  - ID/Password 입력
  - Submit 버튼
  - 다크모드 토글
  - 커스텀 페이지 제작 가능

### 💻 사용 예시

```tsx
import {
  Button,
  Input,
  Checkbox,
  Select,
  Textarea,
  Toggle,
  Radio,
  RadioGroup
} from '@miracle380301/tommy-common';
import '@miracle380301/tommy-common/components/styles/variables.css';

// 기본 사용
<Button theme="minimal" variant="primary" size="md">
  클릭
</Button>

<Input
  theme="glassmorphism"
  label="이메일"
  type="email"
  placeholder="email@example.com"
/>

<Select
  theme="neon"
  label="국가"
  options={[
    { value: 'kr', label: '한국' },
    { value: 'us', label: '미국' }
  ]}
/>
```

### 📁 구조

```
components/
├── level1/           # Level 1 컴포넌트
│   ├── Button/
│   ├── Input/
│   ├── Checkbox/
│   ├── Select/
│   ├── Textarea/
│   ├── Toggle/
│   └── Radio/
├── styles/           # CSS Variables
│   └── variables.css
└── utils/            # 유틸리티
    ├── classNames.ts
    ├── types.ts
    └── hooks.ts

test/frontEnd/        # 테스트 환경
├── level1.tsx        # Component Docs
├── test.tsx          # Test Page
├── App.tsx           # 메인 앱 (탭 전환)
└── main.tsx          # 엔트리 포인트
```

### 🎨 테마 전환

모든 컴포넌트는 `theme` prop으로 테마 변경 가능:
- `minimal`: 심플한 디자인
- `glassmorphism`: 반투명 효과 + backdrop-blur
- `neon`: 네온 글로우 효과

```tsx
<Button theme="minimal">Minimal</Button>
<Button theme="glassmorphism">Glassmorphism</Button>
<Button theme="neon">Neon</Button>
```

---

## 목차
1. [Button](#1-button)
2. [Input](#2-input)
3. [Select](#3-select)
4. [Textarea](#4-textarea)
5. [Checkbox](#5-checkbox)
6. [Radio](#6-radio)
7. [Toggle](#7-toggle)
8. [공통 CSS Variables](#8-공통-css-variables)

---

## 1. Button

### 1.1 개요
클릭 가능한 버튼 컴포넌트로, 다양한 스타일과 크기, 상태를 지원한다.

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' | No | 'primary' | 버튼 스타일 변형 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 버튼 크기 |
| disabled | boolean | No | false | 비활성화 여부 |
| loading | boolean | No | false | 로딩 상태 여부 |
| fullWidth | boolean | No | false | 전체 너비 사용 여부 |
| icon | ReactNode | No | - | 버튼 내 아이콘 |
| iconPosition | 'left' \| 'right' | No | 'left' | 아이콘 위치 |
| onClick | function | No | - | 클릭 이벤트 핸들러 |
| children | ReactNode | Yes | - | 버튼 텍스트 |

### 1.3 내부 상태
- 내부 상태 없음 (모두 props로 제어)

### 1.4 동작 방식

#### 1.4.1 기본 동작
- 클릭 시 `onClick` 핸들러 실행
- `disabled` 또는 `loading` 상태일 때 클릭 이벤트 무시

#### 1.4.2 로딩 상태
- `loading={true}` 시 스피너 아이콘 표시
- 텍스트는 유지, 클릭 불가능

#### 1.4.3 아이콘 표시
- `icon` prop 제공 시 텍스트 옆에 아이콘 표시
- `iconPosition`으로 좌/우 위치 결정

### 1.5 스타일 명세

#### 1.5.1 Size 변형
```css
/* sm */
padding: var(--spacing-xs) var(--spacing-sm);
font-size: 14px;
height: 32px;

/* md */
padding: var(--spacing-sm) var(--spacing-md);
font-size: 16px;
height: 40px;

/* lg */
padding: var(--spacing-md) var(--spacing-lg);
font-size: 18px;
height: 48px;
```

#### 1.5.2 Variant 변형
- **primary**: 배경색 `--primary`, 텍스트 흰색
- **secondary**: 배경색 `--secondary`, 텍스트 흰색
- **outline**: 테두리만, 배경 투명
- **ghost**: 테두리/배경 없음, 호버 시 배경 추가

#### 1.5.3 상태별 스타일
- **hover**: 밝기 조정 또는 그림자 추가
- **active**: 눌린 효과 (scale 0.98)
- **disabled**: 투명도 0.5, cursor: not-allowed
- **loading**: disabled와 유사 + 스피너 표시

#### 1.5.4 테마별 차이
- **minimal**: 간단한 배경, 얇은 테두리
- **glassmorphism**: 반투명 배경, backdrop-blur
- **neon**: 글로우 효과, 밝은 테두리

### 1.6 접근성
- `button` 태그 사용
- `disabled` 상태 시 `aria-disabled="true"` 추가
- `loading` 상태 시 `aria-busy="true"` 추가
- 키보드 포커스 시 outline 표시

### 1.7 사용 예시
```jsx
// 기본 사용
<Button onClick={handleClick}>클릭</Button>

// 로딩 상태
<Button loading>저장 중...</Button>

// 아이콘 포함
<Button icon={<SaveIcon />}>저장</Button>

// 테마 적용
<Button theme="neon" variant="outline" size="lg">
  제출하기
</Button>
```

---

## 2. Input

### 2.1 개요
텍스트 입력 필드로, 다양한 타입과 유효성 검사를 지원한다.

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | 'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url' | No | 'text' | 입력 타입 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 입력 필드 크기 |
| label | string | No | - | 레이블 텍스트 |
| placeholder | string | No | - | placeholder 텍스트 |
| value | string | No | - | 입력값 (제어 컴포넌트) |
| defaultValue | string | No | - | 초기값 (비제어 컴포넌트) |
| error | string | No | - | 에러 메시지 |
| helperText | string | No | - | 도움말 텍스트 |
| disabled | boolean | No | false | 비활성화 여부 |
| required | boolean | No | false | 필수 입력 여부 |
| fullWidth | boolean | No | false | 전체 너비 사용 여부 |
| icon | ReactNode | No | - | 입력 필드 내 아이콘 |
| iconPosition | 'left' \| 'right' | No | 'left' | 아이콘 위치 |
| onChange | function | No | - | 값 변경 핸들러 |
| onBlur | function | No | - | 포커스 해제 핸들러 |
| onFocus | function | No | - | 포커스 핸들러 |

### 2.3 내부 상태
- `isFocused`: 포커스 상태 (스타일 변경용)

### 2.4 동작 방식

#### 2.4.1 제어 컴포넌트
- `value`와 `onChange` 제공 시 제어 컴포넌트로 동작
- 부모 컴포넌트가 상태 관리

#### 2.4.2 비제어 컴포넌트
- `defaultValue` 제공 시 비제어 컴포넌트로 동작
- ref를 통해 값 접근 가능

#### 2.4.3 유효성 검사 표시
- `error` prop 존재 시 에러 스타일 적용
- 에러 메시지를 입력 필드 하단에 표시

### 2.5 스타일 명세

#### 2.5.1 Size 변형
```css
/* sm */
height: 32px;
font-size: 14px;
padding: 0 var(--spacing-sm);

/* md */
height: 40px;
font-size: 16px;
padding: 0 var(--spacing-md);

/* lg */
height: 48px;
font-size: 18px;
padding: 0 var(--spacing-lg);
```

#### 2.5.2 상태별 스타일
- **default**: 테두리 `--border-color`
- **focus**: 테두리 `--primary`, outline 추가
- **error**: 테두리 `--error`, 에러 메시지 빨간색
- **disabled**: 배경 회색, cursor: not-allowed

#### 2.5.3 레이아웃
- Label: 입력 필드 위에 표시, `required` 시 * 표시
- HelperText: 입력 필드 아래 작은 글씨로 표시
- Error: helperText 위치에 빨간색으로 표시

### 2.6 접근성
- `input` 태그 사용
- `label`과 `htmlFor` 연결
- `required` 시 `aria-required="true"`
- `error` 시 `aria-invalid="true"`, `aria-describedby`로 에러 메시지 연결

### 2.7 사용 예시
```jsx
// 기본 사용
<Input 
  label="이메일"
  type="email"
  placeholder="email@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// 에러 표시
<Input 
  label="비밀번호"
  type="password"
  error="8자 이상 입력해주세요"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// 아이콘 포함
<Input 
  icon={<SearchIcon />}
  placeholder="검색..."
/>
```

---

## 3. Select

### 3.1 개요
드롭다운 선택 박스로, 여러 옵션 중 하나를 선택할 수 있다.

### 3.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| options | Array<{value: string, label: string}> | Yes | - | 선택 옵션 목록 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 크기 |
| label | string | No | - | 레이블 텍스트 |
| placeholder | string | No | '선택하세요' | placeholder 텍스트 |
| value | string | No | - | 선택된 값 |
| defaultValue | string | No | - | 초기 선택 값 |
| error | string | No | - | 에러 메시지 |
| disabled | boolean | No | false | 비활성화 여부 |
| required | boolean | No | false | 필수 선택 여부 |
| fullWidth | boolean | No | false | 전체 너비 사용 여부 |
| onChange | function | No | - | 선택 변경 핸들러 |

### 3.3 내부 상태
- `isOpen`: 드롭다운 열림 상태

### 3.4 동작 방식

#### 3.4.1 드롭다운 열기/닫기
- 선택 박스 클릭 시 드롭다운 토글
- 옵션 선택 시 드롭다운 닫힘
- 외부 클릭 시 드롭다운 닫힘

#### 3.4.2 옵션 선택
- 옵션 클릭 시 `onChange(value)` 호출
- 선택된 옵션의 label을 선택 박스에 표시

#### 3.4.3 키보드 네비게이션
- Enter/Space: 드롭다운 열기
- Arrow Up/Down: 옵션 탐색
- Escape: 드롭다운 닫기

### 3.5 스타일 명세

#### 3.5.1 구조
- Select Box (현재 선택 값 표시)
- Dropdown Menu (옵션 목록)
- 화살표 아이콘 (열림/닫힘 표시)

#### 3.5.2 드롭다운 위치
- 기본: 선택 박스 하단
- 공간 부족 시: 선택 박스 상단

#### 3.5.3 상태별 스타일
- Input과 동일한 스타일 적용
- 드롭다운 메뉴: 그림자, 최대 높이 제한, 스크롤

### 3.6 접근성
- `role="combobox"`
- `aria-expanded`: 드롭다운 열림 상태
- `aria-activedescendant`: 현재 포커스된 옵션

### 3.7 사용 예시
```jsx
<Select
  label="국가"
  options={[
    { value: 'kr', label: '한국' },
    { value: 'us', label: '미국' },
    { value: 'jp', label: '일본' }
  ]}
  value={country}
  onChange={setCountry}
/>
```

---

## 4. Textarea

### 4.1 개요
여러 줄 텍스트 입력 필드

### 4.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| label | string | No | - | 레이블 텍스트 |
| placeholder | string | No | - | placeholder 텍스트 |
| value | string | No | - | 입력값 |
| defaultValue | string | No | - | 초기값 |
| rows | number | No | 4 | 표시할 줄 수 |
| maxLength | number | No | - | 최대 글자 수 |
| error | string | No | - | 에러 메시지 |
| helperText | string | No | - | 도움말 텍스트 |
| disabled | boolean | No | false | 비활성화 여부 |
| required | boolean | No | false | 필수 입력 여부 |
| fullWidth | boolean | No | false | 전체 너비 사용 여부 |
| resize | 'none' \| 'vertical' \| 'horizontal' \| 'both' | No | 'vertical' | 크기 조절 방향 |
| onChange | function | No | - | 값 변경 핸들러 |

### 4.3 내부 상태
- `isFocused`: 포커스 상태

### 4.4 동작 방식

#### 4.4.1 글자 수 표시
- `maxLength` 제공 시 우측 하단에 "현재/최대" 표시
- 예: "50/200"

#### 4.4.2 자동 높이 조절 (옵션)
- 내용에 따라 높이 자동 증가
- `autoGrow` prop으로 제어 가능

### 4.5 스타일 명세
- Input과 유사하나 `height`는 `rows`에 따라 결정
- `resize` prop에 따라 크기 조절 가능 여부 설정

### 4.6 접근성
- `textarea` 태그 사용
- Input과 동일한 접근성 속성

### 4.7 사용 예시
```jsx
<Textarea
  label="설명"
  placeholder="내용을 입력하세요"
  rows={6}
  maxLength={500}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

---

## 5. Checkbox

### 5.1 개요
단일 또는 다중 선택 체크박스

### 5.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| label | string | No | - | 레이블 텍스트 |
| checked | boolean | No | false | 체크 상태 |
| defaultChecked | boolean | No | false | 초기 체크 상태 |
| disabled | boolean | No | false | 비활성화 여부 |
| indeterminate | boolean | No | false | 중간 상태 (일부 선택) |
| value | string | No | - | 값 (폼 제출 시 사용) |
| onChange | function | No | - | 상태 변경 핸들러 |

### 5.3 내부 상태
- 비제어 컴포넌트로 사용 시 내부에서 `checked` 상태 관리

### 5.4 동작 방식

#### 5.4.1 체크/해제
- 클릭 시 상태 토글
- `onChange(event)` 호출, `event.target.checked`로 상태 전달

#### 5.4.2 Indeterminate 상태
- 전체 선택/해제가 아닌 일부만 선택된 상태
- 시각적으로만 표시, 실제 값은 `checked`

### 5.5 스타일 명세

#### 5.5.1 구조
- 체크박스 아이콘 (16x16px)
- 레이블 텍스트 (좌측 또는 우측)

#### 5.5.2 상태별 스타일
- **unchecked**: 빈 네모
- **checked**: 체크 아이콘 (✓)
- **indeterminate**: 가로선 (-)
- **disabled**: 투명도 낮춤

#### 5.5.3 테마별 차이
- **minimal**: 심플한 체크 표시
- **glassmorphism**: 반투명 배경
- **neon**: 글로우 효과

### 5.6 접근성
- `input[type="checkbox"]` 사용 (숨김)
- 커스텀 스타일 div로 시각적 표현
- `label`로 클릭 영역 확장
- 키보드 포커스 시 outline

### 5.7 사용 예시
```jsx
// 단일 체크박스
<Checkbox
  label="이용약관에 동의합니다"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>

// 중간 상태 (전체 선택)
<Checkbox
  label="전체 선택"
  checked={allChecked}
  indeterminate={someChecked}
  onChange={handleSelectAll}
/>
```

---

## 6. Radio

### 6.1 개요
여러 옵션 중 하나만 선택할 수 있는 라디오 버튼

### 6.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| label | string | No | - | 레이블 텍스트 |
| name | string | Yes | - | 라디오 그룹 이름 |
| value | string | Yes | - | 라디오 값 |
| checked | boolean | No | false | 선택 상태 |
| defaultChecked | boolean | No | false | 초기 선택 상태 |
| disabled | boolean | No | false | 비활성화 여부 |
| onChange | function | No | - | 선택 변경 핸들러 |

### 6.3 RadioGroup 컴포넌트

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| name | string | Yes | - | 그룹 이름 |
| value | string | No | - | 선택된 값 |
| defaultValue | string | No | - | 초기 선택 값 |
| direction | 'horizontal' \| 'vertical' | No | 'vertical' | 정렬 방향 |
| onChange | function | No | - | 선택 변경 핸들러 |
| children | ReactNode | Yes | - | Radio 컴포넌트들 |

### 6.4 동작 방식

#### 6.4.1 그룹 관리
- RadioGroup으로 여러 Radio를 묶음
- 같은 `name`을 가진 Radio는 하나만 선택 가능

#### 6.4.2 선택 변경
- Radio 클릭 시 해당 값으로 선택
- RadioGroup의 `onChange(value)` 호출

### 6.5 스타일 명세

#### 6.5.1 구조
- 원형 아이콘 (16x16px)
- 레이블 텍스트

#### 6.5.2 상태별 스타일
- **unselected**: 빈 원
- **selected**: 중앙에 작은 원 (내부 dot)
- **disabled**: 투명도 낮춤

### 6.6 접근성
- `input[type="radio"]` 사용
- `role="radio"`, `role="radiogroup"`
- 화살표 키로 그룹 내 탐색

### 6.7 사용 예시
```jsx
<RadioGroup 
  name="payment"
  value={paymentMethod}
  onChange={setPaymentMethod}
>
  <Radio value="card" label="신용카드" />
  <Radio value="bank" label="계좌이체" />
  <Radio value="phone" label="휴대폰 결제" />
</RadioGroup>
```

---

## 7. Toggle

### 7.1 개요
온/오프를 전환하는 스위치 컴포넌트

### 7.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| label | string | No | - | 레이블 텍스트 |
| checked | boolean | No | false | 온/오프 상태 |
| defaultChecked | boolean | No | false | 초기 상태 |
| disabled | boolean | No | false | 비활성화 여부 |
| size | 'sm' \| 'md' | No | 'md' | 크기 |
| onChange | function | No | - | 상태 변경 핸들러 |

### 7.3 내부 상태
- 비제어 컴포넌트로 사용 시 내부 상태 관리

### 7.4 동작 방식

#### 7.4.1 토글
- 클릭 시 상태 반전
- `onChange(event)` 호출

#### 7.4.2 애니메이션
- 스위치 핸들이 부드럽게 이동
- 배경색 변경 애니메이션

### 7.5 스타일 명세

#### 7.5.1 Size 변형
```css
/* sm */
width: 40px;
height: 20px;
handle: 16px;

/* md */
width: 48px;
height: 24px;
handle: 20px;
```

#### 7.5.2 구조
- 트랙 (배경 막대)
- 핸들 (움직이는 원)

#### 7.5.3 상태별 스타일
- **off**: 회색 배경, 핸들 좌측
- **on**: primary 색상 배경, 핸들 우측
- **disabled**: 투명도 낮춤

#### 7.5.4 애니메이션
- `transition: all 0.2s ease`
- 핸들 이동, 배경색 변경

### 7.6 접근성
- `input[type="checkbox"]` 기반 (role="switch")
- `aria-checked`: 현재 상태
- 키보드로 포커스 및 Space로 토글 가능

### 7.7 사용 예시
```jsx
<Toggle
  label="알림 받기"
  checked={notification}
  onChange={(e) => setNotification(e.target.checked)}
/>

<Toggle
  label="다크 모드"
  size="sm"
  checked={darkMode}
  onChange={(e) => setDarkMode(e.target.checked)}
/>
```

---

## 8. 공통 CSS Variables

### 8.1 컬러 시스템
```css
:root {
  /* Primary Colors */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-light: #dbeafe;
  
  /* Secondary Colors */
  --secondary: #64748b;
  --secondary-hover: #475569;
  
  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Neutral Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --border-color: #e5e7eb;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
  
  /* Focus */
  --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
```

### 8.2 Minimal Theme
```css
[data-theme="minimal"] {
  --primary: #000000;
  --primary-hover: #1f1f1f;
  --bg-primary: #ffffff;
  --border-color: #e5e7eb;
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### 8.3 Glassmorphism Theme
```css
[data-theme="glassmorphism"] {
  --primary: #3b82f6;
  --bg-primary: rgba(255, 255, 255, 0.7);
  --bg-secondary: rgba(249, 250, 251, 0.6);
  --border-color: rgba(255, 255, 255, 0.18);
  --backdrop-blur: blur(10px);
  --shadow-md: 0 8px 32px rgba(31, 38, 135, 0.15);
}

/* 글래스모피즘 공통 스타일 */
.glass {
  background: var(--bg-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-color);
}
```

### 8.4 Neon Theme
```css
[data-theme="neon"] {
  --primary: #8b5cf6;
  --primary-glow: 0 0 20px rgba(139, 92, 246, 0.6);
  --bg-primary: #0f0f1e;
  --bg-secondary: #1a1a2e;
  --text-primary: #ffffff;
  --text-secondary: #a78bfa;
  --border-color: #8b5cf6;
  --neon-glow: drop-shadow(0 0 10px currentColor);
}

/* 네온 공통 스타일 */
.neon {
  border: 2px solid var(--border-color);
  box-shadow: var(--primary-glow);
  filter: var(--neon-glow);
}
```

### 8.5 반응형 브레이크포인트
```css
/* Mobile First */
@media (min-width: 640px) {
  /* sm: 태블릿 세로 */
}

@media (min-width: 768px) {
  /* md: 태블릿 가로 */
}

@media (min-width: 1024px) {
  /* lg: 데스크톱 */
}

@media (min-width: 1280px) {
  /* xl: 대형 데스크톱 */
}
```

---

## 9. 구현 우선순위

### 9.1 Phase 1 (필수)
1. Button - 가장 기본적이고 자주 사용
2. Input - 폼의 핵심
3. Checkbox - 단순한 구조

### 9.2 Phase 2 (중요)
4. Select - 드롭다운 로직 필요
5. Textarea - Input 변형
6. Toggle - 애니메이션 필요

### 9.3 Phase 3 (보조)
7. Radio & RadioGroup - 그룹 관리 로직

---

## 10. 공통 유틸리티 함수

### 10.1 클래스 이름 생성
```javascript
// cn (classNames) 유틸리티
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// 사용 예시
className={cn(
  'btn',
  `btn--${variant}`,
  `btn--${size}`,
  disabled && 'btn--disabled',
  loading && 'btn--loading'
)}
```

### 10.2 테마 클래스 생성
```javascript
function getThemeClass(theme) {
  return `theme-${theme}`;
}
```

### 10.3 포커스 관리
```javascript
function useFocus() {
  const [isFocused, setIsFocused] = useState(false);
  
  const handlers = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false)
  };
  
  return [isFocused, handlers];
}
```

---

## 11. 파일 구조

```
components/
└── level1/
    ├── Button/
    │   ├── Button.jsx
    │   ├── Button.css
    │   └── index.js
    ├── Input/
    │   ├── Input.jsx
    │   ├── Input.css
    │   └── index.js
    ├── Select/
    │   ├── Select.jsx
    │   ├── Select.css
    │   └── index.js
    ├── Textarea/
    │   ├── Textarea.jsx
    │   ├── Textarea.css
    │   └── index.js
    ├── Checkbox/
    │   ├── Checkbox.jsx
    │   ├── Checkbox.css
    │   └── index.js
    ├── Radio/
    │   ├── Radio.jsx
    │   ├── RadioGroup.jsx
    │   ├── Radio.css
    │   └── index.js
    └── Toggle/
        ├── Toggle.jsx
        ├── Toggle.css
        └── index.js
```

---

## 12. 테스트 시나리오

> **✅ 모든 테스트 항목이 Component Docs 페이지에서 확인 가능합니다.**
> 실행: `cd test/frontEnd && npm run dev`

### 12.1 Button 테스트
- [x] 모든 variant 렌더링 확인 ✅
- [x] 모든 size 렌더링 확인 ✅
- [x] 클릭 이벤트 동작 ✅
- [x] disabled 상태에서 클릭 불가 ✅
- [x] loading 상태 표시 ✅
- [x] 아이콘 포함 렌더링 ✅
- [x] 3가지 테마 적용 ✅

### 12.2 Input 테스트
- [x] 텍스트 입력 및 상태 업데이트 ✅
- [x] 에러 메시지 표시 ✅
- [x] disabled 상태 ✅
- [x] 다양한 type (email, password 등) ✅
- [x] 레이블 및 helperText 표시 ✅
- [x] 아이콘 포함 렌더링 ✅

### 12.3 Select 테스트
- [x] 드롭다운 열기/닫기 ✅
- [x] 옵션 선택 ✅
- [x] 외부 클릭 시 닫힘 ✅
- [x] 키보드 네비게이션 ✅
- [x] 에러 상태 ✅

### 12.4 Textarea 테스트
- [x] 여러 줄 입력 ✅
- [x] rows에 따른 높이 ✅
- [x] maxLength 제한 및 카운터 ✅
- [x] resize 동작 ✅

### 12.5 Checkbox 테스트
- [x] 체크/해제 토글 ✅
- [x] indeterminate 상태 표시 ✅
- [x] disabled 상태 ✅
- [x] 레이블 클릭으로 토글 ✅

### 12.6 Radio 테스트
- [x] RadioGroup 내에서 하나만 선택 ✅
- [x] 선택 변경 ✅
- [x] horizontal/vertical 정렬 ✅
- [x] disabled 상태 ✅

### 12.7 Toggle 테스트
- [x] 토글 애니메이션 ✅
- [x] 상태 변경 ✅
- [x] disabled 상태 ✅
- [x] size 변형 ✅

---

## 13. 구현 시 주의사항

### 13.1 접근성
- 모든 인터랙티브 요소에 키보드 접근 가능
- 포커스 표시 명확하게
- ARIA 속성 적절히 사용
- 레이블과 입력 필드 연결

### 13.2 성능
- 불필요한 리렌더링 방지 (React.memo 사용 검토)
- 이벤트 핸들러는 useCallback 사용 검토
- CSS 애니메이션 사용 (JS 애니메이션보다 성능 좋음)

### 13.3 유지보수성
- Props는 명확하고 일관성 있게
- 기본값 설정
- PropTypes 또는 주석으로 타입 명시
- 컴포넌트별로 독립적으로 동작

### 13.4 스타일
- CSS Variables 적극 활용
- !important 사용 지양
- 클래스 이름 충돌 방지 (BEM 또는 prefix)
- 테마별 스타일 분리

### 13.5 호환성
- 모던 브라우저 기준
- Flexbox, CSS Grid 사용
- CSS Variables 사용
- ES6+ 문법 사용

---

## 14. 다음 단계

Day 1 컴포넌트 완성 후:
1. 각 컴포넌트별 사용 예시 작성
2. 3가지 테마 모두 적용하여 확인
3. 반응형 동작 테스트
4. 접근성 검증
5. Day 2 상세 설계서 작성 (레이아웃 컴포넌트)

---

## 15. 참고 자료

### 15.1 디자인 참고
- Material-UI Button: https://mui.com/material-ui/react-button/
- Chakra UI Input: https://chakra-ui.com/docs/components/input
- Radix UI Checkbox: https://www.radix-ui.com/docs/primitives/components/checkbox

### 15.2 접근성 가이드
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/

### 15.3 CSS 참고
- CSS Tricks Flexbox Guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- Modern CSS Solutions: https://moderncss.dev/

---

**문서 최종 업데이트**: 2025-10-03
**작성자**: miracle380301
**상태**: Day 1 완료 ✅