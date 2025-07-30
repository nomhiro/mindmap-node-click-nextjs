import { create } from 'zustand';
import { MindmapStore, MindmapData } from '@/types/mindmap';
import { MermaidParser } from '@/lib/mermaidParser';

export const useMindmapStore = create<MindmapStore>((set, get) => ({
  mindmapData: null,
  selectedNodeId: null,
  mermaidInput: `mindmap
  root((IT Technology))
    Programming Languages
      Frontend
        JavaScript
          React
          Vue.js
          Angular
        TypeScript
        CSS
          Tailwind CSS
          SCSS
      Backend
        Python
          Django
          FastAPI
        Node.js
          Express
          NestJS
        Java
          Spring Boot
        Go
        Rust
    Databases
      Relational
        PostgreSQL
        MySQL
        SQLite
      NoSQL
        MongoDB
        Redis
        Cassandra
      Graph
        Neo4j
    Cloud Services
      AWS
        EC2
        S3
        Lambda
        RDS
      Azure
        Virtual Machines
        Blob Storage
        Functions
      Google Cloud
        Compute Engine
        Cloud Storage
        Cloud Functions
    DevOps
      Containerization
        Docker
        Kubernetes
      CI/CD
        GitHub Actions
        Jenkins
        GitLab CI
      Monitoring
        Prometheus
        Grafana
        ELK Stack
    Security
      Authentication
        OAuth
        JWT
        SAML
      Encryption
        TLS/SSL
        AES
      Penetration Testing
        OWASP
        Vulnerability Assessment`,

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