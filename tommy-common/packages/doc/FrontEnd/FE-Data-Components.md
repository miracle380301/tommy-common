# Day 4 상세 설계서 - 데이터 표시 컴포넌트

## 목차
1. [Table](#1-table)
2. [Pagination](#2-pagination)
3. [SearchBar](#3-searchbar)
4. [EmptyState](#4-emptystate)
5. [공통 데이터 패턴](#5-공통-데이터-패턴)

---

## 1. Table

### 1.1 개요
데이터를 행과 열로 표시하는 테이블 컴포넌트로, 정렬, 선택 등 다양한 기능을 지원한다.

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| columns | Array<Column> | Yes | - | 컬럼 정의 |
| data | Array<Object> | Yes | - | 테이블 데이터 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| variant | 'default' \| 'striped' \| 'bordered' \| 'hover' | No | 'default' | 테이블 스타일 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 행 높이 |
| loading | boolean | No | false | 로딩 상태 |
| emptyMessage | string \| ReactNode | No | '데이터가 없습니다' | 빈 상태 메시지 |
| onSort | function | No | - | 정렬 변경 핸들러 |
| sortConfig | {key: string, direction: 'asc'\|'desc'} | No | - | 현재 정렬 상태 |
| selectable | boolean | No | false | 행 선택 가능 여부 |
| selectedRows | Array<string\|number> | No | [] | 선택된 행 ID 목록 |
| onSelectionChange | function | No | - | 선택 변경 핸들러 |
| onRowClick | function | No | - | 행 클릭 핸들러 |
| stickyHeader | boolean | No | false | 헤더 고정 여부 |
| responsive | boolean | No | true | 반응형 (모바일에서 카드 뷰) |

#### Column 타입
```typescript
{
  key: string;              // 데이터 키
  label: string | ReactNode; // 헤더 레이블
  sortable?: boolean;       // 정렬 가능 여부
  width?: string | number;  // 컬럼 너비
  align?: 'left' | 'center' | 'right'; // 정렬
  render?: (value, row, index) => ReactNode; // 커스텀 렌더러
  headerRender?: () => ReactNode; // 커스텀 헤더
}
```

### 1.3 내부 상태
- `internalSortConfig`: 비제어 모드일 때 정렬 상태
- `internalSelectedRows`: 비제어 모드일 때 선택 상태

### 1.4 동작 방식

#### 1.4.1 정렬 처리
```javascript
const handleSort = (columnKey) => {
  const column = columns.find(c => c.key === columnKey);
  if (!column?.sortable) return;

  const currentSort = sortConfig || internalSortConfig;
  let newDirection = 'asc';

  if (currentSort?.key === columnKey) {
    newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
  }

  const newSortConfig = { key: columnKey, direction: newDirection };

  if (onSort) {
    onSort(newSortConfig);
  } else {
    setInternalSortConfig(newSortConfig);
  }
};
```

#### 1.4.2 정렬된 데이터
```javascript
const sortedData = useMemo(() => {
  const currentSort = sortConfig || internalSortConfig;
  if (!currentSort) return data;

  return [...data].sort((a, b) => {
    const aVal = a[currentSort.key];
    const bVal = b[currentSort.key];

    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return currentSort.direction === 'asc' ? comparison : -comparison;
  });
}, [data, sortConfig, internalSortConfig]);
```

#### 1.4.3 행 선택
```javascript
const handleSelectAll = (checked) => {
  const newSelected = checked ? data.map(row => row.id) : [];
  
  if (onSelectionChange) {
    onSelectionChange(newSelected);
  } else {
    setInternalSelectedRows(newSelected);
  }
};

const handleSelectRow = (rowId, checked) => {
  const currentSelected = selectedRows || internalSelectedRows;
  const newSelected = checked
    ? [...currentSelected, rowId]
    : currentSelected.filter(id => id !== rowId);
  
  if (onSelectionChange) {
    onSelectionChange(newSelected);
  } else {
    setInternalSelectedRows(newSelected);
  }
};
```

#### 1.4.4 반응형 처리
```javascript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// 모바일에서는 카드 뷰로 변경
if (responsive && isMobile) {
  return <MobileCardView data={sortedData} columns={columns} />;
}
```

### 1.5 스타일 명세

#### 1.5.1 기본 구조
```css
.table-container {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
}

.table__header {
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border-color);
}

.table__header-cell {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.table__header-cell--sortable {
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}

.table__header-cell--sortable:hover {
  background: var(--bg-tertiary);
}

.table__sort-icon {
  display: inline-block;
  margin-left: var(--spacing-xs);
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.table__header-cell--sorted .table__sort-icon {
  opacity: 1;
}

.table__body-row {
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition-fast);
}

.table__body-cell {
  padding: var(--spacing-md);
}
```

#### 1.5.2 Variant 스타일

**Striped**
```css
.table--striped .table__body-row:nth-child(even) {
  background: var(--bg-secondary);
}
```

**Bordered**
```css
.table--bordered {
  border: 1px solid var(--border-color);
}

.table--bordered .table__header-cell,
.table--bordered .table__body-cell {
  border-right: 1px solid var(--border-color);
}

.table--bordered .table__header-cell:last-child,
.table--bordered .table__body-cell:last-child {
  border-right: none;
}
```

**Hover**
```css
.table--hover .table__body-row:hover {
  background: var(--bg-secondary);
  cursor: pointer;
}
```

#### 1.5.3 Size 변형
```css
/* sm */
.table--sm .table__header-cell,
.table--sm .table__body-cell {
  padding: var(--spacing-sm);
  font-size: 0.875rem;
}

/* md (default) */
.table--md .table__header-cell,
.table--md .table__body-cell {
  padding: var(--spacing-md);
  font-size: 1rem;
}

/* lg */
.table--lg .table__header-cell,
.table--lg .table__body-cell {
  padding: var(--spacing-lg);
  font-size: 1.125rem;
}
```

#### 1.5.4 Sticky Header
```css
.table--sticky-header {
  max-height: 600px;
  overflow-y: auto;
}

.table--sticky-header .table__header {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

#### 1.5.5 선택 체크박스
```css
.table__checkbox-cell {
  width: 40px;
  text-align: center;
}
```

#### 1.5.6 로딩 상태
```css
.table__loading {
  padding: var(--spacing-xl);
  text-align: center;
}

.table__loading-spinner {
  /* 스피너 스타일 */
}
```

#### 1.5.7 모바일 카드 뷰
```css
.table-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.table-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.table-card__row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.table-card__row:last-child {
  border-bottom: none;
}

.table-card__label {
  font-weight: 600;
  color: var(--text-secondary);
}

.table-card__value {
  color: var(--text-primary);
}
```

### 1.6 접근성
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` 시맨틱 태그 사용
- `scope="col"` 헤더 셀에 추가
- `aria-sort`: 정렬된 컬럼 표시
- 키보드로 행 선택 가능

### 1.7 사용 예시

```jsx
// 기본 사용
<Table
  columns={[
    { key: 'id', label: 'ID', sortable: true, width: 80 },
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일' },
    { key: 'status', label: '상태', align: 'center' }
  ]}
  data={users}
/>

// 커스텀 렌더러
<Table
  columns={[
    { key: 'name', label: '이름' },
    { 
      key: 'avatar', 
      label: '프로필',
      render: (value) => <Avatar src={value} size="sm" />
    },
    { 
      key: 'status', 
      label: '상태',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'default'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '작업',
      render: (_, row) => (
        <Flex gap="sm">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            수정
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row)}>
            삭제
          </Button>
        </Flex>
      )
    }
  ]}
  data={users}
  variant="hover"
/>

// 정렬 제어
const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

<Table
  columns={columns}
  data={data}
  sortConfig={sortConfig}
  onSort={setSortConfig}
/>

// 행 선택
const [selectedRows, setSelectedRows] = useState([]);

<Table
  columns={columns}
  data={users}
  selectable
  selectedRows={selectedRows}
  onSelectionChange={setSelectedRows}
/>

// 행 클릭
<Table
  columns={columns}
  data={products}
  onRowClick={(row) => navigate(`/products/${row.id}`)}
  variant="hover"
/>

// Sticky Header
<Table
  columns={columns}
  data={largeDataset}
  stickyHeader
  variant="striped"
/>

// 로딩 상태
<Table
  columns={columns}
  data={data}
  loading={isLoading}
/>
```

---

## 2. Pagination

### 2.1 개요
긴 목록을 여러 페이지로 나누어 표시하는 페이지네이션 컴포넌트

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| currentPage | number | Yes | - | 현재 페이지 (1부터 시작) |
| totalPages | number | Yes | - | 전체 페이지 수 |
| onPageChange | function | Yes | - | 페이지 변경 핸들러 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| variant | 'default' \| 'compact' \| 'simple' | No | 'default' | 스타일 변형 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 크기 |
| showFirstLast | boolean | No | true | 처음/마지막 버튼 표시 |
| showPrevNext | boolean | No | true | 이전/다음 버튼 표시 |
| siblingCount | number | No | 1 | 현재 페이지 좌우 표시 페이지 수 |
| boundaryCount | number | No | 1 | 시작/끝 표시 페이지 수 |
| disabled | boolean | No | false | 비활성화 |
| showPageSize | boolean | No | false | 페이지 크기 선택기 표시 |
| pageSize | number | No | 10 | 페이지당 아이템 수 |
| pageSizeOptions | Array<number> | No | [10, 20, 50, 100] | 페이지 크기 옵션 |
| onPageSizeChange | function | No | - | 페이지 크기 변경 핸들러 |
| totalItems | number | No | - | 전체 아이템 수 (정보 표시용) |

### 2.3 내부 상태
- 없음 (모두 props로 제어)

### 2.4 동작 방식

#### 2.4.1 페이지 범위 계산
```javascript
const generatePageNumbers = () => {
  const { currentPage, totalPages, siblingCount, boundaryCount } = props;
  
  // 총 표시할 페이지 버튼 수
  const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2;
  
  if (totalPages <= totalNumbers) {
    // 모든 페이지 표시
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // 시작 부분
  const leftBoundary = Array.from(
    { length: boundaryCount }, 
    (_, i) => i + 1
  );
  
  // 끝 부분
  const rightBoundary = Array.from(
    { length: boundaryCount },
    (_, i) => totalPages - boundaryCount + i + 1
  );
  
  // 현재 페이지 주변
  const leftSibling = Math.max(currentPage - siblingCount, boundaryCount + 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount - 1);
  
  const shouldShowLeftDots = leftSibling > boundaryCount + 2;
  const shouldShowRightDots = rightSibling < totalPages - boundaryCount - 1;
  
  const middleNumbers = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i
  );
  
  // 조합
  return [
    ...leftBoundary,
    ...(shouldShowLeftDots ? ['...'] : []),
    ...middleNumbers,
    ...(shouldShowRightDots ? ['...'] : []),
    ...rightBoundary
  ];
};
```

#### 2.4.2 페이지 이동
```javascript
const goToPage = (page) => {
  if (page < 1 || page > totalPages || page === currentPage || disabled) {
    return;
  }
  onPageChange(page);
};

const goToFirstPage = () => goToPage(1);
const goToLastPage = () => goToPage(totalPages);
const goToPrevPage = () => goToPage(currentPage - 1);
const goToNextPage = () => goToPage(currentPage + 1);
```

### 2.5 스타일 명세

#### 2.5.1 기본 구조
```css
.pagination {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pagination__button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
}

.pagination__button:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--primary);
}

.pagination__button--active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__ellipsis {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-xs);
  color: var(--text-secondary);
}
```

#### 2.5.2 Variant 스타일

**Compact**
```css
.pagination--compact .pagination__button {
  min-width: 32px;
  height: 32px;
  padding: 0 var(--spacing-xs);
  font-size: 0.75rem;
}

.pagination--compact {
  gap: 4px;
}
```

**Simple**
```css
.pagination--simple {
  justify-content: space-between;
}

.pagination--simple .pagination__info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

#### 2.5.3 Size 변형
```css
/* sm */
.pagination--sm .pagination__button {
  min-width: 28px;
  height: 28px;
  font-size: 0.75rem;
}

/* md (default) */
.pagination--md .pagination__button {
  min-width: 36px;
  height: 36px;
  font-size: 0.875rem;
}

/* lg */
.pagination--lg .pagination__button {
  min-width: 44px;
  height: 44px;
  font-size: 1rem;
}
```

#### 2.5.4 페이지 크기 선택기
```css
.pagination__page-size {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: var(--spacing-lg);
}

.pagination__page-size-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
}
```

### 2.6 접근성
- `<nav>` 태그로 감싸기
- `aria-label="pagination"`
- `aria-current="page"` 현재 페이지에
- 버튼에 `aria-label` (예: "Go to page 1", "Previous page")
- 키보드로 탐색 가능

### 2.7 사용 예시

```jsx
// 기본 사용
const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(totalItems / pageSize);

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

// 페이지 크기 선택
const [pageSize, setPageSize] = useState(20);

<Pagination
  currentPage={currentPage}
  totalPages={Math.ceil(totalItems / pageSize)}
  onPageChange={setCurrentPage}
  showPageSize
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  totalItems={totalItems}
/>

// Compact 변형
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  variant="compact"
  size="sm"
  siblingCount={0}
  boundaryCount={1}
/>

// Simple 변형
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  variant="simple"
/>

// 테이블과 함께
<Card>
  <Card.Body>
    <Table
      columns={columns}
      data={paginatedData}
    />
  </Card.Body>
  <Card.Footer>
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  </Card.Footer>
</Card>
```

---

## 3. SearchBar

### 3.1 개요
검색 입력을 위한 특화된 입력 필드로, 디바운스와 자동완성을 지원한다.

### 3.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string | No | - | 검색어 (제어 모드) |
| defaultValue | string | No | '' | 초기 검색어 |
| onChange | function | No | - | 입력 변경 핸들러 |
| onSearch | function | No | - | 검색 실행 핸들러 |
| onClear | function | No | - | 검색어 삭제 핸들러 |
| placeholder | string | No | '검색...' | placeholder |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 크기 |
| debounceMs | number | No | 300 | 디바운스 시간 (ms) |
| showSearchButton | boolean | No | false | 검색 버튼 표시 |
| showClearButton | boolean | No | true | 삭제 버튼 표시 |
| loading | boolean | No | false | 로딩 상태 |
| disabled | boolean | No | false | 비활성화 |
| autoFocus | boolean | No | false | 자동 포커스 |
| fullWidth | boolean | No | false | 전체 너비 |

### 3.3 내부 상태
- `internalValue`: 비제어 모드일 때 검색어
- `debouncedValue`: 디바운스된 검색어

### 3.4 동작 방식

#### 3.4.1 디바운스 처리
```javascript
const [debouncedValue, setDebouncedValue] = useState(value || internalValue);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedValue(value || internalValue);
  }, debounceMs);

  return () => clearTimeout(timer);
}, [value, internalValue, debounceMs]);

