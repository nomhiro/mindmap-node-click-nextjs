# Next.js + Mermaid.jsでインタラクティブなマインドマップを構築する

## はじめに

マインドマップやナレッジグラフの可視化において、ノードをクリックして詳細情報を表示する機能は重要です。本記事では、StreamlitでMermaidマインドマップのノードクリックイベントが取得できない課題を解決し、Next.js + Mermaid.js nativeアプローチでインタラクティブなマインドマップを実装した過程を解説します。

## 課題：Streamlitでのクリックイベント問題

当初の要件：
- Mermaid形式のマインドマップを描画
- ノードクリックでサイドバーに詳細情報表示
- インタラクティブな操作性

Streamlitの`components.html()`でMermaidを表示する方法では、SVG要素のクリックイベントを取得することが困難でした。

## 解決アプローチの比較検討

### 検討した実装方法

| アプローチ            | メリット           | デメリット          | 適合度 |
| --------------------- | ------------------ | ------------------- | ------ |
| **Mermaid.js Native** | 正確な描画、軽量   | DOM操作必要         | ⭐⭐⭐⭐⭐  |
| **React Flow**        | 高いカスタマイズ性 | Mermaidパーサー必要 | ⭐⭐⭐⭐   |
| **D3.js**             | 完全制御           | 学習コスト高        | ⭐⭐⭐    |
| **Cytoscape.js**      | グラフ特化         | オーバースペック    | ⭐⭐⭐    |

**結論**: Mermaid.js nativeアプローチを採用

## 実装アーキテクチャ

### 技術スタック
```
- フレームワーク: Next.js 14 (App Router)
- 描画ライブラリ: Mermaid.js
- 状態管理: Zustand  
- スタイリング: Tailwind CSS
- 言語: TypeScript
```

### ディレクトリ構成
```
/src
  /app
    page.tsx                 # メインページ
  /components  
    MermaidRenderer.tsx      # Mermaid描画コンポーネント
    MermaidEditor.tsx        # テキスト入力エディタ
    DetailsSidebar.tsx       # 詳細表示サイドバー
  /store
    mindmapStore.ts          # Zustand状態管理
  /lib
    mermaidParser.ts         # Mermaidパーサー
  /types
    mindmap.ts              # TypeScript型定義
```

## 核心実装：MermaidRenderer

### 1. Mermaidの初期化と描画

```typescript
'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useMindmapStore } from '@/store/mindmapStore';

export default function MermaidRenderer({ mermaidCode }: { mermaidCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedNode, parseMermaidForNodeData } = useMindmapStore();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
      mindmap: {
        padding: 20,
        maxNodeSizeRatio: 0.5
      }
    });
  }, []);
```

### 2. 動的レンダリングとイベント追加

```typescript
  useEffect(() => {
    if (!containerRef.current || !mermaidCode.trim()) return;

    const renderMermaid = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          parseMermaidForNodeData(mermaidCode);
          addClickEventListeners();
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    };

    renderMermaid();
  }, [mermaidCode, parseMermaidForNodeData]);
```

### 3. SVGノードへのクリックイベント追加

```typescript
  const addClickEventListeners = () => {
    if (!containerRef.current) return;

    const nodes = containerRef.current.querySelectorAll(
      '.mindmap-node, .node, [id*="node"], [class*="node"]'
    );
    
    nodes.forEach((node, index) => {
      // 重複防止
      if ((node as any)._clickAdded) return;
      (node as any)._clickAdded = true;
      
      const handleClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        
        // ノードテキスト取得
        const textElement = node.querySelector('text, span, div');
        const nodeText = textElement?.textContent?.trim() || `node_${index}`;
        
        setSelectedNode(nodeText);
        
        // 視覚的フィードバック
        nodes.forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');
      };
      
      node.addEventListener('click', handleClick);
    });
  };
```

## 状態管理：Zustand Store

```typescript
import { create } from 'zustand';

export const useMindmapStore = create<MindmapStore>((set, get) => ({
  mindmapData: null,
  selectedNodeId: null,
  mermaidInput: `mindmap
  root((中心テーマ))
    起源
      ロングテール
      ポピュラリゼーション
    研究
      論文発表
      ツール`,

  setSelectedNode: (nodeId: string | null) => 
    set({ selectedNodeId: nodeId }),

  parseMermaidForNodeData: (mermaidText: string) => {
    try {
      const mindmapData = MermaidParser.parseMindmap(mermaidText);
      set({ mindmapData });
    } catch (error) {
      console.error('Parsing error:', error);
    }
  }
}));
```

## パフォーマンス最適化

### 1. ちかちか問題の解決

初期実装では、ホバー時のCSS transitionが原因でちらつきが発生：

```css
/* 問題のあったCSS */
.node {
  transition: all 0.2s ease;
  transform: scale(1.05);
}
```

**解決策**: 軽量なエフェクトに変更

```css
/* 最適化後のCSS */
.mindmap-node:hover,
.node:hover {
  opacity: 0.8; /* 軽量なホバー効果 */
}

.selected {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
}

/* 全てのアニメーションを無効化 */
.mindmap-node *,
.node * {
  transition: none !important;
  animation: none !important;
}
```

### 2. イベントリスナーの重複防止

```typescript
// 重複追加防止の仕組み
if ((node as any)._clickAdded) return;
(node as any)._clickAdded = true;
```

## 詳細表示サイドバー

```typescript
export default function DetailsSidebar() {
  const { mindmapData, selectedNodeId } = useMindmapStore();
  
  const selectedNode = mindmapData?.nodes.find(node => 
    node.id === selectedNodeId || node.label === selectedNodeId
  );

  if (!selectedNode) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🧠</div>
          <p>ノードを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white overflow-y-auto">
      <h3 className="text-lg font-medium mb-2">
        {selectedNode.details?.title || selectedNode.label}
      </h3>
      <p className="text-gray-600 mb-4">
        {selectedNode.details?.description}
      </p>
      {/* 詳細情報の表示 */}
    </div>
  );
}
```

## 完成した機能

### ✅ 実装できた機能
- **Mermaid形式テキストの直接描画**
- **ノードクリックによるインタラクティブ操作**
- **リアルタイムサイドバー詳細表示**
- **エラーハンドリング**
- **レスポンシブデザイン**
- **TypeScript完全対応**

### 🎯 使用方法
1. Mermaid形式でマインドマップを記述
2. ブラウザでリアルタイム描画確認
3. ノードクリックで詳細情報表示
4. エディタモードでコード編集

## まとめ

本実装により、以下を実現しました：

1. **Mermaid.js native approach**により正確で軽量な描画
2. **SVG DOM操作**によるクリックイベント取得
3. **Next.js + TypeScript**による型安全な開発
4. **パフォーマンス最適化**によるスムーズな操作性

この手法は、ナレッジグラフやフローチャートなど、他のMermaid図表にも応用可能です。

---

## 参考：試行錯誤の記録

### 1. React Flow実装の試み

**経緯**: 当初はReact Flowを使用してカスタムノードでマインドマップを実装しようとしました。

**問題**:
- Mermaidパーサーのインデント検出が正しく動作せず、全ノードがlevel 0に
- 親子関係が構築されず、エッジが0個に
- 放射状レイアウトアルゴリズムが複雑

**学んだこと**: 
```typescript
// 問題のあったインデント検出
const lines = mermaidText.split('\n').map(line => line.trim()) // trimで情報喪失

// 修正版
const lines = mermaidText.split('\n').filter(line => line && !line.trim().startsWith('mindmap'))
const indent = this.getIndentLevel(line); // 元の行を使用
```

### 2. 位置計算アルゴリズムの改良

**試行1**: レベルベースの円形配置
```typescript
// 問題: 親子関係を無視した配置
const radius = level * 200;
const angle = index * angleStep;
node.x = Math.cos(angle) * radius;
```

**試行2**: 再帰的な放射状配置
```typescript
// 改良: 親ノードを基準とした配置
private static layoutChildrenRadially(nodes, parent, visited, startAngle) {
  const children = nodes.filter(n => n.parentId === parent.id);
  const radius = (parent.level + 1) * 250;
  
  children.forEach((child, index) => {
    const angle = startingAngle + (angleStep * index);
    child.x = parent.x + Math.cos(angle) * radius;
    child.y = parent.y + Math.sin(angle) * radius;
  });
}
```

### 3. Streamlit components.htmlの限界

**試み**: Streamlitでクリックイベント取得
```python
# 動作しなかったアプローチ
mermaid_html = f"""
<script>
  document.querySelectorAll('.node').forEach(node => {
    node.addEventListener('click', (e) => {
      // Streamlitに情報を送信する方法が不明
    });
  });
</script>
"""
components.html(mermaid_html)
```

**課題**: 
- StreamlitとJavaScript間の双方向通信が困難
- `st.components.v1`の制約

### 4. CSS Animation最適化の試行錯誤

**問題**: ホバー時のちらつき
```css
/* 重いアニメーション */
.node:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
  transition: all 0.2s ease;
}
```

**段階的改善**:
1. **transform削除** → まだちらつく
2. **transition短縮** → 軽減するが完全解決せず  
3. **opacity使用** → 大幅改善
4. **animation完全無効化** → 完全解決

**最終解**:
```css
.node:hover { opacity: 0.8; }
.node * { 
  transition: none !important; 
  animation: none !important; 
}
```

### 5. イベントリスナー重複問題

**現象**: 同じノードを複数回クリック登録
**原因**: useEffectでの再レンダリング時の重複追加
**解決**: フラグによる重複防止
```typescript
if ((node as any)._clickAdded) return;
(node as any)._clickAdded = true;
```

### 6. デバッグ手法の工夫

効果的だったデバッグアプローチ：
```typescript
// 詳細ログ出力
console.log('Parsed mindmap data:', mindmapData);
console.log('React Flow nodes:', reactFlowNodes);
console.log('React Flow edges:', reactFlowEdges);

// テストボタンによる切り分け
const simpleTest = `mindmap
  root((テスト))
    A
      A1
    B`;
```

### 7. ライブラリ選定の考慮事項

**検討要素**:
- **学習コスト**: Mermaid < React Flow < D3.js
- **カスタマイズ性**: D3.js > React Flow > Mermaid
- **保守性**: Mermaid > React Flow > D3.js
- **要件適合度**: 元要件がMermaid形式だったためMermaidが最適

**判断基準**: 
要件に最も近く、シンプルで保守性の高いソリューションを選択

これらの試行錯誤を通じて、最終的にMermaid.js nativeアプローチが最適解であることが判明しました。