'use client';

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMindmapStore } from '@/store/mindmapStore';
import CustomNode from './CustomNode';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function MindmapCanvas() {
  const { mindmapData, setSelectedNode } = useMindmapStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  useEffect(() => {
    if (!mindmapData || mindmapData.nodes.length === 0) return;

    console.log('Mindmap data:', mindmapData);

    const reactFlowNodes: Node[] = mindmapData.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: node.x, y: node.y },
      data: {
        label: node.label,
        level: node.level,
        isRoot: node.id === mindmapData.rootId,
      },
      draggable: true,
    }));

    const reactFlowEdges: Edge[] = mindmapData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      style: { stroke: '#64748b', strokeWidth: 2 },
      animated: false,
    }));

    console.log('React Flow nodes:', reactFlowNodes);
    console.log('React Flow edges:', reactFlowEdges);

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
    
    // fitViewを少し遅延させる
    setTimeout(() => {
      const fitViewButton = document.querySelector('[data-testid="rf__controls-fitview"]') as HTMLElement;
      if (fitViewButton) {
        fitViewButton.click();
      }
    }, 100);
  }, [mindmapData, setNodes, setEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView={true}
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-50"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}