'use client';

import { useEffect, useState } from 'react';
import MermaidRenderer from '@/components/MermaidRenderer';
import MermaidEditor from '@/components/MermaidEditor';
import DetailsSidebar from '@/components/DetailsSidebar';
import TestButton from '@/components/TestButton';
import { useMindmapStore } from '@/store/mindmapStore';

export default function Home() {
  const { mermaidInput, parseMermaidToMindmap } = useMindmapStore();
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    parseMermaidToMindmap(mermaidInput);
  }, [mermaidInput, parseMermaidToMindmap]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🧠 Interactive Mindmap</h1>
          <div className="flex gap-2">
            <TestButton />
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showEditor ? 'マインドマップを表示' : 'エディタを表示'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showEditor ? (
          <div className="flex-1 p-6">
            <MermaidEditor />
          </div>
        ) : (
          <>
            <div className="flex-1">
              <MermaidRenderer mermaidCode={mermaidInput} />
            </div>
            <div className="w-96">
              <DetailsSidebar />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
