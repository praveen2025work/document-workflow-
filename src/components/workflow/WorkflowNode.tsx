import React from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { 
  FileUp, 
  GitBranch, 
  Mail, 
  MessageSquare, 
  Database, 
  AlertTriangle, 
  Play, 
  Square,
  Upload,
  Download,
  Edit,
  Layers,
  MousePointer
} from 'lucide-react';
import { NodeData } from './types';
=======

// Function to get the appropriate icon based on node type and description
const getNodeIcon = (type: string, description?: string): React.ReactNode => {
  // Base icons for node types
  const baseIcons: { [key: string]: React.ReactNode } = {
    start: <Play className="h-5 w-5" />,
    end: <Square className="h-5 w-5" />,
    decision: <MousePointer className="h-5 w-5" />,
    api: <MessageSquare className="h-5 w-5" />,
    database: <Database className="h-5 w-5" />,
  };

  // For action nodes, determine icon based on description
  if (type === 'action' && description) {
    const desc = description.toLowerCase();
    if (desc.includes('upload')) {
      return <Upload className="h-5 w-5" />;
    } else if (desc.includes('download')) {
      return <Download className="h-5 w-5" />;
    } else if (desc.includes('update') || desc.includes('edit') || desc.includes('modify')) {
      return <Edit className="h-5 w-5" />;
    } else if (desc.includes('consolidate') || desc.includes('merge') || desc.includes('combine')) {
      return <Layers className="h-5 w-5" />;
    }
  }

  // Return base icon or default
  return baseIcons[type] || <FileUp className="h-5 w-5" />;
};

const nodeColors = {
  start: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    selectedBg: 'bg-success/20',
    selectedBorder: 'border-success',
    icon: 'text-success',
    selectedRing: 'ring-success/50'
  },
  end: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    selectedBg: 'bg-destructive/20',
    selectedBorder: 'border-destructive',
    icon: 'text-destructive',
    selectedRing: 'ring-destructive/50'
  },
  decision: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    selectedBg: 'bg-warning/20',
    selectedBorder: 'border-warning',
    icon: 'text-warning',
    selectedRing: 'ring-warning/50'
  },
  action: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    selectedBg: 'bg-primary/20',
    selectedBorder: 'border-primary',
    icon: 'text-primary',
    selectedRing: 'ring-primary/50'
  },
  api: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    selectedBg: 'bg-info/20',
    selectedBorder: 'border-info',
    icon: 'text-info',
    selectedRing: 'ring-info/50'
  },
  database: {
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    selectedBg: 'bg-chart-4/20',
    selectedBorder: 'border-chart-4',
    icon: 'text-chart-4',
    selectedRing: 'ring-chart-4/50'
  }
};

const WorkflowNode: React.FC<NodeProps<NodeData>> = ({ data, selected, type }) => {
  const colors = nodeColors[type as keyof typeof nodeColors] || nodeColors.action;

  const nodeClasses = cn(
    'relative w-40 min-h-[90px] p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl',
    'backdrop-blur-sm bg-card/80',
    selected ? [
      colors.selectedBg,
      colors.selectedBorder,
      'ring-2 ring-offset-2 ring-offset-background',
      colors.selectedRing,
      'shadow-glow'
    ] : [
      colors.bg,
      colors.border,
      'hover:shadow-md'
    ]
  );

  return (
    <motion.div
      className={nodeClasses}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        delay: Math.random() * 0.1 
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Connection Handles */}
      {type !== 'start' && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
          <Handle
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
          <Handle
            type="target"
            position={Position.Right}
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
        </>
      )}

      {/* Node Content */}
      <div className={cn("flex items-center gap-2 mb-2", colors.icon)}>
        {getNodeIcon(type, data.description)}
        <span className="font-semibold text-sm capitalize text-foreground">
          {type}
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground text-center leading-tight px-1">
        {data.description || 'No description'}
      </p>

      {/* Selection Indicator */}
      {selected && (
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {type !== 'end' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
          <Handle
            type="source"
            position={Position.Left}
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
        </>
      )}
    </motion.div>
  );
};

export default WorkflowNode;