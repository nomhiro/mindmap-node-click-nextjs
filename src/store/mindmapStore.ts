import { create } from 'zustand';
import { MindmapStore, MindmapData } from '@/types/mindmap';
import { MermaidParser } from '@/lib/mermaidParser';

export const useMindmapStore = create<MindmapStore>((set, get) => ({
  mindmapData: null,
  selectedNodeId: null,
  mermaidInput: `mindmap
  root((中心テーマ))
    起源
      ロングテール
      ポピュラリゼーション
        British popular psychology author Tony Buzan
    研究
      論文発表
        The effectiveness of mind mapping
      ツール
        Pen and paper
        Mermaid
    クリエイティブ用途
      ブレインストーミング
      アート
        色彩
        図形
    開発ツール
      プログラミング
        設計
        ドキュメント
      プロジェクト管理`,

  setMindmapData: (data: MindmapData) => 
    set({ mindmapData: data }),

  setSelectedNode: (nodeId: string | null) => 
    set({ selectedNodeId: nodeId }),

  setMermaidInput: (input: string) => 
    set({ mermaidInput: input }),

  parseMermaidToMindmap: (mermaidText: string) => {
    try {
      console.log('Parsing Mermaid text:', mermaidText);
      const mindmapData = MermaidParser.parseMindmap(mermaidText);
      console.log('Parsed mindmap data:', mindmapData);
      set({ mindmapData, mermaidInput: mermaidText });
    } catch (error) {
      console.error('Mermaid parsing error:', error);
    }
  },

  parseMermaidForNodeData: (mermaidText: string) => {
    try {
      const mindmapData = MermaidParser.parseMindmap(mermaidText);
      set({ mindmapData });
    } catch (error) {
      console.error('Mermaid node data parsing error:', error);
    }
  }
}));