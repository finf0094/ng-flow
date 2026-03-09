export interface NodeCatalogItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  nodeType?: 'default' | 'ai' | 'sticky';
  type?: 'default' | 'trigger';
  outputs?: 2;
}

export const NODE_CATEGORIES = ['Triggers', 'General', 'Communication', 'AI', 'Other'] as const;

export const NODE_CATALOG: NodeCatalogItem[] = [
  // Triggers
  {
    id: 'schedule',
    label: 'Schedule Trigger',
    description: 'Runs on a time schedule',
    icon: 'clock',
    color: '#f97316',
    category: 'Triggers',
    type: 'trigger',
  },
  {
    id: 'webhook',
    label: 'Webhook',
    description: 'Triggered by HTTP call',
    icon: 'link',
    color: '#10b981',
    category: 'Triggers',
    type: 'trigger',
  },
  {
    id: 'manual',
    label: 'Manual Trigger',
    description: 'Run workflow manually',
    icon: 'play',
    color: '#f59e0b',
    category: 'Triggers',
    type: 'trigger',
  },

  // General
  {
    id: 'http',
    label: 'HTTP Request',
    description: 'Make HTTP requests',
    icon: 'globe',
    color: '#3b82f6',
    category: 'General',
  },
  {
    id: 'set',
    label: 'Edit Fields',
    description: 'Set or transform data',
    icon: 'pencil',
    color: '#8b5cf6',
    category: 'General',
  },
  {
    id: 'if',
    label: 'IF',
    description: 'Conditional branching',
    icon: 'git-branch',
    color: '#f59e0b',
    category: 'General',
    outputs: 2,
  },
  {
    id: 'merge',
    label: 'Merge',
    description: 'Merge multiple branches',
    icon: 'git-merge',
    color: '#14b8a6',
    category: 'General',
  },
  {
    id: 'code',
    label: 'Code',
    description: 'Write custom JS/Python',
    icon: 'code',
    color: '#6366f1',
    category: 'General',
  },
  {
    id: 'respond',
    label: 'Respond to Webhook',
    description: 'Send HTTP response',
    icon: 'circle-check',
    color: '#22c55e',
    category: 'General',
  },
  {
    id: 'switch',
    label: 'Switch',
    description: 'Route based on rules',
    icon: 'git-fork',
    color: '#f97316',
    category: 'General',
    outputs: 2,
  },
  {
    id: 'loop',
    label: 'Loop Over Items',
    description: 'Process items one by one',
    icon: 'repeat',
    color: '#a855f7',
    category: 'General',
  },
  {
    id: 'filter',
    label: 'Filter',
    description: 'Filter items by condition',
    icon: 'filter',
    color: '#ec4899',
    category: 'General',
  },

  // Communication
  {
    id: 'slack',
    label: 'Slack',
    description: 'Send Slack messages',
    icon: 'message-square',
    color: '#4a154b',
    category: 'Communication',
  },
  {
    id: 'email',
    label: 'Send Email',
    description: 'Send emails via SMTP',
    icon: 'mail',
    color: '#ef4444',
    category: 'Communication',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Send Telegram messages',
    icon: 'send',
    color: '#0088cc',
    category: 'Communication',
  },

  // AI
  {
    id: 'ai-agent',
    label: 'AI Agent',
    description: 'Autonomous AI task runner',
    icon: 'bot',
    color: '#8b5cf6',
    category: 'AI',
    nodeType: 'ai',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'Call GPT models',
    icon: 'sparkles',
    color: '#10b981',
    category: 'AI',
    nodeType: 'ai',
  },
  {
    id: 'llm-chain',
    label: 'LLM Chain',
    description: 'Chain LLM calls',
    icon: 'link-2',
    color: '#a855f7',
    category: 'AI',
    nodeType: 'ai',
  },
  {
    id: 'embeddings',
    label: 'Embeddings',
    description: 'Generate vector embeddings',
    icon: 'cpu',
    color: '#6366f1',
    category: 'AI',
    nodeType: 'ai',
  },

  // Other
  {
    id: 'sticky',
    label: 'Sticky Note',
    description: 'Add a note to canvas',
    icon: 'sticky-note',
    color: '#fef08a',
    category: 'Other',
    nodeType: 'sticky',
  },
];
