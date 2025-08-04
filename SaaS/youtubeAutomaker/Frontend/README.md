## 🌐 프론트엔드 구성 (with Next.js)

### 📌 기술 스택

| 기술 / 프레임워크 | 설명 |
|------------------|------|
| **Next.js 14**   | 전체 프론트엔드 프레임워크, App Router 기반 |
| **Tailwind CSS** | 반응형 UI 구성 및 빠른 스타일링 적용 |
| **TypeScript**   | 안정적인 컴포넌트 작성 |
| **Axios**        | 백엔드 API 통신 처리 |
| **React Hook Form + Zod** | 입력 폼 검증 및 처리 |
| **Framer Motion** | 인터랙션 애니메이션 |
| **Shadcn/ui**    | 깔끔한 컴포넌트 UI 프레임워크 |
| **Recharts (예정)** | 대시보드 통계 시각화 구성 예정 |
| **NextAuth.js**  | OAuth 2.0 기반 로그인 인증 처리 |
| **Google OAuth 2.0** | 구글 계정으로 로그인 및 유튜브 연동 |
| **JWT** | 사용자 인증 상태 관리 및 세션 처리 |

---

### 🔐 OAuth 2.0 로그인 시스템

- **NextAuth.js** 사용하여 OAuth2.0 구현
- 구글 계정 로그인 → 자동으로 유튜브 API 사용 권한 부여
- 로그인 후 사용자 정보를 세션으로 저장하고, 보호된 페이지 접근 가능

#### ✅ 로그인 흐름

1. 사용자가 로그인 버튼 클릭  
2. Google OAuth 화면으로 리다이렉트  
3. 로그인 성공 시 access token + refresh token 저장  
4. YouTube Data API, TTS API 호출 시 access token 자동 사용

```tsx
import { signIn, signOut, useSession } from "next-auth/react";

const LoginButton = () => {
  const { data: session } = useSession();
  return session ? (
    <button onClick={() => signOut()}>로그아웃</button>
  ) : (
    <button onClick={() => signIn("google")}>구글 로그인</button>
  );
};
