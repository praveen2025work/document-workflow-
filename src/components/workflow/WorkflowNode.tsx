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

// Modern Update Icon Component (sync/refresh with arrows)
const UpdateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

// Modern Consolidate Icon Component (merge/combine)
const ConsolidateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
    <path d="M3 8h3a2 2 0 0 1 2 2v3" />
    <path d="M21 8h-3a2 2 0 0 0-2 2v3" />
    <path d="M8 13v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3" />
    <path d="M12 13v8" />
  </svg>
);

// Modern Decision Icon Component (diamond with branching paths)
const DecisionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L22 12L12 22L2 12Z" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
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
  // Start node - Dark emerald green
  if (type === 'start') {
    return {
      bg: 'bg-emerald-700',
      border: 'border-emerald-600',
      selectedBg: 'bg-emerald-600',
      selectedBorder: 'border-emerald-400',
      icon: 'text-white',
      text: 'text-white',
      selectedRing: 'ring-emerald-400'
    };
  }
  
  // End node - Dark red background
  if (type === 'end') {
    return {
      bg: 'bg-red-700',
      border: 'border-red-600',
      selectedBg: 'bg-red-600',
      selectedBorder: 'border-red-400',
      icon: 'text-white',
      text: 'text-white',
      selectedRing: 'ring-red-400'
    };
  }
  
  // Decision node - Dark blue background
  if (type === 'decision') {
    return {
      bg: 'bg-blue-700',
      border: 'border-blue-600',
      selectedBg: 'bg-blue-600',
      selectedBorder: 'border-blue-400',
      icon: 'text-white',
      text: 'text-white',
      selectedRing: 'ring-blue-400'
    };
  }
  
  // Action nodes - specific colors based on description
  if (type === 'action' && description) {
    const desc = description.toLowerCase();
    
    // Upload - Dark teal
    if (desc.includes('upload')) {
      return {
        bg: 'bg-teal-700',
        border: 'border-teal-600',
        selectedBg: 'bg-teal-600',
        selectedBorder: 'border-teal-400',
        icon: 'text-white',
        text: 'text-white',
        selectedRing: 'ring-teal-400'
      };
    }
    
    // Update - Dark purple background
    if (desc.includes('update') || desc.includes('edit') || desc.includes('modify')) {
      return {
        bg: 'bg-purple-700',
        border: 'border-purple-600',
        selectedBg: 'bg-purple-600',
        selectedBorder: 'border-purple-400',
        icon: 'text-white',
        text: 'text-white',
        selectedRing: 'ring-purple-400'
      };
    }
    
    // Consolidate - Dark green
    if (desc.includes('consolidate') || desc.includes('merge') || desc.includes('combine')) {
      return {
        bg: 'bg-green-700',
        border: 'border-green-600',
        selectedBg: 'bg-green-600',
        selectedBorder: 'border-green-400',
        icon: 'text-white',
        text: 'text-white',
        selectedRing: 'ring-green-400'
      };
    }
    
    // Download - Dark teal
    if (desc.includes('download')) {
      return {
        bg: 'bg-teal-700',
        border: 'border-teal-600',
        selectedBg: 'bg-teal-600',
        selectedBorder: 'border-teal-400',
        icon: 'text-white',
        text: 'text-white',
        selectedRing: 'ring-teal-400'
      };
    }
  }
  
  // Default colors for other types
  return {
    bg: 'bg-slate-700',
    border: 'border-slate-600',
    selectedBg: 'bg-slate-600',
    selectedBorder: 'border-slate-400',
    icon: 'text-white',
    text: 'text-white',
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
        <span className={cn("font-semibold text-sm capitalize", colors.text)}>
          {type}
        </span>
      </div>
      
      <p className={cn("text-xs text-center leading-tight px-1", colors.text)}>
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