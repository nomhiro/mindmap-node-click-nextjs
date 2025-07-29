'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNodeData {
  label: string;
  level: number;
  isRoot: boolean;
}

export default function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const { label, level, isRoot } = data;

  const getNodeStyle = () => {
    if (isRoot) {
      return 'bg-red-500 text-white border-red-600 text-lg font-bold';
    }
    switch (level) {
      case 1:
        return 'bg-blue-500 text-white border-blue-600 font-semibold';
      case 2:
        return 'bg-green-500 text-white border-green-600';
      default:
        return 'bg-yellow-400 text-gray-800 border-yellow-500';
    }
  };

  const getNodeSize = () => {
    if (isRoot) return 'w-32 h-16';
    if (level === 1) return 'w-28 h-12';
    return 'w-24 h-10';
  };

  return (
    <div className={`${getNodeStyle()} ${getNodeSize()} rounded-lg border-2 flex items-center justify-center px-2 cursor-pointer hover:shadow-lg transition-shadow`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="text-center text-sm truncate">
        {label}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}