import React, { useState, useCallback, useMemo } from 'react';
import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, Upload, Download, FileUp, Settings, MousePointer, Workflow, Sparkles, Layers } from 'lucide-react';

// Modern Update Icon Component (sync/refresh with arrows)
const UpdateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

// Modern Consolidate Icon Component (merge/combine)
const ConsolidateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
    <path d="M3 8h3a2 2 0 0 1 2 2v3" />
    <path d="M21 8h-3a2 2 0 0 0-2 2v3" />
    <path d="M8 13v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3" />
    <path d="M12 13v8" />
  </svg>
);

// Modern Decision Icon Component (diamond with branching paths)
const DecisionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L22 12L12 22L2 12Z" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);
import ReactFlow, {
  Controls,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/MainLayout';
import WorkflowNode from '@/components/workflow/WorkflowNode';
import PropertiesPanel from '@/components/workflow/PropertiesPanel';
import WorkflowSettings from '@/components/workflow/WorkflowSettings';
import { NodeType, NodeData } from '@/components/workflow/types';
import { createWorkflow, addWorkflowRole, mapUserToRole, addWorkflowTask, addWorkflowConnection, deployWorkflow } from '@/lib/api';

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
  const initialNodes: Node<NodeData>[] = [
    { id: 'start', type: 'start', position: { x: 100, y: 200 }, data: { description: 'Workflow Start' } },
    { id: 'upload-1', type: 'action', position: { x: 400, y: 200 }, data: { description: 'Upload Invoice' } },
    { id: 'end', type: 'end', position: { x: 700, y: 200 }, data: { description: 'Workflow End' } },
  ];

  const initialEdges: Edge[] = [
    { id: 'e-start-upload-1', source: 'start', target: 'upload-1', animated: true },
  ];

  const initialSettings: WorkflowSettings = {
    name: 'Custom Workflow',
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

  const addNode = (type: NodeType, taskType?: string) => {
    let description = `New ${type} node`;
    
    // Set specific descriptions based on task type
    if (taskType) {
      switch (taskType) {
        case 'upload':
          description = 'Upload File';
          break;
        case 'download':
          description = 'Download File';
          break;
        case 'update':
          description = 'Update File';
          break;
        case 'consolidate':
          description = 'Consolidate Files';
          break;
        case 'decision':
          description = 'Decision Point';
          break;
        default:
          description = `New ${type} node`;
      }
    }

    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 100 },
      data: { description },
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

  // Header actions for workflow designer
  const headerActions = (
    <>
      {workflowSettings.name && (
        <Badge variant="secondary" className="ml-4">
          <Sparkles className="h-3 w-3 mr-1" />
          {workflowSettings.name}
        </Badge>
      )}
      <Button onClick={handleCreateNew} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        New
      </Button>
      <Button 
        onClick={handleDeploy} 
        variant="default" 
        size="sm"
        disabled={isDeploying}
        className="bg-success hover:bg-success/90"
      >
        {isDeploying ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            Deploying...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Deploy
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDeleteNode}
        disabled={!selectedNodeId || ['start', 'end'].includes(selectedNodeId)}
        className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </>
  );

  return (
    <MainLayout
      title="Workflow Designer"
      subtitle="Build and manage your workflows"
      icon={Workflow}
      headerActions={headerActions}
    >
      <div className="h-full flex">
          {/* Left Palette */}
          <motion.aside
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="w-24 glass rounded-l-xl rounded-r-none p-4 z-10"
          >
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">Tools</h2>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    onClick={() => addNode('action', 'upload')} 
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-cyan-600 border border-cyan-500 p-2 transition-all hover:bg-cyan-500 hover:scale-105 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="h-6 w-6 text-white" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">File Upload Task</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    onClick={() => addNode('action', 'download')} 
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-teal-700 border border-teal-600 p-2 transition-all hover:bg-teal-600 hover:scale-105 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="h-6 w-6 text-white" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">File Download Task</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    onClick={() => addNode('action', 'update')} 
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-purple-700 border border-purple-600 p-2 transition-all hover:bg-purple-600 hover:scale-105 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UpdateIcon className="h-6 w-6 text-white" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">File Update Task</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    onClick={() => addNode('action', 'consolidate')} 
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-green-700 border border-green-600 p-2 transition-all hover:bg-green-600 hover:scale-105 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ConsolidateIcon className="h-6 w-6 text-white" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">Consolidate Files Task</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    onClick={() => addNode('decision', 'decision')} 
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-blue-700 border border-blue-600 p-2 transition-all hover:bg-blue-600 hover:scale-105 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DecisionIcon className="h-6 w-6 text-white" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">Decision Task</TooltipContent>
              </Tooltip>
              
              <div className="my-2 h-px w-full bg-border" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    onClick={() => setIsSettingsOpen(true)} 
                    className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl bg-muted/50 border border-border p-2 transition-all hover:bg-muted hover:scale-105 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground mt-1">Settings</span>
                  </motion.div>
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
            className="flex-1 glass rounded-r-xl rounded-l-none overflow-hidden"
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
              className="bg-transparent"
            >
              <Controls className="!bottom-4 !left-4" />
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
        </div>
    </MainLayout>
  );
};

export default Home;