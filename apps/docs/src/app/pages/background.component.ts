import { Component, signal } from '@angular/core';
import { NgFlowComponent, BackgroundComponent } from '@org/ng-flow';
import type { Node, Edge } from '@org/ng-flow';

const SAMPLE_NODES: Node[] = [
  { id: '1', position: { x: 60,  y: 80 },  label: 'Node A', type: 'input' },
  { id: '2', position: { x: 300, y: 40 },  label: 'Node B' },
  { id: '3', position: { x: 300, y: 150 }, label: 'Node C' },
  { id: '4', position: { x: 540, y: 80 },  label: 'Node D', type: 'output' },
];

const SAMPLE_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
];

@Component({
  selector: 'app-docs-background',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="page">
      <h1>Background</h1>
      <p class="tagline">
        Add a visual background pattern to your flow canvas using <code>&lt;lib-background&gt;</code>.
        Place it as a child of <code>&lt;lib-ng-flow&gt;</code> — it automatically reads the viewport
        transform and scales with zoom.
      </p>

      <h2>Dots (default)</h2>
      <p>The default variant renders a repeating dot grid that moves with the canvas.</p>
      <div class="demo-box" style="height:280px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%">
          <lib-background variant="dots" />
        </lib-ng-flow>
      </div>

      <div class="code-block">{{ dotsCode }}</div>

      <h2>Lines</h2>
      <div class="demo-box" style="height:280px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%">
          <lib-background variant="lines" [gap]="30" color="#cccccc" />
        </lib-ng-flow>
      </div>

      <div class="code-block">{{ linesCode }}</div>

      <h2>Dark theme</h2>
      <div class="demo-box" style="height:280px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%; background:#0f172a;">
          <lib-background variant="dots" [gap]="24" color="#334155" bgColor="#0f172a" />
        </lib-ng-flow>
      </div>

      <div class="code-block">{{ darkCode }}</div>

      <h2>Toggle demo</h2>
      <div style="margin-bottom:8px; display:flex; gap:8px;">
        <button class="btn" (click)="variant.set('dots')"   [class.btn--active]="variant() === 'dots'">Dots</button>
        <button class="btn" (click)="variant.set('lines')"  [class.btn--active]="variant() === 'lines'">Lines</button>
      </div>
      <div class="demo-box" style="height:280px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%">
          <lib-background [variant]="variant()" />
        </lib-ng-flow>
      </div>

      <h2>API</h2>
      <table>
        <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>variant</td><td>'dots' | 'lines'</td><td>'dots'</td><td>Pattern type</td></tr>
          <tr><td>gap</td><td>number</td><td>20</td><td>Grid cell size in px (at zoom=1)</td></tr>
          <tr><td>size</td><td>number</td><td>2</td><td>Dot radius or line width</td></tr>
          <tr><td>color</td><td>string</td><td>#91919a / #e0e0e0</td><td>Pattern color</td></tr>
          <tr><td>bgColor</td><td>string</td><td>''</td><td>Canvas background fill color</td></tr>
          <tr><td>lineWidth</td><td>number</td><td>1</td><td>SVG stroke-width for lines variant</td></tr>
          <tr><td>patternId</td><td>string</td><td>auto</td><td>Override SVG pattern ID (needed for multiple flows)</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .btn { padding: 4px 12px; border-radius: 6px; border: 1px solid #334155; background: #1e293b;
      color: #94a3b8; cursor: pointer; font-size: 13px; }
    .btn--active { background: #6366f1; border-color: #6366f1; color: #fff; }
  `],
})
export class BackgroundPageComponent {
  readonly nodes = SAMPLE_NODES;
  readonly edges = SAMPLE_EDGES;
  readonly variant = signal<'dots' | 'lines'>('dots');

  readonly dotsCode = `<lib-ng-flow [nodes]="nodes" [edges]="edges" style="height:500px">
  <lib-background variant="dots" />
</lib-ng-flow>`;

  readonly linesCode = `<lib-ng-flow [nodes]="nodes" [edges]="edges" style="height:500px">
  <lib-background variant="lines" [gap]="30" color="#cccccc" />
</lib-ng-flow>`;

  readonly darkCode = `<lib-ng-flow [nodes]="nodes" [edges]="edges"
  style="height:500px; background:#0f172a;">
  <lib-background variant="dots" [gap]="24" color="#334155" bgColor="#0f172a" />
</lib-ng-flow>`;
}
