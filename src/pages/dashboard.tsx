import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import withAuth from '@/components/auth/withAuth';
import api from '@/lib/api';
import { useRouter } from 'next/router';
import { LogOut, GitBranch } from 'lucide-react';

interface Task {
  id: number;
  task_name: string;
  workflow_id: number;
}

interface DashboardData {
  pending: Task[];
  in_progress: Task[];
  completed: Task[];
}

const DashboardPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/user/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        // Error is handled by the interceptor
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleNavigateToDesigner = () => {
    router.push('/');
  };

  const handlePickUpTask = async (taskId: number) => {
    toast.info('Picking up task...');
    try {
      await api.post(`/task-instances/${taskId}/pickup`);
      toast.success('Task picked up successfully!');
      // Refetch data to update the dashboard
      const response = await api.get('/user/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      // Error is handled by the interceptor
    }
  };

  const renderTaskList = (tasks: Task[], type: 'pending' | 'in_progress' | 'completed') => {
    if (isLoading) {
      return <p>Loading tasks...</p>;
    }
    if (!tasks || tasks.length === 0) {
      return <p>No tasks in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{task.task_name}</p>
                <p className="text-sm text-gray-400">Workflow ID: {task.workflow_id}</p>
              </div>
              {type === 'pending' && (
                <Button size="sm" onClick={() => handlePickUpTask(task.id)}>
                  Pick Up
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
      <header className="flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
        <div className="flex items-center gap-4">
          <GitBranch className="h-7 w-7 text-blue-400" />
          <h1 className="text-xl font-semibold">User Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleNavigateToDesigner} variant="outline">
            Workflow Designer
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle>Pending Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTaskList(dashboardData?.pending || [], 'pending')}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="in_progress">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle>In Progress Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTaskList(dashboardData?.in_progress || [], 'in_progress')}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="completed">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle>Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTaskList(dashboardData?.completed || [], 'completed')}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default withAuth(DashboardPage);