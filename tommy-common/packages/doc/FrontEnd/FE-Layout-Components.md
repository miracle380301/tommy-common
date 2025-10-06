# Day 2 상세 설계서 - 레이아웃 컴포넌트

## 목차
1. [Grid](#1-grid)
2. [Flex](#2-flex)
3. [Container](#3-container)
4. [Card](#4-card)
5. [Divider](#5-divider)
6. [공통 레이아웃 패턴](#6-공통-레이아웃-패턴)

---

## 1. Grid

### 1.1 개요
CSS Grid 기반의 그리드 레이아웃 시스템으로, 반응형 레이아웃을 쉽게 구현할 수 있다.

### 1.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| columns | number \| string \| object | No | 1 | 컬럼 수 (반응형: {sm: 1, md: 2, lg: 3}) |
| gap | string \| number | No | 'md' | 간격 ('sm', 'md', 'lg' 또는 px값) |
| rowGap | string \| number | No | - | 행 간격 (gap과 별도 지정 시) |
| columnGap | string \| number | No | - | 열 간격 (gap과 별도 지정 시) |
| autoRows | string | No | 'auto' | 행 높이 (예: 'minmax(100px, auto)') |
| autoFlow | 'row' \| 'column' \| 'dense' | No | 'row' | 아이템 배치 방향 |
| alignItems | 'start' \| 'center' \| 'end' \| 'stretch' | No | 'stretch' | 수직 정렬 |
| justifyItems | 'start' \| 'center' \| 'end' \| 'stretch' | No | 'stretch' | 수평 정렬 |
| children | ReactNode | Yes | - | 그리드 아이템들 |

### 1.3 내부 상태
- 없음 (순수 레이아웃 컴포넌트)

### 1.4 동작 방식

#### 1.4.1 반응형 컬럼
```javascript
// 객체로 반응형 설정
<Grid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
  {items}
</Grid>

// 내부적으로 CSS로 변환
@media (min-width: 640px) { grid-template-columns: repeat(1, 1fr); }
@media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
```

#### 1.4.2 간격 처리
- 문자열('sm', 'md', 'lg'): CSS 변수로 변환
- 숫자: px 단위로 변환
- rowGap, columnGap 별도 지정 가능

#### 1.4.3 자동 반응형
```javascript
// 'auto' 문자열 사용 시 자동 반응형
<Grid columns="auto">
  // auto-fit, minmax 사용
</Grid>
```

### 1.5 스타일 명세

#### 1.5.1 기본 구조
```css
.grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: var(--gap);
  grid-auto-rows: var(--auto-rows);
  grid-auto-flow: var(--auto-flow);
  align-items: var(--align-items);
  justify-items: var(--justify-items);
}
```

#### 1.5.2 간격 값
```css
--gap-sm: var(--spacing-sm);  /* 8px */
--gap-md: var(--spacing-md);  /* 16px */
--gap-lg: var(--spacing-lg);  /* 24px */
```

#### 1.5.3 자동 반응형
```css
.grid--auto {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

### 1.6 사용 예시
```jsx
// 기본 그리드
<Grid columns={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// 반응형 그리드
<Grid 
  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap="lg"
>
  {products.map(product => (
    <ProductCard key={product.id} {...product} />
  ))}
</Grid>

// 자동 반응형
<Grid columns="auto" gap="md">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</Grid>

// 행/열 간격 별도 지정
<Grid columns={2} rowGap="lg" columnGap="sm">
  {content}
</Grid>
```

### 1.7 GridItem 컴포넌트 (선택적)

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| colSpan | number | No | 1 | 차지할 컬럼 수 |
| rowSpan | number | No | 1 | 차지할 행 수 |
| colStart | number | No | - | 시작 컬럼 |
| rowStart | number | No | - | 시작 행 |
| children | ReactNode | Yes | - | 내용 |

```jsx
<Grid columns={4}>
  <GridItem colSpan={2}>Wide item</GridItem>
  <GridItem>Normal</GridItem>
  <GridItem>Normal</GridItem>
</Grid>
```

---

## 2. Flex

### 2.1 개요
Flexbox 기반 레이아웃 컨테이너로, 아이템 정렬과 배치를 쉽게 제어할 수 있다.

### 2.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| direction | 'row' \| 'column' \| 'row-reverse' \| 'column-reverse' | No | 'row' | 정렬 방향 |
| justify | 'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly' | No | 'start' | 주축 정렬 |
| align | 'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline' | No | 'stretch' | 교차축 정렬 |
| wrap | boolean \| 'wrap' \| 'nowrap' \| 'wrap-reverse' | No | false | 줄바꿈 여부 |
| gap | string \| number | No | 0 | 아이템 간격 |
| inline | boolean | No | false | inline-flex 사용 여부 |
| children | ReactNode | Yes | - | 플렉스 아이템들 |

### 2.3 내부 상태
- 없음

### 2.4 동작 방식

#### 2.4.1 정렬 매핑
```javascript
// justify 값을 justify-content CSS 값으로 변환
const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly'
};

// align 값을 align-items CSS 값으로 변환
const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline'
};
```

#### 2.4.2 간격 처리
- Grid와 동일한 방식

### 2.5 스타일 명세

```css
.flex {
  display: flex;
  flex-direction: var(--direction);
  justify-content: var(--justify);
  align-items: var(--align);
  flex-wrap: var(--wrap);
  gap: var(--gap);
}

.flex--inline {
  display: inline-flex;
}
```

### 2.6 사용 예시
```jsx
// 수평 정렬
<Flex justify="between" align="center">
  <Logo />
  <Navigation />
  <UserMenu />
</Flex>

// 수직 스택
<Flex direction="column" gap="md">
  <Title>제목</Title>
  <Content>내용</Content>
  <Actions>
    <Button>확인</Button>
  </Actions>
</Flex>

// 카드 그리드 (wrap 사용)
<Flex wrap justify="center" gap="lg">
  {cards.map(card => <Card key={card.id}>{card}</Card>)}
</Flex>

// 중앙 정렬
<Flex justify="center" align="center" style={{ height: '100vh' }}>
  <LoginForm />
</Flex>
```

---

## 3. Container

### 3.1 개요
최대 너비를 제한하고 중앙 정렬하는 컨테이너로, 페이지 레이아웃의 기본 래퍼 역할을 한다.

### 3.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| maxWidth | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' \| string | No | 'lg' | 최대 너비 |
| padding | boolean \| string | No | true | 좌우 패딩 (true시 기본값 적용) |
| centered | boolean | No | true | 중앙 정렬 여부 |
| children | ReactNode | Yes | - | 내용 |

### 3.3 내부 상태
- 없음

### 3.4 동작 방식

#### 3.4.1 최대 너비 설정
```javascript
const maxWidthMap = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%'
};
```

#### 3.4.2 패딩 처리
- `true`: 기본 패딩 적용 (좌우 var(--spacing-md))
- `false`: 패딩 없음
- 문자열: 커스텀 패딩 값

### 3.5 스타일 명세

```css
.container {
  width: 100%;
  max-width: var(--max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}

.container--sm { max-width: 640px; }
.container--md { max-width: 768px; }
.container--lg { max-width: 1024px; }
.container--xl { max-width: 1280px; }
.container--full { max-width: 100%; }

/* 반응형 패딩 */
.container {
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}
```

### 3.6 사용 예시
```jsx
// 기본 사용
<Container>
  <h1>페이지 제목</h1>
  <p>내용...</p>
</Container>

// 좁은 컨테이너 (블로그 글 등)
<Container maxWidth="md">
  <Article />
</Container>

// 패딩 없음
<Container padding={false}>
  <FullWidthImage />
</Container>

// 전체 레이아웃
<Container maxWidth="xl">
  <Header />
  <Grid columns={3}>
    <Sidebar />
    <Main />
    <Aside />
  </Grid>
</Container>
```

---

## 4. Card

### 4.1 개요
콘텐츠를 담는 카드 컨테이너로, 시각적으로 구분된 영역을 만든다.

### 4.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| theme | 'minimal' \| 'glassmorphism' \| 'neon' | No | 'minimal' | 적용할 테마 |
| variant | 'default' \| 'bordered' \| 'elevated' \| 'flat' | No | 'default' | 카드 스타일 |
| padding | 'none' \| 'sm' \| 'md' \| 'lg' | No | 'md' | 내부 패딩 |
| hoverable | boolean | No | false | 호버 효과 여부 |
| clickable | boolean | No | false | 클릭 가능 여부 (cursor, 호버 효과) |
| onClick | function | No | - | 클릭 핸들러 |
| children | ReactNode | Yes | - | 카드 내용 |

### 4.3 Subcomponents

#### 4.3.1 Card.Header
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string \| ReactNode | No | - | 헤더 제목 |
| subtitle | string \| ReactNode | No | - | 부제목 |
| action | ReactNode | No | - | 우측 액션 버튼 등 |
| children | ReactNode | No | - | 커스텀 헤더 내용 |

#### 4.3.2 Card.Body
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | Yes | - | 본문 내용 |

#### 4.3.3 Card.Footer
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | Yes | - | 푸터 내용 |

### 4.4 내부 상태
- 없음

### 4.5 동작 방식

#### 4.5.1 Compound Component 패턴
```jsx
<Card>
  <Card.Header title="제목" subtitle="부제목" />
  <Card.Body>내용</Card.Body>
  <Card.Footer>액션</Card.Footer>
</Card>
```

#### 4.5.2 클릭 가능 카드
- `clickable` 또는 `onClick` 제공 시 커서 pointer
- 호버 효과 자동 적용

### 4.6 스타일 명세

#### 4.6.1 Variant 스타일
```css
/* default */
.card--default {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

/* bordered */
.card--bordered {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
}

/* elevated */
.card--elevated {
  background: var(--bg-primary);
  border: none;
  box-shadow: var(--shadow-md);
}

/* flat */
.card--flat {
  background: var(--bg-secondary);
  border: none;
}
```

#### 4.6.2 호버 효과
```css
.card--hoverable:hover,
.card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.card--clickable {
  cursor: pointer;
}
```

#### 4.6.3 패딩
```css
.card--padding-none { padding: 0; }
.card--padding-sm { padding: var(--spacing-sm); }
.card--padding-md { padding: var(--spacing-md); }
.card--padding-lg { padding: var(--spacing-lg); }
```

#### 4.6.4 테마별 차이
- **minimal**: 심플한 배경과 테두리
- **glassmorphism**: 반투명 배경, backdrop-blur
- **neon**: 글로우 효과, 밝은 테두리

### 4.7 사용 예시
```jsx
// 기본 카드
<Card>
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>

// Compound 패턴
<Card variant="elevated" hoverable>
  <Card.Header 
    title="프로젝트 제목" 
    subtitle="2024-01-01"
    action={<Button size="sm">편집</Button>}
  />
  <Card.Body>
    <p>프로젝트 설명...</p>
  </Card.Body>
  <Card.Footer>
    <Flex justify="between">
      <span>상태: 진행중</span>
      <Button variant="outline" size="sm">자세히</Button>
    </Flex>
  </Card.Footer>
</Card>

// 클릭 가능한 카드
<Card 
  clickable 
  onClick={() => navigate('/detail')}
  hoverable
>
  <ProductInfo />
</Card>

// 그리드와 함께
<Grid columns={{ md: 2, lg: 3 }} gap="lg">
  {products.map(product => (
    <Card key={product.id} variant="elevated" hoverable>
      <Card.Body>
        <img src={product.image} alt={product.name} />
        <h4>{product.name}</h4>
        <p>{product.price}</p>
      </Card.Body>
    </Card>
  ))}
</Grid>
```

---

## 5. Divider

### 5.1 개요
콘텐츠를 구분하는 구분선 컴포넌트

### 5.2 Props 명세

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| orientation | 'horizontal' \| 'vertical' | No | 'horizontal' | 방향 |
| spacing | 'none' \| 'sm' \| 'md' \| 'lg' | No | 'md' | 위아래(좌우) 여백 |
| variant | 'solid' \| 'dashed' \| 'dotted' | No | 'solid' | 선 스타일 |
| thickness | number | No | 1 | 선 두께 (px) |
| color | string | No | - | 선 색상 (CSS 변수 또는 색상값) |
| label | string \| ReactNode | No | - | 구분선 중간 레이블 |
| labelPosition | 'left' \| 'center' \| 'right' | No | 'center' | 레이블 위치 |
| children | ReactNode | No | - | label 대신 사용 가능 |

### 5.3 내부 상태
- 없음

### 5.4 동작 방식

#### 5.4.1 방향별 처리
- **horizontal**: 가로 선, 상하 여백
- **vertical**: 세로 선, 좌우 여백, height 필요

#### 5.4.2 레이블 포함
- 레이블이 있으면 선을 나눠서 표시
- Flexbox로 정렬

### 5.5 스타일 명세

#### 5.5.1 기본 구조
```css
.divider {
  border: none;
  border-top: var(--thickness) var(--variant) var(--color);
}

.divider--horizontal {
  width: 100%;
  margin-top: var(--spacing);
  margin-bottom: var(--spacing);
}

.divider--vertical {
  height: 100%;
  border-top: none;
  border-left: var(--thickness) var(--variant) var(--color);
  margin-left: var(--spacing);
  margin-right: var(--spacing);
}
```

#### 5.5.2 레이블 포함 시
```css
.divider--with-label {
  display: flex;
  align-items: center;
  text-align: center;
}

.divider__label {
  padding: 0 var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 14px;
}

.divider__line {
  flex: 1;
  border-top: var(--thickness) var(--variant) var(--color);
}

/* left */
.divider--label-left .divider__line:first-child {
  flex: 0 0 var(--spacing-md);
}

/* right */
.divider--label-right .divider__line:last-child {
  flex: 0 0 var(--spacing-md);
}
```

#### 5.5.3 Variant
```css
.divider--solid { border-style: solid; }
.divider--dashed { border-style: dashed; }
.divider--dotted { border-style: dotted; }
```

### 5.6 사용 예시
```jsx
// 기본 구분선
<Divider />

// 여백 조절
<Divider spacing="lg" />

// 스타일 변형
<Divider variant="dashed" />

// 레이블 포함
<Divider label="또는" />
<Divider label="OR" labelPosition="left" />

// 커스텀 레이블
<Divider>
  <Flex align="center" gap="sm">
    <Icon />
    <span>섹션 구분</span>
  </Flex>
</Divider>

// 세로 구분선 (Flex 내에서)
<Flex align="center" gap="md">
  <Button>버튼 1</Button>
  <Divider orientation="vertical" spacing="none" />
  <Button>버튼 2</Button>
</Flex>

// 폼 섹션 구분
<form>
  <Input label="이름" />
  <Input label="이메일" />
  
  <Divider spacing="lg" label="추가 정보" />
  
  <Input label="전화번호" />
  <Textarea label="메모" />
</form>
```

---

## 6. 공통 레이아웃 패턴

### 6.1 페이지 레이아웃
```jsx
// 전형적인 페이지 구조
<Container maxWidth="xl">
  <Flex direction="column" gap="lg">
    <Header />
    <Main />
    <Footer />
  </Flex>
</Container>
```

### 6.2 대시보드 레이아웃
```jsx
<Container maxWidth="full" padding={false}>
  <Flex>
    <Sidebar /> {/* fixed width */}
    <Flex direction="column" style={{ flex: 1 }}>
      <TopBar />
      <Container maxWidth="xl">
        <Grid columns={{ md: 2, lg: 3 }} gap="lg">
          <Card>통계 1</Card>
          <Card>통계 2</Card>
          <Card>통계 3</Card>
        </Grid>
      </Container>
    </Flex>
  </Flex>
</Container>
```

### 6.3 카드 그리드
```jsx
<Container>
  <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
    {items.map(item => (
      <Card key={item.id} hoverable clickable>
        <Card.Header title={item.title} />
        <Card.Body>{item.content}</Card.Body>
      </Card>
    ))}
  </Grid>
</Container>
```

### 6.4 양분 레이아웃
```jsx
<Grid columns={2} gap="xl">
  <Card variant="elevated">
    <Card.Header title="왼쪽 영역" />
    <Card.Body>내용</Card.Body>
  </Card>
  
  <Card variant="elevated">
    <Card.Header title="오른쪽 영역" />
    <Card.Body>내용</Card.Body>
  </Card>
</Grid>
```

### 6.5 폼 레이아웃
```jsx
<Card maxWidth="md" variant="elevated">
  <Card.Header title="회원가입" subtitle="정보를 입력해주세요" />
  <Card.Body>
    <Flex direction="column" gap="md">
      <Input label="이름" />
      <Input label="이메일" type="email" />
      
      <Divider spacing="lg" />
      
      <Input label="비밀번호" type="password" />
      <Input label="비밀번호 확인" type="password" />
    </Flex>
  </Card.Body>
  <Card.Footer>
    <Flex justify="end" gap="sm">
      <Button variant="ghost">취소</Button>
      <Button>가입하기</Button>
    </Flex>
  </Card.Footer>
</Card>
```

---

## 7. 반응형 전략

### 7.1 모바일 우선 (Mobile First)
```jsx
// 기본 1열, 태블릿 2열, 데스크톱 3열
<Grid columns={{ base: 1, md: 2, lg: 3 }}>
```

### 7.2 컨테이너 중첩
```jsx
<Container maxWidth="xl">
  <Grid columns={2}>
    <Container maxWidth="md">
      {/* 좁은 콘텐츠 */}
    </Container>
    <div>
      {/* 일반 콘텐츠 */}
    </div>
  </Grid>
</Container>
```

### 7.3 방향 전환
```jsx
// 모바일: 세로, 데스크톱: 가로
<Flex 
  direction={{ base: 'column', md: 'row' }}
  gap="md"
>
```

---

## 8. 구현 우선순위

### 8.1 Phase 1 (핵심)
1. Container - 가장 기본적인 래퍼
2. Flex - 가장 자주 사용되는 레이아웃
3. Grid - 복잡한 레이아웃용

### 8.2 Phase 2 (중요)
4. Card - UI 구성의 핵심
5. Divider - 간단하지만 유용

---

## 9. 파일 구조

```
components/
└── level1/
    ├── Grid/
    │   ├── Grid.jsx
    │   ├── GridItem.jsx
    │   ├── Grid.css
    │   └── index.js
    ├── Flex/
    │   ├── Flex.jsx
    │   ├── Flex.css
    │   └── index.js
    ├── Container/
    │   ├── Container.jsx
    │   ├── Container.css
    │   └── index.js
    ├── Card/
    │   ├── Card.jsx
    │   ├── CardHeader.jsx
    │   ├── CardBody.jsx
    │   ├── CardFooter.jsx
    │   ├── Card.css
    │   └── index.js
    └── Divider/
        ├── Divider.jsx
        ├── Divider.css
        └── index.js
```

---

## 10. 테스트 시나리오

### 10.1 Grid 테스트
- [ ] 다양한 컬럼 수 렌더링
- [ ] 반응형 컬럼 동작
- [ ] gap, rowGap, columnGap 적용
- [ ] GridItem colSpan, rowSpan 동작
- [ ] 자동 반응형 (columns="auto")

### 10.2 Flex 테스트
- [ ] direction 변형
- [ ] justify, align 조합
- [ ] wrap 동작
- [ ] gap 적용
- [ ] 중첩 Flex

### 10.3 Container 테스트
- [ ] 다양한 maxWidth
- [ ] 중앙 정렬
- [ ] 패딩 적용/미적용
- [ ] 반응형 패딩

### 10.4 Card 테스트
- [ ] 모든 variant 렌더링
- [ ] Subcomponents 조합
- [ ] hoverable 효과
- [ ] clickable 동작
- [ ] 3가지 테마 적용

### 10.5 Divider 테스트
- [ ] horizontal/vertical 방향
- [ ] variant (solid, dashed, dotted)
- [ ] 레이블 포함
- [ ] labelPosition 변경
- [ ] spacing 적용

---

## 11. 구현 시 주의사항

### 11.1 성능
- Grid, Flex는 순수 CSS 사용 (JS 계산 최소화)
- 반응형은 CSS 미디어 쿼리 활용
- 불필요한 div 중첩 최소화

### 11.2 유연성
- 모든 레이아웃 컴포넌트는 `style`, `className` props 지원
- 사용자 정의 스타일 덮어쓰기 가능
- as prop으로 다른 HTML 태그 렌더링 가능 (선택적)

### 11.3 접근성
- 의미있는 HTML 구조 사용
- landmark 역할이 있는 경우 적절한 태그 사용 (header, main, aside 등)
- Card 클릭 가능 시 role="button" 또는 button/a 태그 고려

### 11.4 호환성
- CSS Grid, Flexbox 사용 (IE 지원 불필요)
- CSS Variables 활용
- gap 속성 사용 (구형 브라우저 margin fallback 불필요)

---

## 12. CSS Variables 확장

### 12.1 레이아웃 관련 변수
```css
:root {
  /* Container Max Widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
  
  /* Spacing Scale */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  
  /* Card Styles */
  --card-bg: var(--bg-primary);
  --card-border: var(--border-color);
  --card-shadow: var(--shadow-sm);
  --card-radius: var(--radius-md);
  
  /* Divider */
  --divider-color: var(--border-color);
  --divider-thickness: 1px;
}
```

### 12.2 테마별 레이아웃 변수

#### Minimal Theme
```css
[data-theme="minimal"] {
  --card-bg: #ffffff;
  --card-border: #e5e7eb;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --divider-color: #e5e7eb;
}
```

#### Glassmorphism Theme
```css
[data-theme="glassmorphism"] {
  --card-bg: rgba(255, 255, 255, 0.7);
  --card-border: rgba(255, 255, 255, 0.18);
  --card-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  --card-backdrop: blur(10px);
  --divider-color: rgba(255, 255, 255, 0.3);
}
```

#### Neon Theme
```css
[data-theme="neon"] {
  --card-bg: #1a1a2e;
  --card-border: #8b5cf6;
  --card-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  --card-glow: 0 0 30px rgba(139, 92, 246, 0.5);
  --divider-color: #8b5cf6;
}
```

---

## 13. 고급 사용 패턴

### 13.1 Sticky Header 레이아웃
```jsx
<Flex direction="column" style={{ minHeight: '100vh' }}>
  <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
    <Container>
      <Header />
    </Container>
  </div>
  
  <Container style={{ flex: 1 }}>
    <Main />
  </Container>
  
  <Container>
    <Footer />
  </Container>
</Flex>
```

### 13.2 Masonry 레이아웃 (Grid 활용)
```jsx
<Grid 
  columns={{ md: 2, lg: 3 }}
  autoRows="minmax(100px, auto)"
  gap="md"
>
  {items.map(item => (
    <Card key={item.id} style={{ gridRow: `span ${item.height}` }}>
      {item.content}
    </Card>
  ))}
</Grid>
```

### 13.3 Split View
```jsx
<Grid columns={2} gap="none" style={{ height: '100vh' }}>
  <div style={{ overflow: 'auto', borderRight: '1px solid var(--border-color)' }}>
    <Container padding="lg">
      <Sidebar />
    </Container>
  </div>
  
  <div style={{ overflow: 'auto' }}>
    <Container padding="lg">
      <Content />
    </Container>
  </div>
</Grid>
```

### 13.4 Holy Grail 레이아웃
```jsx
<Container maxWidth="full" padding={false}>
  <Flex direction="column" style={{ minHeight: '100vh' }}>
    {/* Header */}
    <Container>
      <Header />
    </Container>
    
    {/* Main Content */}
    <Flex style={{ flex: 1 }}>
      {/* Left Sidebar */}
      <aside style={{ width: '250px', borderRight: '1px solid var(--border-color)' }}>
        <Container padding="md">
          <Navigation />
        </Container>
      </aside>
      
      {/* Main */}
      <main style={{ flex: 1 }}>
        <Container maxWidth="lg">
          <Content />
        </Container>
      </main>
      
      {/* Right Sidebar */}
      <aside style={{ width: '300px', borderLeft: '1px solid var(--border-color)' }}>
        <Container padding="md">
          <Widgets />
        </Container>
      </aside>
    </Flex>
    
    {/* Footer */}
    <Container>
      <Footer />
    </Container>
  </Flex>
</Container>
```

### 13.5 반응형 카드 상세 레이아웃
```jsx
<Card variant="elevated">
  <Grid 
    columns={{ base: 1, md: 2 }}
    gap="none"
  >
    {/* 이미지 영역 */}
    <div style={{ 
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      minHeight: '300px'
    }} />
    
    {/* 정보 영역 */}
    <Flex direction="column" gap="md" style={{ padding: 'var(--spacing-lg)' }}>
      <Card.Header 
        title={title}
        subtitle={subtitle}
      />
      <Divider />
      <Card.Body>
        <p>{description}</p>
      </Card.Body>
      <Card.Footer>
        <Flex justify="end" gap="sm">
          <Button variant="outline">취소</Button>
          <Button>확인</Button>
        </Flex>
      </Card.Footer>
    </Flex>
  </Grid>
</Card>
```

---

## 14. 유틸리티 함수

### 14.1 반응형 값 처리
```javascript
// 반응형 prop 값을 CSS 변수로 변환
function getResponsiveValue(value, propName) {
  if (typeof value === 'object') {
    // { base: 1, md: 2, lg: 3 }
    return {
      [`--${propName}`]: value.base || value.sm || 1,
      [`--${propName}-md`]: value.md,
      [`--${propName}-lg`]: value.lg,
      [`--${propName}-xl`]: value.xl
    };
  }
  return { [`--${propName}`]: value };
}

// 사용 예시
const style = {
  ...getResponsiveValue(columns, 'columns'),
  ...getResponsiveValue(gap, 'gap')
};
```

### 14.2 간격 값 변환
```javascript
// 간격 prop을 실제 CSS 값으로 변환
function getSpacingValue(spacing) {
  const spacingMap = {
    none: '0',
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
    '2xl': 'var(--spacing-2xl)',
    '3xl': 'var(--spacing-3xl)'
  };
  
  if (typeof spacing === 'number') {
    return `${spacing}px`;
  }
  
  return spacingMap[spacing] || spacing;
}
```

### 14.3 클래스 이름 결합
```javascript
// 여러 클래스를 안전하게 결합
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// 사용 예시
const className = cn(
  'card',
  `card--${theme}`,
  `card--${variant}`,
  hoverable && 'card--hoverable',
  clickable && 'card--clickable'
);
```

---

## 15. 다음 단계

Day 2 컴포넌트 완성 후:
1. Day 1 컴포넌트와 조합하여 실제 페이지 레이아웃 구성
2. 반응형 동작 철저히 테스트
3. 각 테마별 스타일 검증
4. Day 3 상세 설계서 작성 (복합 인터랙션 컴포넌트)

---

## 16. 참고 자료

### 16.1 레이아웃 가이드
- CSS Grid Complete Guide: https://css-tricks.com/snippets/css/complete-guide-grid/
- Flexbox Complete Guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- Every Layout: https://every-layout.dev/

### 16.2 디자인 시스템 참고
- Material-UI Grid: https://mui.com/material-ui/react-grid/
- Chakra UI Layout: https://chakra-ui.com/docs/components/layout
- Tailwind CSS Flex: https://tailwindcss.com/docs/flex

### 16.3 반응형 디자인
- Responsive Web Design Basics: https://web.dev/responsive-web-design-basics/
- Mobile First Design: https://www.uxpin.com/studio/blog/a-hands-on-guide-to-mobile-first-design/

---

## 17. 완료 체크리스트

### 17.1 기능 구현
- [ ] Grid 컴포넌트 (반응형 columns 포함)
- [ ] GridItem 컴포넌트 (선택적)
- [ ] Flex 컴포넌트
- [ ] Container 컴포넌트
- [ ] Card 컴포넌트 (Compound Components)
- [ ] Card.Header
- [ ] Card.Body
- [ ] Card.Footer
- [ ] Divider 컴포넌트 (horizontal, vertical, label 포함)

### 17.2 스타일링
- [ ] 모든 컴포넌트 3가지 테마 지원
- [ ] 반응형 브레이크포인트 적용
- [ ] 호버 효과 구현
- [ ] 애니메이션/트랜지션 추가

### 17.3 테스트
- [ ] 다양한 조합 테스트
- [ ] 모바일/태블릿/데스크톱 확인
- [ ] 테마 전환 확인
- [ ] 중첩 사용 테스트

### 17.4 문서화
- [ ] 각 컴포넌트 사용 예시 코드 작성
- [ ] 일반적인 레이아웃 패턴 정리
- [ ] 주의사항 및 팁 작성