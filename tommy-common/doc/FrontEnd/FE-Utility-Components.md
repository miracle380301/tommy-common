# Day 9 상세 설계서 - Hooks & 유틸리티

## 목차
1. [커스텀 Hooks](#1-커스텀-hooks)
2. [유틸리티 함수](#2-유틸리티-함수)
3. [테마 시스템 정리](#3-테마-시스템-정리)

---

## 1. 커스텀 Hooks

### 1.1 useApi

#### 개요
API 호출과 상태 관리를 통합한 Hook

#### 인터페이스
```typescript
function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}
```

#### 구현
```javascript
export function useApi(apiFunction, options = {}) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}
```

#### 사용 예시
```jsx
// 즉시 실행
const { data, loading, error } = useApi(
  () => api.get('/users'),
  { immediate: true }
);

// 수동 실행
const { data, loading, execute } = useApi(api.post);

const handleSubmit = async (values) => {
  await execute('/users', values);
  toast.success('저장되었습니다');
};
```

---

### 1.2 useDebounce

#### 개요
값의 변경을 지연시키는 Hook

#### 인터페이스
```typescript
function useDebounce<T>(value: T, delay: number): T
```

#### 구현
```javascript
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

#### 사용 예시
```jsx
function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="검색..."
    />
  );
}
```

---

### 1.3 useToggle

#### 개요
Boolean 상태를 토글하는 Hook

#### 인터페이스
```typescript
function useToggle(
  initialValue?: boolean
): [boolean, () => void, (value: boolean) => void]
```

#### 구현
```javascript
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle, setValue];
}
```

#### 사용 예시
```jsx
function MyComponent() {
  const [isOpen, toggle, setIsOpen] = useToggle(false);

  return (
    <>
      <Button onClick={toggle}>토글</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        내용
      </Modal>
    </>
  );
}
```

---

### 1.4 useLocalStorage

#### 개요
LocalStorage와 동기화되는 상태 Hook (Artifacts에서는 메모리 기반)

#### 인터페이스
```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void]
```

#### 구현
```javascript
export function useLocalStorage(key, initialValue) {
  // Artifacts에서는 localStorage 사용 불가, 메모리 기반 구현
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // 실제 환경에서는 localStorage.getItem(key) 사용
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // 실제 환경에서는 localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      // 실제 환경에서는 localStorage.removeItem(key)
    } catch (error) {
      console.error(error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

#### 사용 예시
```jsx
function UserPreferences() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'minimal');

  return (
    <Select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      options={[
        { value: 'minimal', label: 'Minimal' },
        { value: 'glassmorphism', label: 'Glassmorphism' },
        { value: 'neon', label: 'Neon' }
      ]}
    />
  );
}
```

---

### 1.5 useClickOutside

#### 개요
요소 외부 클릭을 감지하는 Hook

#### 인터페이스
```typescript
function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
): void
```

#### 구현
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

#### 사용 예시
```jsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  return (
    <div ref={dropdownRef}>
      <Button onClick={() => setIsOpen(!isOpen)}>메뉴</Button>
      {isOpen && <DropdownMenu />}
    </div>
  );
}
```

---

### 1.6 usePagination

#### 개요
페이지네이션 로직을 관리하는 Hook

#### 인터페이스
```typescript
function usePagination(
  data: Array<any>,
  options?: {
    initialPage?: number;
    initialPageSize?: number;
  }
): {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedData: Array<any>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
}
```

#### 구현
```javascript
export function usePagination(data, options = {}) {
  const { initialPage = 1, initialPageSize = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => goToPage(1), [goToPage]);
  const lastPage = useCallback(() => goToPage(totalPages), [totalPages, goToPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    totalItems: data.length
  };
}
```

#### 사용 예시
```jsx
function UserList({ users }) {
  const pagination = usePagination(users, { initialPageSize: 20 });

  return (
    <>
      <Table data={pagination.paginatedData} columns={columns} />
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
      />
    </>
  );
}
```

---

### 1.7 useSort

#### 개요
데이터 정렬을 관리하는 Hook

#### 구현
```javascript
export function useSort(data, initialConfig = null) {
  const [sortConfig, setSortConfig] = useState(initialConfig);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  return { sortedData, sortConfig, requestSort, setSortConfig };
}
```

---

### 1.8 useFilter

#### 개요
데이터 필터링을 관리하는 Hook

#### 구현
```javascript
export function useFilter(data, initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all' || value === '') return true;

        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }

        if (typeof value === 'string') {
          return String(item[key])
            .toLowerCase()
            .includes(value.toLowerCase());
        }

        return item[key] === value;
      });
    });
  }, [data, filters]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filteredData,
    filters,
    setFilter,
    setFilters,
    clearFilters
  };
}
```

---

## 2. 유틸리티 함수

### 2.1 Format 유틸리티

#### formatDate
```javascript
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 사용 예시
formatDate(new Date(), 'YYYY-MM-DD'); // "2024-01-01"
formatDate(new Date(), 'YYYY-MM-DD HH:mm'); // "2024-01-01 14:30"
```

#### formatRelativeTime
```javascript
export function formatRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return formatDate(target, 'YYYY-MM-DD');
}

// 사용 예시
formatRelativeTime(new Date(Date.now() - 30000)); // "방금 전"
formatRelativeTime(new Date(Date.now() - 120000)); // "2분 전"
```

#### formatNumber
```javascript
export function formatNumber(number, options = {}) {
  const { decimals = 0, thousandsSeparator = ',', decimalSeparator = '.' } = options;

  const parts = Number(number).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  return parts.join(decimalSeparator);
}

// 사용 예시
formatNumber(1234567.89, { decimals: 2 }); // "1,234,567.89"
formatNumber(1234567); // "1,234,567"
```

#### formatCurrency
```javascript
export function formatCurrency(amount, currency = 'KRW') {
  const currencySymbols = {
    KRW: '₩',
    USD: '# Day 9 상세 설계서 - Hooks & 유틸리티

## 목차
1. [커스텀 Hooks](#1-커스텀-hooks)
2. [유틸리티 함수](#2-유틸리티-함수)
3. [테마 시스템 정리](#3-테마-시스템-정리)

---

## 1. 커스텀 Hooks

### 1.1 useApi

#### 개요
API 호출과 상태 관리를 통합한 Hook

#### 인터페이스
```typescript
function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}
```

#### 구현
```javascript
export function useApi(apiFunction, options = {}) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}
```

#### 사용 예시
```jsx
// 즉시 실행
const { data, loading, error } = useApi(
  () => api.get('/users'),
  { immediate: true }
);

