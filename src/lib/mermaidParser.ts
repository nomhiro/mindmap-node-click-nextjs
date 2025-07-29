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
        details: {
          title: label,
          description: `${label}の詳細情報`,
          content: [
            `• ${label}に関する説明`,
            `• レベル: ${indent}`,
            `• 作成日: ${new Date().toLocaleDateString()}`
          ]
        }
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