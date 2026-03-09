import { Component, input, signal } from '@angular/core';
import {
  NgFlowComponent,
  HandleComponent,
  NodeResizerComponent,
  BackgroundComponent,
  addEdge,
} from '@org/ng-flow';
import { Position } from '@org/ng-flow';
import type { Node, Edge, Connection } from '@org/ng-flow';

/* ── Resizable node component ────────────────────────────────────────────── */
@Component({
  selector: 'doc-resizable-node',
  standalone: true,
  imports: [HandleComponent, NodeResizerComponent],
  template: `
    <lib-node-resizer [minWidth]="80" [minHeight]="40" [isVisible]="selected()" />
    <lib-handle [type]="'target'" [position]="Position.Left" />
    <div class="rn">
      <div class="rn-label">{{ label() }}</div>
    </div>
    <lib-handle [type]="'source'" [position]="Position.Right" />
  `,
  styles: [`
    :host { display: block; position: relative; width: 100%; height: 100%; min-width: 80px; min-height: 40px; }
    .rn { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      background: #1e293b; border: 1px solid #334155; border-radius: 8px;
      box-sizing: border-box; }
    .rn-label { color: #e2e8f0; font-size: 13px; font-weight: 600; text-align: center;
      padding: 0 8px; word-break: break-word; }
  `],
})
class DocResizableNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<any>(null);
  readonly selected = input<boolean>(false);
}

/* ── Resizable node with constrained dimensions ───────────────────────────── */
@Component({
  selector: 'doc-constrained-node',
  standalone: true,
  imports: [HandleComponent, NodeResizerComponent],
  template: `
    <lib-node-resizer [minWidth]="120" [minHeight]="60" [maxWidth]="300" [maxHeight]="200" [isVisible]="selected()" />
    <lib-handle [type]="'target'" [position]="Position.Left" />
    <div class="cn">
      <div class="cn-label">{{ label() }}</div>
      <div class="cn-hint">min 120×60 · max 300×200</div>
    </div>
    <lib-handle [type]="'source'" [position]="Position.Right" />
  `,
  styles: [`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    .cn { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center;
      justify-content: center; background: #1e293b; border: 1px solid #6366f1;
      border-radius: 8px; box-sizing: border-box; gap: 4px; }
    .cn-label { color: #e2e8f0; font-size: 13px; font-weight: 600; }
    .cn-hint { color: #475569; font-size: 10px; }
  `],
})
class DocConstrainedNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<any>(null);
  readonly selected = input<boolean>(false);
}

