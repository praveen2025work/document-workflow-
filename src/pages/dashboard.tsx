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
import { Badge } from '@/components/ui/badge';
import { getUserDashboard, getAssignableTasks, assignTask } from '@/lib/dashboardApi';
import { UserDashboard, DashboardTask, AssignableTask } from '@/types/dashboard';
import { useUser } from '@/context/UserContext';
import { LayoutDashboard, MessageSquare, RefreshCw, UserPlus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const DashboardPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<UserDashboard | null>(null);
  const [assignableTasks, setAssignableTasks] = useState<AssignableTask[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAssignableTasksLoading, setIsAssignableTasksLoading] = useState(false);
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
      console.log('Dashboard data loaded successfully:', response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data.');
      // Fallback to mock data if API fails
      const { mockUserDashboard } = await import('@/lib/mock/dashboard');
      setDashboardData(mockUserDashboard);
      console.log('Using fallback mock data:', mockUserDashboard);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignableTasks = async () => {
    if (!user) return;
    setIsAssignableTasksLoading(true);
    try {
      const response = await getAssignableTasks(user.userId);
      setAssignableTasks(response);
    } catch (error) {
      toast.error('Failed to fetch assignable tasks.');
    } finally {
      setIsAssignableTasksLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchAssignableTasks(); // Load assignable tasks by default since "Available Tasks" is the default tab
    }
  }, [user]);

  const handleTabChange = (value: string) => {
    if (value === 'available' && assignableTasks.length === 0) {
      fetchAssignableTasks();
    }
  };

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

  const handleAssignTaskToMe = async (task: AssignableTask) => {
    if (!user) {
      toast.error('User information not available.');
      return;
    }
    
    try {
      await assignTask(task.instanceTaskId, user.userId);
      toast.success('Task assigned to you successfully!');
      fetchAssignableTasks(); // Refresh the assignable tasks
      fetchDashboardData(); // Refresh dashboard data to show the newly assigned task
    } catch (error) {
      toast.error('Failed to assign task.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'default';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const renderAvailableTaskList = () => {
    const isLoadingTasks = isLoading || isAssignableTasksLoading;
    
    if (isLoadingTasks) {
      return <p className="text-muted-foreground">Loading available tasks...</p>;
    }

    // Combine pending tasks assigned to current user and assignable tasks from role-based queue
    const pendingTasks = dashboardData?.myTasks.filter(t => t.status === 'PENDING') || [];
    const availableTasks = assignableTasks || [];
    
    if (pendingTasks.length === 0 && availableTasks.length === 0) {
      return <p className="text-muted-foreground">No available tasks.</p>;
    }

    return (
      <div className="space-y-6">
        {/* User's Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              My Pending Tasks
            </h4>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Card key={`pending-${task.instanceTaskId}`} className="glass border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(task.status)}
                        <p className="font-semibold text-foreground">{task.taskName}</p>
                        <Badge variant="secondary">ASSIGNED TO ME</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Assigned to: {task.assignedToUsername}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenChat(task.instanceTaskId)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Role-based Assignable Tasks */}
        {availableTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Role-based Available Tasks
            </h4>
            <div className="space-y-3">
              {availableTasks.map((task) => (
                <Card key={`assignable-${task.instanceTaskId}`} className="glass border-l-4 border-l-gray-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(task.status)}
                          <p className="font-semibold text-foreground">{task.taskName}</p>
                          <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Task Type: <span className="font-medium">{task.taskType}</span></p>
                          <p>Instance ID: <span className="font-medium">{task.instanceId}</span></p>
                          <p>Currently assigned to: <span className="font-medium">{task.assignedToUsername}</span></p>
                          {task.startedOn && (
                            <p>Started: <span className="font-medium">{new Date(task.startedOn).toLocaleString()}</span></p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleAssignTaskToMe(task)}
                          disabled={task.status === 'COMPLETED'}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign to Me
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenChat(task.instanceTaskId)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTaskList = (tasks: DashboardTask[], type: 'pending' | 'in_progress' | 'completed') => {
    if (isLoading) {
      return <p className="text-muted-foreground">Loading tasks...</p>;
    }
    if (!tasks || tasks.length === 0) {
      return <p className="text-muted-foreground">No tasks in this category.</p>;
    }

    const getBorderColor = (taskType: string) => {
      switch (taskType) {
        case 'in_progress':
          return 'border-l-orange-500';
        case 'completed':
          return 'border-l-green-500';
        default:
          return 'border-l-blue-500';
      }
    };

    return (
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.instanceTaskId} className={`glass border-l-4 ${getBorderColor(type)}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <p className="font-semibold text-foreground">{task.taskName}</p>
                  <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                </div>
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

  const handleRefreshAll = async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchAssignableTasks()
    ]);
  };

  // Header actions for dashboard
  const headerActions = (
    <Button 
      onClick={handleRefreshAll} 
      variant="outline" 
      size="sm"
      disabled={isLoading || isAssignableTasksLoading}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || isAssignableTasksLoading) ? 'animate-spin' : ''}`} />
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
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="available" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3 glass">
                <TabsTrigger value="available">Available Tasks</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="available">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Available Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderAvailableTaskList()}
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