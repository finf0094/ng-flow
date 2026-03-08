import { Component } from '@angular/core';
import { NgFlowComponent } from '@org/ng-flow';
import type { Node, Edge } from '@org/ng-flow';

@Component({
  selector: 'app-docs-intro',
  standalone: true,
  imports: [NgFlowComponent],
  template: `
    <div class="page">
      <h1>ng-flow</h1>
      <p class="tagline">Angular 21 library for building node-based diagrams and workflows.</p>

      <h2>What is ng-flow?</h2>
      <p>
        ng-flow is an Angular 21 library for building interactive node-based diagrams, flow charts,
        and workflow editors. It is inspired by <strong>vue-flow</strong> and brings the same powerful
        API to Angular with signals-based state, D3-powered zoom/pan, and fully customisable nodes
        and edges via Angular components.
      </p>
      <p>
        Key features include: drag-and-drop nodes, multiple built-in edge types, custom node
        templates, connection handle system, viewport controls, and a clean event API.
      </p>

      <h2>Installation</h2>
      <p>Install the package from npm:</p>
      <pre class="code-block">npm install &#64;org/ng-flow</pre>
      <p>Then import the styles in your global <code>styles.css</code>:</p>
      <pre class="code-block">&#64;import 'node_modules/&#64;org/ng-flow/styles.css';</pre>

      <h2>Quick Start</h2>
      <p>Add <code>&lt;lib-ng-flow&gt;</code> to your component template:</p>
      <pre class="code-block">{{ templateCode }}</pre>
      <p>In your component class:</p>
      <pre class="code-block">{{ tsCode }}</pre>

      <h2>Try it</h2>
      <p class="live-label">Live Example</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="nodes"
          [edges]="edges"
          [fitViewOnInit]="true"
          style="height: 350px"
        />
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; max-width: 860px; }
    h1 { font-size: 26px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
    .tagline { color: #64748b; margin: 0 0 32px; font-size: 15px; }
    h2 { font-size: 18px; font-weight: 600; color: #e2e8f0; margin: 32px 0 12px; padding-top: 24px; border-top: 1px solid #1e2333; }
    h2:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
    p { color: #94a3b8; line-height: 1.7; margin: 0 0 16px; }
    strong { color: #cbd5e1; }
    code { background: #1e2333; color: #a5d6ff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .live-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px; }
    .flow-wrap { border-radius: 10px; overflow: hidden; border: 1px solid #1e2333; margin-bottom: 28px; }
  `],
})
export class IntroComponent {
  readonly templateCode = `<lib-ng-flow
  [nodes]="nodes"
  [edges]="edges"
  style="height: 400px"
  (connect)="onConnect($event)"
/>`;

  readonly tsCode = `import { NgFlowComponent } from '@org/ng-flow';
import type { Node, Edge, Connection } from '@org/ng-flow';

@Component({
  imports: [NgFlowComponent],
  template: \`<lib-ng-flow [nodes]="nodes" [edges]="edges" style="height:400px" />\`,
})
export class AppComponent {
  nodes: Node[] = [
    { id: '1', type: 'input', position: { x: 100, y: 100 }, label: 'Input Node' },
    { id: '2', position: { x: 400, y: 100 }, label: 'Default Node' },
    { id: '3', type: 'output', position: { x: 700, y: 100 }, label: 'Output Node' },
  ];
  edges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
  ];
}`;

  readonly nodes: Node[] = [
    { id: '1', type: 'input', position: { x: 80, y: 160 }, label: 'Start' },
    { id: '2', type: 'output', position: { x: 420, y: 160 }, label: 'End' },
  ];

  readonly edges: Edge[] = [
    { id: 'e1', source: '1', target: '2', type: 'smoothstep', animated: true },
  ];
}
