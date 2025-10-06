# Day 3 상세 설계서 - 복합 인터랙션 컴포넌트

## 목차
1. [Modal](#1-modal)
2. [Dropdown](#2-dropdown)
3. [Autocomplete](#3-autocomplete)
4. [Tabs](#4-tabs)
5. [Accordion](#5-accordion)
6. [Toast](#6-toast)
7. [공통 인터랙션 패턴](#7-공통-인터랙션-패턴)

---

## 1. Modal

### 1.1 개요
오버레이 위에 표시되는 팝업 창으로, 사용자의 주의를 집중시키거나 입력을 받을 때 사용한다.

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| isOpen | boolean | Yes | - | 모달 열림 상태 |
| onClose | function | Yes | - | 모달 닫기 핸들러 |
| title | string \| ReactNode | No | - | 모달 제목 |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | No | 'md' | 모달 크기 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| closeOnOverlay | boolean | No | true | 오버레이 클릭 시 닫기 |
| closeOnEsc | boolean | No | true | ESC 키로 닫기 |
| showCloseButton | boolean | No | true | 닫기 버튼 표시 여부 |
| centered | boolean | No | true | 수직 중앙 정렬 |
| scrollBehavior | 'inside' \| 'outside' | No | 'inside' | 스크롤 동작 (내부/외부) |
| children | ReactNode | Yes | - | 모달 내용 |

### 1.3 Subcomponents

#### 1.3.1 Modal.Header
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | Yes | - | 헤더 내용 |

#### 1.3.2 Modal.Body
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | Yes | - | 본문 내용 |

#### 1.3.3 Modal.Footer
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | Yes | - | 푸터 내용 (주로 버튼) |

### 1.4 내부 상태
- 없음 (모두 props로 제어 - Controlled Component)

### 1.5 동작 방식

#### 1.5.1 열기/닫기
- `isOpen` prop으로 표시 제어
- 부모 컴포넌트가 상태 관리

#### 1.5.2 오버레이 클릭
```javascript
const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget && closeOnOverlay) {
    onClose();
  }
};
```

#### 1.5.3 ESC 키 처리
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && closeOnEsc && isOpen) {
      onClose();
    }
  };
  
  if (isOpen) {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
}, [isOpen, closeOnEsc, onClose]);
```

#### 1.5.4 Body 스크롤 방지
```javascript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }
}, [isOpen]);
```

#### 1.5.5 포커스 트랩
- 모달 열릴 때 첫 번째 포커스 가능한 요소로 포커스
- Tab 키로 모달 내부만 순환

### 1.6 스타일 명세

#### 1.6.1 오버레이
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-overlay--centered {
  align-items: center;
}

.modal-overlay--top {
  align-items: flex-start;
  padding-top: var(--spacing-xl);
}
```

#### 1.6.2 모달 컨테이너
```css
.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Size variants */
.modal--sm { max-width: 400px; width: 100%; }
.modal--md { max-width: 600px; width: 100%; }
.modal--lg { max-width: 800px; width: 100%; }
.modal--xl { max-width: 1200px; width: 100%; }
.modal--full { 
  max-width: 95vw; 
  width: 95vw; 
  max-height: 95vh;
}
```

#### 1.6.3 애니메이션
```css
/* Enter animation */
@keyframes modal-overlay-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-overlay {
  animation: modal-overlay-enter 0.2s ease-out;
}

.modal {
  animation: modal-enter 0.2s ease-out;
}
```

#### 1.6.4 테마별 차이
```css
/* Minimal */
[data-theme="minimal"] .modal {
  background: #ffffff;
  border: 1px solid var(--border-color);
}

/* Glassmorphism */
[data-theme="glassmorphism"] .modal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Neon */
[data-theme="neon"] .modal {
  background: #1a1a2e;
  border: 2px solid var(--primary);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}
```

### 1.7 접근성

#### 1.7.1 ARIA 속성
```jsx
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
```

#### 1.7.2 포커스 관리
- 모달 열릴 때: 첫 번째 포커스 가능 요소로 이동
- 모달 닫힐 때: 모달을 연 요소로 포커스 복귀

#### 1.7.3 키보드 네비게이션
- ESC: 모달 닫기
- Tab: 모달 내부 요소 순환

### 1.8 사용 예시

```jsx
// 기본 사용
const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="제목">
  <Modal.Body>
    <p>모달 내용</p>
  </Modal.Body>
</Modal>

// Compound Pattern
<Modal isOpen={isOpen} onClose={handleClose} size="lg">
  <Modal.Header>
    <h2>사용자 정보 수정</h2>
  </Modal.Header>
  
  <Modal.Body>
    <Flex direction="column" gap="md">
      <Input label="이름" value={name} onChange={setName} />
      <Input label="이메일" value={email} onChange={setEmail} />
    </Flex>
  </Modal.Body>
  
  <Modal.Footer>
    <Flex justify="end" gap="sm">
      <Button variant="ghost" onClick={handleClose}>
        취소
      </Button>
      <Button onClick={handleSave}>
        저장
      </Button>
    </Flex>
  </Modal.Footer>
</Modal>

// 확인 모달
<Modal 
  isOpen={confirmOpen} 
  onClose={() => setConfirmOpen(false)}
  size="sm"
>
  <Modal.Body>
    <Flex direction="column" align="center" gap="md">
      <AlertIcon size={48} />
      <h3>정말 삭제하시겠습니까?</h3>
      <p>이 작업은 되돌릴 수 없습니다.</p>
    </Flex>
  </Modal.Body>
  
  <Modal.Footer>
    <Flex justify="center" gap="sm">
      <Button variant="outline" onClick={() => setConfirmOpen(false)}>
        취소
      </Button>
      <Button variant="primary" onClick={handleDelete}>
        삭제
      </Button>
    </Flex>
  </Modal.Footer>
</Modal>
```

---

## 2. Dropdown

### 2.1 개요
트리거 요소 클릭 시 메뉴를 표시하는 드롭다운 컴포넌트

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| trigger | ReactNode | Yes | - | 드롭다운을 여는 트리거 요소 |
| items | Array<DropdownItem> | Yes | - | 드롭다운 아이템 목록 |
| position | 'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right' | No | 'bottom-left' | 드롭다운 위치 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| closeOnSelect | boolean | No | true | 아이템 선택 시 닫기 |
| disabled | boolean | No | false | 비활성화 여부 |
| children | ReactNode | No | - | items 대신 커스텀 메뉴 |

#### DropdownItem 타입
```typescript
{
  label: string | ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;  // 구분선
  danger?: boolean;   // 위험한 작업 (빨간색)
}
```

### 2.3 내부 상태
- `isOpen`: 드롭다운 열림 상태

### 2.4 동작 방식

#### 2.4.1 열기/닫기
```javascript
const [isOpen, setIsOpen] = useState(false);

const toggle = () => setIsOpen(!isOpen);
const close = () => setIsOpen(false);
```

#### 2.4.2 외부 클릭 감지
```javascript
const dropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      close();
    }
  };
  
  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [isOpen]);
```

#### 2.4.3 아이템 클릭
```javascript
const handleItemClick = (item) => {
  if (!item.disabled) {
    item.onClick();
    if (closeOnSelect) {
      close();
    }
  }
};
```

#### 2.4.4 키보드 네비게이션
- Arrow Up/Down: 아이템 탐색
- Enter: 선택
- Escape: 닫기

### 2.5 스타일 명세

#### 2.5.1 구조
```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown__trigger {
  cursor: pointer;
}

.dropdown__menu {
  position: absolute;
  min-width: 200px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xs) 0;
  z-index: 1000;
}

/* Positions */
.dropdown__menu--bottom-left {
  top: 100%;
  left: 0;
  margin-top: var(--spacing-xs);
}

.dropdown__menu--bottom-right {
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
}

.dropdown__menu--top-left {
  bottom: 100%;
  left: 0;
  margin-bottom: var(--spacing-xs);
}

.dropdown__menu--top-right {
  bottom: 100%;
  right: 0;
  margin-bottom: var(--spacing-xs);
}
```

#### 2.5.2 드롭다운 아이템
```css
.dropdown__item {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  transition: background var(--transition-fast);
}

.dropdown__item:hover {
  background: var(--bg-secondary);
}

.dropdown__item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown__item--danger {
  color: var(--error);
}

.dropdown__divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--spacing-xs) 0;
}
```

#### 2.5.3 애니메이션
```css
@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown__menu {
  animation: dropdown-enter 0.15s ease-out;
}
```

### 2.6 접근성
- `role="menu"`, `role="menuitem"`
- `aria-haspopup="true"`
- `aria-expanded`: 열림 상태
- 키보드 네비게이션 지원

### 2.7 사용 예시

```jsx
// 기본 사용
<Dropdown
  trigger={<Button>메뉴</Button>}
  items={[
    { label: '수정', icon: <EditIcon />, onClick: handleEdit },
    { label: '복사', icon: <CopyIcon />, onClick: handleCopy },
    { divider: true },
    { label: '삭제', icon: <DeleteIcon />, onClick: handleDelete, danger: true }
  ]}
/>

// 커스텀 트리거
<Dropdown
  trigger={
    <Button variant="ghost" icon={<MoreIcon />} />
  }
  position="bottom-right"
  items={menuItems}
/>

// 사용자 메뉴
<Dropdown
  trigger={
    <Flex align="center" gap="sm">
      <Avatar src={user.avatar} />
      <span>{user.name}</span>
      <ChevronDown />
    </Flex>
  }
  position="bottom-right"
  items={[
    { label: '프로필', icon: <UserIcon />, onClick: () => navigate('/profile') },
    { label: '설정', icon: <SettingsIcon />, onClick: () => navigate('/settings') },
    { divider: true },
    { label: '로그아웃', icon: <LogoutIcon />, onClick: handleLogout }
  ]}
/>
```

---

## 3. Autocomplete

### 3.1 개요
사용자가 입력할 때 제안 목록을 표시하는 자동완성 입력 필드

### 3.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string | No | - | 입력값 |
| onChange | function | No | - | 입력 변경 핸들러 |
| suggestions | Array<Suggestion> | Yes | - | 제안 목록 |
| onSelect | function | Yes | - | 제안 선택 핸들러 |
| placeholder | string | No | - | placeholder |
| label | string | No | - | 레이블 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| filterFunction | function | No | 기본 필터 | 커스텀 필터 함수 |
| minChars | number | No | 1 | 제안을 표시할 최소 글자 수 |
| debounceMs | number | No | 300 | 디바운스 시간 (ms) |
| maxSuggestions | number | No | 10 | 최대 제안 개수 |
| loading | boolean | No | false | 로딩 상태 |
| error | string | No | - | 에러 메시지 |
| disabled | boolean | No | false | 비활성화 |

#### Suggestion 타입
```typescript
{
  label: string;
  value: any;
  icon?: ReactNode;
  description?: string;
}
```

### 3.3 내부 상태
- `isOpen`: 제안 목록 열림 상태
- `highlightedIndex`: 현재 하이라이트된 제안 인덱스
- `filteredSuggestions`: 필터링된 제안 목록

### 3.4 동작 방식

#### 3.4.1 입력 처리 (디바운스)
```javascript
const [debouncedValue, setDebouncedValue] = useState(value);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedValue(value);
  }, debounceMs);
  
  return () => clearTimeout(timer);
}, [value, debounceMs]);
```

#### 3.4.2 필터링
```javascript
const defaultFilter = (suggestions, query) => {
  return suggestions.filter(s => 
    s.label.toLowerCase().includes(query.toLowerCase())
  );
};

const filteredSuggestions = useMemo(() => {
  if (!debouncedValue || debouncedValue.length < minChars) {
    return [];
  }
  const filter = filterFunction || defaultFilter;
  return filter(suggestions, debouncedValue).slice(0, maxSuggestions);
}, [debouncedValue, suggestions, minChars, maxSuggestions, filterFunction]);
```

#### 3.4.3 키보드 네비게이션
```javascript
const handleKeyDown = (e) => {
  if (!isOpen || filteredSuggestions.length === 0) return;
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
      break;
    case 'ArrowUp':
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
      break;
    case 'Enter':
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
      break;
    case 'Escape':
      setIsOpen(false);
      break;
  }
};
```

#### 3.4.4 제안 선택
```javascript
const handleSelect = (suggestion) => {
  onSelect(suggestion);
  setIsOpen(false);
  setHighlightedIndex(-1);
};
```

### 3.5 스타일 명세

#### 3.5.1 구조
```css
.autocomplete {
  position: relative;
}

.autocomplete__suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--spacing-xs);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.autocomplete__suggestion {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.autocomplete__suggestion:hover,
.autocomplete__suggestion--highlighted {
  background: var(--bg-secondary);
}

.autocomplete__suggestion-label {
  font-weight: 500;
}

.autocomplete__suggestion-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.autocomplete__loading,
.autocomplete__empty {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
}
```

### 3.6 접근성
- `role="combobox"`
- `aria-autocomplete="list"`
- `aria-expanded`: 제안 목록 열림 상태
- `aria-activedescendant`: 현재 하이라이트된 제안

### 3.7 사용 예시

```jsx
// 기본 사용
const [query, setQuery] = useState('');

<Autocomplete
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  suggestions={countries}
  onSelect={(country) => {
    setQuery(country.label);
    setSelectedCountry(country.value);
  }}
  placeholder="국가 검색"
/>

// 비동기 검색
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  if (query.length >= 2) {
    setLoading(true);
    searchUsers(query).then(results => {
      setUsers(results.map(u => ({
        label: u.name,
        value: u.id,
        description: u.email,
        icon: <Avatar src={u.avatar} size="sm" />
      })));
      setLoading(false);
    });
  }
}, [query]);

<Autocomplete
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  suggestions={users}
  onSelect={handleUserSelect}
  loading={loading}
  minChars={2}
  placeholder="사용자 검색"
/>

// 커스텀 필터
<Autocomplete
  suggestions={products}
  onSelect={handleSelect}
  filterFunction={(suggestions, query) => {
    // 이름과 카테고리 모두 검색
    return suggestions.filter(p =>
      p.name.includes(query) || p.category.includes(query)
    );
  }}
/>
```

---

## 4. Tabs

### 4.1 개요
여러 콘텐츠 패널 중 하나를 선택하여 표시하는 탭 인터페이스

### 4.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | Array<TabItem> | Yes | - | 탭 아이템 목록 |
| defaultActive | string | No | items[0].key | 기본 활성 탭 |
| activeTab | string | No | - | 제어된 활성 탭 |
| onChange | function | No | - | 탭 변경 핸들러 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| variant | 'line' \| 'enclosed' \| 'soft' | No | 'line' | 탭 스타일 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 탭 크기 |
| fullWidth | boolean | No | false | 전체 너비 사용 |
| orientation | 'horizontal' \| 'vertical' | No | 'horizontal' | 탭 방향 |

#### TabItem 타입
```typescript
{
  key: string;
  label: string | ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  content: ReactNode;
}
```

### 4.3 내부 상태
- `activeTab`: 현재 활성 탭 (비제어 모드일 때)

### 4.4 동작 방식

#### 4.4.1 제어/비제어 모드
```javascript
const [internalActiveTab, setInternalActiveTab] = useState(defaultActive);

const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;

const handleTabChange = (key) => {
  if (activeTab === undefined) {
    setInternalActiveTab(key);
  }
  onChange?.(key);
};
```

#### 4.4.2 키보드 네비게이션
```javascript
const handleKeyDown = (e, currentIndex) => {
  let nextIndex;
  
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      nextIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      e.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      nextIndex = items.length - 1;
      break;
    default:
      return;
  }
  
  // disabled 탭 건너뛰기
  while (items[nextIndex].disabled) {
    nextIndex = (nextIndex + 1) % items.length;
  }
  
  handleTabChange(items[nextIndex].key);
};
```

### 4.5 스타일 명세

#### 4.5.1 Line Variant (기본)
```css
.tabs--line .tabs__list {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  gap: var(--spacing-md);
}

.tabs--line .tabs__tab {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.tabs--line .tabs__tab--active {
  border-bottom-color: var(--primary);
  color: var(--primary);
}
```

#### 4.5.2 Enclosed Variant
```css
.tabs--enclosed .tabs__list {
  display: flex;
  gap: var(--spacing-xs);
}

.tabs--enclosed .tabs__tab {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border-bottom: none;
  cursor: pointer;
}

.tabs--enclosed .tabs__tab--active {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--bg-primary);
  margin-bottom: -1px;
}

.tabs--enclosed .tabs__panel {
  border: 1px solid var(--border-color);
  border-top: none;
  padding: var(--spacing-md);
}
```

#### 4.5.3 Soft Variant
```css
.tabs--soft .tabs__tab {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.tabs--soft .tabs__tab--active {
  background: var(--primary);
  color: white;
}

.tabs--soft .tabs__tab:hover:not(.tabs__tab--active) {
  background: var(--bg-secondary);
}
```

#### 4.5.4 Vertical Orientation
```css
.tabs--vertical {
  display: flex;
  gap: var(--spacing-md);
}

.tabs--vertical .tabs__list {
  flex-direction: column;
  min-width: 200px;
}

.tabs--vertical .tabs__panel {
  flex: 1;
}
```

### 4.6 접근성
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected`: 활성 탭
- `aria-controls`: 탭이 제어하는 패널 ID
- `tabindex`: 포커스 관리 (-1 for inactive tabs, 0 for active)
- 화살표 키로 탭 전환

### 4.7 사용 예시

```jsx
// 기본 사용
<Tabs
  items={[
    {
      key: 'profile',
      label: '프로필',
      icon: <UserIcon />,
      content: <ProfileForm />
    },
    {
      key: 'settings',
      label: '설정',
      icon: <SettingsIcon />,
      content: <SettingsPanel />
    },
    {
      key: 'billing',
      label: '결제',
      icon: <CreditCardIcon />,
      content: <BillingInfo />
    }
  ]}
/>

// 제어 모드
const [activeTab, setActiveTab] = useState('overview');

<Tabs
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="enclosed"
  items={dashboardTabs}
/>

// Vertical 탭
<Tabs
  orientation="vertical"
  variant="soft"
  items={settingsTabs}
/>

// Full width
<Tabs
  fullWidth
  variant="line"
  items={[
    { key: 'all', label: '전체', content: <AllItems /> },
    { key: 'active', label: '활성', content: <ActiveItems /> },
    { key: 'archived', label: '보관', content: <ArchivedItems /> }
  ]}
/>
```

---

## 5. Accordion

### 5.1 개요
접고 펼칠 수 있는 콘텐츠 패널로, FAQ나 긴 내용을 구성할 때 사용한다.

### 5.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | Array<AccordionItem> | Yes | - | 아코디언 아이템 목록 |
| allowMultiple | boolean | No | false | 여러 패널 동시 열기 허용 |
| defaultOpen | Array<number> | No | [] | 기본으로 열린 아이템 인덱스 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| variant | 'default' \| 'bordered' \| 'separated' | No | 'default' | 스타일 변형 |
| iconPosition | 'left' \| 'right' | No | 'right' | 아이콘 위치 |

#### AccordionItem 타입
```typescript
{
  title: string | ReactNode;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}
```

### 5.3 내부 상태
- `openItems`: 열린 아이템들의 인덱스 배열

### 5.4 동작 방식

#### 5.4.1 단일/다중 열기
```javascript
const [openItems, setOpenItems] = useState(defaultOpen);

const toggleItem = (index) => {
  if (allowMultiple) {
    // 다중 열기 모드
    setOpenItems(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  } else {
    // 단일 열기 모드
    setOpenItems(prev => 
      prev.includes(index) ? [] : [index]
    );
  }
};
```

#### 5.4.2 키보드 네비게이션
```javascript
const handleKeyDown = (e, index) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      toggleItem(index);
      break;
    case 'ArrowDown':
      e.preventDefault();
      // 다음 아이템으로 포커스 이동
      focusItem(index + 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      // 이전 아이템으로 포커스 이동
      focusItem(index - 1);
      break;
    case 'Home':
      e.preventDefault();
      focusItem(0);
      break;
    case 'End':
      e.preventDefault();
      focusItem(items.length - 1);
      break;
  }
};
```

### 5.5 스타일 명세

#### 5.5.1 기본 구조
```css
.accordion {
  width: 100%;
}

.accordion__item {
  border-bottom: 1px solid var(--border-color);
}

.accordion__item:last-child {
  border-bottom: none;
}

.accordion__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: background var(--transition-base);
  user-select: none;
}

