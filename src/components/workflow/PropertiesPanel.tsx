import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { Node } from 'reactflow';
import { NodeData } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { WorkflowRole, TaskPriority, FileSelectionMode, YesNo, DecisionOutcome } from '@/types/workflow';

interface PropertiesPanelProps {
  selectedNode: Node<NodeData> | null;
  onUpdateNode: (nodeId: string, data: Partial<NodeData>) => void;
  onClose: () => void;
  roles: WorkflowRole[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNode, onClose, roles }) => {
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

  const renderTaskProperties = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Task Name</Label>
        <Input id="description" value={formData.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="taskDescription">Task Description</Label>
        <Textarea id="taskDescription" value={formData.taskDescription || ''} onChange={(e) => handleInputChange('taskDescription', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="roleId">Assigned Role</Label>
        <Select value={formData.roleId?.toString() || ''} onValueChange={(v) => handleInputChange('roleId', +v)}>
          <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
          <SelectContent>{roles.map(r => <SelectItem key={r.roleId} value={r.roleId.toString()}>{r.roleName || `Role ID ${r.roleId}`}</SelectItem>)}</SelectContent>
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
          <Input type="number" value={formData.expectedCompletion || 60} onChange={e => handleInputChange('expectedCompletion', +e.target.value)} />
        </div>
      </div>
      <div className="space-y-2 pt-4 border-t">
        <h4 className="font-semibold">Advanced Options</h4>
        <div className="flex items-center justify-between"><Label>Can Be Revisited?</Label><Switch checked={formData.canBeRevisited === 'Y'} onCheckedChange={c => handleInputChange('canBeRevisited', c ? 'Y' : 'N' as YesNo)} /></div>
        {formData.canBeRevisited === 'Y' && <div><Label>Max Revisits</Label><Input type="number" value={formData.maxRevisits || 1} onChange={e => handleInputChange('maxRevisits', +e.target.value)} /></div>}
        <div className="flex items-center justify-between"><Label>Auto Escalation?</Label><Switch checked={formData.autoEscalationEnabled === 'Y'} onCheckedChange={c => handleInputChange('autoEscalationEnabled', c ? 'Y' : 'N' as YesNo)} /></div>
        <div className="flex items-center justify-between"><Label>Notification Required?</Label><Switch checked={formData.notificationRequired === 'Y'} onCheckedChange={c => handleInputChange('notificationRequired', c ? 'Y' : 'N' as YesNo)} /></div>
      </div>
      {selectedNode?.data.taskType === 'DECISION' && (
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold">Decision Outcomes</h4>
          {(formData.decisionOutcomes || []).map((outcome, index) => (
            <div key={index} className="p-2 border rounded space-y-2">
              <div className="flex justify-between items-center">
                <Label>Outcome #{index + 1}</Label>
                <Button size="icon" variant="destructive" onClick={() => removeDecisionOutcome(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Input placeholder="Outcome Name (e.g., Approve)" value={outcome.outcomeName} onChange={e => handleDecisionOutcomeChange(index, 'outcomeName', e.target.value)} />
              <Input type="number" placeholder="Next Task ID" value={outcome.nextTaskId || ''} onChange={e => handleDecisionOutcomeChange(index, 'nextTaskId', +e.target.value)} />
            </div>
          ))}
          <Button onClick={addDecisionOutcome} variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Add Outcome</Button>
        </div>
      )}
    </div>
  );

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
            <h2 className="text-lg font-semibold capitalize">{selectedNode.data.taskType} Properties</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">{renderTaskProperties()}</div>
          <div className="p-4 border-t flex gap-2">
            <Button onClick={handleSave} className="flex-1">Save</Button>
            <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PropertiesPanel;