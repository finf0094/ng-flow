import { MarkerType } from '@org/ng-flow';
import type { Edge } from '@org/ng-flow';
import type { CanvasNodeData } from '../components/canvas-node/canvas-node.component';
import type { StickyNoteData } from '../components/sticky-note-node/sticky-note-node.component';
import type { AiNodeData } from '../components/ai-node/ai-node.component';

export interface RawNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  nodeType?: 'default' | 'ai' | 'sticky';
  data: CanvasNodeData | StickyNoteData | AiNodeData;
}

export const INITIAL_RAW_NODES: RawNode[] = [
  // ── Sticky note ──────────────────────────────────────────────
  {
    id: 'note-1',
    label: '',
    position: { x: 60, y: 40 },
    nodeType: 'sticky',
    data: {
      text: 'Customer Order Workflow\n\nTriggered every hour to process pending orders.',
      color: 'yellow',
    } satisfies StickyNoteData,
  },

  // ── Trigger ───────────────────────────────────────────────────
  {
    id: 'schedule',
    label: 'Schedule Trigger',
    position: { x: 60, y: 260 },
    data: {
      icon: 'clock',
      color: '#f97316',
      type: 'trigger',
      subtitle: 'Every hour',
    } satisfies CanvasNodeData,
  },

  // ── Core flow ─────────────────────────────────────────────────
  {
    id: 'http',
    label: 'HTTP Request',
    position: { x: 300, y: 260 },
    data: {
      icon: 'globe',
      color: '#3b82f6',
      subtitle: 'GET /api/orders',
    } satisfies CanvasNodeData,
  },
  {
    id: 'set',
    label: 'Edit Fields',
    position: { x: 540, y: 260 },
    data: {
      icon: 'pencil',
      color: '#8b5cf6',
      subtitle: 'Map order data',
    } satisfies CanvasNodeData,
  },
  {
    id: 'if',
    label: 'IF',
    position: { x: 780, y: 260 },
    data: {
      icon: 'git-branch',
      color: '#f59e0b',
      subtitle: 'order.status === "pending"',
      outputs: 2,
    } satisfies CanvasNodeData,
  },

  // ── True branch ───────────────────────────────────────────────
  {
    id: 'slack',
    label: 'Slack',
    position: { x: 1020, y: 160 },
    data: {
      icon: 'message-square',
      color: '#4a154b',
      subtitle: '#orders-alerts',
    } satisfies CanvasNodeData,
  },

  // ── False branch ──────────────────────────────────────────────
  {
    id: 'email',
    label: 'Send Email',
    position: { x: 1020, y: 360 },
    data: {
      icon: 'mail',
      color: '#ef4444',
      subtitle: 'ops@company.com',
    } satisfies CanvasNodeData,
  },

  // ── Converge ──────────────────────────────────────────────────
  {
    id: 'merge',
    label: 'Merge',
    position: { x: 1260, y: 260 },
    data: {
      icon: 'git-merge',
      color: '#14b8a6',
      subtitle: 'Combine branches',
    } satisfies CanvasNodeData,
  },
  {
    id: 'respond',
    label: 'Respond to Webhook',
    position: { x: 1500, y: 260 },
    data: {
      icon: 'circle-check',
      color: '#22c55e',
      subtitle: '200 OK',
    } satisfies CanvasNodeData,
  },

  // ── AI node (disconnected, off to the side) ───────────────────
  {
    id: 'ai-agent',
    label: 'AI Agent',
    position: { x: 300, y: 560 },
    nodeType: 'ai',
    data: {
      icon: 'bot',
      color: '#8b5cf6',
      subtitle: 'GPT-4o',
      model: 'gpt-4o',
    } satisfies AiNodeData,
  },
  {
    id: 'openai',
    label: 'OpenAI Chat Model',
    position: { x: 540, y: 560 },
    nodeType: 'ai',
    data: {
      icon: 'sparkles',
      color: '#10b981',
      subtitle: 'Generate response',
      model: 'gpt-4o-mini',
    } satisfies AiNodeData,
  },
];

export const INITIAL_EDGES: Edge[] = [
  { id: 'e-schedule-http', source: 'schedule', target: 'http', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-http-set', source: 'http', target: 'set', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-set-if', source: 'set', target: 'if', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-if-slack', source: 'if', sourceHandle: 'true', target: 'slack', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-if-email', source: 'if', sourceHandle: 'false', target: 'email', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-slack-merge', source: 'slack', target: 'merge', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-email-merge', source: 'email', target: 'merge', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-merge-respond', source: 'merge', target: 'respond', type: 'default', markerEnd: MarkerType.ArrowClosed },
  { id: 'e-ai-openai', source: 'ai-agent', target: 'openai', type: 'default', markerEnd: MarkerType.ArrowClosed },
];
