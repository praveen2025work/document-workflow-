import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, Upload, Download, Settings, Sparkles, Workflow as WorkflowIcon, FileUp, Save, X, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  CreateWorkflowDto,
  TaskType,
  ComprehensiveWorkflowDto,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
  searchWorkflows,
  createComprehensiveWorkflow,
  convertCanvasToComprehensive,
  deleteWorkflow,
} from '@/lib/workflowApi';
import { startWorkflowWithCalendar, startWorkflowWithoutCalendar } from '@/lib/executionApi';
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

const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 16 });
  return <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />;
};

const GoBackEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 16 });
  return <path id={id} style={{ ...style, stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '8,4', fill: 'none' }} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />;
};

const initialNodes: Node<NodeData>[] = [
  { id: 'start', type: 'start', position: { x: 50, y: 400 }, data: { description: 'Workflow Start' } },
  { id: 'end', type: 'end', position: { x: 1200, y: 400 }, data: { description: 'Workflow End' } },
];

const CanvasWorkflowPage: NextPage = () => {
  const { user } = useUser();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('4');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewWorkflowDialogOpen, setIsNewWorkflowDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const convertWorkflowToCanvas = (wf: Workflow) => {
    const tasks = wf.tasks || [];
    const baseInitialNodes = [
      { ...initialNodes[0], position: { ...initialNodes[0].position, y: 200 } },
      { ...initialNodes[1], position: { ...initialNodes[1].position, y: 200 } },
    ];

    if (tasks.length === 0) {
      return { nodes: baseInitialNodes, edges: [] };
    }

    // --- Layout Calculation using Topological Sort ---
    const taskMap = new Map(tasks.map(t => [t.taskId, t]));
    const sequenceMap = new Map(tasks.map(t => [t.taskSequence, t]));
    
    const adj = new Map<number, number[]>();
    const inDegree = new Map<number, number>();

    tasks.forEach(task => {
      adj.set(task.taskId, []);
      inDegree.set(task.taskId, 0);
    });

    // Build a temporary graph for layout, ignoring back-edges
    tasks.forEach(task => {
      const addForwardEdge = (from: number, to: number) => {
        if (!adj.get(from)?.includes(to)) {
            adj.get(from)?.push(to);
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }
      };

      // Children from parentTaskSequences
      const children = tasks.filter(t => t.parentTaskSequences?.includes(task.taskSequence!));
      children.forEach(child => {
        if (child.taskSequence > task.taskSequence) {
          addForwardEdge(task.taskId, child.taskId);
        }
      });

      // Children from decision outcomes
      if (task.taskType === 'DECISION' && task.decisionOutcomes) {
        task.decisionOutcomes.forEach(outcome => {
          if (outcome.nextTaskId) {
            const target = taskMap.get(outcome.nextTaskId);
            const isGoBack = (outcome.outcomeName.toLowerCase().includes('resubmit') || outcome.outcomeName.toLowerCase().includes('reject')) || (target && task.taskSequence && target.taskSequence < task.taskSequence);
            if (target && !isGoBack) {
              addForwardEdge(task.taskId, target.taskId);
            }
          }
        });
      }
    });

    const queue: number[] = [];
    tasks.forEach(task => {
      if (inDegree.get(task.taskId) === 0) {
        queue.push(task.taskId);
      }
    });

    const levels = new Map<number, number[]>();
    let level = 0;
    while (queue.length > 0) {
      const levelSize = queue.length;
      levels.set(level, []);
      for (let i = 0; i < levelSize; i++) {
        const u = queue.shift()!;
        levels.get(level)!.push(u);
        
        adj.get(u)?.forEach(v => {
          inDegree.set(v, (inDegree.get(v) || 1) - 1);
          if (inDegree.get(v) === 0) {
            queue.push(v);
          }
        });
      }
      level++;
    }

    // Position nodes
    const nodePositions = new Map<string, { x: number; y: number }>();
    const xSpacing = 275;
    const ySpacing = 175;
    const startX = 250;

    let maxLevel = 0;
    levels.forEach((levelTasks, lvl) => {
      maxLevel = Math.max(maxLevel, lvl);
      const yOffset = -(levelTasks.length - 1) * ySpacing / 2;
      levelTasks.forEach((taskId, index) => {
        nodePositions.set(taskId.toString(), {
          x: startX + lvl * xSpacing,
          y: yOffset + index * ySpacing,
        });
      });
    });
    
    let cycleIndex = 0;
    tasks.forEach(task => {
        if(!nodePositions.has(task.taskId.toString())) {
            const fallbackLevel = Math.max(maxLevel + 1, task.sequenceOrder || 0);
            nodePositions.set(task.taskId.toString(), {
                x: startX + fallbackLevel * xSpacing,
                y: 400 + cycleIndex * ySpacing
            });
            cycleIndex++;
        }
    });

    const taskNodes: Node<NodeData>[] = tasks.map((task) => ({
      id: task.taskId.toString(),
      type: task.taskType === 'DECISION' ? 'decision' : 'action',
      position: nodePositions.get(task.taskId.toString()) || { x: 250, y: 150 },
      data: { description: task.name, taskType: task.taskType, ...task } as NodeData,
    }));

    // --- Edge Creation (same as original) ---
    const newEdges: Edge[] = [];
    const allTaskIds = tasks.map(t => t.taskId);

    tasks.forEach(task => {
        const taskIdStr = task.taskId.toString();

        if (!task.parentTaskSequences || task.parentTaskSequences.length === 0) {
            newEdges.push({ id: `start-${taskIdStr}`, source: 'start', target: taskIdStr, type: 'default', style: { stroke: '#3b82f6', strokeWidth: 2 } });
        } else {
            task.parentTaskSequences.forEach(parentSeq => {
                const parentTask = wf.tasks.find(t => t.taskSequence === parentSeq);
                if (parentTask) {
                    const edgeId = `${parentTask.taskId.toString()}-${taskIdStr}`;
                    if (!newEdges.some(e => e.id === edgeId)) {
                        newEdges.push({ id: edgeId, source: parentTask.taskId.toString(), target: taskIdStr, type: 'default', style: { stroke: '#3b82f6', strokeWidth: 2 } });
                    }
                }
            });
        }

        if (task.decisionOutcomes && task.decisionOutcomes.length > 0) {
            task.decisionOutcomes.forEach((outcome, outcomeIndex) => {
                if (outcome.nextTaskId && allTaskIds.includes(outcome.nextTaskId)) {
                    const targetTask = wf.tasks.find(t => t.taskId === outcome.nextTaskId);
                    const isGoBack = (outcome.outcomeName.toLowerCase().includes('resubmit') || outcome.outcomeName.toLowerCase().includes('reject')) || (targetTask && task.taskSequence && targetTask.taskSequence < task.taskSequence);
                    
                    newEdges.push({
                        id: `${taskIdStr}-${outcome.nextTaskId}-${outcomeIndex}`,
                        source: taskIdStr,
                        target: outcome.nextTaskId.toString(),
                        type: isGoBack ? 'goBack' : 'default',
                        style: isGoBack ? { stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '8,4' } : { stroke: '#3b82f6', strokeWidth: 2 },
                        label: outcome.outcomeName
                    });
                } else {
                    newEdges.push({
                        id: `${taskIdStr}-end-${outcomeIndex}`,
                        source: taskIdStr,
                        target: 'end',
                        type: 'default',
                        style: { stroke: '#22c55e', strokeWidth: 2 },
                        label: outcome.outcomeName
                    });
                }
            });
        } else {
            const isParent = (wf.tasks || []).some(childTask => childTask.parentTaskSequences?.includes(task.taskSequence!));
            if (!isParent) {
                newEdges.push({ id: `${taskIdStr}-end`, source: taskIdStr, target: 'end', type: 'default', style: { stroke: '#3b82f6', strokeWidth: 2 } });
            }
        }
    });
    
    const yPositions = Array.from(nodePositions.values()).map(p => p.y);
    const minY = yPositions.length > 0 ? Math.min(...yPositions) : 200;
    const maxY = yPositions.length > 0 ? Math.max(...yPositions) : 200;
    const avgY = (minY + maxY) / 2;

    const endNodeX = startX + (maxLevel + 1) * xSpacing;

    const finalNodes = [
        { ...initialNodes[0], position: { x: 50, y: avgY } },
        { ...initialNodes[1], position: { x: endNodeX, y: avgY } },
        ...taskNodes
    ];

    return { nodes: finalNodes, edges: newEdges };
  };

  const loadWorkflow = useCallback(async (workflowId: string | number) => {
    try {
      const wf = await getWorkflowById(Number(workflowId));
      if (!wf) {
        throw new Error('Workflow not found');
      }
      setWorkflow(wf);
      const { nodes: canvasNodes, edges: canvasEdges } = convertWorkflowToCanvas(wf);
      setNodes(canvasNodes);
      setEdges(canvasEdges);
      toast.success(`Loaded workflow: ${wf.name}`);
    } catch (error) {
      console.error("Failed to load workflow", error);
      toast.error("Failed to load workflow.");
      // Set a default workflow structure
      const defaultWorkflow: Workflow = {
        workflowId: 0, 
        name: 'Custom Workflow', 
        description: 'New workflow from canvas',
        triggerType: 'MANUAL',
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
      };
      setWorkflow(defaultWorkflow);
      setNodes(initialNodes);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    const fetchAllWorkflows = async () => {
      try {
        const response = await searchWorkflows('', 'Y', 0, 50);
        setAllWorkflows(response.content);
      } catch (error) {
        console.error("Failed to fetch workflows", error);
        toast.error("Could not load workflow list.");
      }
    };
    fetchAllWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflowId) {
      loadWorkflow(selectedWorkflowId);
    }
  }, [selectedWorkflowId, loadWorkflow]);

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
    setIsNewWorkflowDialogOpen(true);
  };

  const handleCreateNewWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast.error('Please provide a workflow name.');
      return;
    }

    if (!user) {
      toast.error('User not found.');
      return;
    }

    try {
      // Create a new workflow object
      const newWorkflow: Workflow = {
        workflowId: 0,
        name: newWorkflowName.trim(),
        description: newWorkflowDescription.trim() || 'New workflow created from canvas',
        triggerType: 'MANUAL',
        reminderBeforeDueMins: 60,
        minutesAfterDue: 30,
        escalationAfterMins: 120,
        dueInMins: 1440,
        isActive: 'Y',
        calendarId: null,
        createdBy: user.email,
        createdOn: new Date().toISOString(),
        updatedBy: null,
        updatedOn: null,
        tasks: [],
        workflowRoles: [],
        parameters: []
      };

      setWorkflow(newWorkflow);
      setNodes(initialNodes);
      setEdges([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedWorkflowId('');
      
      // Close dialog and reset form
      setIsNewWorkflowDialogOpen(false);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      
      toast.success(`New workflow "${newWorkflow.name}" created!`);
    } catch (error) {
      console.error('Failed to create new workflow:', error);
      toast.error('Failed to create new workflow.');
    }
  };

  const handleSaveWorkflow = async () => {
    if (!validateWorkflow() || !workflow || !user) return;

    setIsSaving(true);
    toast.info('Saving workflow...');

    try {
      let savedWorkflow = workflow;
      
      if (workflow.workflowId === 0) {
        // Create new comprehensive workflow
        const comprehensiveWorkflow = convertCanvasToComprehensive(
          workflow.name,
          workflow.description || 'New workflow from canvas.',
          nodes,
          edges,
          workflow.workflowRoles || [],
          user.email
        );

        savedWorkflow = await createComprehensiveWorkflow(comprehensiveWorkflow);
        setWorkflow(savedWorkflow);
        setSelectedWorkflowId(savedWorkflow.workflowId.toString());
        
        // Refresh the workflows list
        const response = await searchWorkflows('', 'Y', 0, 50);
        setAllWorkflows(response.content);
        
        toast.success(`Workflow "${savedWorkflow.name}" created and saved successfully!`);
      } else {
        // Update existing workflow
        const comprehensiveWorkflow = convertCanvasToComprehensive(
          workflow.name,
          workflow.description || 'Updated workflow from canvas.',
          nodes,
          edges,
          workflow.workflowRoles || [],
          user.email
        );

        // For updates, we need to use the update API
        const updateData = {
          name: workflow.name,
          description: workflow.description,
          reminderBeforeDueMins: workflow.reminderBeforeDueMins,
          minutesAfterDue: workflow.minutesAfterDue,
          escalationAfterMins: workflow.escalationAfterMins,
          isActive: workflow.isActive,
          updatedBy: user.email
        };

        savedWorkflow = await updateWorkflow(workflow.workflowId, updateData);
        setWorkflow(savedWorkflow);
        
        // Refresh the workflows list
        const response = await searchWorkflows('', 'Y', 0, 50);
        setAllWorkflows(response.content);
        
        toast.success(`Workflow "${savedWorkflow.name}" updated successfully!`);
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportFromJson = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data to import.');
      return;
    }

    setIsImporting(true);
    try {
      const workflowData: ComprehensiveWorkflowDto = JSON.parse(jsonInput);
      
      if (!workflowData.name || !workflowData.tasks || !Array.isArray(workflowData.tasks)) {
        toast.error('Invalid JSON structure. Please ensure it contains name and tasks array.');
        setIsImporting(false);
        return;
      }

      const createdWorkflow = await createComprehensiveWorkflow(workflowData);
      
      const { nodes: canvasNodes, edges: canvasEdges } = convertWorkflowToCanvas(createdWorkflow);
      setNodes(canvasNodes);
      setEdges(canvasEdges);
      setWorkflow(createdWorkflow);
      
      setIsImportDialogOpen(false);
      setJsonInput('');
      
      toast.success(`Successfully imported workflow: ${createdWorkflow.name}`);
      
    } catch (error) {
      console.error('Failed to import workflow from JSON:', error);
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format. Please check your JSON syntax.');
      } else {
        toast.error('Failed to import workflow. Please check the JSON structure.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeploy = async () => {
    if (!validateWorkflow() || !workflow || !user) return;

    setIsDeploying(true);
    toast.info('Creating comprehensive workflow...');

    try {
      // First, ensure the workflow definition is saved using comprehensive format
      let savedWorkflow = workflow;
      if (workflow.workflowId === 0) { // Assuming 0 is for a new workflow
        // Convert canvas workflow to comprehensive format
        const comprehensiveWorkflow = convertCanvasToComprehensive(
          workflow.name,
          workflow.description || 'New workflow from canvas.',
          nodes,
          edges,
          workflow.workflowRoles || [],
          user.email
        );

        // Create the comprehensive workflow
        savedWorkflow = await createComprehensiveWorkflow(comprehensiveWorkflow);
        setWorkflow(savedWorkflow);
        toast.success(`Comprehensive workflow "${savedWorkflow.name}" created successfully!`);
      }

      // Now, start the workflow instance
      toast.info('Starting workflow instance...');
      if (savedWorkflow.calendarId) {
        await startWorkflowWithCalendar({
          workflowId: savedWorkflow.workflowId,
          startedBy: user.userId,
          calendarId: savedWorkflow.calendarId,
          triggeredBy: 'manual',
          scheduledStartTime: new Date().toISOString(),
        });
      } else {
        await startWorkflowWithoutCalendar({
          workflowId: savedWorkflow.workflowId,
          startedBy: user.userId,
          triggeredBy: 'manual',
          scheduledStartTime: null,
        });
      }
      toast.success('Workflow instance started successfully!');

    } catch (error) {
      console.error('Failed to deploy comprehensive workflow', error);
      toast.error('Failed to deploy workflow. Check console for details.');
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

  const handleDeleteWorkflow = async () => {
    if (!workflow || workflow.workflowId === 0) {
      toast.error('No workflow selected to delete.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWorkflow(workflow.workflowId);
      
      // Refresh the workflows list
      const response = await searchWorkflows('', 'Y', 0, 50);
      setAllWorkflows(response.content);
      
      // Reset to default state
      const defaultWorkflow: Workflow = {
        workflowId: 0,
        name: 'Custom Workflow',
        description: 'New workflow from canvas',
        triggerType: 'MANUAL',
        reminderBeforeDueMins: 60,
        minutesAfterDue: 30,
        escalationAfterMins: 120,
        dueInMins: 1440,
        isActive: 'Y',
        calendarId: null,
        createdBy: user?.email || 'canvas-user@example.com',
        createdOn: new Date().toISOString(),
        updatedBy: null,
        updatedOn: null,
        tasks: [],
        workflowRoles: [],
        parameters: []
      };
      
      setWorkflow(defaultWorkflow);
      setNodes(initialNodes);
      setEdges([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedWorkflowId('');
      
      toast.success('Workflow deleted successfully!');
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error('Failed to delete workflow. Check console for details.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (selectedNodeId) {
          handleDeleteNode();
        }
        if (selectedEdgeId) {
          handleDeleteEdge();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, selectedEdgeId, handleDeleteNode, handleDeleteEdge]);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const nodeTypes = useMemo(() => ({ start: WorkflowNode, end: WorkflowNode, action: WorkflowNode, decision: WorkflowNode }), []);
  const edgeTypes = useMemo(() => ({ goBack: GoBackEdge, default: CustomEdge }), []);

  const headerActions = (
    <>
      <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
        <SelectTrigger className="w-[280px] h-9">
          <SelectValue placeholder="Select a workflow..." />
        </SelectTrigger>
        <SelectContent>
          {allWorkflows.map((wf) => (
            <SelectItem key={wf.workflowId} value={wf.workflowId.toString()}>
              {wf.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleCreateNew} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />New</Button>
      <Button onClick={handleSaveWorkflow} variant="outline" size="sm" disabled={isSaving}>
        {isSaving ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save
          </>
        )}
      </Button>
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm"><FileUp className="mr-2 h-4 w-4" />Import JSON</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Workflow from JSON</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="json-input" className="text-sm font-medium">
                Paste your comprehensive workflow JSON here:
              </label>
              <Textarea
                id="json-input"
                placeholder="Paste your JSON workflow definition here..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportFromJson} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Import Workflow
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button onClick={handleDeploy} variant="default" size="sm" disabled={isDeploying} className="bg-success text-success-foreground hover:bg-success/90">
        {isDeploying ? <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />Deploying...</> : <><Play className="mr-2 h-4 w-4" />Deploy</>}
      </Button>
      {workflow && workflow.workflowId !== 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Workflow
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Workflow
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the workflow "{workflow.name}"? This action cannot be undone and will permanently remove the workflow and all its tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWorkflow}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Workflow
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {selectedNodeId && !['start', 'end'].includes(selectedNodeId) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleDeleteNode} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Node (or press Delete)</TooltipContent>
        </Tooltip>
      )}
      {selectedEdgeId && (
        <>
          <Button variant="outline" size="sm" onClick={handleToggleEdgeType}>Toggle Type</Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleDeleteEdge} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Connection (or press Delete)</TooltipContent>
          </Tooltip>
        </>
      )}
    </>
  );

  return (
    <MainLayout title="Canvas Workflow" subtitle="Visually design and configure your workflows" icon={WorkflowIcon}>
      <div className="h-full flex flex-col">
        {/* Workflow Management Header */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border/30 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Workflow Management</span>
              
              <div className="flex items-center gap-3">
                {/* Workflow Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current:</span>
                  <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue placeholder="Select workflow..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allWorkflows.map((wf) => (
                        <SelectItem key={wf.workflowId} value={wf.workflowId.toString()}>
                          {wf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-6 w-px bg-border" />

                {/* Workflow Actions */}
                <div className="flex items-center gap-2">
                  <Button onClick={handleCreateNew} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>

                  <Button onClick={handleSaveWorkflow} variant="outline" size="sm" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>

                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileUp className="h-4 w-4 mr-1" />
                        Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Import Workflow from JSON</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="json-input" className="text-sm font-medium">
                            Paste your comprehensive workflow JSON here:
                          </label>
                          <Textarea
                            id="json-input"
                            placeholder="Paste your JSON workflow definition here..."
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="min-h-[400px] font-mono text-sm"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleImportFromJson} disabled={isImporting}>
                            {isImporting ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <FileUp className="mr-2 h-4 w-4" />
                                Import Workflow
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={handleDeploy} variant="default" size="sm" disabled={isDeploying} className="bg-success text-success-foreground hover:bg-success/90">
                    {isDeploying ? (
                      <>
                        <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Deploy
                      </>
                    )}
                  </Button>

                  {workflow && workflow.workflowId !== 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Workflow
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the workflow "{workflow.name}"? This action cannot be undone and will permanently remove the workflow and all its tasks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteWorkflow}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Workflow
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>

            {/* Node/Edge Actions */}
            <div className="flex items-center gap-2">
              {selectedNodeId && !['start', 'end'].includes(selectedNodeId) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDeleteNode} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Node
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Node (or press Delete)</TooltipContent>
                </Tooltip>
              )}
              {selectedEdgeId && (
                <>
                  <Button variant="outline" size="sm" onClick={handleToggleEdgeType}>
                    Toggle Type
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleDeleteEdge} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Connection
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Connection (or press Delete)</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          <motion.aside initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-24 glass rounded-l-xl rounded-r-none p-4 z-10">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">Tools</h2>
              <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'FILE_UPLOAD')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Upload className="h-6 w-6 text-cyan-600" /></motion.div></TooltipTrigger><TooltipContent side="right">File Upload</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'FILE_DOWNLOAD')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Download className="h-6 w-6 text-teal-700" /></motion.div></TooltipTrigger><TooltipContent side="right">File Download</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'FILE_UPDATE')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><UpdateIcon className="h-6 w-6 text-purple-700" /></motion.div></TooltipTrigger><TooltipContent side="right">File Update</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><motion.div onClick={() => addNode('action', 'CONSOLIDATE_FILES')} className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-white border border-border/50 p-2 transition-all hover:shadow-md group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><ConsolidateIcon className="h-6 w-6 text-green-700" /></motion.div></TooltipTrigger><TooltipContent side="right">Consolidate Files</TooltipContent></Tooltip>
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
              connectionRadius={30}
              minZoom={0.1}
              maxZoom={3}
              proOptions={{ hideAttribution: true }}
            >
              <Controls className="!bottom-4 !left-4" />
            </ReactFlow>
          </motion.main>
        </div>
        
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onClose={() => setSelectedNodeId(null)}
          roles={workflow?.workflowRoles || []}
          allNodes={nodes}
          edges={edges}
          onUpdateEdges={setEdges}
        />

        <WorkflowSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          settings={workflow}
        />

        {/* New Workflow Dialog */}
        <Dialog open={isNewWorkflowDialogOpen} onOpenChange={setIsNewWorkflowDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name *</Label>
                <Input
                  id="workflow-name"
                  placeholder="Enter workflow name..."
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  placeholder="Enter workflow description..."
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsNewWorkflowDialogOpen(false);
                    setNewWorkflowName('');
                    setNewWorkflowDescription('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateNewWorkflow} disabled={!newWorkflowName.trim()}>
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CanvasWorkflowPage;