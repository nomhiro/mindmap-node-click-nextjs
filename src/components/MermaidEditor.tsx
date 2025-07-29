'use client';

import React from 'react';
import { useMindmapStore } from '@/store/mindmapStore';

export default function MermaidEditor() {
  const { mermaidInput, setMermaidInput, parseMermaidToMindmap } = useMindmapStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMermaidInput(e.target.value);
  };

  const handleParseClick = () => {
    parseMermaidToMindmap(mermaidInput);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Mermaid Editor</h2>
        <button
          onClick={handleParseClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          マインドマップを生成
        </button>
      </div>
      
      <textarea
        value={mermaidInput}
        onChange={handleInputChange}
        className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Mermaid形式でマインドマップを入力してください..."
      />
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>使用方法:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>mindmapで開始</li>
          <li>インデントでレベルを表現</li>
          <li>root((テキスト))で中心ノード</li>
          <li>通常のテキストで子ノード</li>
        </ul>
      </div>
    </div>
  );
}