.accordion__header:hover {
  background: var(--bg-secondary);
}

.accordion__header--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.accordion__icon {
  transition: transform var(--transition-base);
}

.accordion__icon--open {
  transform: rotate(180deg);
}

.accordion__content {
  overflow: hidden;
  transition: max-height var(--transition-base) ease-out;
}

.accordion__content-inner {
  padding: var(--spacing-md);
  padding-top: 0;
}
```

#### 5.5.2 Variant 스타일

**Default**
```css
.accordion--default .accordion__item {
  border-bottom: 1px solid var(--border-color);
}
```

**Bordered**
```css
.accordion--bordered .accordion__item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.accordion--bordered .accordion__item:last-child {
  margin-bottom: 0;
}
```

**Separated**
```css
.accordion--separated .accordion__item {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
}
```

#### 5.5.3 애니메이션
```javascript
// 높이 애니메이션 (useRef + useEffect)
const contentRef = useRef(null);

useEffect(() => {
  if (contentRef.current) {
    if (isOpen) {
      contentRef.current.style.maxHeight = contentRef.current.scrollHeight + 'px';
    } else {
      contentRef.current.style.maxHeight = '0px';
    }
  }
}, [isOpen]);
```

### 5.6 접근성
- `button` 태그 사용 (헤더)
- `aria-expanded`: 열림/닫힘 상태
- `aria-controls`: 제어하는 콘텐츠 패널 ID
- `aria-disabled`: 비활성화 상태
- 화살표 키로 아이템 간 이동

### 5.7 사용 예시

```jsx
// FAQ
<Accordion
  items={[
    {
      title: '배송은 얼마나 걸리나요?',
      content: '일반 배송은 2-3일, 빠른 배송은 1일 소요됩니다.'
    },
    {
      title: '환불은 어떻게 하나요?',
      content: '구매 후 7일 이내 환불 가능합니다. 고객센터로 문의해주세요.'
    },
    {
      title: '해외 배송도 가능한가요?',
      content: '현재 해외 배송은 일부 국가만 지원합니다.'
    }
  ]}
