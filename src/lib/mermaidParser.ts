import { MindmapData, MindmapNode, MindmapEdge } from '@/types/mindmap';

export class MermaidParser {
  private static nodeCounter = 0;

  static parseMindmap(mermaidText: string): MindmapData {
    const lines = mermaidText.split('\n').filter(line => line && !line.trim().startsWith('mindmap'));
    console.log('Filtered lines:', lines);
    
    const nodes: MindmapNode[] = [];
    const edges: MindmapEdge[] = [];
    let rootId = '';

    this.nodeCounter = 0;
    const nodeStack: { node: MindmapNode; indent: number }[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const indent = this.getIndentLevel(line);
      const content = line.trim();
      console.log(`Processing line: "${line}", indent: ${indent}, content: "${content}"`);
      
      if (content.startsWith('::icon')) continue;

      const nodeId = `node_${this.nodeCounter++}`;
      const label = this.extractLabel(content);
      console.log(`Created node: ${nodeId}, label: "${label}", level: ${indent}`);

      const node: MindmapNode = {
        id: nodeId,
        label,
        x: 0,
        y: 0,
        level: indent,
        children: [],
        details: this.generateTechDetails(label, indent)
      };

      if (indent === 0) {
        rootId = nodeId;
      } else {
        while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].indent >= indent) {
          nodeStack.pop();
        }

        if (nodeStack.length > 0) {
          const parent = nodeStack[nodeStack.length - 1].node;
          node.parentId = parent.id;
          parent.children.push(nodeId);

          edges.push({
            id: `edge_${parent.id}_${nodeId}`,
            source: parent.id,
            target: nodeId
          });
        }
      }

