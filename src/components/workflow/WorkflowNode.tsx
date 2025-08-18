import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WorkflowNode as WorkflowNodeType, Position } from './types';
import { cn } from '@/lib/utils';
import { FileUp, GitBranch, Mail, MessageSquare, Database, AlertTriangle } from 'lucide-react';

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  onNodeMove: (id: string, position: Position) => void;
  onConnectionStart: (nodeId: string, position: Position) => void;
  onConnectionEnd: (sourceNodeId: string, targetNodeId: string) => void;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  isConnecting: boolean;
  connectionStartNodeId: string | null;
  zoom: number;
}

const nodeIcons = {
  start: <GitBranch className="h-6 w-6" />,
  end: <GitBranch className="h-6 w-6" />,
  decision: <AlertTriangle className="h-6 w-6" />,
  action: <Mail className="h-6 w-6" />,
  api: <MessageSquare className="h-6 w-6" />,
  database: <Database className="h-6 w-6" />,
};

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  onNodeMove,
  onConnectionStart,
  onConnectionEnd,
  isSelected,
  onSelect,
  isConnecting,
  connectionStartNodeId,
  zoom,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('connection-handle')) return;

    setIsDragging(true);
    const rect = nodeRef.current!.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    });
    onSelect(node.id);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.getElementById('workflow-canvas');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const newX = (e.clientX - containerRect.left) / zoom - dragOffset.x;
    const newY = (e.clientY - containerRect.top) / zoom - dragOffset.y;

    onNodeMove(node.id, {
      x: Math.max(0, Math.min(newX, container.offsetWidth - 150)),
      y: Math.max(0, Math.min(newY, container.offsetHeight - 100)),
    });
  }, [isDragging, dragOffset, node.id, onNodeMove, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleConnectionPointClick = (e: React.MouseEvent, isOutput: boolean) => {
    e.stopPropagation();
    if (!nodeRef.current) return;

    const rect = nodeRef.current.getBoundingClientRect();
    const container = document.getElementById('workflow-container');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const position = {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: (isOutput ? rect.bottom : rect.top) - containerRect.top,
    };

    if (isConnecting && connectionStartNodeId && connectionStartNodeId !== node.id) {
      onConnectionEnd(connectionStartNodeId, node.id);
    } else if (isOutput && node.type !== 'end') {
      onConnectionStart(node.id, position);
    }
  };

  const nodeClasses = cn(
    'absolute w-36 min-h-[80px] p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200',
    {
      'bg-gray-700 border-gray-500': !isSelected,
      'ring-2 ring-offset-2 ring-offset-gray-900': isSelected,
      'cursor-grab': !isDragging,
      'cursor-grabbing shadow-2xl': isDragging,
      'z-10': !isDragging,
      'z-20': isDragging,
    },
    {
      'bg-green-900/50 border-green-500 ring-green-400': node.type === 'start' && isSelected,
      'bg-green-800 border-green-600': node.type === 'start' && !isSelected,
      'bg-red-900/50 border-red-500 ring-red-400': node.type === 'end' && isSelected,
      'bg-red-800 border-red-600': node.type === 'end' && !isSelected,
      'bg-yellow-900/50 border-yellow-500 ring-yellow-400': node.type === 'decision' && isSelected,
      'bg-yellow-800 border-yellow-600': node.type === 'decision' && !isSelected,
      'bg-blue-900/50 border-blue-500 ring-blue-400': node.type === 'action' && isSelected,
      'bg-blue-800 border-blue-600': node.type === 'action' && !isSelected,
      'bg-purple-900/50 border-purple-500 ring-purple-400': node.type === 'api' && isSelected,
      'bg-purple-800 border-purple-600': node.type === 'api' && !isSelected,
      'bg-indigo-900/50 border-indigo-500 ring-indigo-400': node.type === 'database' && isSelected,
      'bg-indigo-800 border-indigo-600': node.type === 'database' && !isSelected,
    }
  );

  return (
    <motion.div
      ref={nodeRef}
      className={nodeClasses}
      style={{ left: node.position.x, top: node.position.y }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {node.type !== 'start' && (
        <div
          className="connection-handle absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full cursor-pointer border-2 border-gray-800 hover:bg-white"
          onClick={(e) => handleConnectionPointClick(e, false)}
        />
      )}

      <div className="flex items-center gap-2 mb-1">
        {nodeIcons[node.type] || <FileUp className="h-5 w-5" />}
        <span className="font-bold text-sm capitalize">{node.type}</span>
      </div>
      <p className="text-xs text-gray-300 text-center truncate w-full">
        {node.data.description || 'No description'}
      </p>

      {node.type !== 'end' && (
        <div
          className="connection-handle absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full cursor-pointer border-2 border-gray-800 hover:bg-white"
          onClick={(e) => handleConnectionPointClick(e, true)}
        />
      )}
    </motion.div>
  );
};

export default WorkflowNode;