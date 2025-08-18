import React, { useState, useCallback, useMemo } from 'react';
import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, Upload, Download, FileUp, FileText, GitBranch, Settings, MousePointer, ZoomIn, ZoomOut, RefreshCw, LayoutDashboard, Calendar } from 'lucide-react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection as ReactFlowConnection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkflowNode from '@/components/workflow/WorkflowNode';
import PropertiesPanel from '@/components/workflow/PropertiesPanel';
import WorkflowSettings from '@/components/workflow/WorkflowSettings';
import CalendarManager from '@/components/workflow/CalendarManager';
import { NodeType, NodeData } from '@/components/workflow/types';
import { createWorkflow, addWorkflowRole, mapUserToRole, addWorkflowTask, addWorkflowConnection, deployWorkflow } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/router';

interface Role {
  id: number;
  name: string;
}

interface UserForRole {
  user_id: number;
  role_id: number;
}

interface WorkflowSettings {
  name: string;
  trigger: 'MANUAL' | 'AUTO';
  frequency?: string;
  startTime?: string;
  start_working_day?: number;
  calendar_id?: number;
  roles?: Role[];
  usersForRoles?: UserForRole[];
}

const Home: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useUser();

  const initialNodes: Node<NodeData>[] = [
    { id: 'start', type: 'start', position: { x: 50, y: 200 }, data: { description: 'Workflow Start' } },
    { id: 'upload-1', type: 'action', position: { x: 350, y: 200 }, data: { description: 'Upload Invoice' } },
    { id: 'end', type: 'end', position: { x: 650, y: 200 }, data: { description: 'Workflow End' } },
  ];

  const initialEdges: Edge[] = [
    { id: 'e-start-upload-1', source: 'start', target: 'upload-1', animated: true },
  ];

  const initialSettings: WorkflowSettings = {
    name: 'My Awesome Workflow',
    trigger: 'MANUAL',
    roles: [],
    usersForRoles: [],
  };

  const [workflowSettings, setWorkflowSettings] = useState<WorkflowSettings>(initialSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [workflowId, setWorkflowId] = useState<number | null>(null);

  const onConnect = useCallback(
    (params: ReactFlowConnection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleSaveSettings = (settings: any) => {
    setWorkflowSettings(settings);
    toast.success('Workflow settings saved!');
  };

  const handleCreateNew = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setWorkflowSettings(initialSettings);
    setSelectedNodeId(null);
    toast.success('New workflow created!');
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    toast.info('Deploying workflow...');

    try {
      // Step 1: Create the workflow
      const { name, trigger, frequency, startTime, start_working_day, calendar_id } = workflowSettings;
      const workflowPayload = {
        name,
        trigger_mechanism: trigger,
        frequency,
        start_time: startTime,
        start_working_day,
        calendar_id,
      };

      const workflowResponse = await createWorkflow(workflowPayload);
      const newWorkflowId = workflowResponse.data.id;
      setWorkflowId(newWorkflowId);
      toast.success(`Workflow created with ID: ${newWorkflowId}`);

      // Step 2: Add roles and map users
      const roleIdMap: { [roleName: string]: number } = {};
      if (workflowSettings.roles) {
        for (const role of workflowSettings.roles) {
          const roleResponse = await addWorkflowRole(newWorkflowId, { name: role.name });
          const newRoleId = roleResponse.data.id;
          roleIdMap[role.name] = newRoleId;

          if (workflowSettings.usersForRoles) {
            const usersForRole = workflowSettings.usersForRoles.filter(u => u.role_id === role.id);
            for (const user of usersForRole) {
              await mapUserToRole(newWorkflowId, newRoleId, { user_id: user.user_id, role_id: newRoleId });
            }
          }
        }
        toast.info('Roles and users mapped successfully.');
      }

      // Step 3: Create tasks (nodes)
      const taskIdMap: { [frontendId: string]: string } = {};
      for (const node of nodes.filter(n => n.type !== 'start' && n.type !== 'end')) {
        const taskPayload = {
          type: node.data.taskType || (node.type === 'action' ? 'FileUpload' : 'Decision'),
          name: node.data.description,
          role_id: roleIdMap[node.data.role || ''],
          expected_completion_day: node.data.completionDay,
          expected_completion_time: node.data.completionTime,
          escalation_remind_before_mins: node.data.remindBefore,
          escalation_remind_at_time: node.data.remindAtTime,
          escalation_after_mins: node.data.escalateAfter,
          files: node.data.files,
          outcomes: node.data.outcomes,
        };
        const taskResponse = await addWorkflowTask(newWorkflowId, taskPayload);
        taskIdMap[node.id] = taskResponse.data.id;
      }
      toast.info('Tasks created successfully.');

      // Step 4: Create connections
      for (const edge of edges) {
        const connectionPayload = {
          from_task_id: edge.source === 'start' ? 'Start' : taskIdMap[edge.source],
          to_task_id: edge.target === 'end' ? 'End' : taskIdMap[edge.target!],
          outcome: edge.label || null,
        };
        await addWorkflowConnection(newWorkflowId, connectionPayload);
      }
      toast.info('Connections created successfully.');

      // Step 5: Deploy the workflow
      await deployWorkflow(newWorkflowId);
      toast.success('Workflow deployed successfully!');

    } catch (error) {
      // Error is handled by the interceptor
      console.error('Deployment failed', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const addNode = (type: NodeType) => {
    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { description: `New ${type} node` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleUpdateNode = useCallback((nodeId: string, data: NodeData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, [setNodes]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId || ['start', 'end'].includes(selectedNodeId)) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNodeId, setNodes, setEdges]);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const nodeTypes = useMemo(() => ({
    start: WorkflowNode,
    end: WorkflowNode,
    action: WorkflowNode,
    decision: WorkflowNode,
    api: WorkflowNode,
    database: WorkflowNode,
  }), []);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
        {/* Header */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-6"
        >
          <div className="flex items-center gap-4">
            <GitBranch className="h-7 w-7 text-blue-400" />
            <h1 className="text-xl font-semibold">Workflow Management</h1>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <p>Loading user...</p>
            ) : user ? (
              <p>Welcome, {user.name}</p>
            ) : (
              <p>Could not load user data.</p>
            )}
            <Button onClick={handleCreateNew} variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
            <Button onClick={handleDeploy} variant="outline" className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white" disabled={isDeploying}>
              {isDeploying ? 'Deploying...' : <><Play className="mr-2 h-4 w-4" /> Deploy</>}
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeleteNode}
              disabled={!selectedNodeId || ['start', 'end'].includes(selectedNodeId)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-4">
          <Tabs defaultValue="designer" className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="designer">
                <GitBranch className="mr-2 h-4 w-4" />
                Workflow Designer
              </TabsTrigger>
              <TabsTrigger value="calendars">
                <Calendar className="mr-2 h-4 w-4" />
                Calendars
              </TabsTrigger>
            </TabsList>
            <TabsContent value="designer" className="flex-1 overflow-hidden relative flex">
              {/* Left Palette */}
              <motion.aside
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="w-20 border-r border-gray-700 bg-gray-800 p-2"
              >
                <div className="flex flex-col items-center gap-4 py-4">
                  <h2 className="text-sm font-medium text-gray-400">Tasks</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div onClick={() => addNode('action')} className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-700 p-2 transition-all hover:bg-blue-500">
                        <Upload className="h-6 w-6" />
                        <span className="text-xs">Upload</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">File Upload Task</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div onClick={() => addNode('action')} className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-700 p-2 transition-all hover:bg-blue-500">
                        <Download className="h-6 w-6" />
                        <span className="text-xs">Download</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">File Download Task</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div onClick={() => addNode('action')} className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-700 p-2 transition-all hover:bg-blue-500">
                        <FileUp className="h-6 w-6" />
                        <span className="text-xs">Update</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">File Update Task</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div onClick={() => addNode('action')} className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-700 p-2 transition-all hover:bg-blue-500">
                        <FileText className="h-6 w-6" />
                        <span className="text-xs">Consolidate</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Consolidate Files Task</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div onClick={() => addNode('decision')} className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-700 p-2 transition-all hover:bg-yellow-500">
                        <MousePointer className="h-6 w-6" />
                        <span className="text-xs">Decision</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Decision Task</TooltipContent>
                  </Tooltip>
                  <div className="my-2 h-px w-full bg-gray-600" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div onClick={() => setIsSettingsOpen(true)} className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-700 p-2 transition-all hover:bg-yellow-500">
                        <Settings className="h-6 w-6" />
                        <span className="text-xs">Settings</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Workflow Settings</TooltipContent>
                  </Tooltip>
                </div>
              </motion.aside>

              {/* Workflow Canvas */}
              <motion.main
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                className="flex-1 bg-gray-900 relative"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-gray-900"
                >
                  <Controls />
                  <Background color="#4a5568" gap={16} />
                </ReactFlow>
              </motion.main>
              
              <PropertiesPanel
                selectedNode={selectedNode}
                onUpdateNode={handleUpdateNode}
                onClose={() => setSelectedNodeId(null)}
                roles={workflowSettings.roles || []}
              />

              <WorkflowSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={handleSaveSettings}
                settings={workflowSettings}
              />
            </TabsContent>
            <TabsContent value="calendars" className="flex-1 overflow-auto p-4 bg-gray-800 rounded-lg">
              <CalendarManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Home;