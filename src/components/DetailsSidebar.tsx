'use client';

import React from 'react';
import { useMindmapStore } from '@/store/mindmapStore';

export default function DetailsSidebar() {
  const { mindmapData, selectedNodeId, setSelectedNode } = useMindmapStore();

  const selectedNode = mindmapData?.nodes.find(node => 
    node.id === selectedNodeId || node.label === selectedNodeId
  );

  if (!selectedNode) {
    return (
      <div className="w-full h-full p-6 bg-gray-50 border-l border-gray-200">
        <div className="text-center text-gray-500 mt-20">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-lg font-medium mb-2">ノードを選択してください</h3>
          <p className="text-sm">左側のマインドマップでノードをクリックすると、詳細情報がここに表示されます。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">詳細情報</h2>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="選択を解除"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedNode.details?.title || selectedNode.label}
          </h3>
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            レベル {selectedNode.level}
          </div>
        </div>

        {selectedNode.details?.description && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">説明</h4>
            <p className="text-gray-600 leading-relaxed">
              {selectedNode.details.description}
            </p>
          </div>
        )}

        {selectedNode.details?.content && selectedNode.details.content.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">詳細</h4>
            <ul className="space-y-2">
              {selectedNode.details.content.map((item, index) => (
                <li key={index} className="text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="font-medium text-gray-700 mb-2">ノード情報</h4>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ID:</span>
              <span className="font-mono text-gray-700">{selectedNode.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">親ノード:</span>
              <span className="font-mono text-gray-700">
                {selectedNode.parentId || 'なし'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">子ノード数:</span>
              <span className="text-gray-700">{selectedNode.children.length}個</span>
            </div>
          </div>
        </div>

        {selectedNode.children.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">子ノード</h4>
            <div className="space-y-2">
              {selectedNode.children.map(childId => {
                const childNode = mindmapData?.nodes.find(n => n.id === childId);
                return childNode ? (
                  <button
                    key={childId}
                    onClick={() => setSelectedNode(childId)}
                    className="block w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-sm text-gray-700">{childNode.label}</span>
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}