useEffect(() => {
  if (debouncedValue !== undefined && onSearch) {
    onSearch(debouncedValue);
  }
}, [debouncedValue, onSearch]);
```

#### 3.4.2 입력 처리
```javascript
const handleChange = (e) => {
  const newValue = e.target.value;
  
  if (value === undefined) {
    setInternalValue(newValue);
  }
  
  onChange?.(e);
};
```

#### 3.4.3 검색 실행
```javascript
const handleSearch = () => {
  const currentValue = value || internalValue;
  onSearch?.(currentValue);
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};
```

#### 3.4.4 삭제
```javascript
const handleClear = () => {
  if (value === undefined) {
    setInternalValue('');
  }
  
  onClear?.();
  onSearch?.('');
};
```

### 3.5 스타일 명세

```css
.search-bar {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.search-bar--full-width {
  display: flex;
  width: 100%;
}

.search-bar__input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-bar__icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-secondary);
  pointer-events: none;
}

.search-bar__input {
  width: 100%;
  padding-left: calc(var(--spacing-md) * 2 + 20px); /* icon space */
  padding-right: var(--spacing-xl); /* clear button space */
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  transition: all var(--transition-base);
}

.search-bar__input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--focus-ring);
}

.search-bar__clear-button {
  position: absolute;
  right: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.search-bar__input:not(:placeholder-shown) + .search-bar__clear-button {
  opacity: 1;
}

.search-bar__clear-button:hover {
  color: var(--text-primary);
}

.search-bar__search-button {
  margin-left: var(--spacing-sm);
}

.search-bar__loading {
  position: absolute;
  right: var(--spacing-md);
}
```

### 3.6 접근성
- `<input type="search">` 사용
- `aria-label="search"` 또는 레이블 연결
- `role="searchbox"`
- Enter 키로 검색 실행

### 3.7 사용 예시

```jsx
// 기본 사용
<SearchBar
  placeholder="상품 검색"
  onSearch={(query) => console.log(query)}
/>

// 제어 모드 + 디바운스
const [searchQuery, setSearchQuery] = useState('');

<SearchBar
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onSearch={(query) => fetchSearchResults(query)}
  debounceMs={500}
/>

// 검색 버튼 포함
<SearchBar
  onSearch={handleSearch}
  showSearchButton
  placeholder="Enter를 누르거나 검색 버튼 클릭"
/>

// 로딩 상태
<SearchBar
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  loading={isSearching}
/>

// 전체 너비
<SearchBar
  fullWidth
  size="lg"
  placeholder="무엇을 찾고 계신가요?"
  onSearch={handleSearch}
/>

// 테이블 필터와 함께
<Card>
  <Card.Header>
    <Flex justify="between" align="center">
      <h3>사용자 목록</h3>
      <SearchBar
        placeholder="사용자 검색"
        onSearch={setSearchFilter}
        size="sm"
      />
    </Flex>
  </Card.Header>
  <Card.Body>
    <Table columns={columns} data={filteredUsers} />
  </Card.Body>
</Card>
```

---

## 4. EmptyState

### 4.1 개요
데이터가 없거나 검색 결과가 없을 때 표시하는 빈 상태 컴포넌트

### 4.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| icon | ReactNode | No | - | 아이콘 또는 이미지 |
| title | string | No | '데이터가 없습니다' | 제목 |
| description | string | No | - | 설명 텍스트 |
| action | ReactNode | No | - | 액션 버튼 (주로 Button) |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| size | 'sm' \| 'md' \| 'lg' | No | 'md' | 크기 |
| children | ReactNode | No | - | 커스텀 콘텐츠 |

### 4.3 내부 상태
- 없음

### 4.4 동작 방식

#### 4.4.1 기본 렌더링
```javascript
// icon, title, description, action 순서로 표시
<div className="empty-state">
  {icon && <div className="empty-state__icon">{icon}</div>}
  {title && <h3 className="empty-state__title">{title}</h3>}
  {description && <p className="empty-state__description">{description}</p>}
  {action && <div className="empty-state__action">{action}</div>}
  {children}
</div>
```

### 4.5 스타일 명세

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  min-height: 300px;
}

.empty-state__icon {
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
}

/* Size variants */
.empty-state--sm .empty-state__icon {
  font-size: 48px;
}

.empty-state--md .empty-state__icon {
  font-size: 64px;
}

.empty-state--lg .empty-state__icon {
  font-size: 96px;
}

.empty-state__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-state__description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  max-width: 400px;
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.empty-state__action {
  margin-top: var(--spacing-md);
}

/* Size variants for text */
.empty-state--sm .empty-state__title {
  font-size: 1rem;
}

.empty-state--sm .empty-state__description {
  font-size: 0.75rem;
  max-width: 300px;
}

.empty-state--lg .empty-state__title {
  font-size: 1.5rem;
}

.empty-state--lg .empty-state__description {
  font-size: 1rem;
  max-width: 500px;
}
```

### 4.6 접근성
- 시맨틱 HTML 사용 (h3, p)
- 아이콘에 `aria-hidden="true"` (장식용)
- 액션 버튼은 명확한 텍스트 제공

### 4.7 사용 예시

```jsx
// 기본 사용
<EmptyState
  icon={<InboxIcon />}
  title="받은 메시지가 없습니다"
  description="새로운 메시지가 도착하면 여기에 표시됩니다."
/>

// 액션 포함
<EmptyState
  icon={<FolderIcon />}
  title="프로젝트가 없습니다"
  description="새 프로젝트를 만들어 시작하세요."
  action={
    <Button icon={<PlusIcon />} onClick={handleCreateProject}>
      프로젝트 만들기
    </Button>
  }
/>

// 검색 결과 없음
<EmptyState
  icon={<SearchIcon />}
  title="검색 결과가 없습니다"
  description={`"${searchQuery}"에 대한 결과를 찾을 수 없습니다. 다른 검색어를 시도해보세요.`}
  action={
    <Button variant="outline" onClick={handleClearSearch}>
      검색 초기화
    </Button>
  }
  size="sm"
/>

// 에러 상태
<EmptyState
  icon={<AlertCircleIcon />}
  title="데이터를 불러올 수 없습니다"
  description="네트워크 연결을 확인하고 다시 시도해주세요."
  action={
    <Button onClick={handleRetry}>
      다시 시도
    </Button>
  }
/>

// 테이블과 함께
<Table
  columns={columns}
  data={data}
  emptyMessage={
    <EmptyState
      icon={<UsersIcon />}
      title="등록된 사용자가 없습니다"
      description="첫 번째 사용자를 추가해보세요."
      action={<Button onClick={handleAddUser}>사용자 추가</Button>}
    />
  }
/>

// 커스텀 콘텐츠
<EmptyState>
  <img src="/empty-illustration.svg" alt="" style={{ width: 200 }} />
  <h3>시작할 준비가 되었나요?</h3>
  <p>아래 버튼을 눌러 첫 번째 항목을 만들어보세요.</p>
  <Flex gap="md" style={{ marginTop: 'var(--spacing-lg)' }}>
    <Button variant="outline">둘러보기</Button>
    <Button>시작하기</Button>
  </Flex>
</EmptyState>
```

---

## 5. 공통 데이터 패턴

### 5.1 완전한 데이터 테이블 패턴

```jsx
function DataTableWithFeatures() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState([]);

  // 데이터 로드
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchQuery, sortConfig]);

  // 필터링
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <Card>
      <Card.Header>
        <Flex justify="between" align="center">
          <h2>사용자 목록</h2>
          <Flex gap="md">
            <SearchBar
              value={searchQuery}
              onSearch={setSearchQuery}
              placeholder="검색..."
            />
            <Button icon={<PlusIcon />}>추가</Button>
          </Flex>
        </Flex>
      </Card.Header>

      <Card.Body>
        {filteredData.length === 0 ? (
          <EmptyState
            icon={<InboxIcon />}
            title="데이터가 없습니다"
            description="검색 조건을 변경하거나 새 항목을 추가하세요."
            action={<Button onClick={handleAdd}>추가하기</Button>}
          />
        ) : (
          <Table
            columns={columns}
            data={paginatedData}
            loading={loading}
            sortConfig={sortConfig}
            onSort={setSortConfig}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            variant="hover"
          />
        )}
      </Card.Body>

      {filteredData.length > 0 && (
        <Card.Footer>
          <Flex justify="between" align="center">
            <span className="text-secondary">
              {filteredData.length}개 중 {((currentPage - 1) * pageSize) + 1}-
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showPageSize
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredData.length}
            />
          </Flex>
        </Card.Footer>
      )}
    </Card>
  );
}
```

### 5.2 서버 사이드 페이지네이션 패턴

```jsx
function ServerSideDataTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState(null);

  // 서버에서 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users', {
          params: {
            page: currentPage,
            pageSize,
            search: searchQuery,
            sortBy: sortConfig?.key,
            sortOrder: sortConfig?.direction
          }
        });
        setData(response.data.items);
        setTotalItems(response.data.total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, searchQuery, sortConfig]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <Card>
      <Card.Header>
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          debounceMs={500}
        />
      </Card.Header>

      <Card.Body>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      </Card.Body>

      <Card.Footer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showPageSize
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={totalItems}
        />
      </Card.Footer>
    </Card>
  );
}
```

### 5.3 무한 스크롤 패턴 (보너스)

```jsx
function InfiniteScrollTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/items?page=${page}`);
      setData(prev => [...prev, ...response.data.items]);
      setHasMore(response.data.hasMore);
      setPage(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer로 무한 스크롤 구현
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, hasMore]);

  return (
    <div>
      <Table columns={columns} data={data} />
      <div ref={observerTarget} style={{ height: 20 }} />
      {loading && <div style={{ textAlign: 'center' }}>로딩 중...</div>}
      {!hasMore && <div style={{ textAlign: 'center' }}>모든 데이터를 불러왔습니다.</div>}
    </div>
  );
}
```

### 5.4 필터 + 정렬 + 검색 통합 패턴

```jsx
function AdvancedDataTable() {
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    dateRange: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState(null);

  // 필터링
  const filteredData = useMemo(() => {
    let result = data;

    // 검색
    if (searchQuery) {
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // 상태 필터
    if (filters.status !== 'all') {
      result = result.filter(row => row.status === filters.status);
    }

    // 역할 필터
    if (filters.role !== 'all') {
      result = result.filter(row => row.role === filters.role);
    }

    // 날짜 범위 필터
    if (filters.dateRange) {
      result = result.filter(row => {
        const date = new Date(row.createdAt);
        return date >= filters.dateRange.start && date <= filters.dateRange.end;
      });
    }

    return result;
  }, [data, searchQuery, filters]);

  // 정렬
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      const comparison = aVal > bVal ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  return (
    <Card>
      <Card.Header>
        <Flex direction="column" gap="md">
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            fullWidth
          />
          
          <Grid columns={{ md: 3 }} gap="md">
            <Select
              label="상태"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={[
                { value: 'all', label: '전체' },
                { value: 'active', label: '활성' },
                { value: 'inactive', label: '비활성' }
              ]}
            />
            
            <Select
              label="역할"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              options={roleOptions}
            />
            
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ status: 'all', role: 'all', dateRange: null });
                setSearchQuery('');
              }}
            >
              필터 초기화
            </Button>
          </Grid>
        </Flex>
      </Card.Header>

      <Card.Body>
        <Table
          columns={columns}
          data={sortedData}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      </Card.Body>
    </Card>
  );
}
```

---

## 6. 커스텀 Hooks

### 6.1 usePagination

```javascript
export function usePagination(data, options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100]
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

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

