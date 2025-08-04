import { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/main');
  }, [router]);

  return (
    <div>
      <p>리다이렉팅 중...</p>
    </div>
  );
};

export default IndexPage;