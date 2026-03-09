import { Component, input, signal } from '@angular/core';
import { MarkerType, NgFlowComponent, BackgroundComponent, addEdge } from '@org/ng-flow';
import { HandleComponent, Position } from '@org/ng-flow';
import type { Node, Edge, Connection, NodeMouseEvent } from '@org/ng-flow';

interface WfData { icon: string; subtitle: string; color: string; }

@Component({
  selector: 'doc-wf-node',
  standalone: true,
  imports: [HandleComponent],
  template: `
    <lib-handle [type]="'target'" [position]="Position.Left" />
    <div class="wf" [style.--c]="data().color">
      <div class="wf-h">
        <span class="wf-ico">{{ data().icon }}</span>
        <span class="wf-lbl">{{ label() }}</span>
      </div>
      @if (data().subtitle) {
        <div class="wf-sub">{{ data().subtitle }}</div>
      }
    </div>
    <lib-handle [type]="'source'" [position]="Position.Right" />
  `,
  styles: [`
    :host { display: block; position: relative; }
    .wf { width: 210px; background: #fff; border-radius: 8px;
      border: 1px solid #e2e8f0; border-left: 4px solid var(--c, #6366f1);
      box-shadow: 0 2px 8px rgba(0,0,0,.1); padding: 10px 14px; }
    .wf-h { display: flex; align-items: center; gap: 8px; }
    .wf-ico { font-size: 18px; }
    .wf-lbl { font-size: 13px; font-weight: 600; color: #1e293b; }
    .wf-sub { font-size: 11px; color: #94a3b8; margin-top: 4px; padding-left: 26px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    :host-context(.selected) .wf { box-shadow: 0 0 0 2px var(--c, #6366f1); }
  `],
})
class WfNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<WfData>({ icon: '⚙️', subtitle: '', color: '#6366f1' });
  readonly selected = input<boolean>(false);
}

@Component({
  selector: 'app-docs-demo',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="demo-layout">
      <div class="demo-header">
        <span class="demo-title">n8n-style Workflow Demo</span>
        <span class="demo-hint">Drag nodes · Connect handles · Scroll to zoom</span>
        <span class="demo-event">{{ lastEvent() }}</span>
      </div>
      <lib-ng-flow
        [nodes]="nodes"
        [edges]="edges()"
        [fitViewOnInit]="true"
        [applyDefault]="false"
        [snapGrid]="[16, 16]"
        [snapToGrid]="true"
        (nodeDoubleClick)="nodeDoubleClick($event)"
        (connect)="onConnect($event)"
        style="height: calc(100vh - 120px)"
      >
        <lib-background variant="dots" [gap]="24" color="#1e2333" bgColor="#0a0c12" />
      </lib-ng-flow>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .demo-layout { display: flex; flex-direction: column; height: 100%; }
    .demo-header {
      display: flex; align-items: center; gap: 16px;
      padding: 0 24px; height: 56px; min-height: 56px;
      background: #0d0f17; border-bottom: 1px solid #1e2333;
      flex-shrink: 0;
    }
    .demo-title { font-size: 15px; font-weight: 700; color: #f1f5f9; }
    .demo-hint { font-size: 12px; color: #475569; flex: 1; }
    .demo-event { font-size: 12px; color: #6366f1; font-family: monospace; }
  `],
})
export class DemoComponent {
  readonly nodes: Node[] = [
    {
      id: 'trigger',
      position: { x: 80, y: 200 },
      label: 'Webhook',
      template: WfNodeComponent,
      data: { icon: '🔗', subtitle: 'POST /api/webhook', color: '#10b981' },
    },
    {
      id: 'http',
      position: { x: 360, y: 100 },
      label: 'HTTP Request',
      template: WfNodeComponent,
      data: { icon: '🌐', subtitle: 'GET https://api.example.com/data', color: '#6366f1' },
    },
    {
      id: 'set',
      position: { x: 360, y: 280 },
      label: 'Set Fields',
      template: WfNodeComponent,
      data: { icon: '✏️', subtitle: 'Map response → payload', color: '#f59e0b' },
    },
    {
      id: 'if',
      position: { x: 640, y: 200 },
      label: 'IF Condition',
      template: WfNodeComponent,
      data: { icon: '⚡', subtitle: 'payload.status === "ok"', color: '#ec4899' },
    },
    {
      id: 'email',
      position: { x: 920, y: 100 },
      label: 'Send Email',
      template: WfNodeComponent,
      data: { icon: '📧', subtitle: 'To: {{ user.email }}', color: '#0ea5e9' },
    },
    {
      id: 'db',
      position: { x: 920, y: 280 },
      label: 'Write to DB',
      template: WfNodeComponent,
      data: { icon: '🗄️', subtitle: 'INSERT INTO events', color: '#8b5cf6' },
    },
    {
      id: 'merge',
      position: { x: 1180, y: 200 },
      label: 'Merge',
      template: WfNodeComponent,
      data: { icon: '⊕', subtitle: 'Combine branches', color: '#14b8a6' },
    },
    {
      id: 'respond',
      position: { x: 1440, y: 200 },
      label: 'Respond',
      template: WfNodeComponent,
      data: { icon: '✅', subtitle: '200 OK', color: '#22c55e' },
    },
  ];

  readonly edges = signal<Edge[]>([
    { id: 'e-trigger-http', source: 'trigger', target: 'http',    type: 'default',    label: 'on POST', markerEnd: MarkerType.Arrow },
    { id: 'e-trigger-set',  source: 'trigger', target: 'set',     type: 'smoothstep', animated: true, label: 'on POST' },
    { id: 'e-http-if',      source: 'http',    target: 'if',      type: 'smoothstep', animated: true, label: 'data' },
    { id: 'e-set-if',       source: 'set',     target: 'if',      type: 'smoothstep', animated: true, label: 'fields' },
    { id: 'e-if-email',     source: 'if',      target: 'email',   type: 'smoothstep', animated: true, label: 'true' },
    { id: 'e-if-db',        source: 'if',      target: 'db',      type: 'smoothstep', animated: true, label: 'false' },
    { id: 'e-email-merge',  source: 'email',   target: 'merge',   type: 'smoothstep', animated: true },
    { id: 'e-db-merge',     source: 'db',      target: 'merge',   type: 'smoothstep', animated: true },
    { id: 'e-merge-respond',source: 'merge',   target: 'respond', type: 'smoothstep', animated: true },
  ]);

  readonly lastEvent = signal('Drag from a handle to another to connect nodes');

  onConnect(c: Connection): void {
    const e: Edge = {
      id: `e-${c.source}-${c.target}-${Date.now()}`,
      source: c.source,
      target: c.target,
      sourceHandle: c.sourceHandle ?? undefined,
      targetHandle: c.targetHandle ?? undefined,
      type: 'smoothstep',
      animated: true,
    };
    this.edges.update((prev) => addEdge(e, prev as any) as Edge[]);
    this.lastEvent.set(`Connected: ${c.source} → ${c.target}`);
  }

  nodeDoubleClick(event: NodeMouseEvent) {
    console.log('@nodeDblClick', event)
  }
}