### 6.2 useSort

```javascript
export function useSort(data, initialConfig = null) {
  const [sortConfig, setSortConfig] = useState(initialConfig);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // null/undefined 처리
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // 숫자 비교
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // 문자열 비교
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { sortedData, sortConfig, requestSort, setSortConfig };
}
```

### 6.3 useFilter

```javascript
export function useFilter(data, initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        // 빈 필터는 무시
        if (!value || value === 'all' || value === '') return true;

        // 배열 필터 (다중 선택)
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }

        // 문자열 필터 (검색)
        if (typeof value === 'string') {
          return String(item[key])
            .toLowerCase()
            .includes(value.toLowerCase());
        }

        // 정확한 매치
        return item[key] === value;
      });
    });
  }, [data, filters]);

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filteredData,
    filters,
    setFilter,
    setFilters,
    clearFilters
  };
}
```

### 6.4 useTableState (통합)

```javascript
export function useTableState(initialData, options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialSortConfig = null,
    initialFilters = {},
    initialSearchQuery = ''
  } = options;

  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // 검색
  const searchedData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  // 필터
  const { filteredData, filters, setFilter, clearFilters } = useFilter(
    searchedData,
    initialFilters
  );

  // 정렬
  const { sortedData, sortConfig, requestSort } = useSort(
    filteredData,
    initialSortConfig
  );

  // 페이지네이션
  const pagination = usePagination(sortedData, {
    initialPage,
    initialPageSize
  });

  return {
    data: pagination.paginatedData,
    setData,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    sortConfig,
    requestSort,
    ...pagination
  };
}
```

