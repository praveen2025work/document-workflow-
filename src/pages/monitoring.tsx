import type { NextPage } from 'next';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactFlow, {
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  BarChart3, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  UserX,
  Settings,
  Play,
  Pause,
  Square,
  Edit,
  Save,
  X,
  Activity,
  PieChart,
  Eye,
  List
} from 'lucide-react';
import { getProcessOwnerDashboard, getProcessOwnerWorkload, reassignTask, escalateWorkflow } from '@/lib/processOwnerApi';
import { getWorkflows, getWorkflowById } from '@/lib/workflowApi';
import { getWorkflowInstances } from '@/lib/executionApi';
import { ProcessOwnerDashboardData, ProcessOwnerWorkload } from '@/types/processOwner';
import { WorkflowInstance } from '@/types/execution';
import { Workflow } from '@/types/workflow';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import MainLayout from '@/components/MainLayout';
import WorkflowNode from '@/components/workflow/WorkflowNode';
import PropertiesPanel from '@/components/workflow/PropertiesPanel';
import { NodeData } from '@/components/workflow/types';

interface WorkflowHealth {
  workflowId: number;
  workflowName: string;
  status: string;
  activeInstances: number;
  delayedTasks: number;
  avgCompletionTime: string;
}

interface Task {
  taskId: number;
  taskName: string;
  workflowId: number;
  workflowName: string;
  assignedTo: string;
  status: string;
  delayedBy?: string;
}

interface ExecutionNode {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  assignedTo?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

interface ExecutionData {
  workflowId: string;
  workflowName: string;
  instanceId: number;
  status: string;
  startedAt: string;
  nodes: ExecutionNode[];
  stats: {
    completed: number;
    running: number;
    pending: number;
    failed: number;
  };
}

const MonitoringPage: NextPage = () => {
  const [dashboardData, setDashboardData] = useState<ProcessOwnerDashboardData | null>(null);
  const [workload, setWorkload] = useState<ProcessOwnerWorkload | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedWorkflowData, setSelectedWorkflowData] = useState<Workflow | null>(null);
  const [executionData, setExecutionData] = useState<ExecutionData | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [workflowViewTab, setWorkflowViewTab] = useState('visual');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // ReactFlow states for visual view
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const { user } = useUser();