/* ── Page component ──────────────────────────────────────────────────────── */
@Component({
  selector: 'app-docs-node-resizer',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="page">
      <h1>Node Resizer</h1>
      <p class="tagline">
        Add <code>&lt;lib-node-resizer&gt;</code> inside your custom node to make it resizable.
        Select a node to reveal the resize handles.
      </p>

      <h2>Basic resizable nodes</h2>
      <p>Click to select a node, then drag the blue handles or edges to resize.</p>
      <div class="demo-box" style="height:320px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow
          [nodes]="basicNodes"
          [edges]="basicEdges"
          [fitViewOnInit]="true"
          [applyDefault]="true"
          style="height:100%"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0f172a" />
        </lib-ng-flow>
      </div>

      <div class="code-block">{{ basicCode }}</div>

      <h2>With min/max constraints</h2>
      <p>Use <code>minWidth</code>, <code>minHeight</code>, <code>maxWidth</code>, <code>maxHeight</code> to limit resize range.</p>
      <div class="demo-box" style="height:280px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow
          [nodes]="constrainedNodes"
          [edges]="[]"
          [fitViewOnInit]="true"
          style="height:100%"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0f172a" />
        </lib-ng-flow>
      </div>

      <div class="code-block">{{ constrainedCode }}</div>

      <h2>How to use in your own node</h2>
      <div class="code-block">{{ usageCode }}</div>

      <h2>API</h2>
      <table>
        <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>isVisible</td><td>boolean</td><td>true</td><td>Show/hide resize handles (bind to selected())</td></tr>
          <tr><td>nodeId</td><td>string</td><td>''</td><td>Override node ID (auto-injects from context)</td></tr>
          <tr><td>minWidth</td><td>number</td><td>10</td><td>Minimum width in px</td></tr>
          <tr><td>minHeight</td><td>number</td><td>10</td><td>Minimum height in px</td></tr>
          <tr><td>maxWidth</td><td>number</td><td>∞</td><td>Maximum width in px</td></tr>
          <tr><td>maxHeight</td><td>number</td><td>∞</td><td>Maximum height in px</td></tr>
          <tr><td>color</td><td>string</td><td>#3367d9</td><td>Handle and line color</td></tr>
        </tbody>
      </table>
      <table>
        <thead><tr><th>Output</th><th>Payload</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>resizeStart</td><td>&#123; params: ResizeParams &#125;</td><td>Fired when resize drag starts</td></tr>
          <tr><td>resize</td><td>&#123; params: ResizeParamsWithDirection &#125;</td><td>Fired on each drag move</td></tr>
          <tr><td>resizeEnd</td><td>&#123; params: ResizeParams &#125;</td><td>Fired when drag ends</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class NodeResizerPageComponent {
  readonly basicNodes: Node[] = [
    { id: '1', position: { x: 40,  y: 60 },  label: 'Resize me!', template: DocResizableNodeComponent,
      style: { width: '160px', height: '60px' } },
    { id: '2', position: { x: 300, y: 40 },  label: 'Also resizable', template: DocResizableNodeComponent,
      style: { width: '140px', height: '80px' } },
    { id: '3', position: { x: 300, y: 160 }, label: 'And me', template: DocResizableNodeComponent,
      style: { width: '140px', height: '60px' } },
    { id: '4', position: { x: 560, y: 80 },  label: 'Output', template: DocResizableNodeComponent,
      style: { width: '120px', height: '60px' } },
  ];

  readonly basicEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
  ];

  readonly constrainedNodes: Node[] = [
    { id: 'c1', position: { x: 80,  y: 80 }, label: 'Constrained', template: DocConstrainedNodeComponent,
      style: { width: '160px', height: '80px' } },
    { id: 'c2', position: { x: 360, y: 80 }, label: 'Same limits', template: DocConstrainedNodeComponent,
      style: { width: '200px', height: '100px' } },
  ];

  readonly basicCode = `// my-resizable-node.component.ts
@Component({
  selector: 'app-resizable-node',
  standalone: true,
  imports: [HandleComponent, NodeResizerComponent],
  template: \`
    <!-- isVisible bound to selected() so handles only show when node is selected -->
    <lib-node-resizer [minWidth]="80" [minHeight]="40" [isVisible]="selected()" />
    <lib-handle type="target" [position]="Position.Left" />
    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
      {{ label() }}
    </div>
    <lib-handle type="source" [position]="Position.Right" />
  \`,
  styles: [\`:host { display:block; position:relative; width:100%; height:100%; }\`],
})
export class ResizableNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly selected = input<boolean>(false);  // injected by ng-flow
}

// In your flow:
nodes: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    label: 'Resize me',
    template: ResizableNodeComponent,
    style: { width: '160px', height: '80px' },  // initial size
  }
];`;

  readonly constrainedCode = `<lib-node-resizer
  [minWidth]="120"
  [minHeight]="60"
  [maxWidth]="300"
  [maxHeight]="200"
  [isVisible]="selected()"
/>`;

  readonly usageCode = `// 1. Create a resizable node component
@Component({
  template: \`
    <lib-node-resizer [isVisible]="selected()" [minWidth]="80" [minHeight]="40" />
    <lib-handle type="target" [position]="Position.Left" />
    <div>{{ label() }}</div>
    <lib-handle type="source" [position]="Position.Right" />
  \`,
})
export class MyResizableNode {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly selected = input<boolean>(false);
}

// 2. Set initial size via node.style
nodes: Node[] = [{
  id: '1',
  position: { x: 0, y: 0 },
  label: 'My Node',
  template: MyResizableNode,
  style: { width: '200px', height: '100px' },
}];`;
}