/>

// 다중 열기
<Accordion
  allowMultiple
  defaultOpen={[0, 1]}
  variant="bordered"
  items={sections}
/>

// 커스텀 아이콘
<Accordion
  items={[
    {
      title: '개인정보',
      icon: <UserIcon />,
      content: <PersonalInfoForm />
    },
    {
      title: '보안설정',
      icon: <LockIcon />,
      content: <SecuritySettings />
    }
  ]}
  iconPosition="left"
/>

// Separated 스타일
<Accordion
  variant="separated"
  items={[
    {
      title: '1단계: 기본 정보',
      content: <Step1Form />
    },
    {
      title: '2단계: 추가 정보',
      content: <Step2Form />
    },
    {
      title: '3단계: 확인',
      content: <Step3Review />
    }
  ]}
/>
```

---

## 6. Toast

### 6.1 개요
화면 모서리에 일시적으로 표시되는 알림 메시지 시스템

### 6.2 API 명세

Toast는 명령형 API를 사용한다.

```javascript
toast.success(message, options);
toast.error(message, options);
toast.warning(message, options);
toast.info(message, options);
```

#### Options
```typescript
{
  duration?: number;        // 표시 시간 (ms), 0이면 자동 닫기 안함
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  dismissible?: boolean;    // 닫기 버튼 표시
  action?: {                // 액션 버튼
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;     // 닫힐 때 콜백
}
```

### 6.3 구현 구조

#### 6.3.1 ToastProvider (Context)
```jsx
// 앱 최상위에 배치
<ToastProvider>
  <App />
</ToastProvider>
```

#### 6.3.2 Toast Hook
```javascript
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
```

#### 6.3.3 Toast Manager
```javascript
class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  add(toast) {
    const id = Date.now();
    this.toasts.push({ ...toast, id });
    this.notify();
    
    if (toast.duration > 0) {
      setTimeout(() => this.remove(id), toast.duration);
    }
    
    return id;
  }

  remove(id) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  notify() {
    this.listeners.forEach(listener => listener(this.toasts));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const toastManager = new ToastManager();
```

### 6.4 내부 상태
- ToastProvider가 모든 토스트 상태 관리
- 각 토스트는 고유 ID 보유

### 6.5 동작 방식

#### 6.5.1 토스트 추가
```javascript
const toast = {
  success: (message, options = {}) => {
    return toastManager.add({
      type: 'success',
      message,
      duration: 3000,
      dismissible: true,
      ...options
    });
  },
  // error, warning, info 동일
};
```

#### 6.5.2 자동 제거
```javascript
useEffect(() => {
  if (duration > 0) {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);
    return () => clearTimeout(timer);
  }
}, [duration, id, onRemove]);
```

#### 6.5.3 위치별 그룹핑
```javascript
const groupedToasts = toasts.reduce((acc, toast) => {
  const position = toast.position || 'top-right';
  if (!acc[position]) acc[position] = [];
  acc[position].push(toast);
  return acc;
}, {});
```

### 6.6 스타일 명세

#### 6.6.1 컨테이너
```css
.toast-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.toast-container--top-right {
  top: var(--spacing-lg);
  right: var(--spacing-lg);
}

.toast-container--top-left {
  top: var(--spacing-lg);
  left: var(--spacing-lg);
}

.toast-container--top-center {
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
}

.toast-container--bottom-right {
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
}

.toast-container--bottom-left {
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
}

.toast-container--bottom-center {
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
}
```

#### 6.6.2 토스트 아이템
```css
.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  min-width: 300px;
  max-width: 500px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

/* Type variants */
.toast--success {
  border-left: 4px solid var(--success);
}

.toast--error {
  border-left: 4px solid var(--error);
}

.toast--warning {
  border-left: 4px solid var(--warning);
}

.toast--info {
  border-left: 4px solid var(--info);
}

.toast__icon {
  flex-shrink: 0;
}

.toast__content {
  flex: 1;
}

.toast__message {
  font-weight: 500;
}

.toast__action {
  margin-left: var(--spacing-sm);
}

.toast__close {
  cursor: pointer;
  padding: var(--spacing-xs);
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.toast__close:hover {
  opacity: 1;
}
```

#### 6.6.3 애니메이션
```css
@keyframes toast-enter-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-exit-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast {
  animation: toast-enter-right 0.3s ease-out;
}

.toast--exiting {
  animation: toast-exit-right 0.3s ease-out;
}
```

### 6.7 접근성
- `role="alert"` 또는 `role="status"`
- `aria-live="polite"` 또는 `"assertive"`
- 화면 리더기가 메시지 읽을 수 있도록

### 6.8 사용 예시

```jsx
// 컴포넌트 내에서
import { toast } from './components/Toast';

function MyComponent() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success('저장되었습니다!');
    } catch (error) {
      toast.error('저장 실패: ' + error.message);
    }
  };

  const handleDelete = () => {
    toast.warning('정말 삭제하시겠습니까?', {
      duration: 5000,
      action: {
        label: '삭제',
        onClick: async () => {
          await deleteItem();
          toast.success('삭제되었습니다');
        }
      }
    });
  };

  return (
    <Button onClick={handleSave}>저장</Button>
  );
}

