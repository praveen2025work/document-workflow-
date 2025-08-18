import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';

const withAuth = <P extends object>(WrappedComponent: NextPage<P>) => {
  const AuthComponent: NextPage<P> = (props) => {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
      } else {
        // In a real app, you'd verify the token with your backend
        setIsVerified(true);
      }
    }, [router]);

    if (!isVerified) {
      // You can return a loader here
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;