  const fetchOverviewData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [dashboard, workloadData] = await Promise.all([
        getProcessOwnerDashboard(user.userId),
        getProcessOwnerWorkload(user.userId),
      ]);
      setDashboardData(dashboard);
      setWorkload(workloadData);
      toast.success('Dashboard data refreshed successfully!');
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      toast.error('Failed to load monitoring data.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const workflowsResponse = await getWorkflows();
      setWorkflows(workflowsResponse.workflows || workflowsResponse.content || []);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      // Fallback to mock data if API fails
      setWorkflows([
        { workflowId: 1, workflowName: 'Document Processing Workflow', name: 'Document Processing Workflow' },
        { workflowId: 2, workflowName: 'Monthly Finance Review Workflow', name: 'Monthly Finance Review Workflow' },
        { workflowId: 3, workflowName: 'Quarterly Audit Workflow', name: 'Quarterly Audit Workflow' },
        { workflowId: 4, workflowName: 'Document Processing Workflow', name: 'Document Processing Workflow' }
      ] as Workflow[]);
    }
  };

  const fetchExecutionData = async (workflowId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch workflow definition for visual view
      const workflowData = await getWorkflowById(parseInt(workflowId));
      setSelectedWorkflowData(workflowData);
      
      // Convert workflow to canvas nodes and edges for visual view
      if (workflowData) {
        const { nodes: canvasNodes, edges: canvasEdges } = convertWorkflowToCanvas(workflowData);
        setNodes(canvasNodes);
        setEdges(canvasEdges);
      }
      
      const instancesResponse = await getWorkflowInstances({ workflowId: parseInt(workflowId) });
      const instances = instancesResponse.content || [];
      
      if (instances.length > 0) {
        const latestInstance = instances[0];
        
        // Convert instance tasks to execution nodes
        const nodes: ExecutionNode[] = latestInstance.instanceTasks.map((task, index) => {
          let status: ExecutionNode['status'] = 'pending';
          const taskStatus = task.status.toLowerCase();
          
          if (taskStatus === 'completed') status = 'completed';
          else if (taskStatus === 'in_progress' || taskStatus === 'running') status = 'running';
          else if (taskStatus === 'failed') status = 'failed';
          else if (taskStatus === 'paused') status = 'paused';
          else status = 'pending';

          return {
            id: task.instanceTaskId.toString(),
            name: task.taskName,
            type: task.taskType,
            status,
            assignedTo: task.assignedToUsername,
            dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mock due dates
            priority: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
            notes: `Task ${index + 1} notes - ${task.taskType} task`,
            startedAt: task.startedOn,
            completedAt: task.completedOn
          };
        });

        // Calculate stats
        const stats = {
          completed: nodes.filter(n => n.status === 'completed').length,
          running: nodes.filter(n => n.status === 'running').length,
          pending: nodes.filter(n => n.status === 'pending').length,
          failed: nodes.filter(n => n.status === 'failed').length,
        };

        const executionData: ExecutionData = {
          workflowId,
          workflowName: latestInstance.workflowName,
          instanceId: latestInstance.instanceId,
          status: latestInstance.status,
          startedAt: latestInstance.startedOn,
          nodes,
          stats
        };

        setExecutionData(executionData);
      } else {
        setExecutionData(null);
      }
    } catch (err) {
      console.error('Error fetching execution data:', err);
      setExecutionData(null);
      setSelectedWorkflowData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert workflow to canvas format (similar to canvas-workflow page)
  const convertWorkflowToCanvas = (wf: Workflow) => {
    const tasks = wf.tasks || [];
    const initialNodes = [
      { id: 'start', type: 'start', position: { x: 50, y: 200 }, data: { description: 'Workflow Start' } },
      { id: 'end', type: 'end', position: { x: 1200, y: 200 }, data: { description: 'Workflow End' } },
    ];

    if (tasks.length === 0) {
      return { nodes: initialNodes, edges: [] };
    }

    // Simple layout - arrange tasks horizontally
    const xSpacing = 275;
    const ySpacing = 175;
    const startX = 250;

    const taskNodes: Node<NodeData>[] = tasks.map((task, index) => ({
      id: task.taskId.toString(),
      type: task.taskType === 'DECISION' ? 'decision' : 'action',
      position: { 
        x: startX + index * xSpacing, 
        y: 200 + (index % 2 === 0 ? 0 : ySpacing) 
      },
      data: { 
        description: task.name, 
        taskType: task.taskType, 
        ...task 
      } as NodeData,
    }));

    // Create simple edges between tasks
    const newEdges: Edge[] = [];
    
    // Connect start to first task
    if (taskNodes.length > 0) {
      newEdges.push({ 
        id: `start-${taskNodes[0].id}`, 
        source: 'start', 
        target: taskNodes[0].id, 
        type: 'default', 
        style: { stroke: '#3b82f6', strokeWidth: 2 } 
      });
    }

    // Connect tasks sequentially
    for (let i = 0; i < taskNodes.length - 1; i++) {
      newEdges.push({
        id: `${taskNodes[i].id}-${taskNodes[i + 1].id}`,
        source: taskNodes[i].id,
        target: taskNodes[i + 1].id,
        type: 'default',
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      });
    }

    // Connect last task to end
    if (taskNodes.length > 0) {
      newEdges.push({ 
        id: `${taskNodes[taskNodes.length - 1].id}-end`, 
        source: taskNodes[taskNodes.length - 1].id, 
        target: 'end', 
        type: 'default', 
        style: { stroke: '#3b82f6', strokeWidth: 2 } 
      });
    }

    const finalNodes = [...initialNodes, ...taskNodes];
    return { nodes: finalNodes, edges: newEdges };
  };

  // Handle node click in visual view
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Handle node update from properties panel
  const handleUpdateNode = useCallback((nodeId: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
    toast.success('Node updated successfully!');
  }, [setNodes]);

  // Node types for ReactFlow
  const nodeTypes = useMemo(() => ({ 
    start: WorkflowNode, 
    end: WorkflowNode, 
    action: WorkflowNode, 
    decision: WorkflowNode 
  }), []);

  useEffect(() => {
    if (user && activeTab === 'overview') {
      fetchOverviewData();
    }
    if (activeTab === 'manage') {
      fetchWorkflows();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchExecutionData(selectedWorkflow);
    }
  }, [selectedWorkflow]);

  const handleReassign = async (taskId: number, newUserId: number) => {
    try {
      await reassignTask(taskId, newUserId, 'Reassigned from dashboard');
      toast.success(`Task ${taskId} reassigned successfully.`);
      fetchOverviewData();
    } catch (error) {
      toast.error(`Failed to reassign task ${taskId}.`);
    }
  };

  const handleEscalate = async (workflowId: number, escalatedToUserId: number) => {
    try {
      await escalateWorkflow(workflowId, escalatedToUserId, 'Escalated from dashboard');
      toast.success(`Workflow ${workflowId} escalated successfully.`);
      fetchOverviewData();
    } catch (error) {
      toast.error(`Failed to escalate workflow ${workflowId}.`);
    }
  };

  const handleEditNode = (nodeId: string) => {
    const node = executionData?.nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditForm({
        assignedTo: node.assignedTo || '',
        dueDate: node.dueDate || '',
        priority: node.priority || 'medium',
        notes: node.notes || ''
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNode || !selectedWorkflow) return;
    
    try {
      // Mock update - in real implementation, this would call an API
      if (executionData) {
        const updatedNodes = executionData.nodes.map(node => 
          node.id === editingNode 
            ? { ...node, ...editForm }
            : node
        );
        setExecutionData({ ...executionData, nodes: updatedNodes });
      }
      
      setEditingNode(null);
      setEditForm({});
      toast.success('Node updated successfully!');
    } catch (err) {
      console.error('Error updating execution data:', err);
      toast.error('Failed to update node.');
    }
  };

  const handleCancelEdit = () => {
    setEditingNode(null);
    setEditForm({});
  };

  const handleRefresh = () => {
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (selectedWorkflow) {
      fetchExecutionData(selectedWorkflow);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-500';
      case 'AT_RISK': return 'text-yellow-500';
      case 'UNHEALTHY': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'paused':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'completed':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'failed':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-950';
    }
  };

  const renderStatistics = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics?.activeWorkflows || 0}</div>
          <p className="text-xs text-muted-foreground">Currently running processes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Workflows</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics?.completedToday || 0}</div>
          <p className="text-xs text-muted-foreground">Completed in the last 24 hours</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delayed Tasks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics?.delayedTasks || 0}</div>
          <p className="text-xs text-muted-foreground">Tasks currently behind schedule</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.statistics?.avgCompletionTime || 'N/A'}</div>
          <p className="text-xs text-muted-foreground">Average time from start to finish</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderWorkflowHealth = () => (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Health</CardTitle>
        <CardDescription>Overview of all managed workflows and their current status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active Instances</TableHead>
              <TableHead>Delayed Tasks</TableHead>
              <TableHead>Avg. Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData?.workflowHealth?.map((wf: WorkflowHealth) => (
              <TableRow key={wf.workflowId}>
                <TableCell className="font-medium">{wf.workflowName}</TableCell>
                <TableCell>
                  <Badge variant={wf.status === 'HEALTHY' ? 'default' : wf.status === 'AT_RISK' ? 'secondary' : 'destructive'} className={getStatusColor(wf.status)}>
                    {wf.status}
                  </Badge>
                </TableCell>
                <TableCell>{wf.activeInstances}</TableCell>
                <TableCell>{wf.delayedTasks}</TableCell>
                <TableCell>{wf.avgCompletionTime}</TableCell>
              </TableRow>
            )) || (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No workflow health data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderUserWorkload = () => (
    <Card>
      <CardHeader>
        <CardTitle>User Workload</CardTitle>
        <CardDescription>Breakdown of task assignments across users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Assigned Tasks</TableHead>
              <TableHead>Completed Tasks</TableHead>
              <TableHead>Avg. Task Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workload?.userWorkloads?.map(userLoad => (
              <TableRow key={userLoad.userId}>
                <TableCell className="font-medium">{userLoad.userName}</TableCell>
                <TableCell>{userLoad.assignedTasks}</TableCell>
                <TableCell>{userLoad.completedTasks}</TableCell>
                <TableCell>{userLoad.avgTaskCompletionTime}</TableCell>
              </TableRow>
            )) || (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No user workload data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderActionableTasks = () => (
    <Card>
      <CardHeader>
        <CardTitle>Actionable Insights</CardTitle>
        <CardDescription>Tasks requiring immediate attention, such as bottlenecks or escalations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData?.actionableInsights?.map((task: Task) => (
              <TableRow key={task.taskId}>
                <TableCell className="font-medium">{task.taskName}</TableCell>
                <TableCell>{task.workflowName}</TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>
                  <Badge variant={task.status === 'DELAYED' ? 'destructive' : 'secondary'}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleReassign(task.taskId, 2)}>Reassign</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleEscalate(task.workflowId, 3)}>Escalate</Button>
                </TableCell>
              </TableRow>
            )) || (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No actionable insights available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const headerActions = (
    <Button 
      onClick={handleRefresh} 
      variant="outline" 
      size="sm"
      disabled={isLoading}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  return (
    <MainLayout
      title="Monitoring"
      subtitle="Monitor workflow execution and performance"
      icon={BarChart3}
      headerActions={headerActions}
    >
      <div className="flex-1 p-6 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="manage">Manage Workflows</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {isLoading && !dashboardData ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 pr-4"
                >
                  {dashboardData && renderStatistics()}
                  {dashboardData && renderWorkflowHealth()}
                  {workload && renderUserWorkload()}
                  {dashboardData && dashboardData.actionableInsights && dashboardData.actionableInsights.length > 0 && renderActionableTasks()}
                </motion.div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-6 pr-4">
                {/* Workflow Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Workflow Management
                    </CardTitle>
                    <CardDescription>
                      Select a workflow to monitor and manage its execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 items-center">
                      <Label htmlFor="workflow-select" className="text-sm font-medium">
                        Select Workflow:
                      </Label>
                      <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Choose a workflow to manage" />
                        </SelectTrigger>
                        <SelectContent>
                          {workflows.map((workflow) => (
                            <SelectItem key={workflow.workflowId} value={workflow.workflowId.toString()}>
                              {workflow.workflowName || workflow.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Execution with Visual and List Views */}
                {selectedWorkflow && executionData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Workflow Execution Status
                      </CardTitle>
                      <CardDescription>
                        Monitor and manage workflow execution in real-time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Workflow Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{executionData.stats.completed}</div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{executionData.stats.running}</div>
                            <div className="text-sm text-muted-foreground">Running</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{executionData.stats.pending}</div>
                            <div className="text-sm text-muted-foreground">Pending</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{executionData.stats.failed}</div>
                            <div className="text-sm text-muted-foreground">Failed</div>
                          </div>
                        </div>

                        {/* Visual and List View Tabs */}
                        <Tabs value={workflowViewTab} onValueChange={setWorkflowViewTab} className="space-y-4">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="visual" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Visual
                            </TabsTrigger>
                            <TabsTrigger value="list" className="flex items-center gap-2">
                              <List className="h-4 w-4" />
                              List
                            </TabsTrigger>
                          </TabsList>

                          {/* Visual View */}
                          <TabsContent value="visual" className="space-y-4">
                            <div className="relative h-[600px] border rounded-lg bg-background">
                              <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onNodeClick={onNodeClick}
                                nodeTypes={nodeTypes}
                                fitView
                                className="bg-transparent"
                                minZoom={0.1}
                                maxZoom={3}
                                proOptions={{ hideAttribution: true }}
                              >
                                <Controls className="!bottom-4 !left-4" />
                              </ReactFlow>
                              
                              {/* Properties Panel for Visual View */}
                              <PropertiesPanel
                                selectedNode={nodes.find(node => node.id === selectedNodeId) || null}
                                onUpdateNode={handleUpdateNode}
                                onClose={() => setSelectedNodeId(null)}
                                roles={selectedWorkflowData?.workflowRoles || []}
                                allNodes={nodes}
                                edges={edges}
                                onUpdateEdges={setEdges}
                              />
                            </div>
                          </TabsContent>

                          {/* List View */}
                          <TabsContent value="list" className="space-y-4">
                            <div className="space-y-4">
                              {executionData.nodes.map((node, index) => (
                                <div key={node.id} className="relative">
                                  {/* Connection Line */}
                                  {index < executionData.nodes.length - 1 && (
                                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-border" />
                                  )}
                                  
                                  {/* Node Card */}
                                  <div className={`border-2 rounded-lg p-4 ${getNodeStatusColor(node.status)}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {getStatusIcon(node.status)}
                                        <div>
                                          <h4 className="font-medium">{node.name}</h4>
                                          <p className="text-sm text-muted-foreground">{node.type}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{node.status}</Badge>
                                        {node.status !== 'completed' && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditNode(node.id)}
                                            disabled={editingNode === node.id}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Node Details */}
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Assigned to:</span>
                                        <p className="font-medium">{node.assignedTo || 'Unassigned'}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Due date:</span>
                                        <p className="font-medium">{node.dueDate || 'Not set'}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Priority:</span>
                                        <Badge variant={node.priority === 'high' ? 'destructive' : node.priority === 'medium' ? 'default' : 'secondary'}>
                                          {node.priority || 'medium'}
                                        </Badge>
                                      </div>
                                    </div>

                                    {node.notes && (
                                      <div className="mt-3">
                                        <span className="text-muted-foreground text-sm">Notes:</span>
                                        <p className="text-sm mt-1">{node.notes}</p>
                                      </div>
                                    )}

                                    {/* Edit Form */}
                                    {editingNode === node.id && (
                                      <div className="mt-4 p-4 bg-background rounded-lg border space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="assignedTo">Assigned To</Label>
                                            <Input
                                              id="assignedTo"
                                              value={editForm.assignedTo}
                                              onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                                              placeholder="Enter assignee"
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="dueDate">Due Date</Label>
                                            <Input
                                              id="dueDate"
                                              type="date"
                                              value={editForm.dueDate}
                                              onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <Label htmlFor="priority">Priority</Label>
                                          <Select value={editForm.priority} onValueChange={(value) => setEditForm({...editForm, priority: value})}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="low">Low</SelectItem>
                                              <SelectItem value="medium">Medium</SelectItem>
                                              <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="notes">Notes</Label>
                                          <Textarea
                                            id="notes"
                                            value={editForm.notes}
                                            onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                            placeholder="Add notes or comments"
                                            rows={3}
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button onClick={handleSaveEdit} size="sm">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                          </Button>
                                          <Button onClick={handleCancelEdit} variant="outline" size="sm">
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedWorkflow && !executionData && !isLoading && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No execution data available for this workflow</p>
                    </CardContent>
                  </Card>
                )}

                {selectedWorkflow && isLoading && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading execution data...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!selectedWorkflow && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">Select a workflow to view execution details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MonitoringPage;