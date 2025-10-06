# Day 6 상세 설계서 - 시각화 & 피드백 컴포넌트

## 목차
1. [Loading](#1-loading)
2. [ProgressBar](#2-progressbar)
3. [ChartWrapper](#3-chartwrapper)
4. [Badge](#4-badge)
5. [Tag](#5-tag)
6. [Chip](#6-chip)
7. [공통 피드백 패턴](#7-공통-피드백-패턴)

---

## 1. Loading

### 1.1 개요
로딩 상태를 표시하는 컴포넌트로, Spinner, Skeleton, Linear Progress Bar 세 가지 타입을 지원한다.

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | 'spinner' \| 'skeleton' \| 'linear' | No | 'spinner' | 로딩 타입 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 크기 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| color | string | No | 'primary' | 색상 (CSS 변수 또는 색상값) |
| fullScreen | boolean | No | false | 전체 화면 오버레이 |
| text | string | No | - | 로딩 텍스트 |
| skeletonCount | number | No | 1 | Skeleton 개수 |
| skeletonHeight | number | No | 20 | Skeleton 높이 (px) |
| skeletonWidth | string \| number | No | '100%' | Skeleton 너비 |

### 1.3 내부 상태
- 없음 (순수 표시 컴포넌트)

### 1.4 동작 방식

#### 1.4.1 타입별 렌더링
```javascript
function Loading({ type, ...props }) {
  switch (type) {
    case 'spinner':
      return <Spinner {...props} />;
    case 'skeleton':
      return <Skeleton {...props} />;
    case 'linear':
      return <LinearProgress {...props} />;
    default:
      return <Spinner {...props} />;
  }
}
```

### 1.5 스타일 명세

#### 1.5.1 Spinner
```css
.spinner {
  display: inline-block;
  border: 3px solid rgba(var(--primary-rgb), 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
}

.spinner--sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.spinner--md {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.spinner--lg {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

/* Full Screen Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  z-index: 9999;
}

.loading-overlay__text {
  color: white;
  font-size: 1rem;
}
```

#### 1.5.2 Skeleton
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton--text {
  height: 12px;
  margin-bottom: var(--spacing-xs);
}

.skeleton--title {
  height: 24px;
  margin-bottom: var(--spacing-sm);
}

.skeleton--avatar {
  border-radius: 50%;
}

.skeleton--card {
  height: 200px;
  border-radius: var(--radius-md);
}
```

#### 1.5.3 Linear Progress
```css
.linear-progress {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.linear-progress__bar {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  animation: linear-progress 1.5s ease-in-out infinite;
}

@keyframes linear-progress {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

.linear-progress--sm {
  height: 2px;
}

.linear-progress--md {
  height: 4px;
}

.linear-progress--lg {
  height: 6px;
}
```

### 1.6 사용 예시

```jsx
// Spinner
<Loading type="spinner" size="md" />

// Full Screen Loading
<Loading type="spinner" fullScreen text="데이터를 불러오는 중..." />

// Skeleton - 텍스트
<Loading 
  type="skeleton" 
  skeletonCount={3} 
  skeletonHeight={16}
/>

// Skeleton - 카드
<Loading 
  type="skeleton" 
  skeletonHeight={200}
  skeletonWidth="100%"
/>

// Linear Progress
<Loading type="linear" />

// 버튼에 로딩
<Button loading>
  저장 중...
</Button>

// 테이블 로딩
{isLoading ? (
  <Loading type="skeleton" skeletonCount={5} skeletonHeight={48} />
) : (
  <Table data={data} columns={columns} />
)}

// 카드 그리드 로딩
<Grid columns={3} gap="lg">
  {isLoading ? (
    <>
      <Loading type="skeleton" skeletonHeight={300} />
      <Loading type="skeleton" skeletonHeight={300} />
      <Loading type="skeleton" skeletonHeight={300} />
    </>
  ) : (
    products.map(product => <ProductCard key={product.id} {...product} />)
  )}
</Grid>
```

---

## 2. ProgressBar

### 2.1 개요
진행률을 시각적으로 표시하는 프로그레스 바 컴포넌트

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | number | Yes | - | 진행률 (0-100) |
| max | number | No | 100 | 최대값 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 높이 |
| color | string | No | 'primary' | 바 색상 |
| showLabel | boolean | No | false | 퍼센트 레이블 표시 |
| labelPosition | 'inside' \| 'outside' \| 'top' | No | 'inside' | 레이블 위치 |
| animated | boolean | No | true | 애니메이션 여부 |
| striped | boolean | No | false | 줄무늬 패턴 |
| variant | 'default' \| 'success' \| 'warning' \| 'error' | No | 'default' | 색상 변형 |

### 2.3 내부 상태
- 없음

### 2.4 동작 방식

#### 2.4.1 퍼센트 계산
```javascript
const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
```

#### 2.4.2 색상 자동 변경 (옵션)
```javascript
const getColorByValue = (value) => {
  if (value < 30) return 'error';
  if (value < 70) return 'warning';
  return 'success';
};
```

### 2.5 스타일 명세

```css
.progress-bar {
  width: 100%;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-bar--sm {
  height: 8px;
}

.progress-bar--md {
  height: 16px;
}

.progress-bar--lg {
  height: 24px;
}

.progress-bar__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animated */
.progress-bar__fill--animated {
  transition: width 0.6s ease;
}

/* Striped */
.progress-bar__fill--striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

/* Variants */
.progress-bar__fill--default {
  background: var(--primary);
}

.progress-bar__fill--success {
  background: var(--success);
}

.progress-bar__fill--warning {
  background: var(--warning);
}

.progress-bar__fill--error {
  background: var(--error);
}

/* Label */
.progress-bar__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.progress-bar__label--outside {
  position: absolute;
  right: var(--spacing-sm);
  color: var(--text-primary);
}

.progress-bar__label--top {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}
```

### 2.6 접근성
- `role="progressbar"`
- `aria-valuenow`: 현재 값
- `aria-valuemin="0"`
- `aria-valuemax`: max 값
- `aria-label` 또는 `aria-labelledby`

### 2.7 사용 예시

```jsx
// 기본 사용
<ProgressBar value={65} />

// 레이블 표시
<ProgressBar value={75} showLabel />

// 외부 레이블
<ProgressBar value={45} showLabel labelPosition="outside" />

// 상단 레이블
<ProgressBar value={80} showLabel labelPosition="top" />

// 색상 변형
<ProgressBar value={30} variant="error" />
<ProgressBar value={50} variant="warning" />
<ProgressBar value={90} variant="success" />

// 줄무늬 + 애니메이션
<ProgressBar value={60} striped animated />

// 파일 업로드
const [uploadProgress, setUploadProgress] = useState(0);

<Flex direction="column" gap="sm">
  <Flex justify="between">
    <span>파일 업로드 중...</span>
    <span>{uploadProgress}%</span>
  </Flex>
  <ProgressBar value={uploadProgress} striped animated />
</Flex>

// 여러 단계
const steps = ['정보 입력', '확인', '완료'];
const currentStep = 1;

<Flex direction="column" gap="sm">
  <Flex justify="between">
    {steps.map((step, index) => (
      <span 
        key={index}
        style={{ 
          fontWeight: index <= currentStep ? 'bold' : 'normal',
          color: index <= currentStep ? 'var(--primary)' : 'var(--text-secondary)'
        }}
      >
        {step}
      </span>
    ))}
  </Flex>
  <ProgressBar value={(currentStep / (steps.length - 1)) * 100} />
</Flex>
```

---

## 3. ChartWrapper

### 3.1 개요
Recharts 라이브러리를 래핑하여 간편하게 차트를 생성하는 컴포넌트

### 3.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | 'line' \| 'bar' \| 'pie' \| 'area' | Yes | - | 차트 타입 |
| data | Array<Object> | Yes | - | 차트 데이터 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| width | number \| string | No | '100%' | 너비 |
| height | number | No | 300 | 높이 |
| xKey | string | No | - | X축 데이터 키 |
| yKeys | Array<string> | No | - | Y축 데이터 키들 |
| colors | Array<string> | No | 테마 색상 | 라인/바 색상 배열 |
| showGrid | boolean | No | true | 그리드 표시 |
| showLegend | boolean | No | true | 범례 표시 |
| showTooltip | boolean | No | true | 툴팁 표시 |
| animate | boolean | No | true | 애니메이션 |

### 3.3 내부 상태
- 없음

### 3.4 동작 방식

#### 3.4.1 타입별 차트 렌더링
```javascript
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function ChartWrapper({ type, data, xKey, yKeys, colors, ...props }) {
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const chartColors = colors || defaultColors;

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width={width} height={height}>
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={false}
                animationDuration={animate ? 500 : 0}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    
    case 'bar':
      return (
        <ResponsiveContainer width={width} height={height}>
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartColors[index % chartColors.length]}
                animationDuration={animate ? 500 : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    
    case 'pie':
      return (
        <ResponsiveContainer width={width} height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={yKeys[0]}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
              animationDuration={animate ? 500 : 0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );
    
    case 'area':
      return (
        <ResponsiveContainer width={width} height={height}>
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
                fillOpacity={0.6}
                animationDuration={animate ? 500 : 0}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
  }
}
```

### 3.5 스타일 명세

```css
.chart-wrapper {
  width: 100%;
}

.chart-wrapper__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

/* 테마별 차트 색상 */
[data-theme="minimal"] .recharts-text {
  fill: var(--text-primary);
}

[data-theme="neon"] .recharts-cartesian-grid-horizontal line,
[data-theme="neon"] .recharts-cartesian-grid-vertical line {
  stroke: rgba(139, 92, 246, 0.2);
}
```

### 3.6 사용 예시

```jsx
// 라인 차트
const salesData = [
  { month: '1월', sales: 4000, profit: 2400 },
  { month: '2월', sales: 3000, profit: 1398 },
  { month: '3월', sales: 2000, profit: 9800 },
  { month: '4월', sales: 2780, profit: 3908 },
  { month: '5월', sales: 1890, profit: 4800 },
  { month: '6월', sales: 2390, profit: 3800 }
];

<ChartWrapper
  type="line"
  data={salesData}
  xKey="month"
  yKeys={['sales', 'profit']}
  height={300}
/>

// 바 차트
<ChartWrapper
  type="bar"
  data={salesData}
  xKey="month"
  yKeys={['sales', 'profit']}
  colors={['#3b82f6', '#10b981']}
/>

// 파이 차트
const categoryData = [
  { name: '전자제품', value: 400 },
  { name: '의류', value: 300 },
  { name: '식품', value: 300 },
  { name: '도서', value: 200 }
];

<ChartWrapper
  type="pie"
  data={categoryData}
  xKey="name"
  yKeys={['value']}
  height={400}
/>

// 에어리어 차트
<ChartWrapper
  type="area"
  data={salesData}
  xKey="month"
  yKeys={['sales']}
  colors={['#8b5cf6']}
/>

// 카드 안에
<Card>
  <Card.Header title="월별 매출" />
  <Card.Body>
    <ChartWrapper
      type="line"
      data={salesData}
      xKey="month"
      yKeys={['sales', 'profit']}
    />
  </Card.Body>
</Card>
```

---

## 4. Badge

### 4.1 개요
상태나 카운트를 표시하는 작은 레이블 컴포넌트

### 4.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | 'success' \| 'warning' \| 'error' \| 'info' \| 'default' | No | 'default' | 색상 변형 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| size | 'sm' \| 'md' | No | 'md' | 크기 |
| dot | boolean | No | false | 점만 표시 (텍스트 없이) |
| pulse | boolean | No | false | 펄스 애니메이션 |
| children | ReactNode | Yes | - | 배지 내용 |

### 4.3 내부 상태
- 없음

### 4.4 스타일 명세

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Sizes */
.badge--sm {
  padding: 2px 8px;
  font-size: 0.75rem;
  height: 20px;
}

.badge--md {
  padding: 4px 12px;
  font-size: 0.875rem;
  height: 24px;
}

/* Variants */
.badge--default {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.badge--success {
  background: var(--success);
  color: white;
}

.badge--warning {
  background: var(--warning);
  color: white;
}

.badge--error {
  background: var(--error);
  color: white;
}

.badge--info {
  background: var(--info);
  color: white;
}

/* Dot */
.badge--dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 50%;
}

/* Pulse Animation */
.badge--pulse {
  animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Neon Theme */
[data-theme="neon"] .badge--success {
  box-shadow: 0 0 10px var(--success);
}

[data-theme="neon"] .badge--error {
  box-shadow: 0 0 10px var(--error);
}
```

### 4.5 사용 예시

```jsx
// 기본 사용
<Badge variant="success">활성</Badge>
<Badge variant="error">중지</Badge>
<Badge variant="warning">대기</Badge>
<Badge variant="info">정보</Badge>

// 작은 크기
<Badge variant="success" size="sm">New</Badge>

// 점만 표시
<Badge variant="success" dot />
<Flex align="center" gap="xs">
  <Badge variant="success" dot />
  <span>온라인</span>
</Flex>

// 펄스 애니메이션
<Badge variant="error" pulse>Live</Badge>

// 테이블에서
<Table
  columns={[
    { key: 'name', label: '이름' },
    { 
      key: 'status', 
      label: '상태',
      render: (value) => (
        <Badge 
          variant={value === 'active' ? 'success' : 'default'}
        >
          {value === 'active' ? '활성' : '비활성'}
        </Badge>
      )
    }
  ]}
  data={users}
/>

// 카운트 배지
<Button variant="ghost" icon={<BellIcon />}>
  알림
  <Badge variant="error" size="sm">5</Badge>
</Button>

// 아바타에 상태 표시
<div style={{ position: 'relative', display: 'inline-block' }}>
  <Avatar src={user.avatar} size="lg" />
  <Badge 
    variant="success" 
    dot 
    style={{ 
      position: 'absolute', 
      top: 0, 
      right: 0,
      border: '2px solid white'
    }} 
  />
</div>
```

---

## 5. Tag

### 5.1 개요
제거 가능한 태그 컴포넌트로, Badge와 유사하지만 닫기 버튼이 있다.

### 5.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | 'success' \| 'warning' \| 'error' \| 'info' \| 'default' | No | 'default' | 색상 변형 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| size | 'sm' \| 'md' | No | 'md' | 크기 |
| onClose | function | No | - | 닫기 핸들러 |
| closable | boolean | No | true | 닫기 버튼 표시 여부 |
| icon | ReactNode | No | - | 아이콘 |
| children | ReactNode | Yes | - | 태그 내용 |

### 5.3 내부 상태
- 없음

### 5.4 동작 방식

```javascript
function Tag({ children, onClose, closable = true, icon, ...props }) {
  const handleClose = (e) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <span className="tag">
      {icon && <span className="tag__icon">{icon}</span>}
      <span className="tag__label">{children}</span>
      {closable && onClose && (
        <button 
          className="tag__close" 
          onClick={handleClose}
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
}
```

### 5.5 스타일 명세

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
}

/* Variants */
.tag--default {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.tag--success {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success);
  color: var(--success);
}

.tag--warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--warning);
  color: var(--warning);
}

.tag--error {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--error);
  color: var(--error);
}

.tag--info {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--info);
  color: var(--info);
}

.tag__icon {
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.tag__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1.25rem;
  line-height: 1;
  color: currentColor;
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.tag__close:hover {
  opacity: 1;
}

/* Sizes */
.tag--sm {
  padding: 2px 6px;
  font-size: 0.75rem;
}
```

### 5.6 사용 예시

```jsx
// 기본 사용
<Tag onClose={() => console.log('closed')}>
  JavaScript
</Tag>

// 아이콘 포함
<Tag icon={<TagIcon />} onClose={handleRemove}>
  React
</Tag>

// 색상 변형
<Tag variant="success">승인됨</Tag>
<Tag variant="error">거부됨</Tag>
<Tag variant="warning">대기 중</Tag>

// 닫기 불가
<Tag closable={false}>필수</Tag>

// 태그 목록
const [tags, setTags] = useState(['React', 'Vue', 'Angular', 'Svelte']);

<Flex gap="sm" wrap>
  {tags.map((tag, index) => (
    <Tag
      key={tag}
      onClose={() => {
        setTags(tags.filter((_, i) => i !== index));
      }}
    >
      {tag}
    </Tag>
  ))}
</Flex>

// 입력으로 태그 추가
function TagInput() {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      setTags([...tags, input.trim()]);
      setInput('');
    }
  };

  return (
    <div>
      <Flex gap="sm" wrap style={{ marginBottom: 'var(--spacing-sm)' }}>
        {tags.map((tag, index) => (
          <Tag
            key={index}
            onClose={() => setTags(tags.filter((_, i) => i !== index))}
          >
            {tag}
          </Tag>
        ))}
      </Flex>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="태그를 입력하고 Enter를 누르세요"
      />
    </div>
  );
}

// 필터 태그
<Flex gap="sm">
  <Tag 
    variant="info"
    onClose={() => removeFilter('category')}
  >
    카테고리: 전자제품
  </Tag>
  <Tag 
    variant="info"
    onClose={() => removeFilter('price')}
  >
    가격: 10만원 이하
  </Tag>
</Flex>
```

---

## 6. Chip

### 6.1 개요
아바타와 함께 사용할 수 있는 칩 컴포넌트 (주로 사용자 선택에 사용)

### 6.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | string | Yes | - | 칩 텍스트 |
| avatar | ReactNode | No | - | 아바타 (이미지, 아이콘 등) |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| variant | 'filled' \| 'outlined' | No | 'filled' | 스타일 변형 |
| color | string | No | 'default' | 색상 |
| size | 'sm' \| 'md' | No | 'md' | 크기 |
| onDelete | function | No | - | 삭제 핸들러 |
| onClick | function | No | - | 클릭 핸들러 |
| clickable | boolean | No | false | 클릭 가능 여부 |
| disabled | boolean | No | false | 비활성화 |

### 6.3 내부 상태
- 없음

### 6.4 동작 방식

```javascript
function Chip({ 
  label, 
  avatar, 
  onDelete, 
  onClick, 
  clickable,
  disabled,
  ...props 
}) {
  const handleClick = () => {
    if (!disabled && (clickable || onClick)) {
      onClick?.();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!disabled) {
      onDelete?.();
    }
  };

  const isClickable = clickable || onClick;

  return (
    <div 
      className={cn(
        'chip',
        isClickable && 'chip--clickable',
        disabled && 'chip--disabled'
      )}
      onClick={handleClick}
    >
      {avatar && <div className="chip__avatar">{avatar}</div>}
      <span className="chip__label">{label}</span>
      {onDelete && (
        <button 
          className="chip__delete" 
          onClick={handleDelete}
          disabled={disabled}
        >
          ×
        </button>
      )}
    </div>
  );
}
```

### 6.5 스타일 명세

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  max-width: 100%;
}

.chip--sm {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.chip--clickable {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip--clickable:hover {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
}

.chip--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Outlined variant */
.chip--outlined {
  background: transparent;
  border: 1px solid currentColor;
}

/* Avatar */
.chip__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: -6px;
}

.chip__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chip--sm .chip__avatar {
  width: 20px;
  height: 20px;
  margin-left: -4px;
}

/* Label */
.chip__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Delete button */
.chip__delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.25rem;
  line-height: 1;
  color: currentColor;
  opacity: 0.6;
  transition: all var(--transition-fast);
  margin-right: -4px;
}

.chip__delete:hover:not(:disabled) {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.chip__delete:disabled {
  cursor: not-allowed;
}
```

### 6.6 사용 예시

```jsx
// 기본 사용
<Chip label="John Doe" />

// 아바타 포함
<Chip 
  label="Jane Smith" 
  avatar={<Avatar src="/jane.jpg" size="sm" />}
/>

// 삭제 가능
<Chip 
  label="Alice Johnson" 
  avatar={<Avatar src="/alice.jpg" size="sm" />}
  onDelete={() => console.log('deleted')}
/>

// 클릭 가능
<Chip 
  label="선택 가능" 
  clickable
  onClick={() => console.log('clicked')}
/>

// 사용자 선택
const [selectedUsers, setSelectedUsers] = useState([]);

<Flex gap="sm" wrap>
  {selectedUsers.map((user) => (
    <Chip
      key={user.id}
      label={user.name}
      avatar={<Avatar src={user.avatar} size="sm" />}
      onDelete={() => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
      }}
    />
  ))}
</Flex>

// 필터 칩
<Flex gap="sm" wrap>
  <Chip 
    label="최근 7일" 
    clickable
    onClick={() => setDateRange('7days')}
    variant="outlined"
  />
  <Chip 
    label="지난 달" 
    clickable
    onClick={() => setDateRange('month')}
    variant="outlined"
  />
  <Chip 
    label="올해" 
    clickable
    onClick={() => setDateRange('year')}
    variant="outlined"
  />
</Flex>

// 카테고리 선택
function CategoryChips() {
  const [selected, setSelected] = useState([]);
  const categories = ['전자제품', '의류', '식품', '도서', '가구'];

  return (
    <Flex gap="sm" wrap>
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          clickable
          onClick={() => {
            setSelected(prev =>
              prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
            );
          }}
          variant={selected.includes(category) ? 'filled' : 'outlined'}
        />
      ))}
    </Flex>
  );
}

// 비활성화
<Chip 
  label="비활성화됨" 
  disabled
  onDelete={() => {}}
/>
```

---

## 7. 공통 피드백 패턴

### 7.1 로딩 상태 관리 패턴

```jsx
function DataDisplay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading type="spinner" fullScreen text="데이터 로딩 중..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircleIcon />}
        title="오류가 발생했습니다"
        description={error.message}
        action={<Button onClick={retry}>다시 시도</Button>}
      />
    );
  }

  return <DataView data={data} />;
}
```

### 7.2 진행률 표시 패턴

```jsx
function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error

  const handleUpload = async (file) => {
    setStatus('uploading');
    
    try {
      await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      setStatus('success');
      toast.success('업로드 완료');
    } catch (error) {
      setStatus('error');
      toast.error('업로드 실패');
    }
  };

  return (
    <Card>
      <Card.Body>
        <Flex direction="column" gap="md">
          <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
          
          {status === 'uploading' && (
            <>
              <ProgressBar 
                value={uploadProgress} 
                showLabel 
                striped 
                animated
              />
              <span>{uploadProgress}% 완료</span>
            </>
          )}
          
          {status === 'success' && (
            <Badge variant="success">업로드 완료</Badge>
          )}
          
          {status === 'error' && (
            <Badge variant="error">업로드 실패</Badge>
          )}
        </Flex>
      </Card.Body>
    </Card>
  );
}
```

### 7.3 상태 표시 패턴

```jsx
function StatusDisplay({ status }) {
  const statusConfig = {
    active: { variant: 'success', label: '활성', icon: <CheckIcon /> },
    pending: { variant: 'warning', label: '대기', icon: <ClockIcon /> },
    inactive: { variant: 'default', label: '비활성', icon: <XIcon /> },
    error: { variant: 'error', label: '오류', icon: <AlertIcon /> }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge variant={config.variant}>
      {config.icon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
      {config.label}
    </Badge>
  );
}
```

### 7.4 데이터 시각화 대시보드 패턴

```jsx
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Grid columns={{ md: 2, lg: 4 }} gap="lg">
        {[1, 2, 3, 4].map(i => (
          <Loading key={i} type="skeleton" skeletonHeight={120} />
        ))}
      </Grid>
    );
  }

  return (
    <Flex direction="column" gap="xl">
      {/* 통계 카드 */}
      <Grid columns={{ md: 2, lg: 4 }} gap="lg">
        <Card variant="elevated">
          <Card.Body>
            <Flex direction="column" gap="sm">
              <span className="text-secondary">총 매출</span>
              <h2>{stats.totalSales}원</h2>
              <Flex align="center" gap="xs">
                <Badge variant="success" size="sm">
                  +12.5%
                </Badge>
                <span className="text-secondary text-sm">전월 대비</span>
              </Flex>
            </Flex>
          </Card.Body>
        </Card>

        <Card variant="elevated">
          <Card.Body>
            <Flex direction="column" gap="sm">
              <span className="text-secondary">주문 수</span>
              <h2>{stats.orders}</h2>
              <ProgressBar 
                value={75} 
                size="sm"
                variant="success"
              />
            </Flex>
          </Card.Body>
        </Card>

        <Card variant="elevated">
          <Card.Body>
            <Flex direction="column" gap="sm">
              <span className="text-secondary">신규 고객</span>
              <h2>{stats.newCustomers}</h2>
              <Flex gap="xs">
                <Tag variant="info" size="sm">오늘</Tag>
                <Tag variant="default" size="sm">+{stats.newCustomersToday}</Tag>
              </Flex>
            </Flex>
          </Card.Body>
        </Card>

        <Card variant="elevated">
          <Card.Body>
            <Flex direction="column" gap="sm">
              <Flex justify="between" align="center">
                <span className="text-secondary">시스템 상태</span>
                <Badge variant="success" dot pulse />
              </Flex>
              <h2>정상</h2>
              <span className="text-sm text-secondary">
                모든 서비스 운영 중
              </span>
            </Flex>
          </Card.Body>
        </Card>
      </Grid>

      {/* 차트 */}
      <Grid columns={{ lg: 2 }} gap="lg">
        <Card variant="elevated">
          <Card.Header title="월별 매출 추이" />
          <Card.Body>
            <ChartWrapper
              type="line"
              data={stats.monthlySales}
              xKey="month"
              yKeys={['sales', 'profit']}
              height={300}
            />
          </Card.Body>
        </Card>

        <Card variant="elevated">
          <Card.Header title="카테고리별 판매" />
          <Card.Body>
            <ChartWrapper
              type="pie"
              data={stats.categorySales}
              xKey="category"
              yKeys={['value']}
              height={300}
            />
          </Card.Body>
        </Card>
      </Grid>
    </Flex>
  );
}
```

### 7.5 필터 칩 패턴

```jsx
function FilterChips() {
  const [filters, setFilters] = useState({
    category: null,
    priceRange: null,
    status: null
  });

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: null }));
  };

  const clearAllFilters = () => {
    setFilters({ category: null, priceRange: null, status: null });
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== null);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Flex align="center" gap="md">
      <span className="text-secondary">필터:</span>
      <Flex gap="sm" wrap>
        {activeFilters.map(([key, value]) => (
          <Tag
            key={key}
            variant="info"
            onClose={() => removeFilter(key)}
          >
            {key}: {value}
          </Tag>
        ))}
      </Flex>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={clearAllFilters}
      >
        모두 지우기
      </Button>
    </Flex>
  );
}
```

---

## 8. 커스텀 Hooks

### 8.1 useLoading

```javascript
export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  const withLoading = async (asyncFunction) => {
    startLoading();
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  };
}

// 사용 예시
function MyComponent() {
  const { loading, withLoading } = useLoading();

  const fetchData = async () => {
    await withLoading(async () => {
      const data = await api.get('/data');
      setData(data);
    });
  };

  return (
    <>
      {loading && <Loading type="spinner" />}
      <Button onClick={fetchData}>데이터 불러오기</Button>
    </>
  );
}
```

### 8.2 useProgress

```javascript
export function useProgress(initialValue = 0) {
  const [progress, setProgress] = useState(initialValue);

  const start = () => setProgress(0);
  const complete = () => setProgress(100);
  const reset = () => setProgress(0);
  const increment = (amount = 10) => {
    setProgress(prev => Math.min(prev + amount, 100));
  };

  return {
    progress,
    setProgress,
    start,
    complete,
    reset,
    increment
  };
}

// 사용 예시
function UploadComponent() {
  const { progress, setProgress, reset } = useProgress();

  const handleUpload = async (file) => {
    reset();
    await uploadFile(file, (p) => setProgress(p));
  };

  return (
    <>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      <ProgressBar value={progress} showLabel />
    </>
  );
}
```

---

## 9. 구현 우선순위

### 9.1 Phase 1 (핵심)
1. **Loading (Spinner)** - 가장 자주 사용
2. **Badge** - 상태 표시에 필수
3. **ProgressBar** - 진행률 표시

### 9.2 Phase 2 (중요)
4. **Loading (Skeleton)** - UX 개선
5. **ChartWrapper** - 데이터 시각화
6. **Tag** - 필터, 선택에 유용

### 9.3 Phase 3 (보조)
7. **Chip** - 고급 선택 UI

---

## 10. 파일 구조

```
components/
└── level1/
    ├── Loading/
    │   ├── Loading.jsx
    │   ├── Spinner.jsx
    │   ├── Skeleton.jsx
    │   ├── LinearProgress.jsx
    │   ├── Loading.css
    │   └── index.js
    ├── ProgressBar/
    │   ├── ProgressBar.jsx
    │   ├── ProgressBar.css
    │   └── index.js
    ├── ChartWrapper/
    │   ├── ChartWrapper.jsx
    │   ├── ChartWrapper.css
    │   └── index.js
    ├── Badge/
    │   ├── Badge.jsx
    │   ├── Badge.css
    │   └── index.js
    ├── Tag/
    │   ├── Tag.jsx
    │   ├── Tag.css
    │   └── index.js
    └── Chip/
        ├── Chip.jsx
        ├── Chip.css
        └── index.js

hooks/
├── useLoading.js
├── useProgress.js
└── index.js
```

---

## 11. 테스트 시나리오

### 11.1 Loading 테스트
- [ ] Spinner 렌더링 (sm, md, lg)
- [ ] Full screen overlay
- [ ] Skeleton (다양한 높이, 개수)
- [ ] Linear progress
- [ ] 색상 변경

### 11.2 ProgressBar 테스트
- [ ] 값 변경 (0-100)
- [ ] 레이블 표시 (inside, outside, top)
- [ ] 애니메이션
- [ ] 줄무늬
- [ ] 색상 변형

### 11.3 ChartWrapper 테스트
- [ ] Line chart
- [ ] Bar chart
- [ ] Pie chart
- [ ] Area chart
- [ ] 반응형
- [ ] 툴팁, 범례

### 11.4 Badge 테스트
- [ ] 모든 variant
- [ ] 크기 (sm, md)
- [ ] Dot 모드
- [ ] Pulse 애니메이션

### 11.5 Tag 테스트
- [ ] 기본 렌더링
- [ ] 닫기 버튼
- [ ] 아이콘 포함
- [ ] 색상 변형

### 11.6 Chip 테스트
- [ ] 아바타 포함
- [ ] 삭제 버튼
- [ ] 클릭 가능
- [ ] 비활성화

---

## 12. 구현 시 주의사항

### 12.1 성능
- Skeleton은 많이 사용되므 최적화
- Chart는 데이터 많을 때 성능 고려
- 애니메이션 부드럽게 (60fps)

### 12.2 접근성
- Loading에 aria-live
- ProgressBar에 role, aria-value*
- Badge/Tag는 의미있는 텍스트 제공
- 색상만으로 의미 전달하지 않기

### 12.3 사용성
- 로딩 상태 명확히 표시
- 진행률 정확하게
- 색상은 일관성 있게
- 애니메이션 적절히

### 12.4 테마 일관성
- 모든 컴포넌트에 3가지 테마 지원
- CSS 변수 적극 활용
- 다크모드 고려

---

## 13. 다음 단계

Day 6 컴포넌트 완성 후:
1. Day 1-6 통합 테스트
2. 모든 테마 확인
3. Day 7-8 상세 설계서 작성 (Level 2 Composite 컴포넌트)
4. 또는 구현 시작

---

## 14. 참고 자료

### 14.1 디자인 참고
- Material-UI Progress: https://mui.com/material-ui/react-progress/
- Chakra UI Spinner: https://chakra-ui.com/docs/components/spinner
- Ant Design Badge: https://ant.design/components/badge

### 14.2 차트 라이브러리
- Recharts: https://recharts.org/
- Chart.js: https://www.chartjs.org/
- Victory: https://formidable.com/open-source/victory/

### 14.3 애니메이션
- CSS Animation Guide: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
- Skeleton Screen Best Practices: https://www.nngroup.com/articles/skeleton-screens/

---

## 15. 완료 체크리스트

### 15.1 기능 구현
- [ ] Loading (Spinner, Skeleton, Linear)
- [ ] ProgressBar
- [ ] ChartWrapper (Line, Bar, Pie, Area)
- [ ] Badge
- [ ] Tag
- [ ] Chip

### 15.2 스타일링
- [ ] 모든 컴포넌트 3가지 테마
- [ ] 크기 변형 (sm, md, lg)
- [ ] 애니메이션
- [ ] 반응형

### 15.3 기능
- [ ] Full screen loading
- [ ] Progress with label
- [ ] Chart tooltip, legend
- [ ] Badge pulse animation
- [ ] Tag/Chip 삭제 기능

### 15.4 Hooks
- [ ] useLoading
- [ ] useProgress