// 다양한 옵션
toast.info('새로운 메시지가 있습니다', {
  position: 'bottom-center',
  duration: 0,  // 자동 닫기 안함
  dismissible: true
});

toast.success('파일 업로드 완료', {
  position: 'top-center',
  duration: 2000,
  onClose: () => console.log('Toast closed')
});

// 프로미스와 함께
const promise = uploadFile(file);

toast.promise(promise, {
  loading: '업로드 중...',
  success: '업로드 완료!',
  error: '업로드 실패'
});
```

---

## 7. 공통 인터랙션 패턴

### 7.1 외부 클릭 감지 Hook
```javascript
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
```

### 7.2 ESC 키 감지 Hook
```javascript
export function useEscapeKey(handler, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handler, isActive]);
}
```

### 7.3 포커스 트랩 Hook
```javascript
export function useFocusTrap(ref, isActive = true) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref, isActive]);
}
```

### 7.4 Body 스크롤 방지 Hook
```javascript
export function useLockBodyScroll(isLocked = true) {
  useEffect(() => {
    if (isLocked) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // 스크롤바 너비만큼 padding 추가 (레이아웃 시프트 방지)
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isLocked]);
}
```

### 7.5 Portal 컴포넌트
```javascript
import { createPortal } from 'react-dom';

