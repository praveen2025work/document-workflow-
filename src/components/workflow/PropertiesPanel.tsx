import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { WorkflowNode, NodeData } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface Role {
  id: number;
  name: string;
}

interface PropertiesPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, data: NodeData) => void;
  onClose: () => void;
  roles: Role[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNode, onClose, roles }) => {
  const [formData, setFormData] = useState<NodeData>({});

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

  const renderDecisionProperties = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="e.g., Check user age"
        />
      </div>
      <div>
        <Label htmlFor="leftValue">Left Value</Label>
        <Input
          id="leftValue"
          value={formData.leftValue || ''}
          onChange={(e) => handleInputChange('leftValue', e.target.value)}
          placeholder="e.g., user.age"
        />
      </div>
      <div>
        <Label htmlFor="operator">Operator</Label>
        <Select value={formData.operator || '=='} onValueChange={(value) => handleInputChange('operator', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="==">== (equals)</SelectItem>
            <SelectItem value="!=">!= (not equals)</SelectItem>
            <SelectItem value=">">&gt; (greater than)</SelectItem>
            <SelectItem value=">=">&gt;= (greater or equal)</SelectItem>
            <SelectItem value="<">&lt; (less than)</SelectItem>
            <SelectItem value="<=">&lt;= (less or equal)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="rightValue">Right Value</Label>
        <Input
          id="rightValue"
          value={formData.rightValue || ''}
          onChange={(e) => handleInputChange('rightValue', e.target.value)}
          placeholder="e.g., 18"
        />
      </div>
    </div>
  );

  const renderActionProperties = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Task Name</Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="e.g., Upload Invoice"
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role || ''} onValueChange={(value) => handleInputChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="completionDay">Expected Completion Day</Label>
        <Input
          id="completionDay"
          type="number"
          value={formData.completionDay || ''}
          onChange={(e) => handleInputChange('completionDay', Number(e.target.value))}
          placeholder="e.g., 1"
        />
      </div>
      <div>
        <Label htmlFor="completionTime">Expected Completion Time</Label>
        <Input
          id="completionTime"
          type="time"
          value={formData.completionTime || ''}
          onChange={(e) => handleInputChange('completionTime', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">Escalation</h4>
        <div className="flex items-center justify-between">
          <Label htmlFor="remindAtTime">Remind at Time</Label>
          <Switch
            id="remindAtTime"
            checked={formData.remindAtTime || false}
            onCheckedChange={(checked) => handleInputChange('remindAtTime', checked)}
          />
        </div>
        <div>
          <Label htmlFor="remindBefore">Remind Before (minutes)</Label>
          <Input
            id="remindBefore"
            type="number"
            value={formData.remindBefore || ''}
            onChange={(e) => handleInputChange('remindBefore', Number(e.target.value))}
            placeholder="e.g., 30"
          />
        </div>
        <div>
          <Label htmlFor="escalateAfter">Escalate After (minutes)</Label>
          <Input
            id="escalateAfter"
            type="number"
            value={formData.escalateAfter || ''}
            onChange={(e) => handleInputChange('escalateAfter', Number(e.target.value))}
            placeholder="e.g., 60"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="files">Files (comma-separated)</Label>
        <Input
          id="files"
          value={Array.isArray(formData.files) ? formData.files.join(',') : ''}
          onChange={(e) => handleInputChange('files', e.target.value.split(','))}
          placeholder="e.g., invoice.pdf,receipt.png"
        />
      </div>
    </div>
  );

  const renderProperties = () => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
      case 'decision':
        return renderDecisionProperties();
      case 'action':
        return renderActionProperties();
      default:
        return <p className="text-muted-foreground">No configurable properties for this node type.</p>;
    }
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute right-0 top-0 h-full w-80 glass border-l border-border z-30 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold capitalize text-foreground">{selectedNode.type} Properties</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {renderProperties()}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <Button onClick={handleSave} className="flex-1">Save</Button>
            <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PropertiesPanel;