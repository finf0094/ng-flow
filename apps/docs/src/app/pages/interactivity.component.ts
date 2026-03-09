import { Component, input, signal } from '@angular/core';
import { NgFlowComponent, HandleComponent, BackgroundComponent, addEdge } from '@org/ng-flow';
import { Position } from '@org/ng-flow';
import type { Node, Edge, Connection, GraphEdge } from '@org/ng-flow';

/* ── Connectable node used in the demo ──────────────────────────────────── */
@Component({
  selector: 'doc-connect-node',
  standalone: true,
  imports: [HandleComponent],
  template: `
    <lib-handle [type]="'target'" [position]="Position.Left" />
    <div class="cn" [class.cn--selected]="selected()">
      <div class="cn-icon">{{ data().icon }}</div>
      <div class="cn-label">{{ label() }}</div>
    </div>
    <lib-handle [type]="'source'" [position]="Position.Right" />
  `,
  styles: [`
    :host { display: block; position: relative; }
    .cn { display: flex; align-items: center; gap: 10px; padding: 10px 18px;
      background: #1e293b; border: 1px solid #334155; border-radius: 8px;
      min-width: 130px; transition: border-color .15s; }
    .cn--selected { border-color: #6366f1; box-shadow: 0 0 0 2px #6366f133; }
    .cn-icon { font-size: 20px; }
    .cn-label { color: #e2e8f0; font-size: 13px; font-weight: 600; }
  `],
})
class DocConnectNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<{ icon: string }>({ icon: '⚙️' });
  readonly selected = input<boolean>(false);
}

/* ── Auto mode demo (applyDefault=true, the default) ─────────────────────── */
@Component({
  selector: 'doc-auto-demo',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="demo-wrap">
      <lib-ng-flow
        [nodes]="nodes"
        [edges]="edges"
        [fitViewOnInit]="true"
        (connect)="onConnect($event)"
        style="height:300px; border-radius:8px; overflow:hidden;"
      >
        <lib-background variant="dots" [gap]="20" color="#334155" />
      </lib-ng-flow>
      <div class="status">{{ status() }}</div>
    </div>
  `,
  styles: [`
    .demo-wrap { display:flex; flex-direction:column; gap:8px; }
    .status { font-size:12px; color:#94a3b8; background:#0f172a; border:1px solid #1e293b;
      border-radius:6px; padding:6px 12px; font-family:monospace; }
  `],
})
class AutoDemoComponent {
  readonly nodes: Node[] = [
    { id: '1', position: { x: 40,  y: 80 }, label: 'Start', type: 'input', template: DocConnectNodeComponent, data: { icon: '▶' } },
    { id: '2', position: { x: 280, y: 40 }, label: 'Process', template: DocConnectNodeComponent, data: { icon: '⚙️' } },
    { id: '3', position: { x: 280, y: 140 }, label: 'Filter', template: DocConnectNodeComponent, data: { icon: '🔍' } },
    { id: '4', position: { x: 520, y: 80 }, label: 'Output', type: 'output', template: DocConnectNodeComponent, data: { icon: '✅' } },
  ];

  edges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  ];

  status = signal('Drag from a ▶ handle to a ◀ handle to connect nodes');

  onConnect(c: Connection): void {
    this.status.set(`✓ Connected: ${c.source} → ${c.target}`);
  }
}

/* ── Manual mode demo (applyDefault=false) ──────────────────────────────── */
@Component({
  selector: 'doc-manual-demo',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="demo-wrap">
      <lib-ng-flow
        #flow
        [nodes]="nodes"
        [edges]="edges()"
        [applyDefault]="false"
        [fitViewOnInit]="true"
        (connect)="onConnect($event)"
        style="height:300px; border-radius:8px; overflow:hidden;"
      >
        <lib-background variant="dots" [gap]="20" color="#334155" />
      </lib-ng-flow>
      <div class="status">{{ status() }}</div>
    </div>
  `,
  styles: [`
    .demo-wrap { display:flex; flex-direction:column; gap:8px; }
    .status { font-size:12px; color:#94a3b8; background:#0f172a; border:1px solid #1e293b;
      border-radius:6px; padding:6px 12px; font-family:monospace; }
  `],
})
class ManualDemoComponent {
  readonly nodes: Node[] = [
    { id: 'a', position: { x: 40,  y: 80 }, label: 'Alpha',  template: DocConnectNodeComponent, data: { icon: '🅰' } },
    { id: 'b', position: { x: 280, y: 40 }, label: 'Beta',   template: DocConnectNodeComponent, data: { icon: '🅱' } },
    { id: 'c', position: { x: 280, y: 140 }, label: 'Gamma', template: DocConnectNodeComponent, data: { icon: '🅶' } },
  ];

  edges = signal<Edge[]>([]);
  status = signal('applyDefault=false — you control edges in onConnect()');

