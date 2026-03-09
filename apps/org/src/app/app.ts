import { Component, signal, ViewChild } from '@angular/core';
import type { Connection, Edge, Node, NodeMouseEvent } from '@org/ng-flow';
import { MarkerType, NgFlowComponent, PanelComponent } from '@org/ng-flow';
import { WorkflowNodeComponent } from './workflow-node.component';

@Component({
  imports: [NgFlowComponent, PanelComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @ViewChild(NgFlowComponent) flow!: NgFlowComponent;

  readonly initialNodes: Node[] = [
    {
      id: 'trigger',
      position: { x: 60, y: 220 },
      label: 'Webhook',
      template: WorkflowNodeComponent,
      data: { icon: '🔗', subtitle: 'POST /api/webhook', color: '#10b981' },
    },
    {
      id: 'http',
      position: { x: 360, y: 120 },
      label: 'HTTP Request',
      template: WorkflowNodeComponent,
      data: {
        icon: '🌐',
        subtitle: 'GET https://api.example.com/users',
        color: '#6366f1',
      },
    },
    {
      id: 'transform',
      position: { x: 360, y: 320 },
      label: 'Set Fields',
      template: WorkflowNodeComponent,
      data: { icon: '✏️', subtitle: 'Map response fields', color: '#f59e0b' },
    },
    {
      id: 'condition',
      position: { x: 660, y: 220 },
      label: 'IF Condition',
      template: WorkflowNodeComponent,
      data: { icon: '🔀', subtitle: 'status === "active"', color: '#ec4899' },
    },
    {
      id: 'notify',
      position: { x: 960, y: 100 },
      label: 'Send Email',
      template: WorkflowNodeComponent,
      data: {
        icon: '📧',
        subtitle: 'SMTP · notify@company.com',
        color: '#3b82f6',
      },
    },
    {
      id: 'log',
      position: { x: 960, y: 340 },
      label: 'Write to DB',
      template: WorkflowNodeComponent,
      data: { icon: '🗄️', subtitle: 'INSERT INTO audit_log', color: '#8b5cf6' },
    },
    {
      id: 'end',
      position: { x: 1240, y: 220 },
      label: 'Respond',
      template: WorkflowNodeComponent,
      data: {
        icon: '✅',
        subtitle: '200 OK · {"status":"done"}',
        color: '#10b981',
      },
    },
  ];

  readonly initialEdges: Edge[] = [
    {
      id: 'e-t-h',
      source: 'trigger',
      target: 'http',
      type: 'default',
      animated: true,
      markerEnd: MarkerType.ArrowClosed,
    },
    {
      id: 'e-t-tr',
      source: 'trigger',
      target: 'transform',
      type: 'smoothstep',
      animated: true,
    },
    { id: 'e-h-c', source: 'http', target: 'condition', type: 'smoothstep' },
    {
      id: 'e-tr-c',
      source: 'transform',
      target: 'condition',
      type: 'smoothstep',
    },
    {
      id: 'e-c-n',
      source: 'condition',
      target: 'notify',
      type: 'smoothstep',
      label: 'true',
    },
    {
      id: 'e-c-l',
      source: 'condition',
      target: 'log',
      type: 'smoothstep',
      label: 'false',
    },
    { id: 'e-n-e', source: 'notify', target: 'end', type: 'smoothstep' },
    { id: 'e-l-e', source: 'log', target: 'end', type: 'smoothstep' },
  ];

  lastEvent = signal<string>('Click a node or connect handles');

  onConnect(conn: Connection): void {
    this.lastEvent.set(`Connected: ${conn.source} → ${conn.target}`);
  }

  onNodeClick(e: NodeMouseEvent): void {
    this.lastEvent.set(`Node: ${e.node.label ?? e.node.id}`);
  }
}