      nodes.push(node);
      nodeStack.push({ node, indent });
    }

    console.log('Before position calculation:', nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y, level: n.level })));
    this.calculatePositions(nodes, rootId);
    console.log('After position calculation:', nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y, level: n.level })));

    return {
      nodes,
      edges,
      rootId
    };
  }

  private static getIndentLevel(line: string): number {
    const match = line.match(/^(\s*)/);
    const spaces = match ? match[1].length : 0;
    console.log(`Line: "${line}", spaces: ${spaces}, level: ${Math.floor(spaces / 2)}`);
    return Math.floor(spaces / 2);
  }

  private static extractLabel(content: string): string {
    const bracketMatch = content.match(/\(\((.+?)\)\)/);
    if (bracketMatch) return bracketMatch[1];

    const parenthesesMatch = content.match(/\((.+?)\)/);
    if (parenthesesMatch) return parenthesesMatch[1];

    return content;
  }

  private static generateTechDetails(label: string, level: number) {
    const techDetailsMap: Record<string, { description: string; content: string[] }> = {
      'IT Technology': {
        description: 'Information Technology（情報技術）は、コンピューターとインターネットを使用して情報を保存、取得、送信、操作するためのテクノロジーです。',
        content: [
          'ハードウェア、ソフトウェア、ネットワーク技術を包含',
          'デジタル変革（DX）の基盤となる技術領域',
          '急速に進化する技術分野で継続的な学習が必要'
        ]
      },
      'Programming Languages': {
        description: 'プログラミング言語は、コンピューターに指示を与えるための形式言語です。用途に応じて適切な言語を選択することが重要です。',
        content: [
          '用途に応じて適切な言語を選択することが重要',
          'フロントエンドとバックエンドで異なる言語が使用される',
          'トレンドや技術要件に応じて新しい言語が登場'
        ]
      },
      'Frontend': {
        description: 'フロントエンド技術は、ユーザーが直接操作するWebアプリケーションの表示部分を構築するための技術です。',
        content: [
          'ユーザーインターフェース（UI）の構築に使用',
          'レスポンシブデザインとユーザビリティが重要',
          'モダンなフレームワークで開発効率が向上'
        ]
      },
      'JavaScript': {
        description: 'JavaScriptは動的なWebページの作成に使用される汎用プログラミング言語です。フロントエンドとバックエンドの両方で使用されます。',
        content: [
          'ブラウザで実行される唯一のプログラミング言語',
          'Node.jsによりサーバーサイドでも実行可能',
          'ES6以降で多くの新機能が追加され続けている'
        ]
      },
      'React': {
        description: 'Reactは、Facebookが開発したユーザーインターフェース構築のためのJavaScriptライブラリです。',
        content: [
          'コンポーネントベースの開発でコードの再利用性が高い',
          'Virtual DOMにより高いパフォーマンスを実現',
          '豊富なエコシステムと活発なコミュニティ'
        ]
      },
      'Vue.js': {
        description: 'Vue.jsは、プログレッシブフレームワークとして設計された、ユーザーインターフェース構築用のJavaScriptフレームワークです。',
        content: [
          '学習コストが低く、初心者にも優しい設計',
          'プログレッシブフレームワークで段階的な導入が可能',
          '軽量で高速なパフォーマンス'
        ]
      },
      'Angular': {
        description: 'Angularは、Googleが開発したTypeScriptベースのWebアプリケーションフレームワークです。',
        content: [
          'TypeScriptを標準採用で大規模開発に適している',
          '包括的なフレームワークで多くの機能を内包',
          'エンタープライズレベルのアプリケーション開発に最適'
        ]
      },
      'TypeScript': {
        description: 'TypeScriptは、Microsoftが開発したJavaScriptのスーパーセットで、静的型付けを提供します。',
        content: [
          'JavaScriptに静的型付けを追加',
          'コンパイル時にエラーを検出してバグを削減',
          '大規模プロジェクトでのコード品質向上に貢献'
        ]
      },
      'CSS': {
        description: 'CSS（Cascading Style Sheets）は、HTMLドキュメントのスタイルとレイアウトを定義するためのスタイルシート言語です。',
        content: [
          'Webページの見た目とレイアウトを制御',
          'レスポンシブデザインの実現に不可欠',
          'CSS3で多くの新機能とアニメーションが追加'
        ]
      },
      'Backend': {
        description: 'バックエンド技術は、サーバーサイドでアプリケーションのロジック、データベース処理、API提供を行う技術です。',
        content: [
          'ビジネスロジックとデータ処理を担当',
          'データベースとの連携とAPI提供',
          'セキュリティとパフォーマンスが重要な要素'
        ]
      },
      'Python': {
        description: 'Pythonは、読みやすい構文を持つ高水準プログラミング言語で、Web開発、データサイエンス、AI開発で広く使用されます。',
        content: [
          'シンプルで読みやすい構文',
          '豊富なライブラリとフレームワーク',
          'データサイエンスとAI分野で特に人気'
        ]
      },
      'Node.js': {
        description: 'Node.jsは、Chrome V8 JavaScriptエンジンで構築されたJavaScriptランタイム環境で、サーバーサイド開発を可能にします。',
        content: [
          'JavaScriptでサーバーサイド開発が可能',
          'ノンブロッキングI/Oで高いパフォーマンス',
          'NPMエコシステムで豊富なパッケージを利用'
        ]
      },
      'Databases': {
        description: 'データベースは、構造化された情報を効率的に保存、取得、管理するためのシステムです。',
        content: [
          'データの永続化と効率的な検索機能を提供',
          'リレーショナル、NoSQL、グラフなど用途に応じて選択',
          'ACID特性やCAP定理などの理論的基盤が重要'
        ]
      },
      'Cloud Services': {
        description: 'クラウドサービスは、インターネット経由でコンピューティングリソースを提供するサービスです。',
        content: [
          'スケーラビリティと柔軟性を提供',
          '初期投資を抑えてITインフラを利用可能',
          'IaaS、PaaS、SaaSの3つの主要なサービスモデル'
        ]
      },
      'DevOps': {
        description: 'DevOpsは、開発（Development）と運用（Operations）を統合し、ソフトウェアの開発・リリース・運用を効率化する手法です。',
        content: [
          '開発と運用の連携でリリースサイクルを短縮',
          '自動化によりヒューマンエラーを削減',
          '継続的インテグレーション・継続的デリバリー（CI/CD）を実現'
        ]
      },
      'Security': {
        description: 'ITセキュリティは、情報システムとデータを様々な脅威から保護するための技術と手法の総称です。',
        content: [
          '機密性、完全性、可用性（CIA）の確保が基本',
          '多層防御アプローチで包括的な保護を実現',
          '継続的な脅威監視と対策アップデートが必要'
        ]
      }
    };

    // Get specific details or fall back to generic tech info
    const details = techDetailsMap[label] || {
      description: `${label}に関する技術情報です。現代のIT業界で重要な役割を果たしている技術領域の一つです。`,
      content: [
        `${label}は現代のIT技術において重要な要素`,
        `継続的な学習と実践が必要な分野`,
        `他の技術との連携により価値を最大化`
      ]
    };

    return {
      title: label,
      description: details.description,
      content: details.content
    };
  }

  private static calculatePositions(nodes: MindmapNode[], rootId: string): void {
    const root = nodes.find(n => n.id === rootId);
    console.log('Root node found:', root);
    if (!root) return;

    // ルートノードを中心に配置
    root.x = 0;
    root.y = 0;
    console.log('Set root position:', root.x, root.y);

    // 訪問済みノードを追跡
    const visited = new Set<string>();
    visited.add(rootId);

    // 幅優先探索でレイアウト計算
    this.layoutChildrenRadially(nodes, root, visited, 0);
  }

  private static layoutChildrenRadially(
    nodes: MindmapNode[], 
    parent: MindmapNode, 
    visited: Set<string>, 
    startAngle: number = 0
  ): void {
    const children = nodes.filter(n => n.parentId === parent.id);
    console.log(`Layout children for ${parent.id} (${parent.label}):`, children.map(c => c.id));
    if (children.length === 0) return;

    const radius = (parent.level + 1) * 250;
    const angleRange = children.length === 1 ? Math.PI / 4 : Math.PI * 1.5;
    const angleStep = children.length > 1 ? angleRange / (children.length - 1) : 0;
    const startingAngle = startAngle - angleRange / 2;

    console.log(`Parent: ${parent.id}, children: ${children.length}, radius: ${radius}`);

    children.forEach((child, index) => {
      if (visited.has(child.id)) return;
      visited.add(child.id);

      const angle = startingAngle + (angleStep * index);
      child.x = parent.x + Math.cos(angle) * radius;
      child.y = parent.y + Math.sin(angle) * radius;
      
      console.log(`Child ${child.id} positioned at (${child.x}, ${child.y}), angle: ${angle}`);

      // 子ノードの配置を再帰的に計算
      this.layoutChildrenRadially(nodes, child, visited, angle);
    });
  }
}