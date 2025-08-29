import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, Upload, Download, Settings, Sparkles, Workflow as WorkflowIcon } from 'lucide-react';
import ReactFlow, {
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection as ReactFlowConnection,
  Edge,
  Node,
  getSmoothStepPath,
  EdgeProps,
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
import {
  Workflow,
  WorkflowTask,
  CreateWorkflowDto,
  TaskType,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
} from '@/lib/workflowApi';
import { useUser } from '@/context/UserContext';

// Icon components (assuming they are defined elsewhere or here)
const UpdateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);
const ConsolidateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 8h3a2 2 0 0 1 2 2v3" /><path d="M21 8h-3a2 2 0 0 0-2 2v3" /><path d="M8 13v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3" /><path d="M12 13v8" /></svg>
);
const DecisionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L22 12L12 22L2 12Z" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
);

const GoBackEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 16 });
  return <path id={id} style={{ ...style, stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '8,4', fill: 'none' }} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />;
};

const initialNodes: Node<NodeData>[] = [
  { id: 'start', type: 'start', position: { x: 100, y: 200 }, data: { description: 'Workflow Start' } },
  { id: 'end', type: 'end', position: { x: 700, y: 200 }, data: { description: 'Workflow End' } },
];

const CanvasWorkflowPage: NextPage = () => {
  const { user } = useUser();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    // Load a default workflow or a specific one via query param
    const loadWorkflow = async () => {
      try {
        // Load the comprehensive mock workflow by default
        const wf = await getWorkflowById(1);
        setWorkflow(wf);
        if (wf.tasks) {
          const flowNodes = wf.tasks.map((task, index) => ({
            id: task.taskId.toString(),
            type: task.taskType === 'DECISION' ? 'decision' : 'action',
            position: { x: 250 + index * 200, y: 200 + (index % 2) * 100 },
            data: {
              description: task.name,
              taskType: task.taskType,
              ...task
            } as NodeData,
          }));
          setNodes([...initialNodes, ...flowNodes]);
          
          // Create connections between tasks based on sequence order and decision outcomes
          const newEdges: any[] = [];
          wf.tasks.forEach((task, index) => {
            if (index === 0) {
              // Connect start to first task
              newEdges.push({
                id: `start-${task.taskId}`,
                source: 'start',
                target: task.taskId.toString(),
                type: 'default',
                style: { stroke: '#3b82f6', strokeWidth: 2 }
              });
            }
            
            if (task.decisionOutcomes && task.decisionOutcomes.length > 0) {
              // Connect decision outcomes
              task.decisionOutcomes.forEach((outcome, outcomeIndex) => {
                newEdges.push({
                  id: `${task.taskId}-${outcome.nextTaskId}-${outcomeIndex}`,
                  source: task.taskId.toString(),
                  target: outcome.nextTaskId.toString(),
                  type: outcome.outcomeName === 'REJECT' ? 'goBack' : 'default',
                  style: outcome.outcomeName === 'REJECT' 
                    ? { stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '8,4' }
                    : { stroke: '#3b82f6', strokeWidth: 2 },
                  label: outcome.outcomeName
                });
              });
            } else if (index < wf.tasks.length - 1) {
              // Connect to next task in sequence
              const nextTask = wf.tasks[index + 1];
              newEdges.push({
                id: `${task.taskId}-${nextTask.taskId}`,
                source: task.taskId.toString(),
                target: nextTask.taskId.toString(),
                type: 'default',
                style: { stroke: '#3b82f6', strokeWidth: 2 }
              });
            }
            
            if (index === wf.tasks.length - 1) {
              // Connect last task to end
              newEdges.push({
                id: `${task.taskId}-end`,
                source: task.taskId.toString(),
                target: 'end',
                type: 'default',
                style: { stroke: '#3b82f6', strokeWidth: 2 }
              });
            }
          });
          
          setEdges(newEdges);
        }
      } catch (error) {
        console.error("Failed to load workflow", error);
        // Don't show error toast, just continue with empty workflow
        // Set a default workflow structure for demo
        setWorkflow({
          workflowId: 0,
          name: 'Custom Workflow',
          description: 'New workflow from canvas',
          reminderBeforeDueMins: 60,
          minutesAfterDue: 30,
          escalationAfterMins: 120,
          dueInMins: 1440,
          isActive: 'Y',
          calendarId: null,
          createdBy: 'canvas-user@example.com',
          createdOn: new Date().toISOString(),
          updatedBy: null,
          updatedOn: null,
          tasks: [],
          workflowRoles: [],
          parameters: []
        });
      }
    };
    loadWorkflow(); // Load the workflow by default to show comprehensive example
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params: ReactFlowConnection | Edge) => {
    const newEdge = { ...params, type: 'default', style: { stroke: '#3b82f6', strokeWidth: 2 } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    toast.success('Connection removed!');
  }, [selectedEdgeId, setEdges]);

  const handleToggleEdgeType = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === selectedEdgeId
          ? { ...edge, type: edge.type === 'goBack' ? 'default' : 'goBack' }
          : edge
      )
    );
  }, [selectedEdgeId, setEdges]);

  const validateWorkflow = useCallback(() => {
    if (nodes.length <= 2) {
      toast.error('Please add at least one task to the workflow.');
      return false;
    }
    if (!workflow?.name) {
      toast.error('Please provide a name for the workflow in settings.');
      return false;
    }
    return true;
  }, [nodes, workflow]);

  const handleSaveSettings = (settings: Partial<Workflow>) => {
    setWorkflow(prev => ({ ...(prev || {} as Workflow), ...settings }));
    toast.success('Workflow settings saved!');
  };

  const handleCreateNew = () => {
    setNodes(initialNodes);
    setEdges([]);
    setWorkflow(null);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    toast.success('New workflow canvas cleared!');
  };

  const handleDeploy = async () => {
    if (!validateWorkflow() || !workflow) return;

    setIsDeploying(true);
    toast.info('Saving workflow...');

    const tasksToCreate = nodes
      .filter(n => n.type !== 'start' && n.type !== 'end')
      .map((node, index) => {
        const { data } = node;
        return {
          name: data.description || 'Unnamed Task',
          taskType: (data.taskType || 'FILE_UPLOAD') as TaskType,
          roleId: data.roleId || 1, // Default to role 1 if not set
          sequenceOrder: index + 1,
          expectedCompletion: data.expectedCompletion || 60,
          // Add other task properties from your form/data model
          escalationRules: data.escalationRules || "Default escalation",
          canBeRevisited: data.canBeRevisited || 'N',
          maxRevisits: data.maxRevisits || 0,
          fileSelectionMode: data.fileSelectionMode || 'USER_SELECT',
          taskDescription: data.taskDescription || data.description || '',
          taskPriority: data.taskPriority || 'MEDIUM',
          autoEscalationEnabled: data.autoEscalationEnabled || 'N',
          notificationRequired: data.notificationRequired || 'N',
          allowNewFiles: data.allowNewFiles || 'Y',
          fileRetentionDays: data.fileRetentionDays || 30,
        };
      });

    try {
      if (workflow.workflowId) {
        // Update existing workflow
        const updatePayload = {
          name: workflow.name,
          description: workflow.description || '',
          reminderBeforeDueMins: workflow.reminderBeforeDueMins || 60,
          minutesAfterDue: workflow.minutesAfterDue || 30,
          escalationAfterMins: workflow.escalationAfterMins || 120,
          dueInMins: workflow.dueInMins || 1440,
          isActive: workflow.isActive || 'Y',
          calendarId: workflow.calendarId || null,
          updatedBy: user?.email || 'system',
        };
        const updatedWorkflow = await updateWorkflow(workflow.workflowId, updatePayload);
        // Here you would handle task updates/creations/deletions which is more complex
        toast.success(`Workflow "${updatedWorkflow.name}" updated successfully!`);
      } else {
        // Create new workflow
        const createPayload: CreateWorkflowDto = {
          name: workflow.name,
          description: workflow.description || 'New workflow from canvas.',
          reminderBeforeDueMins: workflow.reminderBeforeDueMins || 60,
          minutesAfterDue: workflow.minutesAfterDue || 30,
          escalationAfterMins: workflow.escalationAfterMins || 120,
          dueInMins: workflow.dueInMins || 1440,
          isActive: 'Y',
          calendarId: workflow.calendarId || null,
          createdBy: user?.email || 'canvas-user@example.com',
          tasks: tasksToCreate,
          workflowRoles: workflow.workflowRoles || [],
          parameters: workflow.parameters || [],
        };
        const newWorkflow = await createWorkflow(createPayload);
        setWorkflow(newWorkflow);
        toast.success(`Workflow "${newWorkflow.name}" created successfully!`);
      }
    } catch (error) {
      console.error('Failed to save workflow', error);
      toast.error('Failed to save workflow. Check console for details.');
    } finally {
      setIsDeploying(false);
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, []);

  const addNode = (type: NodeType, taskType: TaskType) => {
    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 100 },
      data: { description: `New ${taskType}`, taskType },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleUpdateNode = useCallback((nodeId: string, data: Partial<NodeData>) => {
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
    toast.success('Node deleted!');
  }, [selectedNodeId, setNodes, setEdges]);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const nodeTypes = useMemo(() => ({ start: WorkflowNode, end: WorkflowNode, action: WorkflowNode, decision: WorkflowNode }), []);
  const edgeTypes = useMemo(() => ({ goBack: GoBackEdge }), []);

  const headerActions = (
    <>
      {workflow?.name && <Badge variant="secondary"><Sparkles className="h-3 w-3 mr-1" />{workflow.name}</Badge>}
      <Button onClick={handleCreateNew} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />New</Button>
      <Button onClick={handleDeploy} variant="default" size="sm" disabled={isDeploying} className="bg-success text-success-foreground hover:bg-success/90">
        {isDeploying ? <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />Saving...</> : <><Play className="mr-2 h-4 w-4" />Save</>}
      </Button>
      {selectedNodeId && !['start', 'end'].includes(selectedNodeId) && (
        <Button variant="outline" size="sm" onClick={handleDeleteNode} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
          <Trash2 className="mr-2 h-4 w-4" />Delete Node
        </Button>
      )}
      {selectedEdgeId && (
        <>
          <Button variant="outline" size="sm" onClick={handleToggleEdgeType}>Toggle Type</Button>
          <Button variant="outline" size="sm" onClick={handleDeleteEdge} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 className="mr-2 h-4 w-4" />Delete Connection
          </Button>
        </>
      )}
    </>
  );

  return (
    <MainLayout title="Canvas Workflow" subtitle="Visually design and configure your workflows" icon={WorkflowIcon} headerActions={headerActions}>
      <div className="h-full flex">
        <motion.aside initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-24 glass rounded-l-xl rounded-r-none p-4 z-10">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">Tools</h2>
            <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'FILE_UPLOAD')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Upload className="h-6 w-6 text-cyan-600" /></motion.div></TooltipTrigger><TooltipContent side="right">File Upload</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'FILE_DOWNLOAD')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Download className="h-6 w-6 text-teal-700" /></motion.div></TooltipTrigger><TooltipContent side="right">File Download</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'FILE_UPDATE')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><UpdateIcon className="h-6 w-6 text-purple-700" /></motion.div></TooltipTrigger><TooltipContent side="right">File Update</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'CONSOLIDATE_FILE')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><ConsolidateIcon className="h-6 w-6 text-green-700" /></motion.div></TooltipTrigger><TooltipContent side="right">Consolidate Files</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('decision', 'DECISION')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><DecisionIcon className="h-6 w-6 text-blue-700" /></motion.div></TooltipTrigger><TooltipContent side="right">Decision</TooltipContent></Tooltip>
            <div className="my-2 h-px w-full bg-border" />
            <Tooltip><TooltipTrigger asChild><motion.div onClick={() => setIsSettingsOpen(true)} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-border/50 p-2 transition-all hover:bg-muted/20 group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Settings className="h-6 w-6 text-muted-foreground group-hover:text-foreground" /></motion.div></TooltipTrigger><TooltipContent side="right">Workflow Settings</TooltipContent></Tooltip>
          </div>
        </motion.aside>

        <motion.main initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex-1 glass rounded-r-xl rounded-l-none overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-transparent"
            connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 3 }}
            snapToGrid={true}
            snapGrid={[20, 20]}
            connectionRadius={50}
            minZoom={0.1}
            maxZoom={3}
            proOptions={{ hideAttribution: true }}
          >
            <Controls className="!bottom-4 !left-4" />
          </ReactFlow>
        </motion.main>
        
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onClose={() => setSelectedNodeId(null)}
          roles={workflow?.workflowRoles || []}
          allNodes={nodes}
          edges={edges}
        />

        <WorkflowSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          settings={workflow}
        />
      </div>
    </MainLayout>
  );
};

export default CanvasWorkflowPage;