---

## 7. 구현 우선순위

### 7.1 Phase 1 (핵심)
1. **Table** - 가장 복잡하고 중요
2. **Pagination** - 테이블과 함께 자주 사용

### 7.2 Phase 2 (중요)
3. **SearchBar** - 검색 기능 필수
4. **EmptyState** - UX 개선

### 7.3 Phase 3 (Hooks)
5. **usePagination, useSort, useFilter** - 재사용성

---

## 8. 파일 구조

```
components/
└── level1/
    ├── Table/
    │   ├── Table.jsx
    │   ├── TableHeader.jsx
    │   ├── TableBody.jsx
    │   ├── TableRow.jsx
    │   ├── TableCell.jsx
    │   ├── MobileCardView.jsx
    │   ├── Table.css
    │   └── index.js
    ├── Pagination/
    │   ├── Pagination.jsx
    │   ├── Pagination.css
    │   └── index.js
    ├── SearchBar/
    │   ├── SearchBar.jsx
    │   ├── SearchBar.css
    │   └── index.js
    └── EmptyState/
        ├── EmptyState.jsx
        ├── EmptyState.css
        └── index.js

hooks/
├── usePagination.js
├── useSort.js
├── useFilter.js
├── useTableState.js
└── index.js
```

---

## 9. 테스트 시나리오

