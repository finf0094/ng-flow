import { Component } from '@angular/core';
import { MarkerType, NgFlowComponent, BackgroundComponent } from '@org/ng-flow';
import type { Node, Edge } from '@org/ng-flow';

@Component({
  selector: 'app-docs-edges',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="page">
      <h1>Edges</h1>
      <p class="tagline">Edges connect nodes and can be styled with labels, animations, and markers.</p>

      <h2>Edge Types</h2>
      <p>
        Choose an edge type via the <code>type</code> field on an edge object. All types support
        labels, animation, and custom styles.
      </p>
      <table>
        <thead>
          <tr><th>Type value</th><th>Curve style</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>default</code></td>
            <td>Bezier</td>
            <td>Smooth cubic bezier curve (default when no type is set).</td>
          </tr>
          <tr>
            <td><code>straight</code></td>
            <td>Straight</td>
            <td>A direct straight line between source and target.</td>
          </tr>
          <tr>
            <td><code>step</code></td>
            <td>Step</td>
            <td>Right-angle path with sharp corners.</td>
          </tr>
          <tr>
            <td><code>smoothstep</code></td>
            <td>Smooth step</td>
            <td>Right-angle path with rounded corners.</td>
          </tr>
          <tr>
            <td><code>simple-bezier</code></td>
            <td>Simple bezier</td>
            <td>A simplified bezier with less curvature than the default.</td>
          </tr>
        </tbody>
      </table>

      <p class="live-label">All edge types</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="allTypeNodes"
          [edges]="allTypeEdges"
          [fitViewOnInit]="true"
          [nodesDraggable]="false"
          style="height: 500px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
        </lib-ng-flow>
      </div>

      <h2>Edge Options</h2>
      <p>Edges accept a rich set of configuration options beyond just connecting two nodes.</p>
      <table>
        <thead>
          <tr><th>Option</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>animated</code></td>
            <td><code>boolean</code></td>
            <td>Animates a dashed stroke moving along the edge path.</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>Text rendered at the midpoint of the edge.</td>
          </tr>
          <tr>
            <td><code>labelStyle</code></td>
            <td><code>CSSStyleDeclaration</code></td>
            <td>Inline styles applied to the label element.</td>
          </tr>
          <tr>
            <td><code>markerEnd</code></td>
            <td><code>EdgeMarkerType</code></td>
            <td>Arrow marker at the target end (e.g. <code>&#123; type: 'arrowclosed' &#125;</code>).</td>
          </tr>
          <tr>
            <td><code>style</code></td>
            <td><code>CSSStyleDeclaration</code></td>
            <td>Inline styles for the SVG path element.</td>
          </tr>
          <tr>
            <td><code>zIndex</code></td>
            <td><code>number</code></td>
            <td>Controls rendering order relative to other edges.</td>
          </tr>
        </tbody>
      </table>
      <pre class="code-block">{{ edgeOptionsCode }}</pre>

      <p class="live-label">Animated + labeled edge</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="animNodes"
          [edges]="animEdges"
          [fitViewOnInit]="true"
          [nodesDraggable]="false"
          style="height: 280px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
        </lib-ng-flow>
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
    code { background: #1e2333; color: #a5d6ff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .live-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px; }
    .flow-wrap { border-radius: 10px; overflow: hidden; border: 1px solid #1e2333; margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
    th { text-align: left; padding: 8px 12px; background: #0a0c12; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e2333; }
    td { padding: 10px 12px; color: #94a3b8; border-bottom: 1px solid #1a1f2e; font-size: 13px; }
    td code { background: #1e2333; color: #a5d6ff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
  `],
})
export class EdgesComponent {
  readonly allTypeNodes: Node[] = [
    { id: 'a1', type: 'input', position: { x: 80, y: 50 }, label: 'Source' },
    { id: 'a2', type: 'output', position: { x: 400, y: 50 }, label: 'Target' },
    { id: 'b1', type: 'input', position: { x: 80, y: 140 }, label: 'Source' },
    { id: 'b2', type: 'output', position: { x: 400, y: 140 }, label: 'Target' },
    { id: 'c1', type: 'input', position: { x: 80, y: 230 }, label: 'Source' },
    { id: 'c2', type: 'output', position: { x: 400, y: 230 }, label: 'Target' },
    { id: 'd1', type: 'input', position: { x: 80, y: 320 }, label: 'Source' },
    { id: 'd2', type: 'output', position: { x: 400, y: 320 }, label: 'Target' },
    { id: 'e1', type: 'input', position: { x: 80, y: 410 }, label: 'Source' },
    { id: 'e2', type: 'output', position: { x: 400, y: 410 }, label: 'Target' },
  ];

  readonly allTypeEdges: Edge[] = [
    { id: 'ea', source: 'a1', target: 'a2', type: 'default', label: 'bezier' },
    { id: 'eb', source: 'b1', target: 'b2', type: 'straight', label: 'straight' },
    { id: 'ec', source: 'c1', target: 'c2', type: 'step', label: 'step' },
    { id: 'ed', source: 'd1', target: 'd2', type: 'smoothstep', label: 'smoothstep' },
    { id: 'ee', source: 'e1', target: 'e2', type: 'simple-bezier', label: 'simple-bezier' },
  ];

  readonly animNodes: Node[] = [
    { id: 'x1', type: 'input', position: { x: 80, y: 100 }, label: 'Producer' },
    { id: 'x2', type: 'output', position: { x: 420, y: 100 }, label: 'Consumer' },
  ];

  readonly animEdges: Edge[] = [
    {
      id: 'xe1',
      source: 'x1',
      target: 'x2',
      type: 'smoothstep',
      animated: true,
      label: 'sends data →',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1', strokeWidth: 2 } as any,
    },
  ];

  readonly edgeOptionsCode = `const edge: Edge = {
  id: 'e1',
  source: 'node-1',
  target: 'node-2',
  type: 'smoothstep',
  animated: true,
  label: 'sends data →',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: '#6366f1', strokeWidth: 2 },
};`;
}
