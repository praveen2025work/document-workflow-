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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowRole, TaskPriority, FileSelectionMode, YesNo, DecisionOutcome, WorkflowTaskFile } from '@/types/workflow';

interface PropertiesPanelProps {
  selectedNode: Node<NodeData> | null;
  onUpdateNode: (nodeId: string, data: Partial<NodeData>) => void;
  onClose: () => void;
  roles: WorkflowRole[];
  allNodes?: Node<NodeData>[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNode, onClose, roles, allNodes = [] }) => {
  const [formData, setFormData] = useState<Partial<NodeData>>({});

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data);
    }
  }, [selectedNode]);

  const handleInputChange = (field: keyof NodeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, formData);
      onClose();
    }
  };

  const handleDecisionOutcomeChange = (index: number, field: keyof DecisionOutcome, value: any) => {
    const newOutcomes = [...(formData.decisionOutcomes || [])];
    newOutcomes[index] = { ...newOutcomes[index], [field]: value };
    handleInputChange('decisionOutcomes', newOutcomes);
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

  // Get files from previous tasks for file update
  const getAvailableFilesFromPreviousTasks = () => {
    const sourceTaskIds = formData.fileSourceTaskIds?.split(',').map(id => id.trim()) || [];
    const availableFiles: { taskName: string; files: WorkflowTaskFile[] }[] = [];
    
    sourceTaskIds.forEach(taskId => {
      const sourceNode = allNodes.find(node => node.id === taskId || node.data.taskId?.toString() === taskId);
      if (sourceNode && sourceNode.data.taskFiles) {
        availableFiles.push({
          taskName: sourceNode.data.description || 'Unknown Task',
          files: sourceNode.data.taskFiles
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
          <Label>Task Files</Label>
          <Button onClick={addFile} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />Add File
          </Button>
        </div>
        
        {(formData.taskFiles || []).map((file, index) => (
          <Card key={index} className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">File #{index + 1}</Label>
                <Button size="icon" variant="destructive" onClick={() => removeFile(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input 
                placeholder="File name" 
                value={file.fileName} 
                onChange={e => handleFileChange(index, 'fileName', e.target.value)} 
              />
              <Input 
                placeholder="File description" 
                value={file.fileDescription || ''} 
                onChange={e => handleFileChange(index, 'fileDescription', e.target.value)} 
              />
              <div className="flex items-center justify-between">
                <Label className="text-sm">Required?</Label>
                <Switch 
                  checked={file.isRequired === 'Y'} 
                  onCheckedChange={c => handleFileChange(index, 'isRequired', c ? 'Y' : 'N' as YesNo)} 
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFileUpdateProperties = () => {
    const availableFiles = getAvailableFilesFromPreviousTasks();
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Source Task IDs (comma-separated)</Label>
          <Input 
            value={formData.fileSourceTaskIds || ''} 
            onChange={(e) => handleInputChange('fileSourceTaskIds', e.target.value)} 
            placeholder="e.g., 1,2,3"
          />
        </div>

        <div>
          <Label>Output File Name</Label>
          <Input 
            value={formData.outputFileName || ''} 
            onChange={(e) => handleInputChange('outputFileName', e.target.value)} 
            placeholder="e.g., updated_report.xlsx"
          />
        </div>

        {availableFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Available Files from Previous Tasks</Label>
            {availableFiles.map((taskFiles, taskIndex) => (
              <Card key={taskIndex} className="p-3">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {taskFiles.taskName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {taskFiles.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2" />
                          <span className="text-sm">{file.fileName}</span>
                        </div>
                        <Badge variant={file.isRequired === 'Y' ? 'default' : 'secondary'}>
                          {file.isRequired === 'Y' ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderConsolidateProperties = () => {
    const previousFileTasks = getPreviousFileTasks();
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Source Task IDs (comma-separated)</Label>
          <Input 
            value={formData.fileSourceTaskIds || ''} 
            onChange={(e) => handleInputChange('fileSourceTaskIds', e.target.value)} 
            placeholder="e.g., 1,2,3"
          />
        </div>

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Consolidation Sources</Label>
            <Button onClick={addConsolidationSource} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />Add Source
            </Button>
          </div>
          
          {(formData.consolidationSources || []).map((source, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                placeholder="File name to consolidate" 
                value={source} 
                onChange={e => handleConsolidationSourceChange(index, e.target.value)} 
              />
              <Button size="icon" variant="destructive" onClick={() => removeConsolidationSource(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {previousFileTasks.length > 0 && (
          <div className="space-y-2">
            <Label>Available File Tasks</Label>
            <div className="grid gap-2">
              {previousFileTasks.map((task, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{task.data.description}</span>
                    </div>
                    <Badge variant="outline">{task.data.taskType}</Badge>
                  </div>
                  {task.data.taskFiles && task.data.taskFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {task.data.taskFiles.map((file, fileIndex) => (
                        <div key={fileIndex} className="text-xs text-muted-foreground ml-6">
                          • {file.fileName}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDecisionProperties = () => (
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Decision Outcomes</Label>
          <Button onClick={addDecisionOutcome} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />Add Outcome
          </Button>
        </div>
        
        {(formData.decisionOutcomes || []).map((outcome, index) => (
          <Card key={index} className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Outcome #{index + 1}</Label>
                <Button size="icon" variant="destructive" onClick={() => removeDecisionOutcome(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input 
                placeholder="Outcome Name (e.g., Approve)" 
                value={outcome.outcomeName} 
                onChange={e => handleDecisionOutcomeChange(index, 'outcomeName', e.target.value)} 
              />
              <Input 
                type="number" 
                placeholder="Next Task ID" 
                value={outcome.nextTaskId || ''} 
                onChange={e => handleDecisionOutcomeChange(index, 'nextTaskId', +e.target.value)} 
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

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