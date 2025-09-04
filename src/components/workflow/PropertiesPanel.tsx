import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Upload, FileText, Settings2, File, FolderOpen } from 'lucide-react';
import { Node } from 'reactflow';
import { NodeData } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { WorkflowRole, TaskPriority, FileSelectionMode, YesNo, DecisionOutcome, WorkflowTaskFile } from '@/types/workflow';

interface PropertiesPanelProps {
  selectedNode: Node<NodeData> | null;
  onUpdateNode: (nodeId: string, data: Partial<NodeData>) => void;
  onClose: () => void;
  roles: WorkflowRole[];
  allNodes?: Node<NodeData>[];
  edges?: any[];
  onUpdateEdges?: (edges: any[]) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNode, onClose, roles, allNodes = [], edges = [], onUpdateEdges }) => {
  const [formData, setFormData] = useState<Partial<NodeData>>({});

  useEffect(() => {
    if (selectedNode) {
      // Deep copy of node data to avoid unintended mutations
      const nodeData = JSON.parse(JSON.stringify(selectedNode.data));
      
      // Ensure decisionOutcomes is an array for DECISION nodes
      if (nodeData.taskType === 'DECISION') {
        if (!Array.isArray(nodeData.decisionOutcomes) || nodeData.decisionOutcomes.length === 0) {
          nodeData.decisionOutcomes = [{ outcomeName: '', nextTaskId: 0 }];
        }
      }
      
      setFormData(nodeData);
      
      // Recreate red dotted lines for existing decision outcomes
      if (nodeData.taskType === 'DECISION' && nodeData.decisionOutcomes && onUpdateEdges) {
        setTimeout(() => {
          nodeData.decisionOutcomes.forEach((outcome, index) => {
            if (outcome.nextTaskId && outcome.nextTaskId > 0) {
              const targetNodeId = findNodeIdByTaskId(outcome.nextTaskId);
              if (targetNodeId) {
                createDecisionOutcomeEdge(selectedNode.id, targetNodeId, outcome.outcomeName || `Outcome ${index + 1}`, index);
              }
            }
          });
        }, 100); // A slightly longer delay to ensure all state updates are processed
      }
    }
  }, [selectedNode?.id, selectedNode?.data]);

  const handleInputChange = (field: keyof NodeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, formData);
      toast.success('Properties saved successfully!');
    }
  };

  const handleDecisionOutcomeChange = (index: number, field: keyof DecisionOutcome, value: any) => {
    const newOutcomes = [...(formData.decisionOutcomes || [])];
    if (!newOutcomes[index]) {
      newOutcomes[index] = { outcomeName: '', nextTaskId: 0 };
    }
    
    // Update the specific field
    newOutcomes[index] = { ...newOutcomes[index], [field]: value };
    
    // Update the form data immediately
    const updatedFormData = { ...formData, decisionOutcomes: newOutcomes };
    setFormData(updatedFormData);
    
    // Also update the node data immediately to persist the change
    if (selectedNode) {
      onUpdateNode(selectedNode.id, updatedFormData);
    }
    
    // If nextTaskId is being changed and we have onUpdateEdges callback, create/update the decision edge immediately
    if (field === 'nextTaskId' && selectedNode && onUpdateEdges) {
      if (value && value > 0) {
        const targetNodeId = findNodeIdByTaskId(value);
        if (targetNodeId) {
          const outcomeName = newOutcomes[index].outcomeName || `Outcome ${index + 1}`;
          // Create the red dotted line immediately
          createDecisionOutcomeEdge(selectedNode.id, targetNodeId, outcomeName, index);
        }
      } else {
        // Remove existing decision edge for this outcome if nextTaskId is cleared
        removeDecisionOutcomeEdge(selectedNode.id, index);
      }
    }
    
    // If outcome name is being changed and nextTaskId exists, update the edge label
    if (field === 'outcomeName' && newOutcomes[index].nextTaskId && newOutcomes[index].nextTaskId > 0 && selectedNode && onUpdateEdges) {
      const targetNodeId = findNodeIdByTaskId(newOutcomes[index].nextTaskId);
      if (targetNodeId) {
        // Update the edge label immediately
        createDecisionOutcomeEdge(selectedNode.id, targetNodeId, value || `Outcome ${index + 1}`, index);
      }
    }
  };

  // Helper function to find node ID by task ID
  const findNodeIdByTaskId = (taskId: number): string | null => {
    const targetNode = allNodes.find(node => {
      // Check if node has a taskId in data
      if (node.data.taskId && node.data.taskId === taskId) {
        return true;
      }
      // Check if node id can be parsed as the taskId
      const nodeIdAsNumber = parseInt(node.id);
      if (!isNaN(nodeIdAsNumber) && nodeIdAsNumber === taskId) {
        return true;
      }
      // Check if node id matches taskId as string
      if (node.id === taskId.toString()) {
        return true;
      }
      return false;
    });
    return targetNode ? targetNode.id : null;
  };

  // Remove decision outcome edge for a specific outcome index
  const removeDecisionOutcomeEdge = (sourceNodeId: string, outcomeIndex: number) => {
    if (!onUpdateEdges) return;
    
    // Remove any existing decision edges from this source for the specific outcome index
    const updatedEdges = edges.filter(edge => {
      if (edge.source === sourceNodeId && edge.type === 'goBack') {
        // Remove edges that match the outcome index pattern
        return !edge.id.includes(`decision-${sourceNodeId}-`) || !edge.id.endsWith(`-${outcomeIndex}`);
      }
      return true;
    });
    
    // Update the edges
    onUpdateEdges(updatedEdges);
    
    console.log('Removed decision edge for outcome index:', outcomeIndex);
  };

  // Create or update decision outcome edge
  const createDecisionOutcomeEdge = (sourceNodeId: string, targetNodeId: string, outcomeName: string, outcomeIndex?: number) => {
    if (!onUpdateEdges) return;
    
    // Create a unique edge ID that includes the outcome index to avoid conflicts
    const newEdgeId = `decision-${sourceNodeId}-${targetNodeId}-${outcomeIndex !== undefined ? outcomeIndex : outcomeName.replace(/\s+/g, '-')}`;
    const newEdge = {
      id: newEdgeId,
      source: sourceNodeId,
      target: targetNodeId,
      type: 'goBack', // Use the red dotted line type
      style: { 
        stroke: '#ef4444', 
        strokeWidth: 3, 
        strokeDasharray: '8,4' 
      },
      label: outcomeName,
      animated: true,
      markerEnd: {
        type: 'arrowclosed',
        color: '#ef4444',
      }
    };

    // Remove any existing decision edges from this source for the same outcome index
    const updatedEdges = edges.filter(edge => {
      if (edge.source === sourceNodeId && edge.type === 'goBack') {
        // If we have an outcome index, remove edges with the same index pattern
        if (outcomeIndex !== undefined) {
          return !edge.id.endsWith(`-${outcomeIndex}`);
        }
        // Otherwise, remove edges with the same label
        return edge.label !== outcomeName;
      }
      return true;
    });
    
    // Add the new decision edge
    updatedEdges.push(newEdge);
    
    // Force update the edges immediately
    onUpdateEdges(updatedEdges);
    
    // Also log for debugging
    console.log('Created decision edge:', newEdge);
    console.log('Updated edges:', updatedEdges);
  };

  const addDecisionOutcome = () => {
    const newOutcomes = [...(formData.decisionOutcomes || []), { outcomeName: '', nextTaskId: 0 }];
    handleInputChange('decisionOutcomes', newOutcomes);
  };

  const removeDecisionOutcome = (index: number) => {
    const newOutcomes = (formData.decisionOutcomes || []).filter((_, i) => i !== index);
    handleInputChange('decisionOutcomes', newOutcomes);
  };

  const handleFileChange = (index: number, field: keyof WorkflowTaskFile, value: any) => {
    const newFiles = [...(formData.taskFiles || [])];
    newFiles[index] = { ...newFiles[index], [field]: value };
    handleInputChange('taskFiles', newFiles);
  };

  const addFile = () => {
    const newFiles = [...(formData.taskFiles || []), {
      taskId: selectedNode?.data.taskId || 0,
      fileName: '',
      fileDescription: '',
      isRequired: 'Y' as YesNo
    }];
    handleInputChange('taskFiles', newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = (formData.taskFiles || []).filter((_, i) => i !== index);
    handleInputChange('taskFiles', newFiles);
  };

  const addConsolidationSource = () => {
    const newSources = [...(formData.consolidationSources || []), ''];
    handleInputChange('consolidationSources', newSources);
  };

  const removeConsolidationSource = (index: number) => {
    const newSources = (formData.consolidationSources || []).filter((_, i) => i !== index);
    handleInputChange('consolidationSources', newSources);
  };

  const handleConsolidationSourceChange = (index: number, value: string) => {
    const newSources = [...(formData.consolidationSources || [])];
    newSources[index] = value;
    handleInputChange('consolidationSources', newSources);
  };

  // Get previous file upload/update tasks for consolidation
  const getPreviousFileTasks = () => {
    return allNodes.filter(node => 
      node.data.taskType === 'FILE_UPLOAD' || 
      node.data.taskType === 'FILE_UPDATE'
    );
  };

  // Get parent nodes based on canvas connections
  const getParentNodes = (nodeId: string, edges: any[]): Node<NodeData>[] => {
    const parentEdges = edges.filter(edge => edge.target === nodeId);
    const parentNodes: Node<NodeData>[] = [];
    
    parentEdges.forEach(edge => {
      const parentNode = allNodes.find(node => node.id === edge.source);
      if (parentNode && !['start', 'end'].includes(parentNode.id)) {
        parentNodes.push(parentNode);
      }
    });
    
    return parentNodes;
  };

  // Get all ancestor nodes (recursive traversal)
  const getAllAncestorNodes = (nodeId: string, edges: any[], visited: Set<string> = new Set()): Node<NodeData>[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    
    const directParents = getParentNodes(nodeId, edges);
    const allAncestors: Node<NodeData>[] = [...directParents];
    
    directParents.forEach(parent => {
      const parentAncestors = getAllAncestorNodes(parent.id, edges, visited);
      allAncestors.push(...parentAncestors);
    });
    
    return allAncestors.filter((node, index, self) => 
      self.findIndex(n => n.id === node.id) === index
    );
  };

  // Get files from parent tasks for file update
  const getAvailableFilesFromParentTasks = (edges: any[]) => {
    if (!selectedNode) return [];
    
    const parentNodes = getParentNodes(selectedNode.id, edges);
    const availableFiles: { taskName: string; taskId: string; files: WorkflowTaskFile[] }[] = [];
    
    parentNodes.forEach(parentNode => {
      if (parentNode.data.taskFiles && parentNode.data.taskFiles.length > 0) {
        availableFiles.push({
          taskName: parentNode.data.description || 'Unknown Task',
          taskId: parentNode.id,
          files: parentNode.data.taskFiles
        });
      }
    });
    
    return availableFiles;
  };

  // Get files from all ancestor tasks for consolidation
  const getAvailableFilesFromAllAncestors = (edges: any[]) => {
    if (!selectedNode) return [];
    
    const ancestorNodes = getAllAncestorNodes(selectedNode.id, edges);
    const availableFiles: { taskName: string; taskId: string; files: WorkflowTaskFile[] }[] = [];
    
    ancestorNodes.forEach(ancestorNode => {
      if (ancestorNode.data.taskFiles && ancestorNode.data.taskFiles.length > 0) {
        availableFiles.push({
          taskName: ancestorNode.data.description || 'Unknown Task',
          taskId: ancestorNode.id,
          files: ancestorNode.data.taskFiles
        });
      }
    });
    
    return availableFiles;
  };

  const renderBasicProperties = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Task Name</Label>
        <Input 
          id="description" 
          value={formData.description || ''} 
          onChange={(e) => handleInputChange('description', e.target.value)} 
          placeholder="Enter task name"
        />
      </div>
      
      <div>
        <Label htmlFor="taskDescription">Task Description</Label>
        <Textarea 
          id="taskDescription" 
          value={formData.taskDescription || ''} 
          onChange={(e) => handleInputChange('taskDescription', e.target.value)} 
          placeholder="Describe what this task does"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="roleId">Assigned Role</Label>
        <Select value={formData.roleId?.toString() || undefined} onValueChange={(v) => handleInputChange('roleId', +v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map(r => (
              <SelectItem key={r.roleId} value={r.roleId.toString()}>
                {r.roleName || `Role ID ${r.roleId}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select value={formData.taskPriority || 'MEDIUM'} onValueChange={(v: TaskPriority) => handleInputChange('taskPriority', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Expected Completion (mins)</Label>
          <Input 
            type="number" 
            value={formData.expectedCompletion || 60} 
            onChange={e => handleInputChange('expectedCompletion', +e.target.value)} 
          />
        </div>
      </div>

      <div>
        <Label>Escalation Rules</Label>
        <Textarea 
          value={formData.escalationRules || ''} 
          onChange={(e) => handleInputChange('escalationRules', e.target.value)} 
          placeholder="Define escalation rules"
          rows={2}
        />
      </div>
    </div>
  );

  const renderAdvancedProperties = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Can Be Revisited?</Label>
          <Switch 
            checked={formData.canBeRevisited === 'Y'} 
            onCheckedChange={c => handleInputChange('canBeRevisited', c ? 'Y' : 'N' as YesNo)} 
          />
        </div>
        
        {formData.canBeRevisited === 'Y' && (
          <div>
            <Label>Max Revisits</Label>
            <Input 
              type="number" 
              value={formData.maxRevisits || 1} 
              onChange={e => handleInputChange('maxRevisits', +e.target.value)} 
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>Auto Escalation?</Label>
          <Switch 
            checked={formData.autoEscalationEnabled === 'Y'} 
            onCheckedChange={c => handleInputChange('autoEscalationEnabled', c ? 'Y' : 'N' as YesNo)} 
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Notification Required?</Label>
          <Switch 
            checked={formData.notificationRequired === 'Y'} 
            onCheckedChange={c => handleInputChange('notificationRequired', c ? 'Y' : 'N' as YesNo)} 
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Can Run in Parallel?</Label>
          <Switch 
            checked={formData.canRunInParallel === 'Y'} 
            onCheckedChange={c => handleInputChange('canRunInParallel', c ? 'Y' : 'N' as YesNo)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>File Retention (days)</Label>
            <Input 
              type="number" 
              value={formData.fileRetentionDays || 30} 
              onChange={e => handleInputChange('fileRetentionDays', +e.target.value)} 
            />
          </div>
          <div>
            <Label>Max File Versions</Label>
            <Input 
              type="number" 
              value={formData.maxFileVersions || 1} 
              onChange={e => handleInputChange('maxFileVersions', +e.target.value)} 
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>Keep File Versions?</Label>
          <Switch 
            checked={formData.keepFileVersions === 'Y'} 
            onCheckedChange={c => handleInputChange('keepFileVersions', c ? 'Y' : 'N' as YesNo)} 
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Keep File History?</Label>
          <Switch 
            checked={formData.keepFileHistory === 'Y'} 
            onCheckedChange={c => handleInputChange('keepFileHistory', c ? 'Y' : 'N' as YesNo)} 
          />
        </div>
      </div>
    </div>
  );

  const renderFileUploadProperties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Allow New Files?</Label>
        <Switch 
          checked={formData.allowNewFiles === 'Y'} 
          onCheckedChange={c => handleInputChange('allowNewFiles', c ? 'Y' : 'N' as YesNo)} 
        />
      </div>

      <div>
        <Label>File Selection Mode</Label>
        <Select value={formData.fileSelectionMode || 'USER_SELECT'} onValueChange={(v: FileSelectionMode) => handleInputChange('fileSelectionMode', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="USER_SELECT">User Select</SelectItem>
            <SelectItem value="ALL_FILES">All Files</SelectItem>
            <SelectItem value="AUTO_SELECT">Auto Select</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Files to Upload</Label>
          <Button onClick={addFile} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />Add File
          </Button>
        </div>
        
        {(formData.taskFiles || []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files added yet</p>
            <p className="text-xs">Click "Add File" to specify files for upload</p>
          </div>
        ) : (
          (formData.taskFiles || []).map((file, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    File #{index + 1}
                  </Label>
                  <Button size="sm" variant="outline" onClick={() => removeFile(index)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input 
                  placeholder="File name (e.g., document.pdf)" 
                  value={file.fileName || ''} 
                  onChange={e => handleFileChange(index, 'fileName', e.target.value)} 
                />
                <Input 
                  placeholder="File description (optional)" 
                  value={file.fileDescription || ''} 
                  onChange={e => handleFileChange(index, 'fileDescription', e.target.value)} 
                />
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Required File?</Label>
                  <Switch 
                    checked={file.isRequired === 'Y'} 
                    onCheckedChange={c => handleFileChange(index, 'isRequired', c ? 'Y' : 'N' as YesNo)} 
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderFileUpdateProperties = () => {
    const availableFiles = getAvailableFilesFromParentTasks(edges);
    
    // Get currently selected files for this task
    const selectedFiles = formData.taskFiles || [];
    
    const handleFileSelection = (parentFile: WorkflowTaskFile, taskId: string, isSelected: boolean, newFileName?: string) => {
      const currentFiles = formData.taskFiles || [];
      const fileKey = `${taskId}-${parentFile.fileName}`;
      
      if (isSelected) {
        // Add file if not already present
        if (!currentFiles.some(tf => tf.sourceFileKey === fileKey)) {
          const newFile: WorkflowTaskFile = {
            taskId: selectedNode?.data.taskId || 0,
            fileName: newFileName || parentFile.fileName,
            fileDescription: parentFile.fileDescription,
            isRequired: parentFile.isRequired,
            sourceFileKey: fileKey,
            originalFileName: parentFile.fileName,
            sourceTaskId: taskId
          };
          handleInputChange('taskFiles', [...currentFiles, newFile]);
        } else if (newFileName) {
          // Update filename if provided
          const updatedFiles = currentFiles.map(tf => 
            tf.sourceFileKey === fileKey 
              ? { ...tf, fileName: newFileName }
              : tf
          );
          handleInputChange('taskFiles', updatedFiles);
        }
      } else {
        // Remove file
        const updatedFiles = currentFiles.filter(tf => tf.sourceFileKey !== fileKey);
        handleInputChange('taskFiles', updatedFiles);
      }
    };
    
    return (
      <div className="space-y-4">
        {availableFiles.length > 0 ? (
          <div className="space-y-2">
            <Label>Select Files to Update</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Choose which files from connected parent steps to update:
            </div>
            {availableFiles.map((taskFiles, taskIndex) => (
              <Card key={taskIndex} className="p-3">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {taskFiles.taskName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {taskFiles.files.map((file, fileIndex) => {
                      const fileKey = `${taskFiles.taskId}-${file.fileName}`;
                      const isSelected = selectedFiles.some(tf => tf.sourceFileKey === fileKey);
                      const selectedFile = selectedFiles.find(tf => tf.sourceFileKey === fileKey);
                      
                      return (
                        <div key={fileIndex} className="space-y-2 p-2 bg-muted/30 rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`file-update-${taskIndex}-${fileIndex}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleFileSelection(file, taskFiles.taskId, checked as boolean)
                              }
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center">
                                <File className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">{file.fileName}</span>
                              </div>
                              <Badge variant={file.isRequired === 'Y' ? 'default' : 'secondary'}>
                                {file.isRequired === 'Y' ? 'Required' : 'Optional'}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-8">
                            <Input 
                              placeholder="New file name (leave empty to keep original)" 
                              className="text-xs"
                              value={selectedFile?.fileName !== file.fileName ? selectedFile?.fileName || '' : ''}
                              onChange={(e) => 
                                handleFileSelection(file, taskFiles.taskId, true, e.target.value || file.fileName)
                              }
                              disabled={!isSelected}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No parent steps with files found</p>
            <p className="text-xs">Connect this step to parent steps that contain files</p>
          </div>
        )}
      </div>
    );
  };

  const renderConsolidateProperties = () => {
    const availableFiles = getAvailableFilesFromAllAncestors(edges);
    
    // Get currently selected files for this task
    const selectedFiles = formData.taskFiles || [];
    
    const handleConsolidateFileSelection = (parentFile: WorkflowTaskFile, taskId: string, isSelected: boolean, customName?: string) => {
      const currentFiles = formData.taskFiles || [];
      const fileKey = `${taskId}-${parentFile.fileName}`;
      
      if (isSelected) {
        // Add file if not already present
        if (!currentFiles.some(tf => tf.sourceFileKey === fileKey)) {
          const newFile: WorkflowTaskFile = {
            taskId: selectedNode?.data.taskId || 0,
            fileName: customName || parentFile.fileName,
            fileDescription: parentFile.fileDescription,
            isRequired: parentFile.isRequired,
            sourceFileKey: fileKey,
            originalFileName: parentFile.fileName,
            sourceTaskId: taskId
          };
          handleInputChange('taskFiles', [...currentFiles, newFile]);
        } else if (customName) {
          // Update custom name if provided
          const updatedFiles = currentFiles.map(tf => 
            tf.sourceFileKey === fileKey 
              ? { ...tf, fileName: customName }
              : tf
          );
          handleInputChange('taskFiles', updatedFiles);
        }
      } else {
        // Remove file
        const updatedFiles = currentFiles.filter(tf => tf.sourceFileKey !== fileKey);
        handleInputChange('taskFiles', updatedFiles);
      }
    };
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Output File Name</Label>
          <Input 
            value={formData.outputFileName || ''} 
            onChange={(e) => handleInputChange('outputFileName', e.target.value)} 
            placeholder="e.g., consolidated_report.xlsx"
          />
        </div>

        <div>
          <Label>Consolidation Rules (JSON)</Label>
          <Textarea 
            value={formData.consolidationRulesJson || ''} 
            onChange={(e) => handleInputChange('consolidationRulesJson', e.target.value)} 
            placeholder='{"includeAllApproved": true, "excludeRejected": true}'
            rows={3}
          />
        </div>

        {availableFiles.length > 0 ? (
          <div className="space-y-2">
            <Label>Select Files to Consolidate</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Choose files from all connected ancestor steps to consolidate:
            </div>
            {availableFiles.map((taskFiles, taskIndex) => (
              <Card key={taskIndex} className="p-3">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {taskFiles.taskName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {taskFiles.files.map((file, fileIndex) => {
                      const fileKey = `${taskFiles.taskId}-${file.fileName}`;
                      const isSelected = selectedFiles.some(tf => tf.sourceFileKey === fileKey);
                      const selectedFile = selectedFiles.find(tf => tf.sourceFileKey === fileKey);
                      
                      return (
                        <div key={fileIndex} className="space-y-2 p-2 bg-muted/30 rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`file-consolidate-${taskIndex}-${fileIndex}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleConsolidateFileSelection(file, taskFiles.taskId, checked as boolean)
                              }
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center">
                                <File className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">{file.fileName}</span>
                              </div>
                              <Badge variant={file.isRequired === 'Y' ? 'default' : 'secondary'}>
                                {file.isRequired === 'Y' ? 'Required' : 'Optional'}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-8">
                            <Input 
                              placeholder="Custom name for consolidated file" 
                              className="text-xs"
                              value={selectedFile?.fileName !== file.fileName ? selectedFile?.fileName || '' : ''}
                              onChange={(e) => 
                                handleConsolidateFileSelection(file, taskFiles.taskId, true, e.target.value || file.fileName)
                              }
                              disabled={!isSelected}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No ancestor steps with files found</p>
            <p className="text-xs">Connect this step to a workflow path that contains file steps</p>
          </div>
        )}
      </div>
    );
  };

  const renderDecisionProperties = () => {
    // Get all parent nodes for this decision task
    const parentNodes = selectedNode ? getParentNodes(selectedNode.id, edges) : [];
    
    // Get all available tasks (excluding start/end) for selection
    const availableTasks = allNodes.filter(node => 
      !['start', 'end'].includes(node.id) && node.id !== selectedNode?.id
    );

    return (
      <div className="space-y-4">
        <div>
          <Label>Decision Type</Label>
          <Select value={formData.decisionType || 'APPROVAL'} onValueChange={(v) => handleInputChange('decisionType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="APPROVAL">Approval</SelectItem>
              <SelectItem value="CHOICE">Choice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Decision Criteria (JSON)</Label>
          <Textarea 
            value={formData.decisionCriteriaJson || ''} 
            onChange={(e) => handleInputChange('decisionCriteriaJson', e.target.value)} 
            placeholder='{"criteria": "approval_required", "threshold": 80}'
            rows={3}
          />
        </div>

        {parentNodes.length > 0 && (
          <div className="space-y-2">
            <Label>Connected Parent Tasks</Label>
            <div className="text-sm text-muted-foreground mb-2">
              These are the tasks connected to this decision node:
            </div>
            <div className="space-y-1">
              {parentNodes.map((parentNode, index) => (
                <div key={index} className="flex items-center p-2 bg-muted/30 rounded text-sm">
                  <Badge variant="outline" className="mr-2">
                    ID: {parentNode.data.taskId || parentNode.id}
                  </Badge>
                  <span className="font-medium">{parentNode.data.description || 'Unnamed Task'}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {parentNode.data.taskType?.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Decision Outcomes</Label>
            <Button onClick={addDecisionOutcome} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />Add Outcome
            </Button>
          </div>
          
          {(formData.decisionOutcomes || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No decision outcomes defined</p>
              <p className="text-xs">Add outcomes to specify where the workflow should go based on decisions</p>
            </div>
          ) : (
            (formData.decisionOutcomes || []).map((outcome, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Outcome #{index + 1}</Label>
                    <Button size="sm" variant="outline" onClick={() => removeDecisionOutcome(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input 
                    placeholder="Outcome Name (e.g., Approve, Reject, Revise)" 
                    value={outcome.outcomeName} 
                    onChange={e => handleDecisionOutcomeChange(index, 'outcomeName', e.target.value)} 
                  />
                  <div>
                    <Label className="text-xs text-muted-foreground">Next Task</Label>
                    <Select 
                      value={outcome.nextTaskId && outcome.nextTaskId > 0 ? outcome.nextTaskId.toString() : undefined} 
                      onValueChange={(v) => {
                        const numericValue = parseInt(v);
                        handleDecisionOutcomeChange(index, 'nextTaskId', numericValue);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select next task" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTasks.map(task => {
                          // Use taskId if available, otherwise use node id
                          const taskIdValue = task.data.taskId || parseInt(task.id) || task.id;
                          return (
                            <SelectItem key={task.id} value={taskIdValue.toString()}>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  ID: {taskIdValue}
                                </Badge>
                                <span className="truncate max-w-32">
                                  {task.data.description || 'Unnamed Task'}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {task.data.taskType?.replace('_', ' ')}
                                </Badge>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderTaskSpecificContent = () => {
    switch (selectedNode?.data.taskType) {
      case 'FILE_UPLOAD':
        return renderFileUploadProperties();
      case 'FILE_UPDATE':
        return renderFileUpdateProperties();
      case 'CONSOLIDATE_FILE':
        return renderConsolidateProperties();
      case 'DECISION':
        return renderDecisionProperties();
      default:
        return <div className="text-muted-foreground">No specific properties for this task type.</div>;
    }
  };

  return (
    <AnimatePresence>
      {selectedNode && !['start', 'end'].includes(selectedNode.id) && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute right-0 top-0 h-full w-96 bg-background border-l z-30 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold capitalize flex items-center">
              {selectedNode.data.taskType === 'FILE_UPLOAD' && <Upload className="h-5 w-5 mr-2" />}
              {selectedNode.data.taskType === 'FILE_UPDATE' && <FileText className="h-5 w-5 mr-2" />}
              {selectedNode.data.taskType === 'CONSOLIDATE_FILE' && <FolderOpen className="h-5 w-5 mr-2" />}
              {selectedNode.data.taskType === 'DECISION' && <Settings2 className="h-5 w-5 mr-2" />}
              {selectedNode.data.taskType?.replace('_', ' ')} Properties
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="basic" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="specific">Specific</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="basic" className="mt-0">
                  {renderBasicProperties()}
                </TabsContent>
                
                <TabsContent value="specific" className="mt-0">
                  {renderTaskSpecificContent()}
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-0">
                  {renderAdvancedProperties()}
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          <div className="p-4 border-t flex gap-2">
            <Button onClick={handleSave} className="flex-1">Save Changes</Button>
            <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PropertiesPanel;