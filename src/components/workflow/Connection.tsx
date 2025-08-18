import React from 'react';
import { Connection as ConnectionType, WorkflowNode } from './types';

interface ConnectionProps {
  connection: ConnectionType;
  nodes: WorkflowNode[];
}

const Connection: React.FC<ConnectionProps> = ({ connection, nodes }) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);

  if (!sourceNode || !targetNode) return null;

  const sourceX = sourceNode.position.x + 72; // half of node width
  const sourceY = sourceNode.position.y + 80; // bottom of node
  const targetX = targetNode.position.x + 72; // half of node width
  const targetY = targetNode.position.y;

  const pathD = `M ${sourceX} ${sourceY} C ${sourceX} ${sourceY + 50}, ${targetX} ${targetY - 50}, ${targetX} ${targetY}`;

  return (
    <g>
      <path
        d={pathD}
        stroke="#4a5568"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {connection.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          fill="#9ca3af"
          fontSize="12"
          textAnchor="middle"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
};

export default Connection;