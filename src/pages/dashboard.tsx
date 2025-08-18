import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserDashboard, pickupTask, completeTask, sendChatMessage } from '@/lib/api';
import { useRouter } from 'next/router';
import { GitBranch, MessageSquare, Eye } from 'lucide-react';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [receiverUserId, setReceiverUserId] = useState('');
  const router = useRouter();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await getUserDashboard();
      setDashboardData(response.data);
    } catch (error) {
      // Error is handled by the interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNavigateToDesigner = () => {
    router.push('/');
  };

  const handleNavigateToMonitoring = () => {
    router.push('/monitoring');
  };

  const handlePickUpTask = async (taskId: number) => {
    toast.info('Picking up task...');
    try {
      await pickupTask(taskId);
      toast.success('Task picked up successfully!');
      fetchDashboardData();
    } catch (error) {
      // Error is handled by the interceptor
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    toast.info('Completing task...');
    try {
      await completeTask(taskId);
      toast.success('Task completed successfully!');
      fetchDashboardData();
    } catch (error) {
      // Error is handled by the interceptor
    }
  };

  const handleOpenChat = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsChatOpen(true);
  };

  const handleSendChatMessage = async () => {
    if (!selectedTaskId || !chatMessage || !receiverUserId) {
      toast.error('Message and Receiver User ID are required.');
      return;
    }
    toast.info('Sending message...');
    try {
      await sendChatMessage(selectedTaskId, {
        message: chatMessage,
        receiver_user_id: Number(receiverUserId),
      });
      toast.success('Message sent!');
      setChatMessage('');
      setReceiverUserId('');
      setIsChatOpen(false);
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
              <div className="flex items-center gap-2">
                {type === 'pending' && (
                  <Button size="sm" onClick={() => handlePickUpTask(task.id)}>
                    Pick Up
                  </Button>
                )}
                {type === 'in_progress' && (
                  <Button size="sm" variant="secondary" onClick={() => handleCompleteTask(task.id)}>
                    Complete
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleOpenChat(task.id)}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
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
            <Button onClick={handleNavigateToMonitoring} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Monitoring
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
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Send Chat Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="receiverUserId">Receiver User ID</Label>
              <Input
                id="receiverUserId"
                value={receiverUserId}
                onChange={(e) => setReceiverUserId(e.target.value)}
                placeholder="Enter user ID"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="chatMessage">Message</Label>
              <Input
                id="chatMessage"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChatOpen(false)}>Cancel</Button>
            <Button onClick={handleSendChatMessage}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardPage;