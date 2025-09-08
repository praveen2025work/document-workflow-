import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/canvas-workflow');
  }, [router]);

  return null;
};

export default Home;