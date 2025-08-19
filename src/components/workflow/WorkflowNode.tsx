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
  MousePointer,
  RefreshCw,
  Merge
} from 'lucide-react';
import { NodeData } from './types';

// Custom Update Icon Component (up and down arrows within U-like box)
const UpdateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* U-shaped container */}
    <path d="M6 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4" />
    {/* Up arrow */}
    <path d="M10 10l2-2 2 2" />
    <path d="M12 8v4" />
    {/* Down arrow */}
    <path d="M10 16l2 2 2-2" />
    <path d="M12 14v4" />
  </svg>
);

// Custom Consolidate Icon Component (reverse Y shape with horizontal arrows merging)
const ConsolidateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Left horizontal arrow */}
    <path d="M2 8h8" />
    <path d="M6 4l4 4-4 4" />
    {/* Right horizontal arrow */}
    <path d="M14 8h8" />
    <path d="M18 4l4 4-4 4" />
    {/* Merging point and vertical arrow */}
    <path d="M12 8v8" />
    <path d="M8 20l4-4 4 4" />
  </svg>
);

// Custom Decision Icon Component (diamond/decision box shape)
const DecisionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Diamond shape */}
    <path d="M12 2l8 10-8 10-8-10z" />
    {/* Question mark inside */}
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r="0.5" />
  </svg>
);

// Function to get the appropriate icon based on node type and description
const getNodeIcon = (type: string, description?: string): React.ReactNode => {
  // Base icons for node types
  const baseIcons: { [key: string]: React.ReactNode } = {
    start: <Play className="h-5 w-5" />,
    end: <Square className="h-5 w-5" />,
    decision: <DecisionIcon className="h-5 w-5" />,
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
      return <UpdateIcon className="h-5 w-5" />;
    } else if (desc.includes('consolidate') || desc.includes('merge') || desc.includes('combine')) {
      return <ConsolidateIcon className="h-5 w-5" />;
    }
  }

  // Return base icon or default
  return baseIcons[type] || <FileUp className="h-5 w-5" />;
};

// Function to get colors based on node type and description
const getNodeColors = (type: string, description?: string) => {
  // Start node - Modern pleasant green
  if (type === 'start') {
    return {
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      selectedBg: 'bg-emerald-200',
      selectedBorder: 'border-emerald-500',
      icon: 'text-emerald-600',
      selectedRing: 'ring-emerald-400'
    };
  }
  
  // End node - Red background
  if (type === 'end') {
    return {
      bg: 'bg-red-100',
      border: 'border-red-300',
      selectedBg: 'bg-red-200',
      selectedBorder: 'border-red-500',
      icon: 'text-red-600',
      selectedRing: 'ring-red-400'
    };
  }
  
  // Decision node - Blue background
  if (type === 'decision') {
    return {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      selectedBg: 'bg-blue-200',
      selectedBorder: 'border-blue-500',
      icon: 'text-blue-600',
      selectedRing: 'ring-blue-400'
    };
  }
  
  // Action nodes - specific colors based on description
  if (type === 'action' && description) {
    const desc = description.toLowerCase();
    
    // Upload - Sea blue green
    if (desc.includes('upload')) {
      return {
        bg: 'bg-teal-100',
        border: 'border-teal-300',
        selectedBg: 'bg-teal-200',
        selectedBorder: 'border-teal-500',
        icon: 'text-teal-600',
        selectedRing: 'ring-teal-400'
      };
    }
    
    // Update - Purple background
    if (desc.includes('update') || desc.includes('edit') || desc.includes('modify')) {
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-300',
        selectedBg: 'bg-purple-200',
        selectedBorder: 'border-purple-500',
        icon: 'text-purple-600',
        selectedRing: 'ring-purple-400'
      };
    }
    
    // Consolidate - Dark green
    if (desc.includes('consolidate') || desc.includes('merge') || desc.includes('combine')) {
      return {
        bg: 'bg-green-100',
        border: 'border-green-400',
        selectedBg: 'bg-green-200',
        selectedBorder: 'border-green-600',
        icon: 'text-green-700',
        selectedRing: 'ring-green-500'
      };
    }
    
    // Download - Default teal (sea blue green)
    if (desc.includes('download')) {
      return {
        bg: 'bg-teal-100',
        border: 'border-teal-300',
        selectedBg: 'bg-teal-200',
        selectedBorder: 'border-teal-500',
        icon: 'text-teal-600',
        selectedRing: 'ring-teal-400'
      };
    }
  }
  
  // Default colors for other types
  return {
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    selectedBg: 'bg-slate-200',
    selectedBorder: 'border-slate-500',
    icon: 'text-slate-600',
    selectedRing: 'ring-slate-400'
  };
};

const WorkflowNode: React.FC<NodeProps<NodeData>> = ({ data, selected, type }) => {
  const colors = getNodeColors(type, data.description);

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
      {/* Input Connection Handles - for receiving connections */}
      {type !== 'start' && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="target-top"
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="target-left"
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

      {/* Output Connection Handles - for creating connections */}
      {type !== 'end' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="source-bottom"
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="source-right"
            className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary hover:!scale-125 !transition-all !duration-200"
          />
        </>
      )}
    </motion.div>
  );
};

export default WorkflowNode;