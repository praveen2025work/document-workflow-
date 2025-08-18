import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { WorkflowNode, NodeData } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PropertiesPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, data: NodeData) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNode, onClose }) => {
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
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the action"
        />
      </div>
      <div>
        <Label>Action Type</Label>
        <p className="text-sm text-gray-400">Configuration for different action types will be available here.</p>
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
        return <p className="text-gray-400">No configurable properties for this node type.</p>;
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
          className="absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 z-30 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold capitalize">{selectedNode.type} Properties</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {renderProperties()}
          </div>
          <div className="p-4 border-t border-gray-700 flex gap-2">
            <Button onClick={handleSave} className="flex-1">Save</Button>
            <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PropertiesPanel;