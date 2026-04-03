import { Component, signal } from '@angular/core';
import { NgFlowComponent, BackgroundComponent, MiniMapComponent } from '@org/ng-flow';
import type { Node, Edge, MiniMapNodeFunc, PanelPosition } from '@org/ng-flow';

const SAMPLE_NODES: Node[] = [
  { id: '1', position: { x: 60,  y: 80  }, label: 'Node A', type: 'input' },
  { id: '2', position: { x: 300, y: 40  }, label: 'Node B' },
  { id: '3', position: { x: 300, y: 150 }, label: 'Node C' },
  { id: '4', position: { x: 540, y: 80  }, label: 'Node D', type: 'output' },
  { id: '5', position: { x: 160, y: 260 }, label: 'Node E' },
  { id: '6', position: { x: 440, y: 260 }, label: 'Node F', type: 'output' },
];

const SAMPLE_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
  { id: 'e1-5', source: '1', target: '5', type: 'smoothstep' },
  { id: 'e5-6', source: '5', target: '6', type: 'smoothstep' },
];

@Component({
  selector: 'app-docs-minimap',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent, MiniMapComponent],
  template: `
    <div class="page">
      <h1>MiniMap</h1>
      <p class="tagline">
        Add a minimap overview to your flow using <code>&lt;lib-minimap&gt;</code>.
        Place it as a child of <code>&lt;lib-ng-flow&gt;</code> — it automatically
        tracks nodes and the current viewport.
      </p>

      <h2>Basic</h2>
      <p>Default minimap in the bottom-right corner.</p>
      <div class="demo-box" style="height:320px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%">
          <lib-background />
          <lib-minimap />
        </lib-ng-flow>
      </div>
      <div class="code-block">{{ basicCode }}</div>

      <h2>Custom colors</h2>
      <p>Customize node fill, stroke, and viewport mask colors.</p>
      <div class="demo-box" style="height:320px; border-radius:8px; overflow:hidden; background:#0f172a;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%; background:#0f172a;">
          <lib-background variant="dots" color="#334155" bgColor="#0f172a" />
          <lib-minimap
            nodeColor="#6366f1"
            nodeStrokeColor="#818cf8"
            [nodeStrokeWidth]="2"
            maskColor="rgba(15,23,42,0.7)"
          />
        </lib-ng-flow>
      </div>
      <div class="code-block">{{ colorsCode }}</div>

      <h2>Position</h2>
      <p>Control minimap placement with the <code>position</code> input.</p>
      <div style="margin-bottom:8px; display:flex; gap:8px; flex-wrap:wrap;">
        @for (pos of positions; track pos) {
          <button class="btn" (click)="mmPosition.set(pos)" [class.btn--active]="mmPosition() === pos">
            {{ pos }}
          </button>
        }
      </div>
      <div class="demo-box" style="height:320px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%">
          <lib-background />
          <lib-minimap [position]="mmPosition()" />
        </lib-ng-flow>
      </div>
      <div class="code-block">{{ positionCode }}</div>

      <h2>Pannable &amp; Zoomable</h2>
      <p>
        Enable panning and zooming the main viewport directly from the minimap by setting
        <code>[pannable]="true"</code> and <code>[zoomable]="true"</code>.
      </p>
      <div class="demo-box" style="height:320px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%">
          <lib-background />
          <lib-minimap [pannable]="true" [zoomable]="true" />
        </lib-ng-flow>
      </div>
      <div class="code-block">{{ pannableCode }}</div>

      <h2>Node color function</h2>
      <p>Pass a function to <code>nodeColor</code> to colorize nodes individually.</p>
      <div class="demo-box" style="height:320px; border-radius:8px; overflow:hidden;">
        <lib-ng-flow [nodes]="nodes" [edges]="edges" [fitViewOnInit]="true" style="height:100%">
          <lib-background />
          <lib-minimap [nodeColor]="nodeColorFn" />
        </lib-ng-flow>
      </div>
      <div class="code-block">{{ colorFnCode }}</div>

      <h2>API</h2>
      <table>
        <thead><tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>width</td><td>number</td><td>200</td><td>SVG width in px</td></tr>
          <tr><td>height</td><td>number</td><td>150</td><td>SVG height in px</td></tr>
          <tr><td>position</td><td>PanelPosition</td><td>'bottom-right'</td><td>Corner placement</td></tr>
          <tr><td>nodeColor</td><td>string | (node) =&gt; string</td><td>'#e2e2e2'</td><td>Node fill color</td></tr>
          <tr><td>nodeStrokeColor</td><td>string | (node) =&gt; string</td><td>'transparent'</td><td>Node stroke color</td></tr>
          <tr><td>nodeStrokeWidth</td><td>number</td><td>2</td><td>Node stroke width</td></tr>
          <tr><td>nodeBorderRadius</td><td>number</td><td>5</td><td>Node corner radius</td></tr>
          <tr><td>maskColor</td><td>string</td><td>'rgb(240,240,240,0.6)'</td><td>Viewport mask fill</td></tr>
          <tr><td>maskStrokeColor</td><td>string</td><td>'none'</td><td>Viewport mask stroke</td></tr>
          <tr><td>maskStrokeWidth</td><td>number</td><td>1</td><td>Viewport mask stroke width</td></tr>
          <tr><td>maskBorderRadius</td><td>number</td><td>0</td><td>Viewport mask corner radius</td></tr>
          <tr><td>pannable</td><td>boolean</td><td>false</td><td>Pan viewport by dragging minimap</td></tr>
          <tr><td>zoomable</td><td>boolean</td><td>false</td><td>Zoom viewport via minimap scroll</td></tr>
          <tr><td>inversePan</td><td>boolean</td><td>false</td><td>Invert pan direction</td></tr>
          <tr><td>zoomStep</td><td>number</td><td>1</td><td>Zoom sensitivity multiplier</td></tr>
          <tr><td>offsetScale</td><td>number</td><td>5</td><td>Extra padding around content</td></tr>
          <tr><td>ariaLabel</td><td>string</td><td>'Vue Flow mini map'</td><td>Accessibility label</td></tr>
        </tbody>
      </table>

      <h2>Outputs</h2>
      <table>
        <thead><tr><th>Event</th><th>Payload</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>svgClick</td><td>MiniMapClickEvent</td><td>Click on the SVG background</td></tr>
          <tr><td>nodeClick</td><td>MiniMapNodeClickEvent</td><td>Click on a minimap node rect</td></tr>
          <tr><td>nodeDblclick</td><td>MiniMapNodeClickEvent</td><td>Double-click on a minimap node rect</td></tr>
          <tr><td>nodeMouseenter</td><td>MiniMapNodeClickEvent</td><td>Mouse enter on a minimap node rect</td></tr>
          <tr><td>nodeMousemove</td><td>MiniMapNodeClickEvent</td><td>Mouse move on a minimap node rect</td></tr>
          <tr><td>nodeMouseleave</td><td>MiniMapNodeClickEvent</td><td>Mouse leave on a minimap node rect</td></tr>
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
export class MiniMapPageComponent {
  readonly nodes = SAMPLE_NODES;
  readonly edges = SAMPLE_EDGES;

  readonly positions: PanelPosition[] = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];

  readonly mmPosition = signal<PanelPosition>('bottom-right');

  readonly nodeColorFn: MiniMapNodeFunc = (node) => {
    if (node.type === 'input') return '#6366f1';
    if (node.type === 'output') return '#10b981';
    return '#e2e2e2';
  };

  readonly basicCode = `<lib-ng-flow [nodes]="nodes" [edges]="edges" style="height:500px">
  <lib-minimap />
</lib-ng-flow>`;

  readonly colorsCode = `<lib-minimap
  nodeColor="#6366f1"
  nodeStrokeColor="#818cf8"
  [nodeStrokeWidth]="2"
  maskColor="rgba(15,23,42,0.7)"
/>`;

  readonly positionCode = `<lib-minimap position="top-right" />`;

  readonly pannableCode = `<lib-minimap [pannable]="true" [zoomable]="true" />`;

  readonly colorFnCode = `nodeColorFn: MiniMapNodeFunc = (node) => {
  if (node.type === 'input') return '#6366f1';
  if (node.type === 'output') return '#10b981';
  return '#e2e2e2';
};

// In template:
<lib-minimap [nodeColor]="nodeColorFn" />`;
}
