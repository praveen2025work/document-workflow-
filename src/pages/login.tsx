import type { NextPage } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GitBranch } from 'lucide-react';

const LoginPage: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.info('Attempting to log in...');

    // This is a mock API call. In a real application, you would
    // make a request to your backend authentication endpoint.
    setTimeout(() => {
      if (username === 'testuser' && password === 'password') {
        localStorage.setItem('authToken', 'fake-jwt-token');
        toast.success('Login successful!');
        router.push('/');
      } else {
        toast.error('Invalid username or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-8 shadow-lg"
      >
        <div className="mb-8 flex flex-col items-center">
          <GitBranch className="h-12 w-12 text-blue-400" />
          <h1 className="mt-4 text-3xl font-bold">Workflow Designer</h1>
          <p className="text-gray-400">Please log in to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., testuser"
              className="mt-1 bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g., password"
              className="mt-1 bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-blue-400 hover:underline">
                    Register
                </a>
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;