# Day 8 상세 설계서 - 데이터 관리 & 대시보드 Composite 컴포넌트

## 목차
1. [DataTable](#1-datatable)
2. [FilterPanel](#2-filterpanel)
3. [StatCard](#3-statcard)
4. [DashboardCard](#4-dashboardcard)
5. [ActivityFeed](#5-activityfeed)
6. [FileUploader](#6-fileuploader)
7. [ImageGallery](#7-imagegallery)

---

## 1. DataTable

### 1.1 개요
검색, 필터, 정렬, 페이지네이션이 통합된 완전한 데이터 테이블

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| columns | Array<Column> | Yes | - | 컬럼 정의 |
| data | Array<Object> | Yes | - | 데이터 |
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 테마 |
| searchable | boolean | No | false | 검색 기능 |
| filterable | boolean | No | false | 필터 기능 |
| pagination | boolean | No | true | 페이지네이션 |
| pageSize | number | No | 10 | 페이지당 아이템 수 |
| actions | Array<Action> | No | [] | 행 액션 버튼들 |
| onRowClick | function | No | - | 행 클릭 핸들러 |
| selectable | boolean | No | false | 행 선택 가능 |
| onSelectionChange | function | No | - | 선택 변경 핸들러 |
| exportable | boolean | No | false | CSV 내보내기 |
| title | string | No | - | 테이블 제목 |

### 1.3 구조

```jsx
<Card theme={theme}>
  {/* 헤더: 제목, 검색, 필터, 액션 */}
  <Card.Header>
    <Flex justify="between" align="center" wrap>
      {title && <h3>{title}</h3>}
      
      <Flex gap="md" align="center">
        {searchable && (
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="검색..."
          />
        )}
        
        {filterable && (
          <Button
            variant="outline"
            icon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            필터
          </Button>
        )}
        
        {exportable && (
          <Button
            variant="outline"
            icon={<DownloadIcon />}
            onClick={handleExport}
          >
            내보내기
          </Button>
        )}
      </Flex>
    </Flex>

    {/* 필터 패널 */}
    {filterable && showFilters && (
      <FilterPanel
        filters={filterConfig}
        values={filterValues}
        onChange={setFilterValues}
      />
    )}

    {/* 활성 필터 표시 */}
    {activeFilters.length > 0 && (
      <Flex gap="sm" wrap style={{ marginTop: 'var(--spacing-md)' }}>
        {activeFilters.map(filter => (
          <Tag
            key={filter.key}
            variant="info"
            onClose={() => removeFilter(filter.key)}
          >
            {filter.label}: {filter.value}
          </Tag>
        ))}
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          모두 지우기
        </Button>
      </Flex>
    )}
  </Card.Header>

  {/* 테이블 */}
  <Card.Body>
    <Table
      columns={enhancedColumns}
      data={paginatedData}
      sortConfig={sortConfig}
      onSort={setSortConfig}
      selectable={selectable}
      selectedRows={selectedRows}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      loading={loading}
    />
  </Card.Body>

  {/* 페이지네이션 */}
  {pagination && totalPages > 1 && (
    <Card.Footer>
      <Flex justify="between" align="center">
        <span className="text-secondary">
          {filteredData.length}개 중 {startIndex + 1}-{endIndex} 표시
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showPageSize
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </Flex>
    </Card.Footer>
  )}
</Card>
```

### 1.4 내부 로직

```javascript
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
const filteredData = useMemo(() => {
  let result = searchedData;
  
  Object.entries(filterValues).forEach(([key, value]) => {
    if (value && value !== 'all') {
      result = result.filter(row => {
        if (Array.isArray(value)) {
          return value.includes(row[key]);
        }
        return row[key] === value;
      });
    }
  });
  
  return result;
}, [searchedData, filterValues]);

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

// 페이지네이션
const totalPages = Math.ceil(sortedData.length / pageSize);
const startIndex = (currentPage - 1) * pageSize;
const endIndex = Math.min(startIndex + pageSize, sortedData.length);
const paginatedData = sortedData.slice(startIndex, endIndex);

// CSV 내보내기
const handleExport = () => {
  const csv = convertToCSV(filteredData, columns);
  downloadCSV(csv, 'export.csv');
};
```

### 1.5 사용 예시

```jsx
// 기본 사용
<DataTable
  title="사용자 목록"
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일' },
    { 
      key: 'status', 
      label: '상태',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'default'}>
          {value}
        </Badge>
      )
    }
  ]}
  data={users}
  searchable
  pagination
/>

// 필터 + 액션
<DataTable
  title="주문 관리"
  columns={orderColumns}
  data={orders}
  searchable
  filterable
  filterConfig={[
    {
      key: 'status',
      label: '상태',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: 'pending', label: '대기' },
        { value: 'completed', label: '완료' }
      ]
    },
    {
      key: 'dateRange',
      label: '기간',
      type: 'dateRange'
    }
  ]}
  actions={[
    {
      label: '상세보기',
      icon: <EyeIcon />,
      onClick: (row) => navigate(`/orders/${row.id}`)
    },
    {
      label: '삭제',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      variant: 'error'
    }
  ]}
  exportable
/>

// 행 선택
const [selectedRows, setSelectedRows] = useState([]);

<DataTable
  columns={columns}
  data={data}
  selectable
  selectedRows={selectedRows}
  onSelectionChange={setSelectedRows}
/>

{selectedRows.length > 0 && (
  <Flex gap="sm">
    <Button onClick={() => handleBulkDelete(selectedRows)}>
      선택 삭제 ({selectedRows.length})
    </Button>
  </Flex>
)}
```

---

## 2. FilterPanel

### 2.1 개요
다양한 필터 타입을 지원하는 필터 패널

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| filters | Array<FilterConfig> | Yes | - | 필터 설정 |
| values | object | Yes | - | 현재 필터 값 |
| onChange | function | Yes | - | 값 변경 핸들러 |
| onApply | function | No | - | 적용 버튼 핸들러 |
| onReset | function | No | - | 초기화 버튼 핸들러 |
| theme | string | No | 'minimal' | 테마 |

### 2.3 FilterConfig 타입

```typescript
{
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'dateRange' | 'numberRange' | 'checkbox';
  options?: Array<{value: any, label: string}>;
  placeholder?: string;
}
```

### 2.4 구조

```jsx
<Card variant="bordered">
  <Card.Body>
    <Grid columns={{ md: 3 }} gap="md">
      {filters.map(filter => (
        <div key={filter.key}>
          {filter.type === 'text' && (
            <Input
              label={filter.label}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
            />
          )}

          {filter.type === 'select' && (
            <Select
              label={filter.label}
              value={values[filter.key] || 'all'}
              onChange={(e) => onChange(filter.key, e.target.value)}
              options={filter.options}
            />
          )}

          {filter.type === 'dateRange' && (
            <Flex gap="sm">
              <Input
                type="date"
                label="시작일"
                value={values[filter.key]?.start || ''}
                onChange={(e) => onChange(filter.key, {
                  ...values[filter.key],
                  start: e.target.value
                })}
              />
              <Input
                type="date"
                label="종료일"
                value={values[filter.key]?.end || ''}
                onChange={(e) => onChange(filter.key, {
                  ...values[filter.key],
                  end: e.target.value
                })}
              />
            </Flex>
          )}

          {/* 다른 타입들... */}
        </div>
      ))}
    </Grid>

    {(onApply || onReset) && (
      <Flex justify="end" gap="sm" style={{ marginTop: 'var(--spacing-md)' }}>
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            초기화
          </Button>
        )}
        {onApply && (
          <Button onClick={onApply}>
            적용
          </Button>
        )}
      </Flex>
    )}
  </Card.Body>
</Card>
```

### 2.5 사용 예시

```jsx
const [filterValues, setFilterValues] = useState({});

const filterConfig = [
  {
    key: 'status',
    label: '상태',
    type: 'select',
    options: [
      { value: 'all', label: '전체' },
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' }
    ]
  },
  {
    key: 'category',
    label: '카테고리',
    type: 'multiselect',
    options: categories
  },
  {
    key: 'dateRange',
    label: '기간',
    type: 'dateRange'
  },
  {
    key: 'priceRange',
    label: '가격',
    type: 'numberRange'
  }
];

<FilterPanel
  filters={filterConfig}
  values={filterValues}
  onChange={(key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  }}
  onReset={() => setFilterValues({})}
/>
```

---

## 3. StatCard

### 3.1 개요
통계 수치를 표시하는 카드 (대시보드용)

### 3.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | 제목 |
| value | string \| number | Yes | - | 값 |
| change | number | No | - | 증감률 (%) |
| trend | 'up' \| 'down' \| 'neutral' | No | - | 트렌드 |
| icon | ReactNode | No | - | 아이콘 |
| theme | string | No | 'minimal' | 테마 |
| loading | boolean | No | false | 로딩 상태 |
| onClick | function | No | - | 클릭 핸들러 |

### 3.3 구조

```jsx
<Card 
  variant="elevated" 
  hoverable={!!onClick}
  clickable={!!onClick}
  onClick={onClick}
  theme={theme}
>
  <Card.Body>
    {loading ? (
      <Loading type="skeleton" skeletonHeight={80} />
    ) : (
      <Flex direction="column" gap="sm">
        {/* 제목과 아이콘 */}
        <Flex justify="between" align="start">
          <span className="stat-card__title">{title}</span>
          {icon && (
            <div className="stat-card__icon">
              {icon}
            </div>
          )}
        </Flex>

        {/* 값 */}
        <h2 className="stat-card__value">{value}</h2>

        {/* 증감률 */}
        {change !== undefined && (
          <Flex align="center" gap="xs">
            <Badge 
              variant={
                trend === 'up' ? 'success' :
                trend === 'down' ? 'error' : 
                'default'
              }
              size="sm"
            >
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {Math.abs(change)}%
            </Badge>
            <span className="text-secondary text-sm">
              전월 대비
            </span>
          </Flex>
        )}
      </Flex>
    )}
  </Card.Body>
</Card>
```

### 3.4 사용 예시

```jsx
<Grid columns={{ md: 2, lg: 4 }} gap="lg">
  <StatCard
    title="총 매출"
    value="₩1,234,567"
    change={12.5}
    trend="up"
    icon={<DollarIcon />}
  />

  <StatCard
    title="주문 수"
    value="1,234"
    change={-5.2}
    trend="down"
    icon={<ShoppingCartIcon />}
  />

  <StatCard
    title="신규 고객"
    value="567"
    change={8.3}
    trend="up"
    icon={<UsersIcon />}
  />

  <StatCard
    title="전환율"
    value="3.2%"
    change={0}
    trend="neutral"
    icon={<TrendingIcon />}
  />
</Grid>
```

---

## 4. DashboardCard

### 4.1 개요
대시보드에서 사용하는 범용 카드 컴포넌트

### 4.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | 제목 |
| subtitle | string | No | - | 부제목 |
| actions | ReactNode | No | - | 헤더 우측 액션 |
| loading | boolean | No | false | 로딩 상태 |
| theme | string | No | 'minimal' | 테마 |
| children | ReactNode | Yes | - | 내용 |

### 4.3 구조

```jsx
<Card variant="elevated" theme={theme}>
  <Card.Header>
    <Flex justify="between" align="center">
      <div>
        <h3>{title}</h3>
        {subtitle && <p className="text-secondary">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </Flex>
  </Card.Header>

  <Card.Body>
    {loading ? (
      <Loading type="skeleton" skeletonHeight={200} />
    ) : (
      children
    )}
  </Card.Body>
</Card>
```

### 4.5 사용 예시

```jsx
// 차트 카드
<DashboardCard
  title="월별 매출 추이"
  subtitle="최근 6개월"
  actions={
    <Dropdown
      trigger={<Button variant="ghost" icon={<MoreIcon />} />}
      items={[
        { label: '다운로드', onClick: handleDownload },
        { label: '새로고침', onClick: handleRefresh }
      ]}
    />
  }
>
  <ChartWrapper
    type="line"
    data={salesData}
    xKey="month"
    yKeys={['sales']}
  />
</DashboardCard>

// 리스트 카드
<DashboardCard
  title="최근 주문"
  actions={
    <Button variant="ghost" onClick={() => navigate('/orders')}>
      전체 보기
    </Button>
  }
>
  <Flex direction="column" gap="md">
    {recentOrders.map(order => (
      <Flex key={order.id} justify="between" align="center">
        <div>
          <strong>{order.customer}</strong>
          <p className="text-sm text-secondary">{order.product}</p>
        </div>
        <Badge variant="success">{order.status}</Badge>
      </Flex>
    ))}
  </Flex>
</DashboardCard>
```

---

## 5. ActivityFeed

### 5.1 개요
활동 내역을 시간순으로 표시하는 피드

### 5.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | Array<ActivityItem> | Yes | - | 활동 아이템 목록 |
| theme | string | No | 'minimal' | 테마 |
| maxItems | number | No | - | 최대 표시 개수 |
| showTimestamp | boolean | No | true | 시간 표시 여부 |

### 5.3 ActivityItem 타입

```typescript
{
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: Date | string;
  icon?: ReactNode;
  avatar?: string;
}
```

### 5.4 구조

```jsx
<Flex direction="column" gap="md">
  {items.slice(0, maxItems).map(item => (
    <Flex key={item.id} gap="md" align="start">
      {/* 아바타 또는 아이콘 */}
      <div className="activity-feed__avatar">
        {item.avatar ? (
          <Avatar src={item.avatar} size="sm" />
        ) : item.icon ? (
          <div className="activity-feed__icon">{item.icon}</div>
        ) : (
          <Avatar name={item.user} size="sm" />
        )}
      </div>

      {/* 내용 */}
      <Flex direction="column" gap="xs" style={{ flex: 1 }}>
        <div>
          <strong>{item.user}</strong>
          {' '}
          <span className="text-secondary">{item.action}</span>
          {item.target && (
            <>
              {' '}
              <strong>{item.target}</strong>
            </>
          )}
        </div>
        
        {showTimestamp && (
          <span className="text-sm text-secondary">
            {formatRelativeTime(item.timestamp)}
          </span>
        )}
      </Flex>
    </Flex>
  ))}
</Flex>
```

### 5.5 사용 예시

```jsx
const activities = [
  {
    id: '1',
    user: '김철수',
    action: '님이 새 프로젝트를 생성했습니다',
    target: 'Website Redesign',
    timestamp: new Date('2024-01-01T10:30:00'),
    avatar: '/avatars/kim.jpg'
  },
  {
    id: '2',
    user: '이영희',
    action: '님이 댓글을 남겼습니다',
    target: 'Task #123',
    timestamp: new Date('2024-01-01T10:25:00'),
    icon: <CommentIcon />
  }
];

<DashboardCard title="최근 활동">
  <ActivityFeed items={activities} maxItems={5} />
</DashboardCard>
```

---

## 6. FileUploader

### 6.1 개요
드래그 앤 드롭을 지원하는 파일 업로더

### 6.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| accept | string | No | - | 허용 파일 타입 (MIME) |
| multiple | boolean | No | false | 다중 선택 |
| maxSize | number | No | - | 최대 파일 크기 (bytes) |
| maxFiles | number | No | - | 최대 파일 개수 |
| onUpload | function | Yes | - | 업로드 핸들러 (files) => Promise |
| onError | function | No | - | 에러 핸들러 |
| theme | string | No | 'minimal' | 테마 |

### 6.3 내부 상태

```javascript
const [files, setFiles] = useState([]);
const [uploading, setUploading] = useState(false);
const [dragActive, setDragActive] = useState(false);
const [progress, setProgress] = useState({});
```

### 6.4 구조

```jsx
<div
  className={cn(
    'file-uploader',
    dragActive && 'file-uploader--drag-active'
  )}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
>
  {/* 드롭 존 */}
  <div className="file-uploader__dropzone">
    <UploadIcon size={48} />
    <h4>파일을 드래그하거나 클릭하여 선택하세요</h4>
    <p className="text-secondary">
      {accept && `허용 형식: ${accept}`}
      {maxSize && ` / 최대 ${formatFileSize(maxSize)}`}
    </p>
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={handleFileSelect}
      style={{ display: 'none' }}
      ref={inputRef}
    />
    <Button onClick={() => inputRef.current?.click()}>
      파일 선택
    </Button>
  </div>

  {/* 파일 목록 */}
  {files.length > 0 && (
    <div className="file-uploader__files">
      {files.map((file, index) => (
        <Flex 
          key={index} 
          justify="between" 
          align="center"
          className="file-uploader__file"
        >
          <Flex align="center" gap="sm">
            <FileIcon />
            <div>
              <div>{file.name}</div>
              <small className="text-secondary">
                {formatFileSize(file.size)}
              </small>
            </div>
          </Flex>

          <Flex align="center" gap="sm">
            {progress[index] !== undefined && (
              <ProgressBar 
                value={progress[index]} 
                size="sm"
                style={{ width: 100 }}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<XIcon />}
              onClick={() => removeFile(index)}
            />
          </Flex>
        </Flex>
      ))}
    </div>
  )}

  {/* 업로드 버튼 */}
  {files.length > 0 && (
    <Button
      onClick={handleUpload}
      loading={uploading}
      fullWidth
    >
      업로드 ({files.length})
    </Button>
  )}
</div>
```

### 6.5 사용 예시

```jsx
<FileUploader
  accept="image/*"
  multiple
  maxSize={5 * 1024 * 1024} // 5MB
  maxFiles={10}
  onUpload={async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    await api.post('/upload', formData);
    toast.success('업로드 완료');
  }}
  onError={(error) => {
    toast.error(error.message);
  }}
/>
```

---

## 7. ImageGallery

### 7.1 개요
이미지 그리드와 라이트박스를 제공하는 갤러리

### 7.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| images | Array<ImageItem> | Yes | - | 이미지 목록 |
| columns | number \| object | No | { md: 3, lg: 4 } | 컬럼 수 |
| theme | string | No | 'minimal' | 테마 |
| onImageClick | function | No | - | 이미지 클릭 핸들러 |
| showLightbox | boolean | No | true | 라이트박스 표시 |

### 7.3 ImageItem 타입

```typescript
{
  src: string;
  alt?: string;
  thumbnail?: string;
  caption?: string;
}
```

### 7.4 구조

```jsx
<>
  <Grid columns={columns} gap="md">
    {images.map((image, index) => (
      <div
        key={index}
        className="image-gallery__item"
        onClick={() => handleImageClick(index)}
      >
        <img
          src={image.thumbnail || image.src}
          alt={image.alt}
          className="image-gallery__img"
        />
        {image.caption && (
          <div className="image-gallery__caption">
            {image.caption}
          </div>
        )}
      </div>
    ))}
  </Grid>

  {/* 라이트박스 */}
  {showLightbox && lightboxOpen && (
    <Modal
      isOpen={lightboxOpen}
      onClose={() => setLightboxOpen(false)}
      size="xl"
    >
      <Modal.Body>
        <Flex direction="column" align="center" gap="md">
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            style={{ maxWidth: '100%', maxHeight: '80vh' }}
          />
          {images[currentIndex].caption && (
            <p>{images[currentIndex].caption}</p>
          )}
          
          {/* 네비게이션 */}
          <Flex gap="md">
            <Button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              이전
            </Button>
            <span>
              {currentIndex + 1} / {images.length}
            </span>
            <Button
              onClick={goToNext}
              disabled={currentIndex === images.length - 1}
            >
              다음
            </Button>
          </Flex>
        </Flex>
      </Modal.Body>
    </Modal>
  )}
</>
```

### 7.5 사용 예시

```jsx
const images = [
  {
    src: '/images/photo1.jpg',
    thumbnail: '/images/photo1-thumb.jpg',
    alt: '사진 1',
    caption: '아름다운 풍경'
  },
  // ...
];

<ImageGallery
  images={images}
  columns={{ sm: 2, md: 3, lg: 4 }}
/>
```

---

## 8. 통합 대시보드 예제

```jsx
function Dashboard() {
  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap="xl">
        {/* 통계 카드 */}
        <Grid columns={{ md: 2, lg: 4 }} gap="lg">
          <StatCard
            title="총 매출"
            value="₩12,345,678"
            change={12.5}
            trend="up"
            icon={<DollarIcon />}
          />
          {/* ... 더 많은 StatCard */}
        </Grid>

        {/* 차트와 활동 */}
        <Grid columns={{ lg: 2 }} gap="lg">
          <DashboardCard
            title="월별 매출 추이"
            actions={
              <Button variant="ghost">상세보기</Button>
            }
          >
            <ChartWrapper
              type="line"
              data={salesData}
              xKey="month"
              yKeys={['sales']}
            />
          </DashboardCard>

          <DashboardCard title="최근 활동">
            <ActivityFeed items={activities} maxItems={5} />
          </DashboardCard>
        </Grid>

        {/* 데이터 테이블 */}
        <DataTable
          title="최근 주문"
          columns={orderColumns}
          data={orders}
          searchable
          filterable
          pagination
          pageSize={10}
        />
      </Flex>
    </Container>
  );
}
```

---

## 9. 완료 체크리스트

- [ ] DataTable (검색, 필터, 정렬, 페이지네이션 통합)
- [ ] FilterPanel (다양한 필터 타입)
- [ ] StatCard (통계 카드)
- [ ] DashboardCard (범용 대시보드 카드)
- [ ] ActivityFeed (활동 피드)
- [ ] FileUploader (드래그 앤 드롭)
- [ ] ImageGallery (라이트박스)
- [ ] 3가지 테마 적용
- [ ] 반응형 확인
- [ ] 통합 테스트