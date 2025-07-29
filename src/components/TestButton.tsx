'use client';

import React from 'react';
import { useMindmapStore } from '@/store/mindmapStore';

export default function TestButton() {
  const { parseMermaidToMindmap } = useMindmapStore();

  const handleTestSimple = () => {
    const simpleTest = `mindmap
  root((テスト))
    A
      A1
      A2
    B
      B1
    C`;
    
    console.log('Testing with simple mindmap:', simpleTest);
    console.log('Raw string bytes:', simpleTest.split('').map(c => c.charCodeAt(0)));
    parseMermaidToMindmap(simpleTest);
  };

  return (
    <button
      onClick={handleTestSimple}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
    >
      シンプルテスト
    </button>
  );
}