// 수동 실행
const { data, loading, execute } = useApi(api.post);

const handleSubmit = async (values) => {
  await execute('/users', values);
  toast.success('저장되었습니다');
};
```

---

### 1.2 useDebounce

#### 개요
값의 변경을 지연시키는 Hook

#### 인터페이스
```typescript
function useDebounce<T>(value: T, delay: number): T
```

#### 구현
```javascript
export,
    EUR: '€',
    JPY: '¥'
  };

  const symbol = currencySymbols[currency] || currency;
  const formatted = formatNumber(amount, { decimals: currency === 'KRW' ? 0 : 2 });

  return `${symbol}${formatted}`;
}

// 사용 예시
formatCurrency(1234567); // "₩1,234,567"
formatCurrency(1234.56, 'USD'); // "$1,234.56"
```

#### formatFileSize
```javascript
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 사용 예시
formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"
formatFileSize(1234567890); // "1.15 GB"
```

---

### 2.2 Validation 유틸리티

#### isEmail
```javascript
export function isEmail(email) {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regex.test(email);
}
```

#### isPhone
```javascript
export function isPhone(phone) {
  // 한국 전화번호 형식
  const regex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return regex.test(phone);
}
```

#### isURL
```javascript
export function isURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

#### isStrongPassword
```javascript
export function isStrongPassword(password) {
  // 최소 8자, 대문자, 소문자, 숫자 포함
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
```

---

### 2.3 String 유틸리티

#### truncate
```javascript
export function truncate(str, length = 50, suffix = '...') {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

// 사용 예시
truncate('This is a very long text', 10); // "This is..."
```

#### capitalize
```javascript
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// 사용 예시
capitalize('hello world'); // "Hello world"
```

#### slugify
```javascript
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 사용 예시
slugify('Hello World!'); // "hello-world"
slugify('안녕하세요 세상'); // "안녕하세요-세상"
```

---

### 2.4 Array 유틸리티

#### groupBy
```javascript
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

// 사용 예시
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Charlie', role: 'admin' }
];
groupBy(users, 'role');
// { admin: [...], user: [...] }
```

#### sortBy
```javascript
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// 사용 예시
sortBy(users, 'name'); // 이름순 정렬
sortBy(users, 'age', 'desc'); // 나이 내림차순
```

#### unique
```javascript
export function unique(array, key) {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// 사용 예시
unique([1, 2, 2, 3, 3, 4]); // [1, 2, 3, 4]
unique(users, 'email'); // 이메일 기준 중복 제거
```

---

### 2.5 Object 유틸리티

#### pick
```javascript
export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

// 사용 예시
pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
```

#### omit
```javascript
export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

// 사용 예시
omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
```