  onConnect(c: Connection): void {
    const newEdge: Edge = {
      id: `${c.source}-${c.target}-${Date.now()}`,
      source: c.source,
      target: c.target,
      sourceHandle: c.sourceHandle ?? undefined,
      targetHandle: c.targetHandle ?? undefined,
      type: 'smoothstep',
      animated: true,
    };
    this.edges.update((prev) => addEdge(newEdge, prev as unknown as GraphEdge[]) as Edge[]);
    this.status.set(`✓ Edge added: ${c.source} → ${c.target} (${this.edges().length} total)`);
  }
}

/* ── Page component ──────────────────────────────────────────────────────── */
@Component({
  selector: 'app-docs-interactivity',
  standalone: true,
  imports: [AutoDemoComponent, ManualDemoComponent],
  template: `
    <div class="page">
      <h1>Interactivity & Connections</h1>
      <p class="tagline">Connect nodes by dragging from a source handle to a target handle.</p>

      <h2>How drag-to-connect works</h2>
      <ol>
        <li>Add <code>&lt;lib-handle type="source" [position]="Position.Right" /&gt;</code> to your node.</li>
        <li>Add <code>&lt;lib-handle type="target" [position]="Position.Left" /&gt;</code> to another node.</li>
        <li>
          Add <code>(connect)="onConnect(${'$event'})"</code> to <code>&lt;lib-ng-flow&gt;</code>.
          Edges are added <strong>automatically</strong> when <code>applyDefault</code> is <code>true</code> (the default).
        </li>
      </ol>

      <h2>Approach 1: Automatic edges (applyDefault=true)</h2>
      <p>
        This is the default behavior. Edges are added automatically when a connection is made.
        You only need to listen to <code>(connect)</code> if you want to react to connections.
      </p>
      <doc-auto-demo />

      <div class="code-block">{{ autoCode }}</div>

      <h2>Approach 2: Manual edges (applyDefault=false)</h2>
      <p>
        Set <code>[applyDefault]="false"</code> to take full control.
        You must add edges yourself in the <code>(connect)</code> handler using the <code>addEdge()</code> utility.
        Use a <code>signal&lt;Edge[]&gt;</code> so Angular reactively updates the flow.
      </p>
      <doc-manual-demo />

      <div class="code-block">{{ manualCode }}</div>

      <h2>Tips</h2>
      <ul>
        <li>Connections only complete when you release on a handle of the opposite type (source → target).</li>
        <li>Use <code>connectable="single"</code> on a handle to allow only one connection.</li>
        <li>Use <code>[isValidConnection]="myValidator"</code> to prevent invalid connections.</li>
        <li>The animated connection line is shown during drag — it uses the same path algorithm as the edge type.</li>
      </ul>
    </div>
  `,
})
export class InteractivityComponent {
  readonly autoCode = `// app.component.ts
import { Component } from '@angular/core';
import { NgFlowComponent } from '@org/ng-flow';
import type { Node, Edge, Connection } from '@org/ng-flow';

@Component({
  standalone: true,
  imports: [NgFlowComponent],
  template: \`
    <lib-ng-flow
      [nodes]="nodes"
      [edges]="edges"
      (connect)="onConnect($event)"
      style="height: 500px"
    />
  \`,
})
export class AppComponent {
  nodes: Node[] = [
    { id: '1', position: { x: 0,   y: 0 }, type: 'input', label: 'Start' },
    { id: '2', position: { x: 250, y: 0 }, label: 'Process' },
    { id: '3', position: { x: 500, y: 0 }, type: 'output', label: 'End' },
  ];

  // Initial edges — new connections are added automatically (applyDefault=true)
  edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

  onConnect(c: Connection): void {
    // Optional: react to new connections
    console.log('Connected:', c.source, '->', c.target);
  }
}`;

  readonly manualCode = `// app.component.ts  (applyDefault=false — full manual control)
import { Component, signal } from '@angular/core';
import { NgFlowComponent, addEdge } from '@org/ng-flow';
import type { Node, Edge, Connection } from '@org/ng-flow';

@Component({
  standalone: true,
  imports: [NgFlowComponent],
  template: \`
    <lib-ng-flow
      [nodes]="nodes"
      [edges]="edges()"
      [applyDefault]="false"
      (connect)="onConnect($event)"
      style="height: 500px"
    />
  \`,
})
export class AppComponent {
  nodes: Node[] = [
    { id: '1', position: { x: 0,   y: 0 }, label: 'Alpha' },
    { id: '2', position: { x: 250, y: 0 }, label: 'Beta' },
  ];

  // Use signal<Edge[]> so Angular tracks changes reactively
  edges = signal<Edge[]>([]);

  onConnect(c: Connection): void {
    const newEdge: Edge = {
      id: \`\${c.source}-\${c.target}\`,
      source: c.source,
      target: c.target,
      sourceHandle: c.sourceHandle ?? undefined,
      targetHandle: c.targetHandle ?? undefined,
      type: 'smoothstep',
      animated: true,
    };
    // addEdge() prevents duplicate edges automatically
    this.edges.update(prev => addEdge(newEdge, prev));
  }
}`;
}
