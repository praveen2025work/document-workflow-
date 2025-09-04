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
import { getUserDashboard } from '@/lib/dashboardApi';
import { UserDashboard, DashboardTask } from '@/types/dashboard';
import { useUser } from '@/context/UserContext';
import { LayoutDashboard, MessageSquare, RefreshCw } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const DashboardPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<UserDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [receiverUserId, setReceiverUserId] = useState('');
  const { user } = useUser();

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await getUserDashboard(user.userId);
      setDashboardData(response);
    } catch (error) {
      toast.error('Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handlePickUpTask = async (taskId: number) => {
    toast.info('Picking up task...');
    // Replace with actual API call from executionApi
    console.log('Pick up task:', taskId);
    toast.success('Task picked up successfully!');
    fetchDashboardData();
  };

  const handleCompleteTask = async (taskId: number) => {
    toast.info('Completing task...');
    // Replace with actual API call from executionApi
    console.log('Complete task:', taskId);
    toast.success('Task completed successfully!');
    fetchDashboardData();
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
    // Replace with actual API call
    console.log('Send chat message:', chatMessage, 'to user:', receiverUserId, 'for task:', selectedTaskId);
    toast.success('Message sent!');
    setChatMessage('');
    setReceiverUserId('');
    setIsChatOpen(false);
  };

  const renderTaskList = (tasks: DashboardTask[], type: 'pending' | 'in_progress' | 'completed') => {
    if (isLoading) {
      return <p className="text-muted-foreground">Loading tasks...</p>;
    }
    if (!tasks || tasks.length === 0) {
      return <p className="text-muted-foreground">No tasks in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.instanceTaskId} className="glass">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{task.taskName}</p>
                <p className="text-sm text-muted-foreground">Assigned to: {task.assignedToUsername}</p>
              </div>
              <div className="flex items-center gap-2">
                {type === 'pending' && (
                  <Button size="sm" onClick={() => handlePickUpTask(task.instanceTaskId)}>
                    Pick Up
                  </Button>
                )}
                {type === 'in_progress' && (
                  <Button size="sm" variant="secondary" onClick={() => handleCompleteTask(task.instanceTaskId)}>
                    Complete
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleOpenChat(task.instanceTaskId)}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Header actions for dashboard
  const headerActions = (
    <Button 
      onClick={fetchDashboardData} 
      variant="outline" 
      size="sm"
      disabled={isLoading}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  return (
    <>
      <MainLayout
        title="User Dashboard"
        subtitle="Manage your tasks and workflow activities"
        icon={LayoutDashboard}
        headerActions={headerActions}
      >
        <div className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground">Pending Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderTaskList(dashboardData?.myTasks.filter(t => t.status === 'PENDING') || [], 'pending')}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="in_progress">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground">In Progress Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderTaskList(dashboardData?.myTasks.filter(t => t.status === 'IN_PROGRESS') || [], 'in_progress')}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="completed">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground">Completed Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderTaskList(dashboardData?.myTasks.filter(t => t.status === 'COMPLETED') || [], 'completed')}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </MainLayout>
      
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Send Chat Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="receiverUserId" className="text-foreground">Receiver User ID</Label>
              <Input
                id="receiverUserId"
                value={receiverUserId}
                onChange={(e) => setReceiverUserId(e.target.value)}
                placeholder="Enter user ID"
                className="glass border-border"
              />
            </div>
            <div>
              <Label htmlFor="chatMessage" className="text-foreground">Message</Label>
              <Input
                id="chatMessage"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="glass border-border"
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