---

### 2.6 CSV 유틸리티

#### convertToCSV
```javascript
export function convertToCSV(data, columns) {
  if (!data || data.length === 0) return '';

  // 헤더
  const headers = columns.map(col => col.label).join(',');

  // 행
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      
      // 쉼표나 따옴표가 있으면 따옴표로 감싸기
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value ?? '';
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}
```

#### downloadCSV
```javascript
export function downloadCSV(csv, filename = 'export.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

---

### 2.7 Class Name 유틸리티

#### cn (classNames)
```javascript
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}

// 사용 예시
cn('btn', 'btn--primary', isActive && 'btn--active');
// "btn btn--primary btn--active"

cn('card', { 'card--hoverable': hoverable });
// "card card--hoverable"
```

---

## 3. 테마 시스템 정리

### 3.1 CSS Variables 전체 구조

```css
:root {
  /* Colors */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-light: #dbeafe;
  --primary-rgb: 59, 130, 246;
  
  --secondary: #64748b;
  --secondary-hover: #475569;
  
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  /* Text */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  
  /* Borders */
  --border-color: #e5e7eb;
  --border-radius: 8px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  
  /* Radius */
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

### 3.2 Minimal Theme
```css
[data-theme="minimal"] {
  --primary: #000000;
  --primary-hover: #1f1f1f;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --border-color: #e5e7eb;
}
```

### 3.3 Glassmorphism Theme
```css
[data-theme="glassmorphism"] {
  --primary: #3b82f6;
  --bg-primary: rgba(255, 255, 255, 0.7);
  --bg-secondary: rgba(249, 250, 251, 0.6);
  --border-color: rgba(255, 255, 255, 0.18);
  --backdrop-blur: blur(10px);
}
```

### 3.4 Neon Theme
```css
[data-theme="neon"] {
  --primary: #8b5cf6;
  --bg-primary: #0f0f1e;
  --bg-secondary: #1a1a2e;
  --text-primary: #ffffff;
  --text-secondary: #a78bfa;
  --border-color: #8b5cf6;
}
```

### 3.5 ThemeProvider Component
```jsx
export function ThemeProvider({ theme = 'minimal', children }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return children;
}

// 사용
<ThemeProvider theme="glassmorphism">
  <App />
</ThemeProvider>
```

---

## 4. 파일 구조

```
hooks/
├── useApi.js
├── useDebounce.js
├── useToggle.js
├── useLocalStorage.js
├── useClickOutside.js
├── usePagination.js
├── useSort.js
├── useFilter.js
└── index.js

utils/
├── format.js
├── validation.js
├── string.js
├── array.js
├── object.js
├── csv.js
├── classNames.js
└── index.js

themes/
├── variables.css
├── minimal.css
├── glassmorphism.css
├── neon.css
└── ThemeProvider.jsx
```

---

## 5. 완료 체크리스트

### 5.1 Hooks
- [ ] useApi
- [ ] useDebounce
- [ ] useToggle
- [ ] useLocalStorage
- [ ] useClickOutside
- [ ] usePagination
- [ ] useSort
- [ ] useFilter

### 5.2 유틸리티
- [ ] Format 함수들
- [ ] Validation 함수들
- [ ] String 함수들
- [ ] Array 함수들
- [ ] Object 함수들
- [ ] CSV 함수들
- [ ] cn (classNames)

### 5.3 테마
- [ ] CSS Variables 정리
- [ ] 3가지 테마 완성
- [ ] ThemeProvider
- [ ] 모든 컴포넌트 테마 적용 확인# Day 9 상세 설계서 - Hooks & 유틸리티

## 목차
1. [커스텀 Hooks](#1-커스텀-hooks)
2. [유틸리티 함수](#2-유틸리티-함수)
3. [테마 시스템 정리](#3-테마-시스템-정리)

---

## 1. 커스텀 Hooks

### 1.1 useApi

#### 개요
API 호출과 상태 관리를 통합한 Hook

#### 인터페이스
```typescript
function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}
```

#### 구현
```javascript
export function useApi(apiFunction, options = {}) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}
```

#### 사용 예시
```jsx
// 즉시 실행
const { data, loading, error } = useApi(
  () => api.get('/users'),
  { immediate: true }
);

// 수동 실행
const { data, loading, execute } = useApi(api.post);

const handleSubmit = async (values) => {
  await execute('/users', values);
  toast.success('저장되었습니다');
};
```

---

### 1.2 useDebounce

#### 개요
값의 변경을 지연시키는 Hook

#### 인터페이스
```typescript
function useDebounce<T>(value: T, delay: number): T
```

#### 구현
```javascript
export