import React, { useState, useCallback } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, Upload, Download, FileUp, FileText, GitBranch, Settings, MousePointer, ZoomIn, ZoomOut, RefreshCw, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import WorkflowNode from '@/components/workflow/WorkflowNode';
import Connection from '@/components/workflow/Connection';
import PropertiesPanel from '@/components/workflow/PropertiesPanel';
import WorkflowSettings from '@/components/workflow/WorkflowSettings';
import { WorkflowNode as WorkflowNodeType, Connection as ConnectionType, NodeType, Position, NodeData } from '@/components/workflow/types';
import withAuth from '@/components/auth/withAuth';
import api from '@/lib/api';

interface WorkflowSettings {
  name: string;
  trigger: 'MANUAL' | 'AUTO';
  frequency?: string;
  startTime?: string;
  start_working_day?: number;
  calendar_id?: number;
}

const Home: NextPage = () => {
  const router = useRouter();
  const initialNodes: WorkflowNodeType[] = [
    { id: 'start', type: 'start', position: { x: 50, y: 200 }, data: { description: 'Workflow Start' } },
    { id: 'upload-1', type: 'action', position: { x: 350, y: 200 }, data: { description: 'Upload Invoice' } },
    { id: 'end', type: 'end', position: { x: 650, y: 200 }, data: { description: 'Workflow End' } },
  ];

  const initialConnections: ConnectionType[] = [
    { id: 'conn-start-upload-1', source: 'start', target: 'upload-1' },
  ];

  const initialSettings: WorkflowSettings = {
    name: 'My Awesome Workflow',
    trigger: 'MANUAL',
  };

  const [workflowSettings, setWorkflowSettings] = useState<WorkflowSettings>(initialSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNodeType[]>(initialNodes);
  const [connections, setConnections] = useState<ConnectionType[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; position: Position } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [workflowId, setWorkflowId] = useState<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
  const handleResetZoom = () => setZoom(1);

  const handleSaveSettings = (settings: any) => {
    setWorkflowSettings(settings);
    toast.success('Workflow settings saved!');
  };

  const handleCreateNew = () => {
    setNodes(initialNodes);
    setConnections(initialConnections);
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

      const workflowResponse = await api.post('/workflows', workflowPayload);
      const newWorkflowId = workflowResponse.data.id;
      setWorkflowId(newWorkflowId);
      toast.success(`Workflow created with ID: ${newWorkflowId}`);

      // Step 2: Create tasks (nodes)
      const taskIdMap: { [frontendId: string]: string } = {};
      const taskPromises = nodes
        .filter((node) => node.type !== 'start' && node.type !== 'end')
        .map(async (node) => {
          const taskPayload = {
            type: node.type === 'action' ? 'FileUpload' : 'Decision', // Example mapping
            name: node.data.description,
            role_id: 1, // Mock role_id, this should come from node data
            expected_completion_day: 1, // Mock data
            expected_completion_time: '09:00', // Mock data
          };
          const taskResponse = await api.post(`/workflows/${newWorkflowId}/tasks`, taskPayload);
          taskIdMap[node.id] = taskResponse.data.id;
        });
      
      await Promise.all(taskPromises);
      toast.info('Tasks created successfully.');

      // Step 3: Create connections
      const connectionPromises = connections.map(async (conn) => {
        const connectionPayload = {
          from_task_id: conn.source === 'start' ? 'Start' : taskIdMap[conn.source],
          to_task_id: conn.target === 'end' ? 'End' : taskIdMap[conn.target],
          outcome: null, // Mock data
        };
        await api.post(`/workflows/${newWorkflowId}/connections`, connectionPayload);
      });

      await Promise.all(connectionPromises);
      toast.info('Connections created successfully.');

      // Step 4: Deploy the workflow
      await api.post(`/workflows/${newWorkflowId}/deploy`);
      toast.success('Workflow deployed successfully!');

    } catch (error) {
      // Error is handled by the interceptor
      console.error('Deployment failed', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleNodeMove = useCallback((id: string, position: Position) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, position } : node)));
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
    setIsConnecting(false);
    setConnectionStart(null);
  }, []);

  const handleConnectionStart = useCallback((nodeId: string, position: Position) => {
    setIsConnecting(true);
    setConnectionStart({ nodeId, position });
  }, []);

  const handleConnectionEnd = useCallback((sourceNodeId: string, targetNodeId: string) => {
    if (sourceNodeId !== targetNodeId) {
      const newConnection: ConnectionType = {
        id: `conn-${sourceNodeId}-${targetNodeId}`,
        source: sourceNodeId,
        target: targetNodeId,
      };
      setConnections((prev) => [...prev, newConnection]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  }, []);

  const addNode = (type: NodeType) => {
    const newNode: WorkflowNodeType = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 300, y: 150 },
      data: { description: `New ${type} node` },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleUpdateNode = useCallback((nodeId: string, data: NodeData) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId || ['start', 'end'].includes(selectedNodeId)) return;

    setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId));
    setConnections((prev) =>
      prev.filter((conn) => conn.source !== selectedNodeId && conn.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
  }, [selectedNodeId]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;

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
            <h1 className="text-xl font-semibold">Workflow Designer</h1>
          </div>
          <div className="flex items-center gap-2">
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
            <Button onClick={handleLogout} variant="outline" className="border-gray-500 text-gray-400 hover:bg-gray-700 hover:text-white">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
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
            id="workflow-container"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
            className="flex-1 bg-gray-900 relative"
            style={{
              backgroundImage: 'radial-gradient(#4a5568 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
            onClick={handleCanvasClick}
          >
            <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
              <Button onClick={handleZoomOut} variant="outline" size="icon" className="bg-gray-800 border-gray-600">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium bg-gray-800 px-2 py-1 rounded">{Math.round(zoom * 100)}%</span>
              <Button onClick={handleZoomIn} variant="outline" size="icon" className="bg-gray-800 border-gray-600">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button onClick={handleResetZoom} variant="outline" size="icon" className="bg-gray-800 border-gray-600">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <motion.div
              id="workflow-canvas"
              className="relative w-full h-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#4a5568" />
                  </marker>
                </defs>
                {connections.map((conn) => (
                  <Connection key={conn.id} connection={conn} nodes={nodes} />
                ))}
              </svg>

              {nodes.map((node) => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  onNodeMove={handleNodeMove}
                  onConnectionStart={handleConnectionStart}
                  onConnectionEnd={handleConnectionEnd}
                  isSelected={selectedNodeId === node.id}
                  onSelect={handleNodeSelect}
                  isConnecting={isConnecting}
                  connectionStartNodeId={connectionStart?.nodeId || null}
                  zoom={zoom}
                />
              ))}
            </motion.div>
          </motion.main>
          
          <PropertiesPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onClose={() => setSelectedNodeId(null)}
          />

          <WorkflowSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSave={handleSaveSettings}
            settings={workflowSettings}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default withAuth(Home);