export function Portal({ children, container }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const portalContainer = container || document.body;
  return createPortal(children, portalContainer);
}
```

---

## 8. 구현 우선순위

### 8.1 Phase 1 (핵심)
1. **Modal** - 가장 자주 사용, 다른 컴포넌트의 기반
2. **Toast** - 피드백 시스템의 핵심

### 8.2 Phase 2 (중요)
3. **Dropdown** - 메뉴, 액션에 필수
4. **Tabs** - 콘텐츠 구성에 유용

### 8.3 Phase 3 (보조)
5. **Autocomplete** - 복잡하지만 유용
6. **Accordion** - FAQ, 긴 콘텐츠용

---

## 9. 파일 구조

```
components/
└── level1/
    ├── Modal/
    │   ├── Modal.jsx
    │   ├── ModalHeader.jsx
    │   ├── ModalBody.jsx
    │   ├── ModalFooter.jsx
    │   ├── Modal.css
    │   └── index.js
    ├── Dropdown/
    │   ├── Dropdown.jsx
    │   ├── Dropdown.css
    │   └── index.js
    ├── Autocomplete/
    │   ├── Autocomplete.jsx
    │   ├── Autocomplete.css
    │   └── index.js
    ├── Tabs/
    │   ├── Tabs.jsx
    │   ├── Tabs.css
    │   └── index.js
    ├── Accordion/
    │   ├── Accordion.jsx
    │   ├── Accordion.css
    │   └── index.js
    └── Toast/
        ├── Toast.jsx
        ├── ToastProvider.jsx
        ├── ToastManager.js
        ├── Toast.css
        └── index.js