### 9.1 Table 테스트
- [ ] 데이터 렌더링
- [ ] 정렬 (오름차순/내림차순)
- [ ] 행 선택 (단일/전체)
- [ ] 커스텀 렌더러
- [ ] 로딩 상태
- [ ] 빈 상태
- [ ] 반응형 (모바일 카드 뷰)
- [ ] Sticky header
- [ ] 행 클릭

### 9.2 Pagination 테스트
- [ ] 페이지 이동 (숫자, 이전/다음, 처음/마지막)
- [ ] 페이지 범위 계산 (ellipsis)
- [ ] 페이지 크기 변경
- [ ] 비활성화 상태
- [ ] 키보드 네비게이션

### 9.3 SearchBar 테스트
- [ ] 입력 및 검색
- [ ] 디바운스
- [ ] 삭제 버튼
- [ ] Enter 키 검색
- [ ] 로딩 상태

### 9.4 EmptyState 테스트
- [ ] 아이콘, 제목, 설명 표시
- [ ] 액션 버튼
- [ ] 다양한 size
- [ ] 커스텀 콘텐츠

---

## 10. 구현 시 주의사항

### 10.1 성능
- 큰 데이터셋: 가상화(virtualization) 고려
- useMemo로 정렬/필터 결과 캐싱
- 불필요한 리렌더링 방지

### 10.2 접근성
- 테이블 시맨틱 태그 사용
- ARIA 속성 적절히
- 키보드로 모든 기능 접근 가능
- 스크린 리더 호환

### 10.3 사용성
- 로딩 상태 명확히 표시
- 빈 상태에 명확한 안내
- 모바일 최적화 (반응형)
- 에러 처리

### 10.4 유연성
- 커스텀 렌더러 지원
- 제어/비제어 모드 모두 지원
- 다양한 옵션 제공

---

## 11. 다음 단계

Day 4 컴포넌트 완성 후:
1. 실제 데이터로 통합 테스트
2. 서버 사이드 페이지네이션 테스트
3. 모바일 반응형 확인
4. Day 5 상세 설계서 작성 (폼 시스템)

---

## 12. 참고 자료

### 12.1 디자인 참고
- TanStack Table: https://tanstack.com/table/
- AG Grid: https://www.ag-grid.com/
- Material-UI Table: https://mui.com/material-ui/react-table/

### 12.2 패턴 참고
- Virtual Scrolling: https://github.com/bvaughn/react-window
- Server-side Pagination: https://tanstack.com/query/
- Infinite Scroll: https://www.npmjs.com/package/react-infinite-scroll-component