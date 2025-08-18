import React from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { FileUp, GitBranch, Mail, MessageSquare, Database, AlertTriangle } from 'lucide-react';
import { NodeData } from './types';

const nodeIcons: { [key: string]: React.ReactNode } = {
  start: <GitBranch className="h-6 w-6" />,
  end: <GitBranch className="h-6 w-6" />,
  decision: <AlertTriangle className="h-6 w-6" />,
  action: <Mail className="h-6 w-6" />,
  api: <MessageSquare className="h-6 w-6" />,
  database: <Database className="h-6 w-6" />,
};

const WorkflowNode: React.FC<NodeProps<NodeData>> = ({ data, selected, type }) => {

  const nodeClasses = cn(
    'w-36 min-h-[80px] p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200',
    {
      'bg-gray-700 border-gray-500': !selected,
      'ring-2 ring-offset-2 ring-offset-gray-900': selected,
    },
    {
      'bg-green-900/50 border-green-500 ring-green-400': type === 'start' && selected,
      'bg-green-800 border-green-600': type === 'start' && !selected,
      'bg-red-900/50 border-red-500 ring-red-400': type === 'end' && selected,
      'bg-red-800 border-red-600': type === 'end' && !selected,
      'bg-yellow-900/50 border-yellow-500 ring-yellow-400': type === 'decision' && selected,
      'bg-yellow-800 border-yellow-600': type === 'decision' && !selected,
      'bg-blue-900/50 border-blue-500 ring-blue-400': type === 'action' && selected,
      'bg-blue-800 border-blue-600': type === 'action' && !selected,
      'bg-purple-900/50 border-purple-500 ring-purple-400': type === 'api' && selected,
      'bg-purple-800 border-purple-600': type === 'api' && !selected,
      'bg-indigo-900/50 border-indigo-500 ring-indigo-400': type === 'database' && selected,
      'bg-indigo-800 border-indigo-600': type === 'database' && !selected,
    }
  );

  return (
    <motion.div
      className={nodeClasses}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-gray-400 !w-3 !h-3 !border-2 !border-gray-800 hover:!bg-white"
        />
      )}

      <div className="flex items-center gap-2 mb-1">
        {nodeIcons[type] || <FileUp className="h-5 w-5" />}
        <span className="font-bold text-sm capitalize">{type}</span>
      </div>
      <p className="text-xs text-gray-300 text-center truncate w-full">
        {data.description || 'No description'}
      </p>

      {type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-gray-400 !w-3 !h-3 !border-2 !border-gray-800 hover:!bg-white"
        />
      )}
    </motion.div>
  );
};

export default WorkflowNode;