hooks/
├── useClickOutside.js
├── useEscapeKey.js
├── useFocusTrap.js
├── useLockBodyScroll.js
└── index.js

components/common/
└── Portal.jsx
```

---

## 10. 테스트 시나리오

### 10.1 Modal 테스트
- [ ] 열기/닫기 동작
- [ ] 오버레이 클릭으로 닫기
- [ ] ESC 키로 닫기
- [ ] Body 스크롤 방지
- [ ] 포커스 트랩
- [ ] 다양한 size
- [ ] Subcomponents (Header, Body, Footer)

### 10.2 Dropdown 테스트
- [ ] 클릭으로 열기/닫기
- [ ] 외부 클릭으로 닫기
- [ ] 아이템 선택
- [ ] disabled 아이템
- [ ] divider 표시
- [ ] 4가지 position
- [ ] 키보드 네비게이션

### 10.3 Autocomplete 테스트
- [ ] 입력 시 제안 표시
- [ ] 디바운스 동작
- [ ] 필터링
- [ ] 제안 선택
- [ ] 키보드 네비게이션 (화살표, Enter)
- [ ] 로딩 상태
- [ ] 빈 상태

### 10.4 Tabs 테스트
- [ ] 탭 전환
- [ ] 제어/비제어 모드
- [ ] disabled 탭
- [ ] 키보드 네비게이션
- [ ] 3가지 variant
- [ ] vertical orientation

### 10.5 Accordion 테스트
- [ ] 열기/닫기
- [ ] 단일/다중 열기 모드
- [ ] 애니메이션
- [ ] disabled 아이템
- [ ] 키보드 네비게이션
- [ ] 3가지 variant

### 10.6 Toast 테스트
- [ ] success, error, warning, info 표시
- [ ] 자동 닫기 (duration)
- [ ] 수동 닫기 (dismissible)
- [ ] 액션 버튼
- [ ] 6가지 position
- [ ] 여러 토스트 동시 표시
- [ ] 애니메이션

---

## 11. 구현 시 주의사항

### 11.1 성능
- Portal 사용하여 DOM 최상위에 렌더링
- 모달/드롭다운 열릴 때만 DOM에 마운트
- 애니메이션은 CSS 사용 (JS 최소화)
- Toast는 최대 개수 제한 고려

### 11.2 접근성
- 모든 인터랙션 컴포넌트 키보드 접근 가능
- ARIA 속성 적절히 사용
- 포커스 관리 철저히
- 스크린 리더 호환

### 11.3 사용성
- 애니메이션 부드럽게 (200-300ms)
- 로딩 상태 명확히 표시
- 에러 처리 철저히
- 모바일 터치 이벤트 고려

### 11.4 유지보수성
- 공통 Hook 재사용
- Portal 컴포넌트 공유
- 일관된 API 디자인
- 명확한 props 명세

---

## 12. 다음 단계

Day 3 컴포넌트 완성 후:
1. Day 1, 2 컴포넌트와 조합하여 실제 UI 패턴 테스트
2. 모든 인터랙션 키보드/마우스로 테스트
3. 접근성 검증 (스크린 리더, 키보드만)
4. Day 4 상세 설계서 작성 (데이터 표시 컴포넌트)

---

## 13. 참고 자료

### 13.1 디자인 참고
- Headless UI: https://headlessui.com/
- Radix UI Primitives: https://www.radix-ui.com/
- React Aria: https://react-spectrum.adobe.com/react-aria/

### 13.2 접근성
- WAI-ARIA Dialog: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WAI-ARIA Tabs: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- WAI-ARIA Accordion: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/

### 13.3 구현 참고
- React Portal: https://react.dev/reference/react-dom/createPortal
- Focus Management: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/